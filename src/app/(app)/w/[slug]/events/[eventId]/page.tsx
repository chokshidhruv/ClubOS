import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { can } from "@/lib/permissions"
import { notFound } from "next/navigation"

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string; eventId: string }>
}) {
  const user = await requireUser()
  const { slug, eventId } = await params

  const workspace = await db.workspace.findUnique({
    where: { slug },
  })

  if (!workspace) notFound()

  const event = await db.event.findUnique({
    where: { id: eventId },
    include: {
      members: {
        include: { user: true },
      },
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

  if (!event || event.workspaceId !== workspace.id) notFound()

  const canEdit = await can(user.id, workspace.id, "event.edit")

  const statusColors: Record<string, string> = {
    PLANNING: "bg-yellow-100 text-yellow-700",
    ACTIVE: "bg-green-100 text-green-700",
    COMPLETED: "bg-blue-100 text-blue-700",
    CANCELLED: "bg-red-100 text-red-700",
    ARCHIVED: "bg-gray-100 text-gray-500",
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{event.name}</h1>
            <span className={`text-xs px-2 py-1 rounded-full ${statusColors[event.status]}`}>
              {event.status}
            </span>
          </div>
          {event.description && (
            <p className="text-gray-500 mt-2">{event.description}</p>
          )}
          <div className="flex gap-4 mt-3 text-sm text-gray-400">
            {event.location && <span>📍 {event.location}</span>}
            {event.startsAt && (
              <span>📅 {new Date(event.startsAt).toLocaleDateString()}</span>
            )}
            {event.endsAt && (
              <span>→ {new Date(event.endsAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Members */}
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-3">
              Event Team ({event.members.length})
            </h2>
            {event.members.length === 0 ? (
              <p className="text-sm text-gray-400">No members assigned yet</p>
            ) : (
              <ul className="space-y-2">
                {event.members.map((m) => (
                  <li key={m.id} className="flex justify-between text-sm">
                    <span>{m.user.name ?? m.user.email}</span>
                    <span className="text-gray-400 text-xs">{m.role}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Tasks */}
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-3">
              Tasks ({event.tasks.length})
            </h2>
            {event.tasks.length === 0 ? (
              <p className="text-sm text-gray-400">No tasks yet</p>
            ) : (
              <ul className="space-y-2">
                {event.tasks.map((task) => (
                  <li key={task.id} className="flex justify-between text-sm">
                    <span className={task.status === "DONE" ? "line-through text-gray-400" : ""}>
                      {task.title}
                    </span>
                    <span className="text-gray-400 text-xs">{task.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Documents */}
          <div className="border rounded-lg p-4 md:col-span-2">
            <h2 className="font-semibold mb-3">
              Documents ({event.documents.length})
            </h2>
            {event.documents.length === 0 ? (
              <p className="text-sm text-gray-400">No documents attached yet</p>
            ) : (
              <ul className="space-y-2">
                {event.documents.map((doc) => (
                  <li key={doc.id} className="flex justify-between text-sm">
                    <span>{doc.title}</span>
                    <span className="text-gray-400 text-xs">{doc.category}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Retrospective */}
          {event.status === "COMPLETED" && (
            <div className="border rounded-lg p-4 md:col-span-2">
              <h2 className="font-semibold mb-3">Retrospective</h2>
              {event.retrospective ? (
                <p className="text-sm text-gray-600">{event.retrospective}</p>
              ) : (
                <p className="text-sm text-gray-400">
                  No retrospective written yet
                </p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}