import { z } from "zod";

// Esquemas compartidos para curso.yml / unidad.yml / quiz.yml (ADR-002).
// Viven en la plataforma porque aqui es donde se compila el contenido; el
// validador del repo de contenidos (content:validate, en docentia-contenidos)
// mantiene una copia identica cubierta por un test de contrato, tal como
// exige la consecuencia de ADR-002 de no depender de un paquete npm privado
// para un MVP de dos personas.

export const seccionTipoSchema = z.enum(["video", "texto", "quiz", "actividad"]);

export const unidadYmlSchema = z.object({
  titulo: z.string().min(1),
  orden: z.number().int().positive(),
  // Terminologia TBLT (Pre-Task, Task Cycle N, Project Task) - descriptiva,
  // no estructural (docs/analisis-prototipo-idiomas.md #4).
  fase: z.string().optional(),
  secciones: z
    .array(
      z.object({
        id: z.string().min(1),
        archivo: z.string().min(1),
        tipo: seccionTipoSchema,
        titulo: z.string().min(1),
        duracionMinutos: z.number().int().positive(),
        orden: z.number().int().positive(),
        obligatoria: z.boolean().default(true),
      })
    )
    .min(1),
});
export type UnidadYml = z.infer<typeof unidadYmlSchema>;

export const quizPreguntaSchema = z.object({
  id: z.string().min(1),
  enunciado: z.string().min(1),
  opciones: z.array(z.object({ id: z.string().min(1), texto: z.string().min(1) })).min(2),
  respuestaCorrectaId: z.string().min(1),
  explicacion: z.string().optional(),
});

export const quizYmlSchema = z.object({
  passingScore: z.number().min(0).max(100),
  maxIntentos: z.number().int().positive().default(3),
  criterioAprobado: z.enum(["mejor_intento", "ultimo_intento"]).default("mejor_intento"),
  preguntas: z.array(quizPreguntaSchema).min(1),
});
export type QuizYml = z.infer<typeof quizYmlSchema>;

// Actividades interactivas (docs/formato-actividades.md). Por ahora solo se
// implementa el subtipo rellenar-huecos; el resto del inventario de
// docs/analisis-prototipo-idiomas.md queda para cuando se autoren.
export const huecoSchema = z.object({
  id: z.union([z.string(), z.number()]),
  respuesta: z.string().min(1),
  acepta: z.array(z.string().min(1)).optional(),
  pista: z.string().optional(),
});

export const reintentosSchema = z.object({
  maximos: z.union([z.number().int().positive(), z.literal("ilimitado")]).default("ilimitado"),
  mostrarSolucionAl: z.enum(["siempre", "agotar_intentos", "nunca"]).default("siempre"),
});

// modo: practica es el unico implementado hoy (correccion 100% en cliente).
// modo: evaluacion queda declarado para no romper compatibilidad cuando el
// ADR de la seccion 4 del encargo de idiomas defina el mecanismo server-side.
export const rellenarHuecosYmlSchema = z.object({
  tipo: z.literal("rellenar-huecos"),
  instrucciones: z.string().min(1),
  modo: z.enum(["practica", "evaluacion"]).default("practica"),
  reintentos: reintentosSchema.default({ maximos: "ilimitado", mostrarSolucionAl: "siempre" }),
  bancoPalabras: z.boolean(),
  texto: z.string().min(1),
  huecos: z.array(huecoSchema).min(1),
});
export type RellenarHuecosYml = z.infer<typeof rellenarHuecosYmlSchema>;
export type Hueco = z.infer<typeof huecoSchema>;

// Tipos de valoracion humana (docs/formato-actividades.md #3): ninguno usa
// modo ni reintentos, no hay respuesta correcta que proteger. Guardan una
// entrega en activity_submissions, sin calificar todavia (sin UI de
// correccion por el coordinador en esta tanda).
export const grabacionAudioYmlSchema = z.object({
  tipo: z.literal("grabacion-audio"),
  instrucciones: z.string().min(1),
  duracionGrabacionSegundos: z.number().int().positive(),
  preparacionSegundos: z.number().int().min(0).default(0),
  rubricaId: z.string().nullable().default(null),
});
export type GrabacionAudioYml = z.infer<typeof grabacionAudioYmlSchema>;

export const foroYmlSchema = z.object({
  tipo: z.literal("foro"),
  instrucciones: z.string().min(1),
  palabrasMinimasPublicacion: z.number().int().positive(),
  requiereRespuesta: z.boolean().default(true),
});
export type ForoYml = z.infer<typeof foroYmlSchema>;

// Union discriminada: anadir un subtipo nuevo es anadir un miembro aqui, sin
// tocar el resto del pipeline de carga (lib/content/course.ts) ni el switch
// de renderizado (app/cursos/.../page.tsx).
export const actividadYmlSchema = z.discriminatedUnion("tipo", [
  rellenarHuecosYmlSchema,
  grabacionAudioYmlSchema,
  foroYmlSchema,
]);
export type ActividadYml = z.infer<typeof actividadYmlSchema>;

export const cursoYmlSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "el slug solo admite minusculas, numeros y guiones"),
  version: z.number().int().positive(),
  titulo: z.string().min(1),
  resumen: z.string().min(1),
  horasEstimadas: z.number().positive(),
  unidades: z.array(z.string().min(1)).min(1),
});
export type CursoYml = z.infer<typeof cursoYmlSchema>;
