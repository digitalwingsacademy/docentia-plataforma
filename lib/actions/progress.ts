"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getQuiz } from "@/lib/content/course";
import { gradeQuiz, resolveFinalScore, type QuizAnswer } from "@/lib/domain/quiz";
import { issueCertificateIfComplete } from "@/lib/actions/certificate";
import type { Database } from "@/lib/database.types";

type SectionStatus = Database["public"]["Enums"]["section_status"];

function statusFor(percent: number): SectionStatus {
  if (percent >= 90) return "COMPLETED";
  if (percent > 0) return "IN_PROGRESS";
  return "NOT_STARTED";
}

/** Vídeo (checkpoints periódicos, ≥90% cuenta como completado) y lectura
 * (IntersectionObserver + botón manual) comparten este registro — ADR-005. */
export async function recordSectionProgress(params: {
  enrollmentId: string;
  sectionId: string;
  percent: number;
  durationMinutes: number;
}) {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const status = statusFor(params.percent);

  const { data: existing } = await supabase
    .from("section_progress")
    .select("started_at, completed_at")
    .eq("enrollment_id", params.enrollmentId)
    .eq("section_id", params.sectionId)
    .maybeSingle();

  const { error } = await supabase.from("section_progress").upsert(
    {
      enrollment_id: params.enrollmentId,
      section_id: params.sectionId,
      percent: Math.min(100, Math.round(params.percent)),
      status,
      duration_minutes: status === "COMPLETED" ? params.durationMinutes : 0,
      started_at: existing?.started_at ?? now,
      completed_at: status === "COMPLETED" ? (existing?.completed_at ?? now) : null,
      updated_at: now,
    },
    { onConflict: "enrollment_id,section_id" }
  );

  if (error) throw error;
  revalidatePath("/", "layout");

  if (status === "COMPLETED") {
    await issueCertificateIfComplete(params.enrollmentId);
  }
}

export async function markSectionAsRead(params: { enrollmentId: string; sectionId: string; durationMinutes: number }) {
  return recordSectionProgress({ ...params, percent: 100 });
}

export interface SubmitQuizResult {
  score: number;
  passed: boolean;
  correctCount: number;
  total: number;
  attemptNumber: number;
  attemptsRemaining: number;
}

export async function submitQuizAttempt(params: {
  enrollmentId: string;
  courseSlug: string;
  unidadDir: string;
  sectionId: string;
  contentRef: string;
  answers: QuizAnswer[];
  durationMinutes: number;
}): Promise<SubmitQuizResult> {
  const quiz = await getQuiz(params.courseSlug, params.unidadDir, params.contentRef);
  const result = gradeQuiz(quiz, params.answers);

  const supabase = await createClient();

  const { data: previousAttempts, error: attemptsError } = await supabase
    .from("quiz_attempts")
    .select("attempt_number, score")
    .eq("enrollment_id", params.enrollmentId)
    .eq("section_id", params.sectionId)
    .order("attempt_number", { ascending: true });

  if (attemptsError) throw attemptsError;

  const attemptNumber = (previousAttempts?.at(-1)?.attempt_number ?? 0) + 1;
  if (attemptNumber > quiz.maxIntentos) {
    throw new Error("No quedan intentos disponibles para este cuestionario.");
  }

  const { error: insertError } = await supabase.from("quiz_attempts").insert({
    enrollment_id: params.enrollmentId,
    section_id: params.sectionId,
    attempt_number: attemptNumber,
    // Cast a Json: QuizAnswer es una interfaz nombrada, TS no la considera
    // compatible por estructura con el indice de string de Json aunque lo sea en runtime.
    answers: params.answers as unknown as Database["public"]["Tables"]["quiz_attempts"]["Insert"]["answers"],
    score: result.score,
    passed: result.passed,
  });
  if (insertError) throw insertError;

  const allScores = [...(previousAttempts ?? []).map((a) => a.score), result.score];
  const finalScore = resolveFinalScore(quiz.criterioAprobado, allScores) ?? result.score;
  const passedOverall = finalScore >= quiz.passingScore;

  await recordSectionProgress({
    enrollmentId: params.enrollmentId,
    sectionId: params.sectionId,
    percent: passedOverall ? 100 : Math.min(89, finalScore),
    durationMinutes: params.durationMinutes,
  });

  return {
    ...result,
    attemptNumber,
    attemptsRemaining: Math.max(0, quiz.maxIntentos - attemptNumber),
  };
}
