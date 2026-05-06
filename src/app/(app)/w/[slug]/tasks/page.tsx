import { requireUser } from "@/lib/auth"
import { getWorkspaceBySlug } from "@/modules/workspaces/queries"
import { getTasksByWorkspace } from "@/modules/tasks/queries"
import { can } from "@/lib/permissions"
import { notFound } from "next/navigation"
import CreateTaskButton from "./CreateTaskButton"
import TaskList from "./TaskList"

export default async function TasksPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const user = await requireUser()
  const { slug } = await params

  const workspace = await getWorkspaceBySlug(slug)
  if (!workspace) notFound()

  const tasks = await getTasksByWorkspace(workspace.id)
  const canCreate = await can(user.id, workspace.id, "task.create")

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Tasks</h1>
          {canCreate && (
            <CreateTaskButton workspaceId={workspace.id} />
          )}
        </div>

        <TaskList
          tasks={tasks}
          workspaceId={workspace.id}
          currentUserId={user.id}
        />
      </div>
    </div>
  )
}