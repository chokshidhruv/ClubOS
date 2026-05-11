import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { can } from "@/lib/permissions"
import { createHandoffPackage } from "@/modules/handoff/services"
import { getHandoffPackagesByWorkspace } from "@/modules/handoff/queries"
import { createHandoffPackageSchema } from "@/lib/validation/handoff"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const clerkUser = await currentUser()
  if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { workspaceId } = await params
  const dbUser = await db.user.findUnique({ where: { id: clerkUser.id } })
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const allowed = await can(dbUser.id, workspaceId, "handoff.view")
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const packages = await getHandoffPackagesByWorkspace(workspaceId)
  return NextResponse.json(packages)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const clerkUser = await currentUser()
  if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { workspaceId } = await params
  const dbUser = await db.user.findUnique({ where: { id: clerkUser.id } })
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const allowed = await can(dbUser.id, workspaceId, "handoff.create")
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const parsed = createHandoffPackageSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  try {
    const pkg = await createHandoffPackage(dbUser.id, workspaceId, parsed.data)
    return NextResponse.json(pkg)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
