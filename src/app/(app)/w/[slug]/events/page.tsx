import { requireUser } from "@/lib/auth"
import { getWorkspaceBySlug } from "@/modules/workspaces/queries"
import { getEventsByWorkspace } from "@/modules/events/queries"
import { can } from "@/lib/permissions"
import { notFound } from "next/navigation"
import Link from "next/link"
import CreateEventButton from "./CreateEventButton"

export default async function EventsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const user = await requireUser()
  const { slug } = await params

  const workspace = await getWorkspaceBySlug(slug)
  if (!workspace) notFound()

  const events = await getEventsByWorkspace(workspace.id)
  const canCreate = await can(user.id, workspace.id, "event.create")

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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Events</h1>
          {canCreate && <CreateEventButton workspaceId={workspace.id} />}
        </div>

        {events.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg mb-1">No events yet</p>
            <p className="text-sm">Create your first event to get started</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/w/${slug}/events/${event.id}`}
                className="block border rounded-lg p-5 hover:bg-gray-50 transition"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{event.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[event.status]}`}>
                    {event.status}
                  </span>
                </div>
                {event.description && (
                  <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                )}
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                  {event.location && <span>📍 {event.location}</span>}
                  {event.startsAt && (
                    <span>📅 {new Date(event.startsAt).toLocaleDateString()}</span>
                  )}
                  <span>👥 {event.members.length} members</span>
                  <span>✓ {event._count.tasks} tasks</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}