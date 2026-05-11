import { requireUser } from "@/lib/auth"
import { getMyTasks } from "@/modules/tasks/queries"
import Link from "next/link"

const priorityColors: Record<string, string> = {
  URGENT: "bg-red-100 text-red-600",
  HIGH: "bg-orange-100 text-orange-600",
  NORMAL: "bg-gray-100 text-gray-500",
  LOW: "bg-blue-100 text-blue-500",
}

const OPEN_STATUSES = new Set(["TODO", "IN_PROGRESS", "BLOCKED"])

export default async function MyTasksPage() {
  const user = await requireUser()
  const tasks = await getMyTasks(user.id)

  const open = tasks.filter((t) => OPEN_STATUSES.has(t.status))
  const done = tasks.filter((t) => t.status === "DONE")

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/workspaces" className="text-xs text-gray-400 hover:text-black">
            ← All workspaces
          </Link>
          <h1 className="text-2xl font-bold mt-3">My Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">Tasks assigned to you across all workspaces</p>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg mb-1">No tasks assigned to you</p>
            <p className="text-sm">Tasks from all your workspaces will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {open.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-gray-500 mb-2">Open ({open.length})</h2>
                <div className="border rounded-lg divide-y">
                  {open.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Link
                            href={`/w/${task.workspace.slug}/tasks`}
                            className="text-xs text-blue-500 hover:underline"
                          >
                            {task.workspace.name}
                          </Link>
                          {task.dueDate && (
                            <span className="text-xs text-gray-400">
                              Due {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-4">
                        <span className="text-xs text-gray-400">{task.status.replace("_", " ")}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {done.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-gray-500 mb-2">Done ({done.length})</h2>
                <div className="border rounded-lg divide-y">
                  {done.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 opacity-60">
                      <div className="min-w-0">
                        <p className="text-sm line-through truncate">{task.title}</p>
                        <Link
                          href={`/w/${task.workspace.slug}/tasks`}
                          className="text-xs text-blue-500 hover:underline mt-1 block"
                        >
                          {task.workspace.name}
                        </Link>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded shrink-0 ml-4 ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
