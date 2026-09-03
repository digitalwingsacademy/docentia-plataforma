"use client";

import { useState, useTransition } from "react";
import { inviteTeacher } from "@/lib/actions/invite";

export function InviteTeacherForm() {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          const result = await inviteTeacher(formData);
          setFeedback(result);
        });
      }}
      className="flex items-end gap-2"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="invite-email" className="text-xs text-muted-foreground">
          Invitar docente por email
        </label>
        <input
          id="invite-email"
          name="email"
          type="email"
          required
          placeholder="docente@colegio.es"
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
      >
        {isPending ? "Enviando..." : "Invitar"}
      </button>
      {feedback && (
        <p role="status" className={feedback.ok ? "text-sm text-green-700" : "text-sm text-red-700"}>
          {feedback.message}
        </p>
      )}
    </form>
  );
}
