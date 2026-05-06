import { z } from "zod"

export const createDocumentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(500).optional(),
  type: z.enum(["TEXT_NOTE", "EXTERNAL_LINK", "FILE_UPLOAD"]),
  category: z.enum([
    "GENERAL", "EVENT", "SPONSOR", "FINANCE",
    "MARKETING", "HANDOFF", "MEETING_NOTES", "CONTRACT", "OTHER"
  ]),
  visibility: z.enum([
    "EVERYONE", "EXECUTIVES_ONLY", "EVENT_TEAM_ONLY",
    "SPONSORSHIP_ONLY", "FINANCE_ONLY", "OWNER_ONLY"
  ]).default("EVERYONE"),
  url: z.string().url().optional(),
  content: z.string().optional(),
  eventId: z.string().optional(),
  sponsorId: z.string().optional(),
})

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>