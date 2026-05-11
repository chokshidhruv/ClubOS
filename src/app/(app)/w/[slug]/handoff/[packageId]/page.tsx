import { requireUser } from "@/lib/auth"
import { getWorkspaceBySlug } from "@/modules/workspaces/queries"
import { getHandoffPackageById } from "@/modules/handoff/queries"
import { can } from "@/lib/permissions"
import { notFound } from "next/navigation"
import AddSectionButton from "./AddSectionButton"

export default async function HandoffPackagePage({
  params,
}: {
  params: Promise<{ slug: string; packageId: string }>
}) {
  const user = await requireUser()
  const { slug, packageId } = await params

  const workspace = await getWorkspaceBySlug(slug)
  if (!workspace) notFound()

  const canView = await can(user.id, workspace.id, "handoff.view")
  if (!canView) notFound()

  const pkg = await getHandoffPackageById(packageId)
  if (!pkg || pkg.workspaceId !== workspace.id) notFound()

  const canEdit = await can(user.id, workspace.id, "handoff.edit")

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">

        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{pkg.title}</h1>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 inline-block">
                {pkg.academicYear}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {pkg.publishedAt ? "Published" : "Draft"}
            </span>
          </div>
          {pkg.summary && (
            <p className="text-gray-500 mt-3">{pkg.summary}</p>
          )}
        </div>

        <div className="space-y-6">
          {pkg.sections.length === 0 ? (
            <div className="text-center py-12 text-gray-400 border rounded-lg">
              <p className="mb-1">No sections yet</p>
              <p className="text-sm">Add sections to document knowledge for incoming executives</p>
            </div>
          ) : (
            pkg.sections.map((section) => (
              <div key={section.id} className="border rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="font-semibold">{section.title}</h2>
                  {section.role && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                      {section.role}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{section.content}</p>
              </div>
            ))
          )}
        </div>

        {canEdit && (
          <div className="mt-6">
            <AddSectionButton
              workspaceId={workspace.id}
              packageId={pkg.id}
              nextOrderIdx={pkg.sections.length}
            />
          </div>
        )}

      </div>
    </div>
  )
}
