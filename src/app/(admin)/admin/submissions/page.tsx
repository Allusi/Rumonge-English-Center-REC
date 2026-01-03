
'use client';
import { ArrowLeft, BookOpen, Check, FilePenLine } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import type { AssignmentSubmission } from "@/lib/data";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export default function SubmissionsPage() {
  const firestore = useFirestore();
  const router = useRouter();

  const submissionsQuery = firestore ? query(collection(firestore, 'submissions'), orderBy('submittedAt', 'desc')) : null;
  const { data: submissions, loading } = useCollection<AssignmentSubmission>(submissionsQuery);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
         <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" passHref>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="font-headline text-3xl font-bold tracking-tight">
                Assignment Submissions
              </h1>
              <p className="text-muted-foreground">
                Review and grade student assignment submissions.
              </p>
            </div>
        </div>
      </div>
      <Card>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Assignment</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Submitted On</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading && Array.from({length: 5}).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-9 w-20 ml-auto" /></TableCell>
                        </TableRow>
                    ))}
                    {!loading && submissions?.map(submission => (
                        <TableRow key={submission.id} className="cursor-pointer" onClick={() => router.push(`/admin/submissions/grade/${submission.id}`)}>
                            <TableCell className="font-medium">{submission.studentName}</TableCell>
                            <TableCell>{submission.assignmentTitle}</TableCell>
                            <TableCell>
                                <Badge variant="outline" className="gap-1">
                                    <BookOpen className="h-3 w-3" />
                                    {submission.courseName}
                                </Badge>
                            </TableCell>
                            <TableCell>{submission.submittedAt ? format(new Date(submission.submittedAt.seconds * 1000), 'PPP p') : 'N/A'}</TableCell>
                            <TableCell>
                                <Badge variant={submission.status === 'graded' ? 'default' : 'secondary'}>
                                    {submission.status === 'graded' && <Check className="mr-1 h-3 w-3" />}
                                    <span className="capitalize">{submission.status}</span>
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="outline" size="sm">
                                    <FilePenLine className="mr-2 h-4 w-4" />
                                    {submission.status === 'graded' ? 'View Grade' : 'Grade'}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    {!loading && submissions?.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                No submissions found yet.
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
