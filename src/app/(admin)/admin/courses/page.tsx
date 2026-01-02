
'use client';
import { Plus, MoreHorizontal, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCollection, useFirestore } from "@/firebase";
import { collection, writeBatch, getDocs, doc, updateDoc } from "firebase/firestore";
import type { Course, Enrollment } from "@/lib/data";
import { courses as hardcodedCourses } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useMemo } from "react";
import { useRouter } from 'next/navigation';
import Link from "next/link";

export default function CoursesPage() {
  const firestore = useFirestore();
  const router = useRouter();
  const coursesCollection = firestore ? collection(firestore, 'courses') : null;
  const enrollmentsCollection = firestore ? collection(firestore, 'enrollments') : null;

  useEffect(() => {
    const seedCourses = async () => {
      if (firestore && coursesCollection) {
        const snapshot = await getDocs(coursesCollection);
        if (snapshot.empty) {
          const batch = writeBatch(firestore);
          hardcodedCourses.forEach((course) => {
            const docRef = doc(coursesCollection);
            batch.set(docRef, course);
          });
          await batch.commit();
        }
      }
    };
    seedCourses();
  }, [firestore, coursesCollection]);

  const { data: courses, loading: coursesLoading } = useCollection<Course>(coursesCollection);
  const { data: enrollments, loading: enrollmentsLoading } = useCollection<Enrollment>(enrollmentsCollection);

  const handleRowClick = (courseId: string) => {
    router.push(`/admin/courses/${courseId}`);
  };
  
  const toggleCourseStatus = async (course: Course) => {
    if (!firestore) return;
    const courseRef = doc(firestore, "courses", course.id);
    await updateDoc(courseRef, { isEnabled: !course.isEnabled });
  };
  
  const courseEnrollmentCounts = useMemo(() => {
    const counts = new Map<string, number>();
    enrollments?.forEach(enrollment => {
        counts.set(enrollment.courseId, (counts.get(enrollment.courseId) || 0) + 1);
    });
    return counts;
  }, [enrollments]);

  const loading = coursesLoading || enrollmentsLoading;

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
                Course Management
              </h1>
              <p className="text-muted-foreground">
                Create, update, and manage all courses offered.
              </p>
            </div>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add New Course
        </Button>
      </div>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Name</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enrolled Students</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <>
                  {[...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))}
                </>
              )}
              {!loading && courses?.map((course) => (
                <TableRow key={course.id} onClick={() => handleRowClick(course.id)} className="cursor-pointer">
                  <TableCell className="font-medium">{course.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{course.level}</Badge>
                  </TableCell>
                   <TableCell>
                    <Badge variant={course.isEnabled ? "secondary" : "destructive"}>
                      {course.isEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {courseEnrollmentCounts.get(course.id) || 0}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                           onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {course.isEnabled ? (
                           <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toggleCourseStatus(course);}}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Disable
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toggleCourseStatus(course);}}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Enable
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
               {!loading && courses?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No courses found.
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
