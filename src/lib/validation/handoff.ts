import { z } from "zod"

export const createHandoffPackageSchema = z.object({
  academicYear: z.string().min(1, "Academic year is required"),
  title: z.string().min(1, "Title is required").max(200),
  summary: z.string().max(2000).optional(),
})

export const createHandoffSectionSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  role: z.string().max(100).optional(),
  content: z.string().min(1, "Content is required"),
  orderIdx: z.number().default(0),
})

export type CreateHandoffPackageInput = z.infer<typeof createHandoffPackageSchema>
export type CreateHandoffSectionInput = z.infer<typeof createHandoffSectionSchema>
