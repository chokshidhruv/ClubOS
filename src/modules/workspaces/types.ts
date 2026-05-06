import type { Workspace, WorkspaceMember, User } from "@prisma/client"

export type WorkspaceWithMembers = Workspace & {
  members: (WorkspaceMember & { user: User })[]
}

export type MembershipWithWorkspace = WorkspaceMember & {
  workspace: Workspace
}