
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import type { Assignment, AssignmentSubmission, Enrollment } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BookOpen, Check, Edit } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { format } from "date-fns";

export default function StudentAssignmentsPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const { data: enrollments, loading: enrollmentsLoading } = useCollection<Enrollment>(
    firestore && user ? query(collection(firestore, 'enrollments'), where('studentId', '==', user.uid)) : null
  );

  const enrolledCourseIds = useMemo(() => enrollments?.map(e => e.courseId) || [], [enrollments]);

  const { data: assignments, loading: assignmentsLoading } = useCollection<Assignment>(
    firestore && enrolledCourseIds.length > 0 
    ? query(
        collection(firestore, 'assignments'), 
        where('courseId', 'in', enrolledCourseIds),
        where('status', '==', 'published')
      ) 
    : null
  );
  
  const { data: submissions, loading: submissionsLoading } = useCollection<AssignmentSubmission>(
      firestore && user ? query(collection(firestore, 'submissions'), where('studentId', '==', user.uid)) : null
  );

  const mergedAssignments = useMemo(() => {
    return assignments?.map(assignment => {
      const submission = submissions?.find(s => s.assignmentId === assignment.id);
      return {
        ...assignment,
        submissionStatus: submission ? (submission.status === 'graded' ? 'Graded' : 'Submitted') : 'Not Submitted',
        submission: submission,
      };
    }).sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
  }, [assignments, submissions]);

  const isLoading = userLoading || enrollmentsLoading || assignmentsLoading || submissionsLoading;

  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center gap-4">
            <Link href="/student/dashboard" passHref>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">
                    My Assignments
                </h1>
                <p className="text-muted-foreground">
                    View and complete your assignments.
                </p>
            </div>
      </div>
      
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assignment</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                 [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-9 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
              )}
               {!isLoading && mergedAssignments?.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">{assignment.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1">
                        <BookOpen className="h-3 w-3" />
                        {assignment.courseName}
                    </Badge>
                  </TableCell>
                  <TableCell>{assignment.createdAt ? format(assignment.createdAt.toDate(), 'PPP') : '-'}</TableCell>
                  <TableCell>
                    <Badge variant={
                        assignment.submissionStatus === 'Submitted' ? 'secondary' : 
                        assignment.submissionStatus === 'Graded' ? 'default' : 
                        'destructive'
                    }>
                      {assignment.submissionStatus === 'Graded' && <Check className="mr-1 h-3 w-3"/>}
                      {assignment.submissionStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {assignment.submissionStatus === 'Not Submitted' && (
                        <Link href={`/student/assignments/submit/${assignment.id}`} passHref>
                            <Button variant="outline" size="sm">Submit</Button>
                        </Link>
                    )}
                    {assignment.submissionStatus === 'Submitted' && (
                        <Button variant="outline" size="sm" disabled>Submitted</Button>
                    )}
                     {assignment.submissionStatus === 'Graded' && assignment.submission && (
                        <Link href={`/student/assignments/view/${assignment.submission.id}`} passHref>
                            <Button variant="default" size="sm">View Grade</Button>
                        </Link>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && mergedAssignments?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    You have no assignments at the moment.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
