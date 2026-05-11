import { z } from "zod"

export const changeMemberRoleSchema = z.object({
  role: z.enum(["PRESIDENT", "EXECUTIVE", "MEMBER", "VIEWER"]),
})

export type ChangeMemberRoleInput = z.infer<typeof changeMemberRoleSchema>
