import { requireUser } from "@/lib/auth"
import { getWorkspaceBySlug } from "@/modules/workspaces/queries"
import { can } from "@/lib/permissions"
import { notFound } from "next/navigation"

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const user = await requireUser()
  const { slug } = await params

  const workspace = await getWorkspaceBySlug(slug)
  if (!workspace) notFound()

  const canManage = await can(user.id, workspace.id, "workspace.manage")
  if (!canManage) notFound()

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Workspace Settings</h1>

        <div className="border rounded-lg divide-y">
          <div className="p-4">
            <h2 className="font-semibold mb-1">Workspace Name</h2>
            <p className="text-sm text-gray-500 mb-3">{workspace.name}</p>
            <p className="text-xs text-gray-400">
              Contact support to change your workspace name
            </p>
          </div>

          <div className="p-4">
            <h2 className="font-semibold mb-1">Slug</h2>
            <p className="text-sm text-gray-500 mb-1">
              <code className="bg-gray-100 px-1 rounded">/w/{workspace.slug}</code>
            </p>
            <p className="text-xs text-gray-400">
              Your workspace URL identifier
            </p>
          </div>

          {workspace.university && (
            <div className="p-4">
              <h2 className="font-semibold mb-1">University</h2>
              <p className="text-sm text-gray-500">{workspace.university}</p>
            </div>
          )}

          {workspace.description && (
            <div className="p-4">
              <h2 className="font-semibold mb-1">Description</h2>
              <p className="text-sm text-gray-500">{workspace.description}</p>
            </div>
          )}

          <div className="p-4">
            <h2 className="font-semibold mb-1">Created</h2>
            <p className="text-sm text-gray-500">
              {new Date(workspace.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}