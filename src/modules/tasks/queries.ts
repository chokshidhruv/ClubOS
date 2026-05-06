import { db } from "@/lib/db"

export async function getTasksByWorkspace(workspaceId: string) {
  return db.task.findMany({
    where: { workspaceId, status: { not: "ARCHIVED" } },
    orderBy: { createdAt: "desc" },
    include: {
      assignee: true,
      createdBy: true,
    },
  })
}

export async function getTasksByEvent(eventId: string) {
  return db.task.findMany({
    where: { eventId, status: { not: "ARCHIVED" } },
    orderBy: { createdAt: "desc" },
    include: {
      assignee: true,
      createdBy: true,
    },
  })
}

export async function getMyTasks(userId: string) {
  return db.task.findMany({
    where: {
      assigneeId: userId,
      status: { not: "ARCHIVED" },
    },
    orderBy: { dueDate: "asc" },
    include: {
      workspace: true,
      assignee: true,
    },
  })
}

export async function getTaskById(taskId: string) {
  return db.task.findUnique({
    where: { id: taskId },
    include: {
      assignee: true,
      createdBy: true,
    },
  })
}