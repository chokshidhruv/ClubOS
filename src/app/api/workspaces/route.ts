import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { createWorkspace } from "@/modules/workspaces/service"
import { createWorkspaceSchema } from "@/lib/validation/workspace"

export async function POST(req: NextRequest) {
  const clerkUser = await currentUser()
  if (!clerkUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createWorkspaceSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })  }

  let dbUser = await db.user.findUnique({ where: { id: clerkUser.id } })
  if (!dbUser) {
    dbUser = await db.user.create({
      data: {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0].emailAddress,
        name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || null,
        image: clerkUser.imageUrl,
      },
    })
  }

  try {
    const workspace = await createWorkspace(dbUser.id, parsed.data)
    return NextResponse.json(workspace)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}