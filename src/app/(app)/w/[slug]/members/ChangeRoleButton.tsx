"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const ROLES = ["VIEWER", "MEMBER", "EXECUTIVE", "PRESIDENT"] as const

export default function ChangeRoleButton({
  workspaceId,
  memberId,
  currentRole,
}: {
  workspaceId: string
  memberId: string
  currentRole: string
}) {
  const router = useRouter()
  const [role, setRole] = useState(currentRole)
  const [saving, setSaving] = useState(false)

  async function handleChange(newRole: string) {
    const prev = role
    setRole(newRole)
    setSaving(true)

    const res = await fetch(
      `/api/workspaces/${workspaceId}/members/${memberId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      }
    )

    setSaving(false)

    if (!res.ok) {
      setRole(prev)
      toast.error("Failed to change role")
      return
    }

    toast.success("Role updated")
    router.refresh()
  }

  return (
    <select
      value={role}
      onChange={(e) => handleChange(e.target.value)}
      disabled={saving}
      className="text-xs border rounded px-2 py-1 bg-white disabled:opacity-50"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  )
}
