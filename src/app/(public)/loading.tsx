import { Skeleton } from '@/components/ui/skeleton';

export default function PublicLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-16 sm:px-6 lg:px-8">
      <Skeleton className="h-10 w-72" />
      <Skeleton className="h-5 w-96" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-72 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
