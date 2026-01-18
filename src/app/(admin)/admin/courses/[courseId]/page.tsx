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
import { useDoc, useCollection, useFirestore } from "@/firebase";
import { doc, updateDoc, collection, query, where } from "firebase/firestore";
import type { Course, Lesson, LessonActivity } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Video, Loader2, BarChart } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const lessonFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters."),
  description: z.string().optional(),
  youtubeUrl: z.string().url("Please enter a valid YouTube URL."),
});

function UserActivityTable({ activities, loading, type }: { activities: LessonActivity[], loading: boolean, type: 'completed' | 'watching' }) {
    if (loading) {
        return <Skeleton className="h-40 w-full" />
    }

    if (activities.length === 0) {
        return <p className="text-center text-sm text-muted-foreground py-8">No students in this category.</p>
    }

    return (
        <ScrollArea className="h-64">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>{type === 'completed' ? 'Completed On' : 'Started Watching'}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {activities.map(activity => (
                        <TableRow key={activity.id}>
                            <TableCell>{activity.userName}</TableCell>
                            <TableCell>{format(type === 'completed' && activity.completedAt ? activity.completedAt.toDate() : activity.startedAt.toDate(), 'PPP p')}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </ScrollArea>
    )
}

function LessonStatsDialog({ lesson }: { lesson: Lesson }) {
    const firestore = useFirestore();

    const activitiesQuery = useMemo(() => {
        if (!firestore) return null;
        // The orderBy was removed to prevent the composite index requirement. We now sort on the client.
        return query(collection(firestore, 'lesson_activities'), where('lessonId', '==', lesson.id));
    }, [firestore, lesson.id]);
    const { data: unsortedActivities, loading } = useCollection<LessonActivity>(activitiesQuery);

    const activities = useMemo(() => {
        if (!unsortedActivities) return null;
        return [...unsortedActivities].sort((a, b) => b.startedAt.toDate().getTime() - a.startedAt.toDate().getTime());
    }, [unsortedActivities]);

    const stats = useMemo(() => {
        if (!activities) return { views: 0, completed: [], watching: [] };
        
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        
        const completed = activities.filter(a => a.status === 'completed');
        const watching = activities.filter(a => a.status === 'watching' && a.startedAt.toDate() > fiveMinutesAgo);

        return {
            views: activities.length,
            completed,
            watching,
        }
    }, [activities]);

    return (
         <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm"><BarChart className="h-4 w-4 mr-2" /> View Stats</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Lesson Stats: {lesson.title}</DialogTitle>
                    <DialogDescription>
                        Analytics for this video lesson. Total Views: {loading || !activities ? <Loader2 className="h-4 w-4 animate-spin inline-block"/> : stats.views}
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="completed">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="completed">Completed ({loading || !activities ? '...' : stats.completed.length})</TabsTrigger>
                        <TabsTrigger value="watching">Watching Now ({loading || !activities ? '...' : stats.watching.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="completed">
                        <UserActivityTable activities={stats.completed} loading={loading} type="completed" />
                    </TabsContent>
                    <TabsContent value="watching">
                        <UserActivityTable activities={stats.watching} loading={loading} type="watching" />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}

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

  const onSubmit = (values: z.infer<typeof lessonFormSchema>) => {
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

    updateDoc(courseRef, { lessons: updatedLessons }).then(() => {
        toast({ title: "Lesson Added", description: `"${values.title}" has been added to the course.` });
        form.reset();
    }).catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: courseRef.path,
            operation: 'update',
            requestResourceData: { lessons: updatedLessons }
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };
  
  const handleDeleteLesson = (lessonId: string) => {
     if (!firestore) return;
     const courseRef = doc(firestore, "courses", course.id);
     const updatedLessons = (course.lessons || []).filter(lesson => lesson.id !== lessonId);
     
     updateDoc(courseRef, { lessons: updatedLessons }).then(() => {
        toast({ title: "Lesson Removed", description: "The video lesson has been removed from the course."});
     }).catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: courseRef.path,
            operation: 'update',
            requestResourceData: { lessons: updatedLessons }
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };

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
                        <div className="flex items-center gap-2">
                           <LessonStatsDialog lesson={lesson} />
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteLesson(lesson.id)}>
                                <Trash2 className="h-4 w-4 text-destructive"/>
                            </Button>
                        </div>
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
