
'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { notFound, useParams } from "next/navigation";
import { UnitOneContent } from "@/components/unit-one-content";
import { useDoc, useFirestore } from "@/firebase";
import { doc, updateDoc, collection } from "firebase/firestore";
import type { Course, Lesson } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Video, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const lessonFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  description: z.string().optional(),
  youtubeUrl: z.string().url("Please enter a valid YouTube URL."),
});

function VideoManager({ course }: { course: Course }) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof lessonFormSchema>>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: { title: "", description: "", youtubeUrl: "" },
  });
  
  const getYouTubeVideoId = (url: string) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const onSubmit = async (values: z.infer<typeof lessonFormSchema>) => {
    const videoId = getYouTubeVideoId(values.youtubeUrl);
    if (!videoId) {
      toast({ variant: "destructive", title: "Invalid URL", description: "Could not extract video ID from YouTube URL." });
      return;
    }

    if (!firestore) return;

    const newLesson: Lesson = {
      id: doc(collection(firestore, 'dummy')).id, // Generate a unique ID
      title: values.title,
      description: values.description || "",
      youtubeVideoId: videoId,
    };
    
    const courseRef = doc(firestore, "courses", course.id);
    const updatedLessons = [...(course.lessons || []), newLesson];

    try {
      await updateDoc(courseRef, { lessons: updatedLessons });
      toast({ title: "Lesson Added", description: `"${values.title}" has been added to the course.`});
      form.reset();
    } catch(error) {
       console.error("Error adding lesson:", error);
       toast({ variant: "destructive", title: "Error", description: "Could not add the lesson." });
    }
  };
  
  const handleDeleteLesson = async (lessonId: string) => {
     if (!firestore) return;
     const courseRef = doc(firestore, "courses", course.id);
     const updatedLessons = (course.lessons || []).filter(lesson => lesson.id !== lessonId);
     try {
      await updateDoc(courseRef, { lessons: updatedLessons });
      toast({ title: "Lesson Removed", description: "The video lesson has been removed from the course."});
    } catch(error) {
       console.error("Error removing lesson:", error);
       toast({ variant: "destructive", title: "Error", description: "Could not remove the lesson." });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Lessons</CardTitle>
        <CardDescription>Manage the YouTube video lessons for this course.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <h3 className="text-lg font-medium mb-4">Add New Lesson</h3>
           <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-lg">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Lesson 1: Alphabet Song" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Description (Optional)</FormLabel><FormControl><Textarea placeholder="A brief summary of the video lesson..." {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="youtubeUrl" render={({ field }) => (
                  <FormItem><FormLabel>YouTube Video URL</FormLabel><FormControl><Input placeholder="https://www.youtube.com/watch?v=..." {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <Button type="submit" disabled={form.formState.isSubmitting}>
                   {form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Adding...</> : <><Plus className="mr-2 h-4 w-4"/>Add Lesson</>}
                </Button>
              </form>
           </Form>
        </div>

        <Separator />
        
        <div>
            <h3 className="text-lg font-medium mb-4">Existing Lessons</h3>
            <div className="space-y-4">
                {(course.lessons && course.lessons.length > 0) ? course.lessons.map(lesson => (
                    <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center gap-4">
                           <Video className="h-6 w-6 text-muted-foreground"/>
                           <div>
                               <p className="font-semibold">{lesson.title}</p>
                               <p className="text-sm text-muted-foreground">{lesson.description}</p>
                           </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteLesson(lesson.id)}>
                            <Trash2 className="h-4 w-4 text-destructive"/>
                        </Button>
                    </div>
                )) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No video lessons have been added to this course yet.</p>
                )}
            </div>
        </div>

      </CardContent>
    </Card>
  )
}

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
      
      <VideoManager course={course!} />

      {course?.id === 'C001' && (
        <UnitOneContent />
      )}
    </div>
  );
}
