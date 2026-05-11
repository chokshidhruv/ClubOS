import { db } from "@/lib/db"
import { logActivity } from "@/lib/activity"
import type {
  CreateHandoffPackageInput,
  CreateHandoffSectionInput,
} from "@/lib/validation/handoff"

export async function createHandoffPackage(
  userId: string,
  workspaceId: string,
  input: CreateHandoffPackageInput
) {
  const pkg = await db.handoffPackage.create({
    data: {
      workspaceId,
      academicYear: input.academicYear,
      title: input.title,
      summary: input.summary || null,
      createdById: userId,
    },
  })

  await logActivity({
    workspaceId,
    actorId: userId,
    action: "handoff.created",
    targetType: "handoff",
    targetId: pkg.id,
    metadata: { title: pkg.title },
  })

  return pkg
}

export async function addHandoffSection(
  packageId: string,
  input: CreateHandoffSectionInput
) {
  return db.handoffSection.create({
    data: {
      packageId,
      title: input.title,
      role: input.role || null,
      content: input.content,
      orderIdx: input.orderIdx,
    },
  })
}
