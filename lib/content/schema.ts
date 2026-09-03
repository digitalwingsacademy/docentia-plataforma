import { z } from "zod";

// Esquemas compartidos para curso.yml / unidad.yml / quiz.yml (ADR-002).
// Viven en la plataforma porque aqui es donde se compila el contenido; el
// validador del repo de contenidos (content:validate, en docentia-contenidos)
// mantiene una copia identica cubierta por un test de contrato, tal como
// exige la consecuencia de ADR-002 de no depender de un paquete npm privado
// para un MVP de dos personas.

export const seccionTipoSchema = z.enum(["video", "texto", "quiz"]);

export const unidadYmlSchema = z.object({
  titulo: z.string().min(1),
  orden: z.number().int().positive(),
  secciones: z
    .array(
      z.object({
        id: z.string().min(1),
        archivo: z.string().min(1),
        tipo: seccionTipoSchema,
        titulo: z.string().min(1),
        duracionMinutos: z.number().int().positive(),
        orden: z.number().int().positive(),
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

export const cursoYmlSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "el slug solo admite minusculas, numeros y guiones"),
  version: z.number().int().positive(),
  titulo: z.string().min(1),
  resumen: z.string().min(1),
  horasEstimadas: z.number().positive(),
  unidades: z.array(z.string().min(1)).min(1),
});
export type CursoYml = z.infer<typeof cursoYmlSchema>;
