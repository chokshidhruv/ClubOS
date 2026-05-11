"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Modal from "@/components/shared/Modal"

export default function AddSectionButton({
  workspaceId,
  packageId,
  nextOrderIdx,
}: {
  workspaceId: string
  packageId: string
  nextOrderIdx: number
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
    const role = (form.elements.namedItem("role") as HTMLInputElement).value
    const content = (form.elements.namedItem("content") as HTMLTextAreaElement).value

    const res = await fetch(
      `/api/workspaces/${workspaceId}/handoff/${packageId}/sections`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          role: role || undefined,
          content,
          orderIdx: nextOrderIdx,
        }),
      }
    )

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
        className="text-sm border border-dashed rounded-lg w-full py-3 text-gray-400 hover:text-black hover:border-gray-400 transition"
      >
        + Add Section
      </button>

      <Modal title="Add Section" open={open} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Section Title</label>
            <input
              name="title"
              required
              placeholder="e.g. Sponsorship Process"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role (optional)</label>
            <input
              name="role"
              placeholder="e.g. VP Sponsorship"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <textarea
              name="content"
              required
              rows={6}
              placeholder="Write everything the next person needs to know..."
              className="w-full border rounded px-3 py-2 text-sm"
            />
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
              {loading ? "Adding..." : "Add Section"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
