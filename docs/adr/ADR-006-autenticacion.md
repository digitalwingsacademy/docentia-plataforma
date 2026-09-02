# ADR-006 — Autenticación e identidad con Supabase Auth

## Estado
Propuesto. SSO (Google/Microsoft) queda documentado pero no activo en el MVP — ver "Estado real de
acceso" más abajo.

## Contexto
Login por magic link, Google y Microsoft Entra (proveedor `azure`), sin Auth.js (un único sistema de
identidad, como pide el usuario). Hay que modelar la pertenencia a un colegio sobre `auth.users` sin
duplicar lo que Supabase Auth ya gestiona.

## Estado real de acceso (según respuesta del usuario)
A día de hoy no hay acceso de administración ni a Google Workspace ni a Microsoft Entra para registrar
las apps OAuth correspondientes. **Decisión práctica**: el MVP se construye y se demuestra con login por
magic link únicamente. Los botones de "Entrar con Google" / "Entrar con Microsoft" se muestran solo si
las variables de entorno del cliente OAuth correspondiente existen (`GOOGLE_OAUTH_CLIENT_ID`,
`AZURE_OAUTH_CLIENT_ID`) — así el código de login SSO se escribe y queda listo, pero no se enseña un
botón roto en la demo. Cuando existan esos accesos, activar SSO es configuración, no desarrollo.

Checklist para cuando haya acceso (queda documentado aquí para no perderlo):
- **Google**: proyecto en Google Cloud Console → pantalla de consentimiento OAuth → credenciales OAuth
  2.0 → añadir el client id/secret en Supabase Auth → dominio(s) de redirect autorizados.
- **Microsoft Entra**: registro de aplicación en Azure AD → plataforma "Web" con el redirect URI de
  Supabase → permisos `openid`/`email`/`profile` → client id/secret en Supabase Auth (proveedor `azure`).

## Decisión
- Supabase Auth como único sistema de sesión (cookies gestionadas vía `@supabase/ssr`, integrado con
  Server Components/Server Actions/middleware de Next.js). No se introduce Auth.js.
- `Profile` es una tabla 1:1 con `auth.users` (mismo `id`, `on delete cascade`) que guarda **solo** lo
  que Supabase Auth no gestiona: nombre completo, avatar, idioma preferido. Nunca credenciales, estado de
  verificación de email ni proveedor — eso vive en `auth.users`/`auth.identities`.
- **Alta en una organización por invitación explícita, nunca por dominio de email automático.** Aunque
  muchos colegios usan un dominio corporativo de Google Workspace/M365, asumir "todo el que entre con
  `@colegioX.es` pertenece a la organización X" es frágil (dominios compartidos entre entidades, colegios
  con varios dominios) y es exactamente el tipo de fuga de datos entre colegios que el usuario quiere
  evitar a toda costa. Mecanismo: tabla `organization_invitations` (email o código), y al completar el
  login por primera vez con ese email se crea la `Membership` correspondiente (server action tras el
  callback de auth, o trigger sobre `auth.users` que consulta invitaciones pendientes).

## Sobre los custom claims del JWT (para ADR-007)
Supabase permite añadir `app_metadata` al JWT mediante un Auth Hook, lo que podría cachear los
`organization_id`/rol del usuario directamente en el token y evitar una consulta a `Membership` en cada
política RLS. Se descarta para el MVP: los claims quedan desactualizados hasta que el token se refresca,
lo cual es peligroso justo en el escenario que más nos importa (revocar el acceso de alguien a un
colegio). Se empieza con una función `security definer` que consulta `Membership` en tiempo real en cada
política (fuente de verdad siempre fresca) y se deja el Auth Hook como optimización de rendimiento futura
si hiciera falta.

## Consecuencias
- El flujo de invitación (crear `organization_invitations`, aceptarla al primer login) es lógica de
  dominio con tests, no un detalle de UI — cubre el caso principal del negocio (coordinador invita a su
  claustro).
- En local, los magic links se capturan con el proveedor de correo de pruebas de Supabase o se leen en
  consola/Inbucket — nunca hace falta SMTP real para desarrollar (requisito explícito de la sección 2).
