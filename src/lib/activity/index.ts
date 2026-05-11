import { db } from "@/lib/db"
import type { Prisma } from "@prisma/client"

type LogActivityInput = {
  workspaceId: string
  actorId: string
  action: string
  targetType: string
  targetId?: string
  metadata?: Prisma.InputJsonValue
}

export async function logActivity(input: LogActivityInput) {
  return db.activityLog.create({
    data: {
      workspaceId: input.workspaceId,
      actorId: input.actorId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId ?? null,
      metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  })
}