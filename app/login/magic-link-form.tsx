"use client";

import { useState, useTransition } from "react";
import { sendMagicLink } from "@/lib/actions/auth";

export function MagicLinkForm() {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          const result = await sendMagicLink(formData);
          setFeedback(result);
        });
      }}
      className="flex flex-col gap-3"
    >
      <label htmlFor="email" className="text-sm font-medium text-foreground">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="tu@colegio.es"
        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
      >
        {isPending ? "Enviando..." : "Enviar enlace de acceso"}
      </button>
      {feedback && (
        <p role="status" className={feedback.ok ? "text-sm text-green-700" : "text-sm text-red-700"}>
          {feedback.message}
        </p>
      )}
    </form>
  );
}
