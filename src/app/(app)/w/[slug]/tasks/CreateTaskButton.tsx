"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Modal from "@/components/shared/Modal"
import { toast } from "sonner"

type Member = { id: string; name: string | null; email: string }

export default function CreateTaskButton({
  workspaceId,
  members = [],
}: {
  workspaceId: string
  members?: Member[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = e.currentTarget
    const title = (form.elements.namedItem("title") as HTMLInputElement).value
    const description = (form.elements.namedItem("description") as HTMLTextAreaElement).value
    const dueDate = (form.elements.namedItem("dueDate") as HTMLInputElement).value
    const priority = (form.elements.namedItem("priority") as HTMLSelectElement).value
    const assigneeId = (form.elements.namedItem("assigneeId") as HTMLSelectElement).value

    const res = await fetch(`/api/workspaces/${workspaceId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, dueDate, priority, assigneeId: assigneeId || undefined }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? "Something went wrong")
      setLoading(false)
      return
    }

    setOpen(false)
    toast.success("Task created")
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm bg-black text-white px-4 py-2 rounded-md"
      >
        Create Task
      </button>

      <Modal title="Create Task" open={open} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              name="title"
              required
              placeholder="Book the room"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              rows={2}
              placeholder="Optional details..."
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          {members.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">Assignee</label>
              <select name="assigneeId" className="w-full border rounded px-3 py-2 text-sm">
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name ?? m.email}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input
                name="dueDate"
                type="date"
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                name="priority"
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 border rounded py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-black text-white rounded py-2 text-sm disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}