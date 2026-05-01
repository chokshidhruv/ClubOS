import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const user = await requireUser()
  const { slug } = await params

  const workspace = await db.workspace.findUnique({
    where: { slug },
    include: {
      members: {
        where: { status: "ACTIVE" },
        include: { user: true },
      },
      events: {
        where: { archivedAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      activity: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { actor: true },
      },
    },
  })

  if (!workspace) notFound()

  const member = workspace.members.find((m: { userId: string; role: string }) => m.userId === user.id)

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
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

          {/* Recent Events */}
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-3">Recent Events</h2>
            {workspace.events.length === 0 ? (
              <p className="text-sm text-gray-400">No events yet</p>
            ) : (
              <ul className="space-y-2">
                {workspace.events.map((event: { id: string; name: string; status: string }) => (
                <li key={event.id} className="text-sm">
                    <span className="font-medium">{event.name}</span>
                    <span className="text-gray-400 ml-2">{event.status}</span>
                </li>
                ))}
              </ul>
            )}
          </div>

          {/* Members */}
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-3">
              Members ({workspace.members.length})
            </h2>
            <ul className="space-y-2">
              {workspace.members.map((m: { id: string; role: string; user: { name: string | null; email: string } }) => (
            <li key={m.id} className="text-sm flex justify-between">
                <span>{m.user.name ?? m.user.email}</span>
                <span className="text-gray-400">{m.role}</span>
            </li>
            ))}
            </ul>
          </div>

          {/* Activity Feed */}
          <div className="border rounded-lg p-4 md:col-span-2">
            <h2 className="font-semibold mb-3">Recent Activity</h2>
            {workspace.activity.length === 0 ? (
              <p className="text-sm text-gray-400">No activity yet</p>
            ) : (
              <ul className="space-y-2">
                {workspace.activity.map((log: { id: string; action: string; createdAt: Date; actor: { name: string | null; email: string } }) => (
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