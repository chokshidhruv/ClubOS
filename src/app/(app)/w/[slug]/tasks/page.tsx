import { requireUser } from "@/lib/auth"
import { getWorkspaceBySlug } from "@/modules/workspaces/queries"
import { getTasksByWorkspace } from "@/modules/tasks/queries"
import { getMembersByWorkspace } from "@/modules/members/queries"
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

  const [tasks, members, canCreate] = await Promise.all([
    getTasksByWorkspace(workspace.id),
    getMembersByWorkspace(workspace.id),
    can(user.id, workspace.id, "task.create"),
  ])

  const memberOptions = members.map((m) => ({ id: m.userId, name: m.user.name, email: m.user.email }))

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Tasks</h1>
          {canCreate && (
            <CreateTaskButton workspaceId={workspace.id} members={memberOptions} />
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