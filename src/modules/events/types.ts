import type { Event, EventMember, User, Task, Document } from "@prisma/client"

export type EventWithMembers = Event & {
  members: (EventMember & { user: User })[]
  tasks: (Task & { assignee: User | null })[]
  documents: Document[]
}