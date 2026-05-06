import { db } from "@/lib/db"

export async function getMembersByWorkspace(workspaceId: string) {
  return db.workspaceMember.findMany({
    where: { workspaceId, status: "ACTIVE" },
    include: { user: true },
    orderBy: { joinedAt: "asc" },
  })
}

export async function getMember(workspaceId: string, userId: string) {
  return db.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId, userId },
    },
  })
}