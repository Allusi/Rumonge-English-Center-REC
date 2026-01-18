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
import { doc, collection, query, where, setDoc, serverTimestamp } from "firebase/firestore";
import type { Course, Enrollment, CompletedLesson, Lesson } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BookLock, CheckCircle, Circle, Loader2 } from "lucide-react";
import YouTube from 'react-youtube';
import { useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";

function LessonPlayer({ lesson, courseId, isCompleted }: { lesson: Lesson; courseId: string; isCompleted: boolean }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [justCompleted, setJustCompleted] = useState(false);

  const handleVideoEnd = async () => {
    if (!user || !firestore || isCompleted || justCompleted) return;

    const completedLessonRef = doc(firestore, `users/${user.uid}/completedLessons`, lesson.id);
    try {
      await setDoc(completedLessonRef, {
        completedAt: serverTimestamp(),
        courseId: courseId
      });
      setJustCompleted(true);
      toast({
        title: "Lesson Completed!",
        description: `Great job on finishing "${lesson.title}".`,
      });
    } catch (error) {
      console.error("Error marking lesson as complete:", error);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">{lesson.description}</p>
      <div className="aspect-video overflow-hidden rounded-lg border">
         <YouTube
            videoId={lesson.youtubeVideoId}
            opts={{
              height: '100%',
              width: '100%',
              playerVars: {
                autoplay: 0,
              },
            }}
            onEnd={handleVideoEnd}
            className="w-full h-full"
          />
      </div>
    </div>
  );
}


export default function CourseDetailsPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const courseRef = firestore ? doc(firestore, 'courses', courseId) : null;
  const { data: course, loading: courseLoading } = useDoc<Course>(courseRef);
  
  const enrollmentsQuery = (firestore && user) 
    ? query(
        collection(firestore, 'enrollments'), 
        where('studentId', '==', user.uid),
        where('courseId', '==', courseId)
      )
    : null;
  const { data: studentEnrollments, loading: enrollmentLoading } = useCollection<Enrollment>(enrollmentsQuery);
  
  const completedLessonsQuery = (firestore && user) ? collection(firestore, `users/${user.uid}/completedLessons`) : null;
  const { data: completedLessons, loading: completedLessonsLoading } = useCollection<CompletedLesson>(completedLessonsQuery);
  
  const completedLessonIds = useMemo(() => new Set(completedLessons?.map(l => l.id)), [completedLessons]);
  const isEnrolled = studentEnrollments && studentEnrollments.length > 0;

  const isLoading = courseLoading || userLoading || enrollmentLoading || completedLessonsLoading;

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

  const hasVideoLessons = course?.lessons && course.lessons.length > 0;

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
      ) : hasVideoLessons ? (
         <Card>
            <CardHeader>
              <CardTitle>Video Lessons</CardTitle>
              <CardDescription>Watch these videos to learn. Your progress will be saved automatically.</CardDescription>
            </CardHeader>
            <CardContent>
               <Accordion type="single" collapsible className="w-full space-y-2">
                 {course.lessons!.map(lesson => {
                   const isCompleted = completedLessonIds.has(lesson.id);
                   return (
                      <AccordionItem value={lesson.id} key={lesson.id} className="border rounded-lg px-4">
                        <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                           <div className="flex items-center gap-3">
                              {isCompleted ? <CheckCircle className="h-5 w-5 text-green-500"/> : <Circle className="h-5 w-5 text-muted-foreground"/>}
                              {lesson.title}
                           </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-4 pt-0">
                          <LessonPlayer lesson={lesson} courseId={course.id} isCompleted={isCompleted} />
                        </AccordionContent>
                      </AccordionItem>
                   )
                 })}
               </Accordion>
            </CardContent>
         </Card>
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

       {isEnrolled && course?.id === 'C001' && (
        <UnitOneContent />
      )}

    </div>
  );
}
