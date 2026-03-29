export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-orange-600" />
    </div>
  )
}

export function PageLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <LoadingSpinner />
    </div>
  )
}

export function ItemCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-border bg-surface">
      <div className="aspect-4/3 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-3 w-1/2 rounded bg-gray-200" />
        <div className="h-4 w-1/4 rounded bg-gray-200" />
      </div>
    </div>
  )
}
