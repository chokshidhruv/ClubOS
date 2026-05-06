import { NextRequest, NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { can } from "@/lib/permissions"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const clerkUser = await currentUser()
  if (!clerkUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { workspaceId } = await params

  const dbUser = await db.user.findUnique({ where: { id: clerkUser.id } })
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const member = await db.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: dbUser.id,
      },
    },
  })

  if (!member || member.status !== "ACTIVE") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const events = await db.event.findMany({
    where: {
      workspaceId,
      archivedAt: null,
    },
    orderBy: { createdAt: "desc" },
    include: {
      members: {
        include: { user: true },
      },
      _count: {
        select: { tasks: true, documents: true },
      },
    },
  })

  return NextResponse.json(events)
}

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
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const allowed = await can(dbUser.id, workspaceId, "event.create")
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { name, description, location, startsAt, endsAt } = await req.json()

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  const event = await db.event.create({
    data: {
      workspaceId,
      name,
      description: description || null,
      location: location || null,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
      status: "PLANNING",
      createdById: dbUser.id,
    },
  })

  await db.activityLog.create({
    data: {
      workspaceId,
      actorId: dbUser.id,
      action: "event.created",
      targetType: "event",
      targetId: event.id,
      metadata: { eventName: event.name },
    },
  })

  return NextResponse.json(event)
}