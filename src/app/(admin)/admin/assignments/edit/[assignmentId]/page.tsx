
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useCollection, useDoc, useFirestore } from '@/firebase';
import { collection, query, where, doc, updateDoc } from 'firebase/firestore';
import { ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams, notFound } from 'next/navigation';
import { useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Assignment, Course } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  instructions: z.string().min(10, { message: 'Instructions must be at least 10 characters.' }),
  courseId: z.string({ required_error: 'Please select a course.' }),
});

export default function EditAssignmentPage() {
  const firestore = useFirestore();
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.assignmentId as string;
  const { toast } = useToast();

  const assignmentRef = firestore && assignmentId ? doc(firestore, 'assignments', assignmentId) : null;
  const { data: assignment, loading: assignmentLoading } = useDoc<Assignment>(assignmentRef);

  const coursesQuery = firestore ? query(collection(firestore, 'courses'), where('isEnabled', '==', true)) : null;
  const { data: courses, loading: coursesLoading } = useCollection<Course>(coursesQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        title: '',
        instructions: '',
        courseId: '',
    }
  });

  useEffect(() => {
    if (assignment) {
      form.reset({
        title: assignment.title,
        instructions: assignment.instructions,
        courseId: assignment.courseId,
      });
    }
  }, [assignment, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!assignmentRef) return;
    try {
      const course = courses?.find(c => c.id === values.courseId);
      await updateDoc(assignmentRef, {
        ...values,
        courseName: course?.name || 'Unknown Course',
      });
      toast({ title: 'Success', description: 'Assignment updated successfully.' });
      router.push('/admin/assignments');
    } catch (error) {
      console.error("Error updating assignment: ", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update assignment. Please try again.' });
    }
  }

  const handleSendToStudents = () => {
    toast({
        title: "Feature Coming Soon!",
        description: "Sending assignments directly to students is not yet implemented.",
    });
  }

  const isLoading = assignmentLoading || coursesLoading;
  
  if (isLoading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-64" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/3" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                    <Skeleton className="h-32" />
                </CardContent>
            </Card>
        </div>
    )
  }

  if (!assignment && !assignmentLoading) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/assignments" passHref>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Edit Assignment
          </h1>
          <p className="text-muted-foreground">
            Update the details for "{assignment?.title}".
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Assignment Details</CardTitle>
            <CardDescription>Update the title, instructions, and course for this assignment.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 'My Summer Vacation Essay'" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Course</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder={coursesLoading ? "Loading courses..." : "Select a course"} />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {courses?.map((course) => (
                                <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                            ))}
                            {!coursesLoading && courses?.length === 0 && (
                                <div className="p-4 text-sm text-muted-foreground">No enabled courses available.</div>
                            )}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write the full instructions for the assignment here..."
                        className="resize-y min-h-[250px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between items-center">
                 <Button type="button" variant="secondary" onClick={handleSendToStudents}>
                  <Send className="mr-2 h-4 w-4" />
                  Send to Students
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
