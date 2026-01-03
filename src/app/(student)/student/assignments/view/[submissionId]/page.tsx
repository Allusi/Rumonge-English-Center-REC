
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useFirestore } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { ArrowLeft, FileCheck2, MessageSquareQuote, FileQuestion } from 'lucide-react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import type { Assignment, AssignmentSubmission } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

function LoadingSkeleton() {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
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
            </CardContent>
        </Card>
      </div>
    );
}

function GradedSubmissionContent({ submission }: { submission: AssignmentSubmission }) {
    const firestore = useFirestore();
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
                    // Assignment was likely deleted, this is a valid state
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


    if (assignmentLoading) {
        return <LoadingSkeleton />;
    }

    // `assignment` can be null if it was deleted, but we should still show the grade.

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
                    Graded Assignment
                </h1>
                <p className="text-muted-foreground">
                    Viewing your grade for "{submission.assignmentTitle}".
                </p>
                </div>
            </div>

            <Card className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                    <FileCheck2 className="h-10 w-10 text-primary" />
                    <div>
                    <CardTitle className="text-xl">Your Grade</CardTitle>
                    <CardDescription>This assignment has been graded by an administrator.</CardDescription>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-5xl font-bold text-primary">{submission.marks ?? 'N/A'}<span className="text-2xl text-muted-foreground">/{assignment?.maxMarks ?? '??'}</span></p>
                </div>
            </Card>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Your Submission</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="p-4 border rounded-md bg-muted/30 h-full">
                            <p className="text-muted-foreground whitespace-pre-wrap">{submission.answers}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <MessageSquareQuote className="h-6 w-6 text-primary"/>
                            <CardTitle>Teacher's Feedback</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {submission.feedback ? (
                            <div className="p-4 border rounded-md bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800 h-full">
                                <p className="text-primary whitespace-pre-wrap">{submission.feedback}</p>
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-10">No feedback was provided for this submission.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Original Assignment Instructions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {assignment ? (
                        assignment.instructions.split('\n').map((line, index) => (
                           <p key={index} className="text-muted-foreground">{line}</p>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                            <FileQuestion className="h-10 w-10 mb-4" />
                            <p className="font-semibold">The original assignment could not be found.</p>
                            <p className="text-sm">It may have been deleted by an administrator.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function ViewGradedSubmissionPage() {
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

  return <GradedSubmissionContent submission={submission} />;
}
