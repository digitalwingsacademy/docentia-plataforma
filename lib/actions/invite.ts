"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function inviteTeacher(formData: FormData): Promise<{ ok: boolean; message: string }> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { ok: false, message: "Escribe un email." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "No autenticado." };

  const { data: membership } = await supabase
    .from("memberships")
    .select("organization_id")
    .in("role", ["COORDINATOR", "ADMIN"])
    .limit(1)
    .maybeSingle();

  if (!membership) return { ok: false, message: "No tienes permisos de coordinador." };

  const { error } = await supabase.from("organization_invitations").insert({
    organization_id: membership.organization_id,
    email,
    invited_by: user.id,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, message: `${email} ya tiene una invitación pendiente o activa.` };
    }
    return { ok: false, message: "No se pudo crear la invitación." };
  }

  revalidatePath("/panel");
  return { ok: true, message: `Invitación creada para ${email}. Ya puede entrar con magic link.` };
}
