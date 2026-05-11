"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type Result = {
  id: string
  type: "document" | "event" | "sponsor"
  title: string
  description: string | null
}

const typeIcons = {
  document: "Doc",
  event: "Event",
  sponsor: "Sponsor",
}

const typeRoutes = {
  document: "documents",
  event: "events",
  sponsor: "sponsors",
}

export default function SearchBar({
  workspaceId,
  slug,
}: {
  workspaceId: string
  slug: string
}) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Result[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    const timeout = setTimeout(async () => {
      setLoading(true)
      const res = await fetch(
        `/api/workspaces/${workspaceId}/search?q=${encodeURIComponent(query)}`
      )
      const data = await res.json()
      setResults(data)
      setLoading(false)
    }, 300)

    return () => clearTimeout(timeout)
  }, [query, workspaceId])

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder="Search..."
        className="w-full border rounded px-3 py-1.5 text-sm bg-white"
      />

      {open && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-64 overflow-auto">
          {loading ? (
            <p className="text-xs text-gray-400 p-3">Searching...</p>
          ) : results.length === 0 ? (
            <p className="text-xs text-gray-400 p-3">No results found</p>
          ) : (
            results.map((result) => (
              <button
                key={result.id}
                onMouseDown={() => {
                  router.push(`/w/${slug}/${typeRoutes[result.type]}`)
                  setQuery("")
                  setOpen(false)
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-start gap-2"
              >
                <span className="text-xs text-gray-400 pt-0.5 shrink-0">
                  {typeIcons[result.type]}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{result.title}</p>
                  {result.description && (
                    <p className="text-xs text-gray-400 truncate">{result.description}</p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
