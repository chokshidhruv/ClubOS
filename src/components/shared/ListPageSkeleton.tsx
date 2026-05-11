export default function ListPageSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="p-8 max-w-4xl mx-auto animate-pulse">
      <div className="flex justify-between mb-8">
        <div className="h-8 w-40 bg-gray-200 rounded" />
        <div className="h-9 w-28 bg-gray-200 rounded" />
      </div>
      <div className="border rounded-lg divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-4 w-48 bg-gray-200 rounded" />
              <div className="h-3 w-32 bg-gray-100 rounded" />
            </div>
            <div className="h-6 w-20 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
