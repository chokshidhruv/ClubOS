"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SponsorActions({
  workspaceId,
  sponsorId,
  canEdit,
  currentStatus,
}: {
  workspaceId: string
  sponsorId: string
  canEdit: boolean
  currentStatus: string
}) {
  const router = useRouter()
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(currentStatus)

  async function addNote() {
    if (!note.trim()) return
    setLoading(true)

    await fetch(`/api/workspaces/${workspaceId}/sponsors/${sponsorId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: note }),
    })

    setNote("")
    setLoading(false)
    router.refresh()
  }

  async function updateStatus(newStatus: string) {
    setStatus(newStatus)
    await fetch(`/api/workspaces/${workspaceId}/sponsors/${sponsorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    router.refresh()
  }

  return (
    <div className="space-y-3">
      {canEdit && (
        <div>
          <label className="block text-sm font-medium mb-1">Update Status</label>
          <select
            value={status}
            onChange={(e) => updateStatus(e.target.value)}
            className="border rounded px-3 py-2 text-sm w-full"
          >
            <option value="NOT_CONTACTED">Not Contacted</option>
            <option value="CONTACTED">Contacted</option>
            <option value="FOLLOW_UP_NEEDED">Follow Up Needed</option>
            <option value="INTERESTED">Interested</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="REJECTED">Rejected</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Add Note</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="e.g. Spoke with Jane, interested in Gold tier..."
          className="w-full border rounded px-3 py-2 text-sm"
        />
        <button
          onClick={addNote}
          disabled={loading || !note.trim()}
          className="mt-2 bg-black text-white px-4 py-2 text-sm rounded disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Note"}
        </button>
      </div>
    </div>
  )
}
