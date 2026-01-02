
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
import { notFound, useParams } from "next/navigation";
import { UnitOneContent } from "@/components/unit-one-content";
import { useDoc, useCollection, useFirestore, useUser } from "@/firebase";
import { doc, collection, query, where } from "firebase/firestore";
import type { Course, Enrollment } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BookLock } from "lucide-react";

export default function CourseDetailsPage({
  params,
}: {
  params: { courseId: string };
}) {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const courseRef = firestore ? doc(firestore, 'courses', params.courseId) : null;
  const { data: course, loading: courseLoading } = useDoc<Course>(courseRef);
  
  const enrollmentsQuery = (firestore && user) 
    ? query(
        collection(firestore, 'enrollments'), 
        where('studentId', '==', user.uid),
        where('courseId', '==', params.courseId)
      )
    : null;

  const { data: studentEnrollments, loading: enrollmentLoading } = useCollection<Enrollment>(enrollmentsQuery);

  const isEnrolled = studentEnrollments && studentEnrollments.length > 0;

  const isLoading = courseLoading || userLoading || enrollmentLoading;

  if (isLoading) {
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

  if (!course && !isLoading) {
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

      {!isEnrolled ? (
         <Alert variant="destructive">
          <BookLock className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You are not enrolled in this course. Please contact an administrator if you believe this is an error.
          </AlertDescription>
        </Alert>
      ) : course?.id === 'C001' ? (
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
