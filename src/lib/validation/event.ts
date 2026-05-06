import { z } from "zod"

export const createEventSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  location: z.string().max(200).optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
})

export type CreateEventInput = z.infer<typeof createEventSchema>