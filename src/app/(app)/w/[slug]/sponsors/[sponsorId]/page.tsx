import { requireUser } from "@/lib/auth"
import { getWorkspaceBySlug } from "@/modules/workspaces/queries"
import { getSponsorById } from "@/modules/sponsors/queries"
import { can } from "@/lib/permissions"
import { notFound } from "next/navigation"
import SponsorActions from "./SponsorActions"

const statusColors: Record<string, string> = {
  NOT_CONTACTED: "bg-gray-100 text-gray-500",
  CONTACTED: "bg-blue-100 text-blue-600",
  FOLLOW_UP_NEEDED: "bg-yellow-100 text-yellow-700",
  INTERESTED: "bg-green-100 text-green-600",
  CONFIRMED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-600",
  ARCHIVED: "bg-gray-100 text-gray-400",
}

export default async function SponsorDetailPage({
  params,
}: {
  params: Promise<{ slug: string; sponsorId: string }>
}) {
  const user = await requireUser()
  const { slug, sponsorId } = await params

  const workspace = await getWorkspaceBySlug(slug)
  if (!workspace) notFound()

  const canView = await can(user.id, workspace.id, "sponsor.view")
  if (!canView) notFound()

  const sponsor = await getSponsorById(sponsorId)
  if (!sponsor || sponsor.workspaceId !== workspace.id) notFound()

  const canEdit = await can(user.id, workspace.id, "sponsor.edit")
  const canNote = await can(user.id, workspace.id, "sponsor.note")

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{sponsor.companyName}</h1>
            {sponsor.contactName && (
              <p className="text-gray-500 mt-1">
                {sponsor.contactName}
                {sponsor.contactEmail && ` · ${sponsor.contactEmail}`}
              </p>
            )}
          </div>
          <span className={`text-sm px-3 py-1 rounded-full ${statusColors[sponsor.status]}`}>
            {sponsor.status.replace(/_/g, " ")}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-3">Details</h2>
            <div className="space-y-2 text-sm">
              {sponsor.tier && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Tier</span>
                  <span>{sponsor.tier}</span>
                </div>
              )}
              {sponsor.owner && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Owner</span>
                  <span>{sponsor.owner.name ?? sponsor.owner.email}</span>
                </div>
              )}
              {sponsor.lastContactedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Last contacted</span>
                  <span>{new Date(sponsor.lastContactedAt).toLocaleDateString()}</span>
                </div>
              )}
              {sponsor.nextFollowUpAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Next follow up</span>
                  <span>{new Date(sponsor.nextFollowUpAt).toLocaleDateString()}</span>
                </div>
              )}
              {sponsor.academicYear && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Academic year</span>
                  <span>{sponsor.academicYear}</span>
                </div>
              )}
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-3">Tasks ({sponsor.tasks.length})</h2>
            {sponsor.tasks.length === 0 ? (
              <p className="text-sm text-gray-400">No tasks yet</p>
            ) : (
              <ul className="space-y-2">
                {sponsor.tasks.map((task) => (
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

          <div className="border rounded-lg p-4 md:col-span-2">
            <h2 className="font-semibold mb-3">Contact History</h2>
            {sponsor.notes.length === 0 ? (
              <p className="text-sm text-gray-400 mb-4">No notes yet</p>
            ) : (
              <ul className="space-y-3 mb-4">
                {sponsor.notes.map((note) => (
                  <li key={note.id} className="border-l-2 border-gray-200 pl-3">
                    <p className="text-sm">{note.content}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {note.author.name ?? note.author.email} ·{" "}
                      {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            {canNote && (
              <SponsorActions
                workspaceId={workspace.id}
                sponsorId={sponsor.id}
                canEdit={canEdit}
                currentStatus={sponsor.status}
              />
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
