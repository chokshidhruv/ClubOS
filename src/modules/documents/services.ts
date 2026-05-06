import { db } from "@/lib/db"
import { logActivity } from "@/lib/activity"
import type { CreateDocumentInput } from "@/lib/validation/document"

export async function createDocument(
  userId: string,
  workspaceId: string,
  input: CreateDocumentInput
) {
  if (input.type === "EXTERNAL_LINK" && !input.url) {
    throw new Error("URL is required for external links")
  }

  if (input.type === "TEXT_NOTE" && !input.content) {
    throw new Error("Content is required for text notes")
  }

  const document = await db.document.create({
    data: {
      workspaceId,
      title: input.title,
      description: input.description || null,
      type: input.type,
      category: input.category,
      visibility: input.visibility,
      url: input.url || null,
      content: input.content || null,
      eventId: input.eventId || null,
      sponsorId: input.sponsorId || null,
      uploadedById: userId,
    },
  })

  await logActivity({
    workspaceId,
    actorId: userId,
    action: "document.created",
    targetType: "document",
    targetId: document.id,
    metadata: { title: document.title, type: document.type },
  })

  return document
}