import { db } from "@/lib/db"
import { logActivity } from "@/lib/activity"
import type { CreateEventInput } from "@/lib/validation/event"

export async function createEvent(
  userId: string,
  workspaceId: string,
  input: CreateEventInput
) {
  const event = await db.event.create({
    data: {
      workspaceId,
      name: input.name,
      description: input.description || null,
      location: input.location || null,
      startsAt: input.startsAt ? new Date(input.startsAt) : null,
      endsAt: input.endsAt ? new Date(input.endsAt) : null,
      status: "PLANNING",
      createdById: userId,
    },
  })

  await logActivity({
    workspaceId,
    actorId: userId,
    action: "event.created",
    targetType: "event",
    targetId: event.id,
    metadata: { eventName: event.name },
  })

  return event
}