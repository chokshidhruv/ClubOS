import { db } from "@/lib/db"
import { logActivity } from "@/lib/activity"
import { randomBytes } from "crypto"
import type { WorkspaceRole } from "@prisma/client"

export async function changeMemberRole(
  actorId: string,
  workspaceId: string,
  memberId: string,
  newRole: WorkspaceRole
) {
  const target = await db.workspaceMember.findUnique({ where: { id: memberId } })
  if (!target) throw new Error("Member not found")
  if (target.role === "OWNER") throw new Error("Cannot change the workspace owner's role")
  if (target.userId === actorId) throw new Error("Cannot change your own role")

  const oldRole = target.role
  const updated = await db.workspaceMember.update({
    where: { id: memberId },
    data: { role: newRole },
  })

  await logActivity({
    workspaceId,
    actorId,
    action: "workspace.role_changed",
    targetType: "member",
    targetId: memberId,
    metadata: { oldRole, newRole },
  })

  return updated
}

export async function createInvitation(
  createdById: string,
  workspaceId: string,
  role: WorkspaceRole
) {
  const token = randomBytes(32).toString("base64url")
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const invitation = await db.invitation.create({
    data: {
      workspaceId,
      token,
      role,
      expiresAt,
      createdById,
    },
  })

  await logActivity({
    workspaceId,
    actorId: createdById,
    action: "workspace.member_invited",
    targetType: "invitation",
    targetId: invitation.id,
  })

  return invitation
}

export async function acceptInvitation(
  token: string,
  userId: string
) {
  const invitation = await db.invitation.findUnique({
    where: { token },
    include: { workspace: true },
  })

  if (!invitation) throw new Error("Invitation not found")
  if (invitation.acceptedAt || invitation.revokedAt) throw new Error("Invitation no longer valid")
  if (new Date() > invitation.expiresAt) throw new Error("Invitation expired")

  const existing = await db.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: invitation.workspaceId,
        userId,
      },
    },
  })

  if (existing) return invitation.workspace

  await db.workspaceMember.create({
    data: {
      workspaceId: invitation.workspaceId,
      userId,
      role: invitation.role,
      status: "ACTIVE",
    },
  })

  await db.invitation.update({
    where: { token },
    data: { acceptedAt: new Date(), acceptedById: userId },
  })

  await logActivity({
    workspaceId: invitation.workspaceId,
    actorId: userId,
    action: "workspace.member_joined",
    targetType: "workspace",
    targetId: invitation.workspaceId,
  })

  return invitation.workspace
}