# Roadmap hasta un producto vendible a colegios

## Fase 0 — Fundacional (completa)
- ADRs (`docs/adr/`) revisados y aprobados por el usuario (2026-09-02).
- Cuentas reales creadas por el usuario: GitHub (org + dos repos), Netlify, Supabase (proyectos dev/prod
  en región UE) — modelo elegido: "tú creas, yo accedo".
- Spike de revalidación en Netlify (ADR-001) ejecutado y verificado en producción de verdad.

## Fase 1 — MVP vertical (completa, 2026-09-03)
Alcance de la sección 9 del encargo, verificado de principio a fin con un navegador real contra
`docentia-platform.netlify.app`: alta de colegio con plazas, invitación y login (magic link, incluyendo
el caso de abrir el enlace en otro dispositivo), un curso completo con vídeo/texto/quiz, progreso
persistente entre dispositivos, certificado PDF con verificación pública, panel de coordinador, y
publicación de contenido sin redeploy demostrada de verdad. Incluye el curso de ejemplo completo
("Competencia Digital Docente — Nivel 1") y el test de aislamiento multi-colegio (pgTAP).

Deliberadamente fuera de esta fase, para la siguiente: entorno de producción real y separado (hoy el
site de Netlify usa el proyecto de Supabase de dev), y activación de SSO.

## Fase 2 — Piloto comercial reducido (2-3 colegios reales)
- Invitación también por código (no solo email).
- Exportación CSV/PDF del panel de coordinador (ya prevista en el modelo, se completa la UI).
- Catálogo con más de un curso.
- Subtítulos reales (no placeholder) en los vídeos existentes.
- Auditoría de accesibilidad: pasada automática (axe) + revisión manual básica de los flujos críticos
  contra WCAG 2.1 AA — no como parche, como gate antes de escalar a más colegios.
- Activar SSO (Google Workspace / Microsoft Entra) si para entonces hay acceso admin a ambos (ADR-006).

## Fase 3 — Preparación para vender de verdad
- Flujo de contratación: como mínimo activación manual de plazas contra factura; pasarela de pago si el
  volumen lo justifica (explícitamente fuera de alcance del MVP, no antes).
- Plantilla de contrato de encargo de tratamiento (DPA) lista para firmar con cada colegio.
- Página de marketing/landing, política de privacidad y términos de servicio.
- Revisión legal del certificado de aprovechamiento (formato, validez, requisitos del sector).

## Fase 4 — Escala
- Métricas de uso más ricas: dónde abandonan los docentes, qué vídeos no se terminan (ya hay eventos de
  progreso desde el MVP vía ADR-005/ADR-003; esta fase es el dashboard interno sobre esos datos).
- CMS con interfaz (TinaCMS sobre el mismo repo de contenidos, ADR-001) si el socio necesita escribir
  contenido directamente sin pasar por PRs de Git.
- Exportación de cursos como paquete SCORM/cmi5 bajo demanda comercial (ADR-005), para colegios con
  Moodle propio.
- Multi-idioma, si el negocio se abre a otras regiones (la base de i18n ya se sienta en el MVP, sin
  traducir más que español).

## Explícitamente fuera de alcance mientras no cambie el contexto de negocio
Pasarela de pagos, foros/mensajería, app móvil nativa, videoconferencia en directo, import de SCORM de
terceros, IA generativa dentro de la plataforma — según la sección 10 del encargo original.
