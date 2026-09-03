import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=exchange_failed`);
  }

  // Primer login con este email: resuelve invitaciones pendientes y crea el
  // Membership correspondiente (ADR-006). Es idempotente (on conflict do
  // nothing), asi que es seguro llamarlo en cada login, no solo el primero.
  const email = data.user.email;
  if (email) {
    await supabase.rpc("accept_pending_invitations", {
      target_profile_id: data.user.id,
      target_email: email,
    });
  }

  return NextResponse.redirect(`${origin}${next}`);
}
