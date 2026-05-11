import { requireUser } from "@/lib/auth"
import { getWorkspaceBySlug } from "@/modules/workspaces/queries"
import { getHandoffPackagesByWorkspace } from "@/modules/handoff/queries"
import { can } from "@/lib/permissions"
import { notFound } from "next/navigation"
import Link from "next/link"
import CreateHandoffButton from "./CreateHandoffButton"

export default async function HandoffPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const user = await requireUser()
  const { slug } = await params

  const workspace = await getWorkspaceBySlug(slug)
  if (!workspace) notFound()

  const canView = await can(user.id, workspace.id, "handoff.view")
  if (!canView) notFound()

  const packages = await getHandoffPackagesByWorkspace(workspace.id)
  const canCreate = await can(user.id, workspace.id, "handoff.create")

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Handoff Hub</h1>
            <p className="text-gray-500 text-sm mt-1">
              Institutional knowledge for incoming executives
            </p>
          </div>
          {canCreate && <CreateHandoffButton workspaceId={workspace.id} slug={slug} />}
        </div>

        {packages.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg mb-1">No handoff packages yet</p>
            <p className="text-sm">Create one to preserve knowledge for incoming executives</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {packages.map((pkg) => (
              <Link
                key={pkg.id}
                href={`/w/${slug}/handoff/${pkg.id}`}
                className="block border rounded-lg p-5 hover:bg-gray-50 transition"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{pkg.title}</h3>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {pkg.academicYear}
                  </span>
                </div>
                {pkg.summary && (
                  <p className="text-sm text-gray-500 mt-1">{pkg.summary}</p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {pkg.sections.length} sections ·{" "}
                  {pkg.publishedAt ? "Published" : "Draft"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
