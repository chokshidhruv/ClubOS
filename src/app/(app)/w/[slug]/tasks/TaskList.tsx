"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Task = {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  dueDate: Date | null
  assignee: { name: string | null; email: string } | null
  createdBy: { name: string | null; email: string }
}

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-500",
  NORMAL: "bg-blue-100 text-blue-600",
  HIGH: "bg-orange-100 text-orange-600",
  URGENT: "bg-red-100 text-red-600",
}

const statusColors: Record<string, string> = {
  TODO: "bg-gray-100 text-gray-600",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  BLOCKED: "bg-red-100 text-red-600",
  DONE: "bg-green-100 text-green-700",
}

export default function TaskList({
  tasks,
  workspaceId,
  currentUserId,
}: {
  tasks: Task[]
  workspaceId: string
  currentUserId: string
}) {
  const router = useRouter()
  const [updating, setUpdating] = useState<string | null>(null)

  async function updateStatus(taskId: string, status: string) {
    setUpdating(taskId)
    await fetch(`/api/workspaces/${workspaceId}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    setUpdating(null)
    router.refresh()
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg mb-1">No tasks yet</p>
        <p className="text-sm">Create your first task to get started</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg divide-y">
      {tasks.map((task) => (
        <div key={task.id} className="p-4 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded ${statusColors[task.status]}`}>
                {task.status.replace("_", " ")}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
              <span className="font-medium text-sm">{task.title}</span>
            </div>
            {task.description && (
              <p className="text-xs text-gray-400 mt-1">{task.description}</p>
            )}
            <div className="flex gap-3 mt-1 text-xs text-gray-400">
              {task.assignee && (
                <span>👤 {task.assignee.name ?? task.assignee.email}</span>
              )}
              {task.dueDate && (
                <span>📅 {new Date(task.dueDate).toLocaleDateString()}</span>
              )}
            </div>
          </div>

          <div className="ml-4">
            {task.status !== "DONE" ? (
              <button
                onClick={() => updateStatus(task.id, "DONE")}
                disabled={updating === task.id}
                className="text-xs border rounded px-3 py-1.5 hover:bg-gray-50 disabled:opacity-50"
              >
                {updating === task.id ? "..." : "Mark done"}
              </button>
            ) : (
              <button
                onClick={() => updateStatus(task.id, "TODO")}
                disabled={updating === task.id}
                className="text-xs border rounded px-3 py-1.5 hover:bg-gray-50 disabled:opacity-50 text-gray-400"
              >
                Reopen
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}