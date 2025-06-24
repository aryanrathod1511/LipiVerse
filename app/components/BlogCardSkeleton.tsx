import React from "react";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/app/components/ui/card";

export const BlogCardSkeleton = () => (
  <Card className="card">
    <CardHeader>
      <Skeleton className="h-6 w-2/3 mb-4" />
      <Skeleton className="h-40 w-full" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6 mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </CardContent>
    <CardFooter className="flex flex-wrap gap-2 lg:gap-4 justify-center sm:justify-start">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-20" />
    </CardFooter>
  </Card>
);
