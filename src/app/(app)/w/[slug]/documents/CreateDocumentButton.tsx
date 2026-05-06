"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Modal from "@/components/shared/Modal"

export default function CreateDocumentButton({
  workspaceId,
}: {
  workspaceId: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [type, setType] = useState("TEXT_NOTE")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form = e.currentTarget
    const title = (form.elements.namedItem("title") as HTMLInputElement).value
    const description = (form.elements.namedItem("description") as HTMLInputElement).value
    const category = (form.elements.namedItem("category") as HTMLSelectElement).value
    const visibility = (form.elements.namedItem("visibility") as HTMLSelectElement).value
    const url = (form.elements.namedItem("url") as HTMLInputElement)?.value
    const content = (form.elements.namedItem("content") as HTMLTextAreaElement)?.value

    const res = await fetch(`/api/workspaces/${workspaceId}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, type, category, visibility, url, content }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Something went wrong")
      setLoading(false)
      return
    }

    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm bg-black text-white px-4 py-2 rounded-md"
      >
        Add Document
      </button>

      <Modal title="Add Document" open={open} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              name="title"
              required
              placeholder="Q4 Sponsorship Package"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="TEXT_NOTE">📝 Text Note</option>
              <option value="EXTERNAL_LINK">🔗 External Link</option>
            </select>
          </div>

          {type === "EXTERNAL_LINK" && (
            <div>
              <label className="block text-sm font-medium mb-1">URL</label>
              <input
                name="url"
                type="url"
                placeholder="https://drive.google.com/..."
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
          )}

          {type === "TEXT_NOTE" && (
            <div>
              <label className="block text-sm font-medium mb-1">Content</label>
              <textarea
                name="content"
                rows={4}
                placeholder="Write your note here..."
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              name="description"
              placeholder="Optional short description"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select name="category" className="w-full border rounded px-3 py-2 text-sm">
                <option value="GENERAL">General</option>
                <option value="EVENT">Event</option>
                <option value="SPONSOR">Sponsor</option>
                <option value="FINANCE">Finance</option>
                <option value="MARKETING">Marketing</option>
                <option value="HANDOFF">Handoff</option>
                <option value="MEETING_NOTES">Meeting Notes</option>
                <option value="CONTRACT">Contract</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Visibility</label>
              <select name="visibility" className="w-full border rounded px-3 py-2 text-sm">
                <option value="EVERYONE">Everyone</option>
                <option value="EXECUTIVES_ONLY">Executives Only</option>
                <option value="SPONSORSHIP_ONLY">Sponsorship Only</option>
                <option value="FINANCE_ONLY">Finance Only</option>
                <option value="OWNER_ONLY">Owner Only</option>
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
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}