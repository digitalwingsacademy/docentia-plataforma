# ADR-004 — Presentaciones y material visual

## Estado
Confirmado (2026-09-02).

## Contexto
Parte del contenido son presentaciones (diapositivas). Hay que decidir cómo se insertan y renderizan,
valorando rendimiento en wifi mediocre, funcionamiento offline/descargable, y accesibilidad.

## Opciones consideradas
1. **Embeber Google Slides / Canva** (iframe): cero trabajo de conversión, pero depende de que el
   proveedor externo siga permitiendo embeber ese documento con esas condiciones de acceso; problemas de
   foco de teclado/lector de pantalla dentro de un iframe ajeno que no controlamos; carga su propio JS
   pesado; no funciona offline; Canva en concreto no tiene un embed tan estable como Slides.
2. **Exportar a PDF + renderizar con pdf.js** (`react-pdf` o similar).
3. **Convertir a imágenes en build**: evita pdf.js en cliente, pero exige una pieza de pipeline de build
   ligada al repo de contenidos (re-procesar en cada cambio), justo la complejidad que ADR-001 intenta
   evitar mover al lado de la plataforma.

## Decisión
**Opción 2**: los autores exportan su presentación a PDF (flujo natural en Google Slides/PowerPoint/
Canva: "Descargar como PDF"), se sube como recurso del curso (Supabase Storage, URL firmada, igual que
el resto de descargables) y se renderiza página a página con pdf.js.

Razones:
- **Rendimiento/offline**: el PDF se descarga una vez y se pagina localmente; funciona con wifi mala sin
  depender de un iframe externo. Además sirve directamente como descargable (ya pedido en la sección 3).
- **Accesibilidad**: mejor que un iframe de Slides ajeno — un PDF con texto real (no solo imágenes)
  permite extracción de texto por lectores de pantalla. No es perfecto: cuando una diapositiva sea
  puramente texto, se prefiere maquetarla directamente en MDX/markdown en vez de como PDF, reservando el
  componente `<Presentacion />` para diseños visuales que de verdad lo necesiten.
- **No atarnos a proveedor**: no depende de que Google/Canva mantengan sus condiciones de embed público.
- **Contra aceptado**: se pierden animaciones/transiciones de la presentación original — razonable para
  material formativo asíncrono, no una charla en directo.

Componente: `<Presentacion src="..." />`, mismo principio de conjunto cerrado que el resto (ADR-002).

## Consecuencias
- Los descargables de presentación pasan por el mismo pipeline de Storage + URL firmada que cualquier
  otro descargable — no hace falta infraestructura nueva.
- Se documenta en la guía de autoría que "exportar a PDF" es el paso obligatorio antes de referenciar
  una presentación, y `content:validate` puede comprobar que el fichero referenciado existe y es un PDF.
