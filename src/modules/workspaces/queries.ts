import { db } from "@/lib/db"

export async function getWorkspaceBySlug(slug: string) {
  return db.workspace.findUnique({
    where: { slug },
  })
}

export async function getWorkspaceById(id: string) {
  return db.workspace.findUnique({
    where: { id },
  })
}

export async function getWorkspaceWithMembers(slug: string) {
  return db.workspace.findUnique({
    where: { slug },
    include: {
      members: {
        where: { status: "ACTIVE" },
        include: { user: true },
        orderBy: { joinedAt: "asc" },
      },
    },
  })
}

export async function getWorkspaceDashboard(slug: string) {
  return db.workspace.findUnique({
    where: { slug },
    include: {
      members: {
        where: { status: "ACTIVE" },
        include: { user: true },
      },
      events: {
        where: { archivedAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      activity: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { actor: true },
      },
    },
  })
}

export async function getUserWorkspaces(userId: string) {
  return db.workspaceMember.findMany({
    where: {
      userId,
      status: "ACTIVE",
    },
    include: {
      workspace: true,
    },
  })
}

export async function getWorkspaceMember(workspaceId: string, userId: string) {
  return db.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId, userId },
    },
  })
}