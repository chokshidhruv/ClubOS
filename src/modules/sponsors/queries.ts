import { db } from "@/lib/db"

export async function getSponsorsByWorkspace(workspaceId: string) {
  return db.sponsor.findMany({
    where: { workspaceId, archivedAt: null },
    orderBy: { updatedAt: "desc" },
    include: {
      owner: true,
      notes: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { author: true },
      },
      _count: { select: { tasks: true } },
    },
  })
}

export async function getSponsorById(sponsorId: string) {
  return db.sponsor.findUnique({
    where: { id: sponsorId },
    include: {
      owner: true,
      notes: {
        orderBy: { createdAt: "desc" },
        include: { author: true },
      },
      tasks: {
        include: { assignee: true },
        orderBy: { createdAt: "desc" },
      },
      documents: {
        where: { archivedAt: null },
        orderBy: { createdAt: "desc" },
      },
    },
  })
}
