"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Modal from "@/components/shared/Modal"
import { toast } from "sonner"

export default function CreateSponsorButton({
  workspaceId,
}: {
  workspaceId: string
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
    const companyName = (form.elements.namedItem("companyName") as HTMLInputElement).value
    const contactName = (form.elements.namedItem("contactName") as HTMLInputElement).value
    const contactEmail = (form.elements.namedItem("contactEmail") as HTMLInputElement).value
    const status = (form.elements.namedItem("status") as HTMLSelectElement).value
    const tier = (form.elements.namedItem("tier") as HTMLSelectElement).value
    const nextFollowUpAt = (form.elements.namedItem("nextFollowUpAt") as HTMLInputElement).value

    const res = await fetch(`/api/workspaces/${workspaceId}/sponsors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName,
        contactName: contactName || undefined,
        contactEmail: contactEmail || undefined,
        status,
        tier: tier || undefined,
        nextFollowUpAt: nextFollowUpAt || undefined,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Something went wrong")
      setLoading(false)
      return
    }

    setOpen(false)
    toast.success("Sponsor added")
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm bg-black text-white px-4 py-2 rounded-md"
      >
        Add Sponsor
      </button>

      <Modal title="Add Sponsor" open={open} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Company Name</label>
            <input
              name="companyName"
              required
              placeholder="RBC"
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Contact Name</label>
              <input
                name="contactName"
                placeholder="Jane Smith"
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact Email</label>
              <input
                name="contactEmail"
                type="email"
                placeholder="jane@rbc.com"
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select name="status" className="w-full border rounded px-3 py-2 text-sm">
                <option value="NOT_CONTACTED">Not Contacted</option>
                <option value="CONTACTED">Contacted</option>
                <option value="FOLLOW_UP_NEEDED">Follow Up Needed</option>
                <option value="INTERESTED">Interested</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tier</label>
              <select name="tier" className="w-full border rounded px-3 py-2 text-sm">
                <option value="">No tier</option>
                <option value="BRONZE">Bronze</option>
                <option value="SILVER">Silver</option>
                <option value="GOLD">Gold</option>
                <option value="PLATINUM">Platinum</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Next Follow Up</label>
            <input
              name="nextFollowUpAt"
              type="date"
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
              {loading ? "Adding..." : "Add Sponsor"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
