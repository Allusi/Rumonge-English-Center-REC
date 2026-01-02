
'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { notFound, useParams } from "next/navigation";
import { UnitOneContent } from "@/components/unit-one-content";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import type { Course } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AdminCourseDetailsPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const firestore = useFirestore();

  const courseRef = firestore ? doc(firestore, 'courses', courseId) : null;
  const { data: course, loading: courseLoading } = useDoc<Course>(courseRef);

  if (courseLoading) {
      return (
          <div className="flex flex-col gap-6">
              <Skeleton className="h-10 w-3/4"/>
              <Skeleton className="h-4 w-1/2"/>
              <Card>
                  <CardHeader><Skeleton className="h-8 w-1/3"/></CardHeader>
                  <CardContent><Skeleton className="h-40 w-full"/></CardContent>
              </Card>
          </div>
      )
  }

  if (!course && !courseLoading) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/courses" passHref>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">
            {course?.name}
            </h1>
            <p className="text-muted-foreground">{course?.description}</p>
      </div>
      </div>

      {course?.id === 'C001' ? (
        <UnitOneContent />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Course Content</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Course content for "{course?.name}" is not yet available. Please check back later.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
