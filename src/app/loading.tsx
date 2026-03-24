import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function FeedCardSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-4 pt-4">
        <div className="flex items-start gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[88%]" />
          </div>
        </div>

        <Skeleton className="h-56 w-full rounded-xl" />

        <div className="flex gap-3 pt-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

function SuggestionSkeleton() {
  return (
    <Card>
      <CardHeader className="border-b">
        <Skeleton className="h-5 w-28" />
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-8 w-18" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function Loading() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
      <div className="space-y-6 lg:col-span-6">
        <Card>
          <CardContent className="space-y-4 pt-4">
            <div className="flex gap-4">
              <Skeleton className="size-10 rounded-full" />
              <Skeleton className="h-24 flex-1 rounded-xl" />
            </div>
            <div className="flex items-center justify-between border-t pt-4">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </CardContent>
        </Card>

        <FeedCardSkeleton />
        <FeedCardSkeleton />
      </div>

      <div className="hidden lg:block lg:col-span-4">
        <SuggestionSkeleton />
      </div>
    </div>
  );
}
