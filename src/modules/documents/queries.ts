import { db } from "@/lib/db"
import type { DocumentVisibility } from "@prisma/client"

export async function getDocumentsByWorkspace(
  workspaceId: string,
  visibility?: string[]
) {
  return db.document.findMany({
    where: {
      workspaceId,
      archivedAt: null,
      ...(visibility ? { visibility: { in: visibility as DocumentVisibility[] } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      uploadedBy: true,
      tags: true,
    },
  })
}

export async function getDocumentById(documentId: string) {
  return db.document.findUnique({
    where: { id: documentId },
    include: {
      uploadedBy: true,
      tags: true,
    },
  })
}