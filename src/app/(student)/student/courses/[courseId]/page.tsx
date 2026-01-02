
'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { notFound } from "next/navigation";
import { UnitOneContent } from "@/components/unit-one-content";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import type { Course } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";

export default function CourseDetailsPage({
  params,
}: {
  params: { courseId: string };
}) {
  const firestore = useFirestore();
  const courseRef = firestore ? doc(firestore, 'courses', params.courseId) : null;
  const { data: course, loading } = useDoc<Course>(courseRef);

  if (loading) {
      return (
          <div className="flex flex-col gap-6">
              <Skeleton className="h-10 w-3/4"/>
              <Skeleton className="h-4 w-1/2"/>
              <Card>
                  <CardHeader><Skeleton className="h-8 w-1/3"/></CardHeader>
                  <CardContent><Skeleton className="h-20 w-full"/></CardContent>
              </Card>
          </div>
      )
  }

  if (!course && !loading) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          {course?.name}
        </h1>
        <p className="text-muted-foreground">{course?.description}</p>
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
