import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { can } from "@/lib/permissions"
import { changeMemberRole } from "@/modules/members/services"
import { changeMemberRoleSchema } from "@/lib/validation/member"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; memberId: string }> }
) {
  const clerkUser = await currentUser()
  if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { workspaceId, memberId } = await params
  const dbUser = await db.user.findUnique({ where: { id: clerkUser.id } })
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const allowed = await can(dbUser.id, workspaceId, "workspace.change_roles")
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const parsed = changeMemberRoleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  try {
    const member = await changeMemberRole(
      dbUser.id,
      workspaceId,
      memberId,
      parsed.data.role
    )
    return NextResponse.json(member)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
