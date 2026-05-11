import { db } from "@/lib/db"
import { getAllowedVisibilities } from "@/lib/permissions"

type SearchResult = {
  id: string
  type: "document" | "event" | "sponsor"
  title: string
  description: string | null
}

export async function searchWorkspace(
  query: string,
  workspaceId: string,
  userRole: string
): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return []

  const q = query.toLowerCase().trim()
  const allowedVisibilities = getAllowedVisibilities(userRole)

  const [documents, events, sponsors] = await Promise.all([
    db.document.findMany({
      where: {
        workspaceId,
        archivedAt: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        visibility: { in: allowedVisibilities as any },
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { content: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
    }),
    db.event.findMany({
      where: {
        workspaceId,
        archivedAt: null,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
    }),
    db.sponsor.findMany({
      where: {
        workspaceId,
        archivedAt: null,
        OR: [
          { companyName: { contains: q, mode: "insensitive" } },
          { contactName: { contains: q, mode: "insensitive" } },
          { contactEmail: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
    }),
  ])

  return [
    ...documents.map((d) => ({
      id: d.id,
      type: "document" as const,
      title: d.title,
      description: d.description,
    })),
    ...events.map((e) => ({
      id: e.id,
      type: "event" as const,
      title: e.name,
      description: e.description,
    })),
    ...sponsors.map((s) => ({
      id: s.id,
      type: "sponsor" as const,
      title: s.companyName,
      description: s.contactName,
    })),
  ]
}
