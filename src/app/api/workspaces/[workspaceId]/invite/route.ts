import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { can } from "@/lib/permissions"
import { createInvitation } from "@/modules/members/services"
import type { WorkspaceRole } from "@prisma/client"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const clerkUser = await currentUser()
  if (!clerkUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { workspaceId } = await params
  const dbUser = await db.user.findUnique({ where: { id: clerkUser.id } })
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const allowed = await can(dbUser.id, workspaceId, "workspace.invite")
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { role } = await req.json()

  try {
    const invitation = await createInvitation(dbUser.id, workspaceId, role as WorkspaceRole ?? "MEMBER")
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invitation.token}`
    return NextResponse.json({ inviteUrl, token: invitation.token })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}