
'use client';

import { Megaphone } from "lucide-react";
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
import { useUser, useCollection, useFirestore } from "@/firebase";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import type { Course, Enrollment, Announcement } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

export default function StudentDashboard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const studentName = user?.displayName || "Student";
  
  const { data: studentEnrollments, loading: enrollmentsLoading } = useCollection<Enrollment>(
    firestore && user ? query(collection(firestore, 'enrollments'), where('studentId', '==', user.uid)) : null
  );

  const { data: allCourses, loading: coursesLoading } = useCollection<Course>(
    firestore ? query(collection(firestore, 'courses'), where('isEnabled', '==', true)) : null
  );

  const { data: announcements, loading: announcementsLoading } = useCollection<Announcement>(
    firestore
      ? query(collection(firestore, 'announcements'), orderBy('date', 'desc'), where('date', '<=', new Date().toISOString().split('T')[0]), limit(3))
      : null
  );

  const enrolledCourses = studentEnrollments?.map((enrollment) => {
    const course = allCourses?.find((c) => c.id === enrollment.courseId);
    if (!course) return null;
    return { ...course, ...enrollment, progress: 0, grade: 'Not Started' }; // Mock progress/grade for now
  }).filter(course => course !== null) as (Course & Enrollment & { progress: number; grade: string; })[] | undefined;

  const isLoading = enrollmentsLoading || coursesLoading || announcementsLoading;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Welcome back, {studentName}!
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your learning journey.
        </p>
      </div>

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
                    <TableHead>Grade</TableHead>
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
