"use server";

import { createClient } from "@/lib/supabase/server";

/** Si la matricula ya completo el 100% de las secciones, emite el
 * certificado (idempotente: la tabla certificates tiene unique(enrollment_id)).
 * Las horas son la suma de duracion DECLARADA de las secciones completadas,
 * nunca un cronometro de pantalla (ADR-005). */
export async function issueCertificateIfComplete(enrollmentId: string) {
  const supabase = await createClient();

  const { data: progress } = await supabase
    .from("enrollment_progress")
    .select("percent_complete, completed_minutes")
    .eq("enrollment_id", enrollmentId)
    .maybeSingle();

  if (!progress || (progress.percent_complete ?? 0) < 100) return null;

  const { data: existing } = await supabase
    .from("certificates")
    .select("verification_code")
    .eq("enrollment_id", enrollmentId)
    .maybeSingle();
  if (existing) return existing;

  const { data: created, error } = await supabase
    .from("certificates")
    .insert({
      enrollment_id: enrollmentId,
      total_hours: Math.round(((progress.completed_minutes ?? 0) / 60) * 100) / 100,
    })
    .select("verification_code")
    .single();

  if (error) throw error;
  return created;
}
