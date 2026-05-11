import { requireUser } from "@/lib/auth"
import { getWorkspaceBySlug } from "@/modules/workspaces/queries"
import { getSponsorsByWorkspace } from "@/modules/sponsors/queries"
import { can } from "@/lib/permissions"
import { notFound } from "next/navigation"
import Link from "next/link"
import CreateSponsorButton from "./CreateSponsorButton"

const statusColors: Record<string, string> = {
  NOT_CONTACTED: "bg-gray-100 text-gray-500",
  CONTACTED: "bg-blue-100 text-blue-600",
  FOLLOW_UP_NEEDED: "bg-yellow-100 text-yellow-700",
  INTERESTED: "bg-green-100 text-green-600",
  CONFIRMED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-600",
  ARCHIVED: "bg-gray-100 text-gray-400",
}

const tierColors: Record<string, string> = {
  BRONZE: "bg-orange-100 text-orange-700",
  SILVER: "bg-gray-100 text-gray-600",
  GOLD: "bg-yellow-100 text-yellow-700",
  PLATINUM: "bg-purple-100 text-purple-600",
  CUSTOM: "bg-blue-100 text-blue-600",
}

export default async function SponsorsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const user = await requireUser()
  const { slug } = await params

  const workspace = await getWorkspaceBySlug(slug)
  if (!workspace) notFound()

  const canView = await can(user.id, workspace.id, "sponsor.view")
  if (!canView) notFound()

  const sponsors = await getSponsorsByWorkspace(workspace.id)
  const canCreate = await can(user.id, workspace.id, "sponsor.create")

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Sponsors</h1>
          {canCreate && <CreateSponsorButton workspaceId={workspace.id} />}
        </div>

        {sponsors.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg mb-1">No sponsors yet</p>
            <p className="text-sm">Start tracking your sponsor outreach</p>
          </div>
        ) : (
          <div className="border rounded-lg divide-y">
            {sponsors.map((sponsor) => (
              <Link
                key={sponsor.id}
                href={`/w/${slug}/sponsors/${sponsor.id}`}
                className="block p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{sponsor.companyName}</p>
                    {sponsor.contactName && (
                      <p className="text-sm text-gray-500">{sponsor.contactName}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {sponsor.tier && (
                      <span className={`text-xs px-2 py-0.5 rounded ${tierColors[sponsor.tier]}`}>
                        {sponsor.tier}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded ${statusColors[sponsor.status]}`}>
                      {sponsor.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
                <div className="flex gap-4 mt-2 text-xs text-gray-400">
                  {sponsor.owner && <span>{sponsor.owner.name ?? sponsor.owner.email}</span>}
                  {sponsor.nextFollowUpAt && (
                    <span>Follow up {new Date(sponsor.nextFollowUpAt).toLocaleDateString()}</span>
                  )}
                  {sponsor.notes.length > 0 && (
                    <span>{sponsor.notes[0].content.slice(0, 50)}...</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
