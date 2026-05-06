import { db } from "@/lib/db"

export async function getEventsByWorkspace(workspaceId: string) {
  return db.event.findMany({
    where: { workspaceId, archivedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      members: { include: { user: true } },
      _count: { select: { tasks: true, documents: true } },
    },
  })
}

export async function getEventById(eventId: string) {
  return db.event.findUnique({
    where: { id: eventId },
    include: {
      members: { include: { user: true } },
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