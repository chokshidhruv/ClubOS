import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { can } from "@/lib/permissions"
import { addSponsorNote } from "@/modules/sponsors/services"
import { createSponsorNoteSchema } from "@/lib/validation/sponsor"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; sponsorId: string }> }
) {
  const clerkUser = await currentUser()
  if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { workspaceId, sponsorId } = await params
  const dbUser = await db.user.findUnique({ where: { id: clerkUser.id } })
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const allowed = await can(dbUser.id, workspaceId, "sponsor.note")
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const parsed = createSponsorNoteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  try {
    const note = await addSponsorNote(dbUser.id, workspaceId, sponsorId, parsed.data)
    return NextResponse.json(note)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
