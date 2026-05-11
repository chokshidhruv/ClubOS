"use client"

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <p className="text-gray-500">Something went wrong</p>
      <p className="text-xs text-gray-400">{error.message}</p>
      <button
        onClick={reset}
        className="text-sm border px-4 py-2 rounded hover:bg-gray-50 transition"
      >
        Try again
      </button>
    </div>
  )
}
