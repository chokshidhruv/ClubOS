import { db } from "@/lib/db"
import { logActivity } from "@/lib/activity"
import type { CreateTaskInput, UpdateTaskInput } from "@/lib/validation/task"

export async function createTask(
  userId: string,
  workspaceId: string,
  input: CreateTaskInput
) {
  const task = await db.task.create({
    data: {
      workspaceId,
      title: input.title,
      description: input.description || null,
      assigneeId: input.assigneeId || null,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      priority: input.priority,
      eventId: input.eventId || null,
      sponsorId: input.sponsorId || null,
      status: "TODO",
      createdById: userId,
    },
  })

  await logActivity({
    workspaceId,
    actorId: userId,
    action: "task.created",
    targetType: "task",
    targetId: task.id,
    metadata: { taskTitle: task.title },
  })

  return task
}

export async function updateTaskStatus(
  userId: string,
  workspaceId: string,
  taskId: string,
  input: UpdateTaskInput
) {
  const task = await db.task.update({
    where: { id: taskId },
    data: {
      ...input,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      completedAt: input.status === "DONE" ? new Date() : undefined,
    },
  })

  await logActivity({
    workspaceId,
    actorId: userId,
    action: "task.status_changed",
    targetType: "task",
    targetId: task.id,
    metadata: { status: input.status },
  })

  return task
}