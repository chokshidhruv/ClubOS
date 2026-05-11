import { z } from "zod"

export const createSponsorSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(200),
  contactName: z.string().max(200).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(50).optional(),
  status: z.enum([
    "NOT_CONTACTED", "CONTACTED", "FOLLOW_UP_NEEDED",
    "INTERESTED", "CONFIRMED", "REJECTED", "ARCHIVED",
  ]).default("NOT_CONTACTED"),
  tier: z.enum(["BRONZE", "SILVER", "GOLD", "PLATINUM", "CUSTOM"]).optional(),
  nextFollowUpAt: z.string().optional(),
  academicYear: z.string().optional(),
})

export const updateSponsorSchema = z.object({
  status: z.enum([
    "NOT_CONTACTED", "CONTACTED", "FOLLOW_UP_NEEDED",
    "INTERESTED", "CONFIRMED", "REJECTED", "ARCHIVED",
  ]).optional(),
  tier: z.enum(["BRONZE", "SILVER", "GOLD", "PLATINUM", "CUSTOM"]).optional(),
  nextFollowUpAt: z.string().optional(),
  ownerId: z.string().optional(),
})

export const createSponsorNoteSchema = z.object({
  content: z.string().min(1, "Note cannot be empty").max(2000),
})

export type CreateSponsorInput = z.infer<typeof createSponsorSchema>
export type UpdateSponsorInput = z.infer<typeof updateSponsorSchema>
export type CreateSponsorNoteInput = z.infer<typeof createSponsorNoteSchema>
