import { requireUser } from "@/lib/auth"
import { getWorkspaceBySlug } from "@/modules/workspaces/queries"
import { getDocumentsByWorkspace } from "@/modules/documents/queries"
import { can, getAllowedVisibilities } from "@/lib/permissions"
import { getMember } from "@/modules/members/queries"
import { notFound } from "next/navigation"
import CreateDocumentButton from "./CreateDocumentButton"

const categoryColors: Record<string, string> = {
  GENERAL: "bg-gray-100 text-gray-600",
  EVENT: "bg-blue-100 text-blue-600",
  SPONSOR: "bg-green-100 text-green-600",
  FINANCE: "bg-yellow-100 text-yellow-700",
  MARKETING: "bg-purple-100 text-purple-600",
  HANDOFF: "bg-orange-100 text-orange-600",
  MEETING_NOTES: "bg-pink-100 text-pink-600",
  CONTRACT: "bg-red-100 text-red-600",
  OTHER: "bg-gray-100 text-gray-500",
}

const typeIcons: Record<string, string> = {
  TEXT_NOTE: "📝",
  EXTERNAL_LINK: "🔗",
  FILE_UPLOAD: "📎",
}

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const user = await requireUser()
  const { slug } = await params

  const workspace = await getWorkspaceBySlug(slug)
  if (!workspace) notFound()

  const member = await getMember(workspace.id, user.id)
  if (!member) notFound()

  const allowedVisibilities = getAllowedVisibilities(member.role)
  const documents = await getDocumentsByWorkspace(workspace.id, allowedVisibilities)
  const canCreate = await can(user.id, workspace.id, "document.create")

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Documents</h1>
          {canCreate && <CreateDocumentButton workspaceId={workspace.id} />}
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg mb-1">No documents yet</p>
            <p className="text-sm">Add a note, link, or file to get started</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span>{typeIcons[doc.type]}</span>
                    <div>
                      <p className="font-medium text-sm">{doc.title}</p>
                      {doc.description && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {doc.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${categoryColors[doc.category]}`}>
                      {doc.category.replace("_", " ")}
                    </span>
                    <span className="text-xs text-gray-400">
                      {doc.visibility !== "EVERYONE" && `🔒 ${doc.visibility.replace("_", " ")}`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span>by {doc.uploadedBy.name ?? doc.uploadedBy.email}</span>
                  <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                  {doc.url && (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Open link →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}