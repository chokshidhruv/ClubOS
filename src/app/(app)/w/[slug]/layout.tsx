import { requireUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const user = await requireUser()
  const { slug } = await params

  const workspace = await db.workspace.findUnique({
    where: { slug },
  })

  if (!workspace) notFound()

  const member = await db.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: workspace.id,
        userId: user.id,
      },
    },
  })

  if (!member || member.status !== "ACTIVE") redirect("/workspaces")

  return <>{children}</>
}