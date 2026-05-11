import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { can } from "@/lib/permissions"
import { addHandoffSection } from "@/modules/handoff/services"
import { createHandoffSectionSchema } from "@/lib/validation/handoff"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; packageId: string }> }
) {
  const clerkUser = await currentUser()
  if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { workspaceId, packageId } = await params
  const dbUser = await db.user.findUnique({ where: { id: clerkUser.id } })
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const allowed = await can(dbUser.id, workspaceId, "handoff.edit")
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const parsed = createHandoffSectionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  try {
    const section = await addHandoffSection(packageId, parsed.data)
    return NextResponse.json(section)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
