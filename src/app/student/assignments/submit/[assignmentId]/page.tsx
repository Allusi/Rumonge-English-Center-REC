
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useDoc, useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams, notFound } from 'next/navigation';
import type { Assignment, UserProfile } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  answers: z.string().min(10, { message: 'Your answer must be at least 10 characters long.' }),
});

export default function SubmitAssignmentPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.assignmentId as string;
  const { toast } = useToast();

  const assignmentRef = firestore && assignmentId ? doc(firestore, 'assignments', assignmentId) : null;
  const { data: assignment, loading: assignmentLoading } = useDoc<Assignment>(assignmentRef);
  
  const studentRef = firestore && user ? doc(firestore, 'users', user.uid) : null;
  const { data: studentProfile, loading: studentLoading } = useDoc<UserProfile>(studentRef);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      answers: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !user || !assignment || !studentProfile) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not submit. Missing information.' });
      return;
    }
    
    try {
      await addDoc(collection(firestore, 'submissions'), {
        assignmentId: assignment.id,
        assignmentTitle: assignment.title,
        studentId: user.uid,
        studentName: studentProfile.name,
        courseId: assignment.courseId,
        courseName: assignment.courseName,
        answers: values.answers,
        submittedAt: serverTimestamp(),
        status: 'submitted',
      });

      // Create notification for admin
      const adminsQuery = query(collection(firestore, 'users'), where('role', '==', 'admin'));
      const adminSnapshot = await getDocs(adminsQuery);
      adminSnapshot.forEach(adminDoc => {
          addDoc(collection(firestore, 'notifications'), {
              userId: adminDoc.id,
              message: `${studentProfile.name} submitted an assignment: "${assignment.title}"`,
              link: `/admin/submissions`,
              isRead: false,
              createdAt: serverTimestamp(),
          });
      });

      toast({ title: 'Success', description: 'Your assignment has been submitted.' });
      router.push('/student/assignments');
    } catch (error) {
      console.error("Error submitting assignment: ", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not submit your assignment. Please try again.' });
    }
  }
  
  const isLoading = assignmentLoading || userLoading || studentLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-9" />
            <div className='space-y-2'>
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
            </div>
        </div>
        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-40" />
            <div className="flex justify-end">
                <Skeleton className="h-10 w-40" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!assignment) {
    return notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/student/assignments" passHref>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Submit Assignment
          </h1>
          <p className="text-muted-foreground">
            Complete and submit your work for "{assignment?.title}".
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Assignment Instructions</CardTitle>
            <CardDescription as="div" className="pt-2 space-y-2">
                {assignment.instructions.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                ))}
            </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="answers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Your Answer</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write your answer here..."
                        className="resize-y min-h-[300px] text-base"
                        {...field}
                      />
                    </FormControl>
                     <FormDescription>
                      You can use the AI Assignment Helper for feedback before submitting.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting} size="lg">
                  {form.formState.isSubmitting ? 'Submitting...' : <>Submit Your Answer <Send className="ml-2 h-4 w-4" /></>}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
