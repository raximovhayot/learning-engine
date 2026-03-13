import { z } from "zod";

export const exerciseSchema = z.object({
  type: z.enum(["mcq", "fill_blank", "free_text"]),
  prompt: z.string().describe("The question or prompt for the exercise"),
  options: z.array(z.string()).optional().describe("For MCQ: array of 4 options"),
  correctAnswer: z.string().describe("The correct answer"),
  explanation: z.string().describe("Explanation of the correct answer"),
  hints: z.array(z.string()).describe("Array of 3 progressive hints, from subtle to specific"),
  subject: z.string().describe("Subject area (math, physics, code, general)"),
  topic: z.string().describe("Specific topic within the subject"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
});

export type Exercise = z.infer<typeof exerciseSchema>;

export const lessonStepContentSchema = z.object({
  title: z.string(),
  body: z.string().describe("Markdown content for the step"),
});

export const lessonStepSchema = z.object({
  type: z.enum(["content", "exercise"]),
  contentData: lessonStepContentSchema.optional(),
  exerciseData: exerciseSchema.optional(),
});

export const lessonSchema = z.object({
  title: z.string(),
  description: z.string(),
  steps: z.array(lessonStepSchema).min(2).max(8),
});

export type Lesson = z.infer<typeof lessonSchema>;

export const unitSchema = z.object({
  title: z.string(),
  description: z.string(),
  lessons: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        estimatedMinutes: z.number(),
      })
    )
    .min(1)
    .max(5),
});

export const courseSchema = z.object({
  title: z.string(),
  description: z.string(),
  subject: z.enum(["math", "programming", "science", "general"]),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  estimatedMinutes: z.number(),
  units: z.array(unitSchema).min(1).max(5),
});

export type CourseStructure = z.infer<typeof courseSchema>;

export const answerCheckSchema = z.object({
  isCorrect: z.boolean(),
  feedback: z.string().describe("Detailed, encouraging feedback"),
  partialCredit: z.number().min(0).max(1).optional(),
  hint: z.string().optional(),
});

export type AnswerCheck = z.infer<typeof answerCheckSchema>;
