import { db } from "@/lib/db"
import { logActivity } from "@/lib/activity"
import type { CreateWorkspaceInput } from "@/lib/validation/workspace"

export async function createWorkspace(
  userId: string,
  input: CreateWorkspaceInput
) {
  const slug = input.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")

  const existing = await db.workspace.findUnique({ where: { slug } })
  if (existing) {
    throw new Error("A workspace with this name already exists")
  }

  const workspace = await db.workspace.create({
    data: {
      name: input.name,
      slug,
      description: input.description || null,
      university: input.university || null,
      createdById: userId,
      members: {
        create: {
          userId,
          role: "OWNER",
          status: "ACTIVE",
        },
      },
    },
  })

  await logActivity({
    workspaceId: workspace.id,
    actorId: userId,
    action: "workspace.created",
    targetType: "workspace",
    targetId: workspace.id,
    metadata: { workspaceName: workspace.name },
  })

  return workspace
}