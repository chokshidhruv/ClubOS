import type { Sponsor, SponsorNote, User, Task, Document } from "@prisma/client"

export type SponsorWithDetails = Sponsor & {
  owner: User | null
  notes: (SponsorNote & { author: User })[]
  tasks: (Task & { assignee: User | null })[]
  documents: Document[]
}
