import { db } from "@/lib/db"
import { logActivity } from "@/lib/activity"
import type {
  CreateSponsorInput,
  UpdateSponsorInput,
  CreateSponsorNoteInput,
} from "@/lib/validation/sponsor"

export async function createSponsor(
  userId: string,
  workspaceId: string,
  input: CreateSponsorInput
) {
  const sponsor = await db.sponsor.create({
    data: {
      workspaceId,
      companyName: input.companyName,
      contactName: input.contactName || null,
      contactEmail: input.contactEmail || null,
      contactPhone: input.contactPhone || null,
      status: input.status,
      tier: input.tier || null,
      ownerId: userId,
      nextFollowUpAt: input.nextFollowUpAt ? new Date(input.nextFollowUpAt) : null,
      academicYear: input.academicYear || null,
    },
  })

  await logActivity({
    workspaceId,
    actorId: userId,
    action: "sponsor.created",
    targetType: "sponsor",
    targetId: sponsor.id,
    metadata: { companyName: sponsor.companyName },
  })

  return sponsor
}

export async function updateSponsor(
  userId: string,
  workspaceId: string,
  sponsorId: string,
  input: UpdateSponsorInput
) {
  const sponsor = await db.sponsor.update({
    where: { id: sponsorId },
    data: {
      ...input,
      nextFollowUpAt: input.nextFollowUpAt ? new Date(input.nextFollowUpAt) : undefined,
      lastContactedAt: input.status === "CONTACTED" ? new Date() : undefined,
    },
  })

  await logActivity({
    workspaceId,
    actorId: userId,
    action: "sponsor.status_changed",
    targetType: "sponsor",
    targetId: sponsor.id,
    metadata: { status: input.status, companyName: sponsor.companyName },
  })

  return sponsor
}

export async function addSponsorNote(
  userId: string,
  workspaceId: string,
  sponsorId: string,
  input: CreateSponsorNoteInput
) {
  const note = await db.sponsorNote.create({
    data: {
      sponsorId,
      authorId: userId,
      content: input.content,
    },
  })

  await logActivity({
    workspaceId,
    actorId: userId,
    action: "sponsor.note_added",
    targetType: "sponsor",
    targetId: sponsorId,
    metadata: { content: input.content.slice(0, 100) },
  })

  return note
}
