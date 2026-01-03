
'use client';

import { Megaphone, BookCheck } from "lucide-react";
import Link from 'next/link';
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
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useUser, useCollection, useFirestore, useDoc } from "@/firebase";
import { collection, query, where, orderBy, limit, doc } from "firebase/firestore";
import type { Course, Enrollment, Announcement, Student, Assignment, AssignmentSubmission } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";

export default function StudentDashboard() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = (firestore && user) ? doc(firestore, 'users', user.uid) : null;
  const { data: studentProfile, loading: profileLoading } = useDoc<Student>(userDocRef);

  const studentName = studentProfile?.name || "Student";
  
  const { data: studentEnrollments, loading: enrollmentsLoading } = useCollection<Enrollment>(
    firestore && user ? query(collection(firestore, 'enrollments'), where('studentId', '==', user.uid)) : null
  );

  const enrolledCourseIds = useMemo(() => studentEnrollments?.map(e => e.courseId) || [], [studentEnrollments]);

  const { data: allCourses, loading: coursesLoading } = useCollection<Course>(
    firestore ? query(collection(firestore, 'courses'), where('isEnabled', '==', true)) : null
  );
  
  const { data: allAssignments, loading: assignmentsLoading } = useCollection<Assignment>(
    firestore && enrolledCourseIds.length > 0 
    ? query(
        collection(firestore, 'assignments'), 
        where('courseId', 'in', enrolledCourseIds),
        where('status', '==', 'published')
      ) 
    : null
  );

  const { data: allSubmissions, loading: submissionsLoading } = useCollection<AssignmentSubmission>(
    firestore && user ? query(collection(firestore, 'submissions'), where('studentId', '==', user.uid)) : null
  );

  const { data: announcements, loading: announcementsLoading } = useCollection<Announcement>(
    firestore
      ? query(collection(firestore, 'announcements'), orderBy('date', 'desc'), where('date', '<=', new Date().toISOString().split('T')[0]), limit(3))
      : null
  );

  const enrolledCourses = useMemo(() => {
    return studentEnrollments?.map((enrollment) => {
      const course = allCourses?.find((c) => c.id === enrollment.courseId);
      if (!course) return null;

      const assignmentsForCourse = allAssignments?.filter(a => a.courseId === course.id) || [];
      const submissionsForCourse = allSubmissions?.filter(s => s.courseId === course.id) || [];
      
      const progress = assignmentsForCourse.length > 0 
        ? (submissionsForCourse.length / assignmentsForCourse.length) * 100 
        : 0;

      const gradedSubmissions = submissionsForCourse.filter(s => s.status === 'graded' && s.marks !== undefined);
      const averageGrade = gradedSubmissions.length > 0
        ? gradedSubmissions.reduce((acc, s) => acc + s.marks!, 0) / gradedSubmissions.length
        : null;

      return { 
        ...course, 
        ...enrollment, 
        progress: Math.round(progress), 
        grade: averageGrade !== null ? `${Math.round(averageGrade)}%` : 'Not Graded' 
      };
    }).filter(course => course !== null) as (Course & Enrollment & { progress: number; grade: string; })[] | undefined;
  }, [studentEnrollments, allCourses, allAssignments, allSubmissions]);
  
  const nextAssignment = useMemo(() => {
    if (!allAssignments || !allSubmissions) return null;
    
    const submittedAssignmentIds = new Set(allSubmissions.map(s => s.assignmentId));

    // Sort assignments by creation date, oldest first
    const sortedAssignments = [...allAssignments].sort((a, b) => 
        (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0)
    );

    return sortedAssignments.find(a => !submittedAssignmentIds.has(a.id));

  }, [allAssignments, allSubmissions]);

  const isLoading = userLoading || profileLoading || enrollmentsLoading || coursesLoading || announcementsLoading || assignmentsLoading || submissionsLoading;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Welcome back, {isLoading ? <Skeleton className="h-8 w-40 inline-block" /> : studentName}!
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your learning journey.
        </p>
      </div>
      
      {isLoading ? <Skeleton className="h-48 w-full" /> : (
        <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <CardHeader>
             <div className="flex items-center gap-3">
              <BookCheck className="h-6 w-6"/>
              <CardTitle>Your Next Step</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {nextAssignment ? (
              <div>
                <p className="text-lg font-semibold">{nextAssignment.title}</p>
                <p className="text-sm opacity-80 mb-4">From course: {nextAssignment.courseName}</p>
                <Link href={`/student/assignments/submit/${nextAssignment.id}`}>
                  <Button variant="secondary">Start Assignment</Button>
                </Link>
              </div>
            ) : (
              <div>
                 <p className="text-lg font-semibold">You're all caught up!</p>
                 <p className="text-sm opacity-80">There are no new assignments for you at the moment. Great job!</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
           <Card>
            <CardHeader>
              <CardTitle>My Courses</CardTitle>
              <CardDescription>
                Your enrolled courses and current progress.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead className="w-[30%]">Progress</TableHead>
                    <TableHead>Avg. Grade</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && [...Array(2)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                    </TableRow>
                  ))}
                  {!isLoading && enrolledCourses && enrolledCourses.length > 0 ? enrolledCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{course.level}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={course.progress} className="h-2" />
                          <span>{course.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge>{course.grade}</Badge>
                      </TableCell>
                      <TableCell>
                        <Link href={`/student/courses/${course.courseId}`} passHref>
                            <Button variant="outline" size="sm">View Course</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  )) : (
                     !isLoading && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                You are not enrolled in any courses yet.
                            </TableCell>
                        </TableRow>
                     )
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Recent Announcements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading && [...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
              ))}
              {!isLoading && announcements?.map(announcement => (
                 <Link key={announcement.id} href={`/student/announcements/${announcement.id}`} className="block hover:bg-muted/50 p-3 rounded-lg -m-3 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <Megaphone className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{announcement.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {announcement.content}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
              {!isLoading && announcements?.length === 0 && (
                <p className="text-sm text-center text-muted-foreground py-4">No recent announcements.</p>
              )}
               <Link href="/student/announcements" passHref>
                    <Button variant="outline" className="w-full mt-4">View all announcements</Button>
               </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
