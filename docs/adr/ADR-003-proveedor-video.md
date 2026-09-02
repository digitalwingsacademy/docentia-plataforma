# ADR-003 — Proveedor de vídeo

## Estado
Confirmado (2026-09-02).

## Contexto
Escenario de dimensionamiento dado por el usuario: ~20h de vídeo alojado, ~500 docentes activos,
~3.000 horas de visionado al mes. Criterios en orden de importancia: rendimiento (HLS adaptativo,
arranque rápido en wifi mediocre), control de acceso (URLs firmadas/tokens), eventos de progreso por
usuario, coste predecible, subtítulos, facilidad de subida.

Precios verificados por búsqueda (no de memoria) a fecha de este documento; fuentes al final.

## Cálculo del escenario
20h almacenadas = 1.200 min. 3.000h de visionado/mes = 180.000 min entregados/mes.
Para Bunny/Mux, donde el precio es por GB en vez de por minuto, se asume un bitrate medio ABR de
~3 Mbps (mezcla de calidades porque parte del público verá con wifi mala) — **son estimaciones**, no
cifras exactas como las de Cloudflare (que factura directamente por minuto).

| Proveedor | Almacenamiento/mes | Entrega/mes | Total estimado/mes | Notas |
|---|---|---|---|---|
| **Cloudflare Stream** | $6 (1.200 min × $5/1.000) | $180 (180.000 min × $1/1.000) | **≈ $186** | Precio exacto (facturación por minuto). Egress incluido, sin sorpresas. |
| **Bunny.net Stream** | ≈ $1–3 (storage $0.01/GB) | ≈ $20–25 ($0.005/GB, ~4 TB estimados) | **≈ $25–30** | El más barato con diferencia. Compañía más pequeña, menos garantías tipo SLA/DRM empresarial que Cloudflare/Mux. |
| **Mux** | ≈ $2 ($0.015/GB) + $9 encoding único (1.200 min × $0.0075) | ≈ $72 (100.000 min/mes gratis; resto a ~$0.0008–0.001/min según resolución) | **≈ $75–85** | Mejor analítica de vídeo out-of-the-box (Mux Data) — es literalmente su producto. |
| **Vimeo Advanced** | Incluido en cuota | Incluido (cap 7 TB) | **$65/mes fijo** (anual) | Pensado para vídeo de marketing, no para tracking granular por usuario/sección. |
| **YouTube no listado** | $0 | $0 | **$0** | Descartado, ver más abajo. |
| **Google Drive** | $0 (dentro de cuota Workspace) | $0 | **$0** | Descartado, ver más abajo. |
| **Autoalojado (R2 + transcodificación propia)** | ≈ $1.5–2 (R2 $0.015/GB, egress **gratis**) | ≈ $0 de egress | **≈ $2–5 de infraestructura pura** | El más barato en factura, el más caro en horas de ingeniería (ver más abajo). |

## Por qué se descartan Google Drive y YouTube (confirmando la sospecha del usuario)

**Google Drive**: sin ABR real (una sola calidad, mal en wifi de aula), con **cuotas de visualización
compartida por fichero** que pueden bloquear temporalmente un vídeo con muchos visionados simultáneos
(inaceptable si 30 docentes de un mismo colegio ven la misma lección la misma semana), control de acceso
solo a nivel de permisos de Drive (no expira, se puede reenviar el enlace sin fricción), y **sin ninguna
API de eventos de progreso de visionado** — el requisito #3 del usuario es simplemente imposible aquí.
Confirmado: mala idea.

**YouTube no listado**: gratis pero sin control de acceso real (cualquiera con el enlace lo reenvía),
sin eventos de progreso fiables sin recurrir a polling manual del IFrame API (frágil, no pensado para
esto), y con el chrome del reproductor de YouTube — choca directamente con el objetivo de "parecer cara
al lado de Moodle". Válido solo como parche de emergencia gratuito en una fase pre-ingresos, nunca como
decisión final.

## Por qué se descarta el autoalojado para el MVP
El coste de infraestructura es el más bajo, pero exige construir y mantener: pipeline de transcodificación
a HLS multi-bitrate, empaquetado de subtítulos, firma de URLs/tokens de acceso, y un sistema de eventos
de progreso — es decir, reconstruir a mano exactamente lo que Cloudflare Stream y Mux venden como
producto. Para un equipo de dos personas, ese es trabajo de ingeniería recurrente que no aparece en la
factura pero sí en el tiempo de mantenimiento. Contradice directamente "soluciones aburridas y
mantenibles" de las reglas de trabajo. Se descarta para el MVP; queda como opción si el volumen crece
tanto que el coste por minuto de un proveedor gestionado deje de ser predecible.

## Decisión
**Mux** para el MVP y la fase inicial del negocio.

Razón principal: Mux es el único de los tres proveedores "serios" cuyo producto central es exactamente
el criterio #3 del usuario (saber cuánto se ha visto cada vídeo, por usuario) — Mux Data viene de serie,
no hay que construir el enganche de analítica desde cero. El coste en este escenario (~$75–85/mes) es
razonable para un negocio B2B que facturará por plazas a colegios, con subida vía API sencilla (útil para
automatizar desde el flujo de publicación de contenido de ADR-001), URLs de reproducción firmadas y
subtítulos soportados de serie.

Cloudflare Stream es la alternativa "más aburrida" (una pieza menos si en algún momento ya usáis
Cloudflare para DNS/CDN) pero sale más cara a este volumen por su fee plano de entrega. **Bunny.net** es
la opción de menor coste y perfectamente viable — se señala como alternativa si el presupuesto inicial es
muy ajustado, entendiendo que su analítica de progreso requiere más trabajo propio de enganche de eventos
(el player expone lo necesario, pero hay que construirlo).

## Consecuencias de diseño: interfaz `VideoProvider`
El vídeo se implementa detrás de una interfaz para poder cambiar de proveedor sin tocar contenido:

```
<Video id="intro-competencia-digital" />
```

resuelve, vía un manifiesto `VideoAsset` (tabla en BD, ver sección 7 del modelo de datos), el `id` lógico
a `{ provider: "mux", assetId: "...", durationSeconds, captions: [...] }`. Cambiar de proveedor es
cambiar el manifiesto y el adaptador `VideoProvider`, nunca el MDX.

## Fuentes
- [Cloudflare Stream — pricing](https://developers.cloudflare.com/stream/pricing/index.md)
- [Bunny.net Stream — pricing](https://bunny.net/pricing/stream/) / [docs.bunny.net](https://docs.bunny.net/stream/pricing)
- [Mux — pricing](https://www.mux.com/pricing) / [Mux — video pricing docs](https://www.mux.com/docs/pricing/video)
- [Vimeo — pricing 2026](https://www.uscreen.tv/blog/vimeo-pricing-guide/)
- [Cloudflare R2 — pricing (egress gratis)](https://egresscost.com/cloudflare/)
