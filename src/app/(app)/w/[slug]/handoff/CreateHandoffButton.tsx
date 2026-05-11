"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Modal from "@/components/shared/Modal"
import { toast } from "sonner"

export default function CreateHandoffButton({
  workspaceId,
  slug,
}: {
  workspaceId: string
  slug: string
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
    const academicYear = (form.elements.namedItem("academicYear") as HTMLInputElement).value
    const summary = (form.elements.namedItem("summary") as HTMLTextAreaElement).value

    const res = await fetch(`/api/workspaces/${workspaceId}/handoff`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, academicYear, summary: summary || undefined }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Something went wrong")
      setLoading(false)
      return
    }

    setOpen(false)
    toast.success("Handoff package created")
    router.push(`/w/${slug}/handoff/${data.id}`)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm bg-black text-white px-4 py-2 rounded-md"
      >
        Create Handoff Package
      </button>

      <Modal title="Create Handoff Package" open={open} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              name="title"
              required
              placeholder="2024-2025 Executive Handoff"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Academic Year</label>
            <input
              name="academicYear"
              required
              placeholder="2024-2025"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Summary</label>
            <textarea
              name="summary"
              rows={3}
              placeholder="Overview of this handoff package..."
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
              {loading ? "Creating..." : "Create Package"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
