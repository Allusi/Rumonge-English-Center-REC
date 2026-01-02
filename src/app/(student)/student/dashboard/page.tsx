import { BookCopy, Home, FileText, BarChart2 } from "lucide-react";
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
import { courses, enrollments } from "@/lib/data";
import { Button } from "@/components/ui/button";

export default function StudentDashboard() {
  const studentId = "S001"; // Mock student ID
  const studentEnrollments = enrollments.filter(
    (e) => e.studentId === studentId
  );
  const enrolledCourses = studentEnrollments.map((enrollment) => {
    const course = courses.find((c) => c.id === enrollment.courseId);
    return { ...course, ...enrollment };
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Welcome, Student!
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your courses and progress.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Enrolled Courses
            </CardTitle>
            <BookCopy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrolledCourses.length}</div>
            <p className="text-xs text-muted-foreground">
              Courses you are currently taking.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Assignments Due
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              In the next 7 days.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Progress
            </CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72%</div>
            <p className="text-xs text-muted-foreground">
              Average across all courses.
            </p>
          </CardContent>
        </Card>
      </div>

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
              {enrolledCourses.map((course) => (
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
                     <Link href={`/student/courses/${course.id}`} passHref>
                        <Button variant="outline" size="sm">View Course</Button>
                     </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
