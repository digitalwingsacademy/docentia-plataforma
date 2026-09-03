import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

// /api/webhooks se autentica con su propia firma HMAC (ver route.ts), no
// con sesion de usuario - por eso esta en la lista de rutas publicas.
const PUBLIC_PATHS = ["/login", "/auth/callback", "/certificados", "/api/webhooks"];

// Refresca la sesion en cada peticion (los tokens de Supabase expiran) y
// protege rutas privadas. No hace operaciones de sistema de ficheros: solo
// lee/escribe cookies, que es lo unico soportado en el proxy de Netlify.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicPath = PUBLIC_PATHS.some((path) => request.nextUrl.pathname.startsWith(path));

  if (!user && !isPublicPath) {
    // request.url puede reflejar el host interno del deploy en Netlify, no
    // el dominio publico (ver el mismo comentario en auth/callback/route.ts)
    // - x-forwarded-host es el que vio de verdad el navegador.
    const forwardedHost = request.headers.get("x-forwarded-host");
    const base = forwardedHost
      ? `${request.headers.get("x-forwarded-proto") ?? "https"}://${forwardedHost}`
      : request.url;
    const loginUrl = new URL("/login", base);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)"],
};
