import { requireUser } from "@/lib/auth"
import { getWorkspaceDashboard } from "@/modules/workspaces/queries"
import { notFound } from "next/navigation"

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const user = await requireUser()
  const { slug } = await params

  const workspace = await getWorkspaceDashboard(slug)
  if (!workspace) notFound()

  const member = workspace.members.find((m) => m.userId === user.id)

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{workspace.name}</h1>
          {workspace.university && (
            <p className="text-gray-500 mt-1">{workspace.university}</p>
          )}
          <span className="inline-block mt-2 text-xs bg-gray-100 px-2 py-1 rounded">
            {member?.role}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-3">Recent Events</h2>
            {workspace.events.length === 0 ? (
              <p className="text-sm text-gray-400">No events yet</p>
            ) : (
              <ul className="space-y-2">
                {workspace.events.map((event) => (
                  <li key={event.id} className="text-sm">
                    <span className="font-medium">{event.name}</span>
                    <span className="text-gray-400 ml-2">{event.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-3">
              Members ({workspace.members.length})
            </h2>
            <ul className="space-y-2">
              {workspace.members.map((m) => (
                <li key={m.id} className="text-sm flex justify-between">
                  <span>{m.user.name ?? m.user.email}</span>
                  <span className="text-gray-400">{m.role}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border rounded-lg p-4 md:col-span-2">
            <h2 className="font-semibold mb-3">Recent Activity</h2>
            {workspace.activity.length === 0 ? (
              <p className="text-sm text-gray-400">No activity yet</p>
            ) : (
              <ul className="space-y-2">
                {workspace.activity.map((log) => (
                  <li key={log.id} className="text-sm text-gray-600">
                    <span className="font-medium text-black">
                      {log.actor.name ?? log.actor.email}
                    </span>{" "}
                    {log.action}{" "}
                    <span className="text-gray-400 text-xs">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}