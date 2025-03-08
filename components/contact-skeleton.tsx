import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function ContactSkeleton() {
  return (
    <Card className="mb-2">
      <CardContent className="p-4 flex items-center">
        <Skeleton className="w-12 h-12 rounded-full flex-shrink-0 mr-4" />
        <div className="flex-grow space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>
    </Card>
  );
}