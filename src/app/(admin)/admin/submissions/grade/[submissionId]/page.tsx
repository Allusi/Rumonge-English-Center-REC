
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
import { useFirestore } from '@/firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams, notFound } from 'next/navigation';
import type { Assignment, AssignmentSubmission } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useEffect, useState, useMemo } from 'react';

// Define the schema creation as a function to accept dynamic max marks
const createFormSchema = (maxMarks: number) => z.object({
  feedback: z.string().min(10, { message: 'Feedback must be at least 10 characters long.' }),
  marks: z.coerce.number().min(0, "Marks cannot be negative.").max(maxMarks, `Marks cannot exceed ${maxMarks}.`),
});


function LoadingSkeleton() {
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
          <Skeleton className="h-6 w-1/3" />
        </CardHeader>
        <CardContent className="space-y-6">
           <Skeleton className="h-20" />
           <Skeleton className="h-40" />
        </CardContent>
      </Card>
       <Card>
          <CardHeader>
              <Skeleton className="h-6 w-1/4" />
          </CardHeader>
          <CardContent className="space-y-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-10 w-20" />
              <div className="flex justify-end">
                  <Skeleton className="h-10 w-32" />
              </div>
          </CardContent>
      </Card>
    </div>
  );
}

function GradeSubmissionPageContent({ submission }: { submission: AssignmentSubmission }) {
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [assignmentLoading, setAssignmentLoading] = useState(true);

    useEffect(() => {
        if (firestore && submission) {
            setAssignmentLoading(true);
            const assignmentRef = doc(firestore, 'assignments', submission.assignmentId);
            const unsubscribe = onSnapshot(assignmentRef, (docSnap) => {
                if (docSnap.exists()) {
                    setAssignment({ id: docSnap.id, ...docSnap.data() } as Assignment);
                } else {
                    setAssignment(null);
                }
                setAssignmentLoading(false);
            }, (error) => {
                console.error("Error fetching assignment:", error);
                setAssignment(null);
                setAssignmentLoading(false);
            });
            return () => unsubscribe();
        }
    }, [firestore, submission]);

    const formSchema = useMemo(() => {
        return assignment ? createFormSchema(assignment.maxMarks) : createFormSchema(10);
    }, [assignment]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            feedback: submission.feedback || '',
            marks: submission.marks ?? 0,
        },
    });

    useEffect(() => {
        if (assignment) {
            form.reset({
                feedback: submission.feedback || '',
                marks: submission.marks ?? 0,
            });
        }
    }, [assignment, submission, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!firestore) return;
        const submissionRef = doc(firestore, 'submissions', submission.id);
        try {
            await updateDoc(submissionRef, {
                ...values,
                status: 'graded',
            });
            toast({ title: 'Success', description: 'The submission has been graded.' });
            router.push('/admin/submissions');
        } catch (error) {
            console.error("Error grading submission: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not grade the submission. Please try again.' });
        }
    }

    if (assignmentLoading) {
        return <LoadingSkeleton />;
    }

    if (!assignment) {
        notFound();
    }

    return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/submissions" passHref>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Grade Submission
          </h1>
          <p className="text-muted-foreground">
            Reviewing "{submission.assignmentTitle}" by {submission.studentName}.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Assignment & Submission</CardTitle>
            <CardDescription as="div" className="whitespace-pre-wrap pt-2">{assignment.instructions.split('\n').map((line, i) => <p key={i}>{line}</p>)}</CardDescription>
        </CardHeader>
        <CardContent>
             <h3 className="text-lg font-semibold mb-2">Student's Answer</h3>
             <div className="p-4 border rounded-md bg-muted/30">
                <p className="text-muted-foreground whitespace-pre-wrap">{submission.answers}</p>
             </div>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
            <CardTitle>Grading & Feedback</CardTitle>
            <CardDescription>Provide feedback and assign marks for this submission.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="feedback"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Feedback</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write your feedback here..."
                        className="resize-y min-h-[150px] text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="marks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Marks</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 8"
                        className="w-40"
                        {...field}
                      />
                    </FormControl>
                     <FormDescription>
                      Assign a score out of {assignment.maxMarks}.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting} size="lg">
                  {form.formState.isSubmitting ? 'Submitting...' : <>Submit Grade <Send className="ml-2 h-4 w-4" /></>}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
    );
}

export default function GradeSubmissionPage() {
    const firestore = useFirestore();
    const params = useParams();
    const submissionId = params.submissionId as string;

    const [submission, setSubmission] = useState<AssignmentSubmission | null>(null);
    const [submissionLoading, setSubmissionLoading] = useState(true);

    useEffect(() => {
        if (firestore && submissionId) {
            setSubmissionLoading(true);
            const submissionRef = doc(firestore, 'submissions', submissionId);
            const unsubscribe = onSnapshot(submissionRef, (docSnap) => {
                if (docSnap.exists()) {
                    setSubmission({ id: docSnap.id, ...docSnap.data() } as AssignmentSubmission);
                } else {
                    setSubmission(null);
                }
                setSubmissionLoading(false);
            }, (error) => {
                console.error("Error fetching submission:", error);
                setSubmission(null);
                setSubmissionLoading(false);
            });

            return () => unsubscribe();
        }
    }, [firestore, submissionId]);
    
    if (submissionLoading) {
        return <LoadingSkeleton />;
    }

    if (!submission) {
        notFound();
    }
    
    return <GradeSubmissionPageContent submission={submission} />;
}
