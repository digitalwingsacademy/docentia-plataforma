import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { completeLoginSetup } from "@/lib/actions/auth";

// En Netlify (y en general detras de un proxy), request.url puede reflejar
// el host INTERNO del deploy concreto (p. ej. "<deploy-id>--sitio.netlify.app")
// en vez del dominio publico que el navegador realmente pidio. Redirigir con
// ese origen hace que las cookies de sesion se fijen en el host equivocado -
// visibles en ese deploy, invisibles en el dominio real. x-forwarded-host es
// el header estandar para el host tal como lo vio el cliente.
function publicOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (!forwardedHost) return new URL(request.url).origin;
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  return `${forwardedProto}://${forwardedHost}`;
}

export async function GET(request: NextRequest) {
  const origin = publicOrigin(request);
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    // Sin "code" no es necesariamente un error: si el enlace se abre en un
    // dispositivo/navegador distinto del que pidio el magic link (p. ej. el
    // docente lo pide desde el portatil del cole y lo abre en el movil),
    // Supabase no puede usar PKCE (el code_verifier vive en una cookie del
    // navegador original) y cae a flujo implicito, con los tokens en el
    // fragmento de la URL - invisible para el servidor, solo el navegador
    // puede leerlo. Se delega esa rama a una pagina cliente.
    return NextResponse.redirect(`${origin}/auth/callback/implicit?next=${encodeURIComponent(next)}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=exchange_failed`);
  }

  await completeLoginSetup();

  return NextResponse.redirect(`${origin}${next}`);
}
