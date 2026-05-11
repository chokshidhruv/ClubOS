import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { searchWorkspace } from "@/lib/search"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const clerkUser = await currentUser()
  if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { workspaceId } = await params
  const query = req.nextUrl.searchParams.get("q") ?? ""

  const dbUser = await db.user.findUnique({ where: { id: clerkUser.id } })
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const member = await db.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: dbUser.id } },
  })
  if (!member || member.status !== "ACTIVE") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const results = await searchWorkspace(query, workspaceId, member.role)
  return NextResponse.json(results)
}
