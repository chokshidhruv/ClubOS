import { requireUser } from "@/lib/auth"
import { getUserWorkspaces } from "@/modules/workspaces/queries"
import Link from "next/link"

export default async function WorkspacesPage() {
  const user = await requireUser()
  const memberships = await getUserWorkspaces(user.id)

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Your Workspaces</h1>
          <Link
            href="/workspaces/new"
            className="bg-black text-white px-4 py-2 rounded-md text-sm"
          >
            Create Workspace
          </Link>
        </div>

        <div className="mb-4">
          <Link
            href="/workspaces/tasks"
            className="text-sm text-gray-500 hover:text-black"
          >
            My Tasks →
          </Link>
        </div>

        {memberships.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg mb-2">No workspaces yet</p>
            <p className="text-sm">Create one to get started</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {memberships.map((m) => (
              <Link
                key={m.workspace.id}
                href={`/w/${m.workspace.slug}/dashboard`}
                className="block border rounded-lg p-4 hover:bg-gray-50 transition"
              >
                <div className="font-medium">{m.workspace.name}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {m.workspace.university ?? "No university set"} · {m.role}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}