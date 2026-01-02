import { Megaphone, BookOpen } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { courses, enrollments, announcements } from "@/lib/data";

// Assuming we are logged in as student 'S001'
const STUDENT_ID = "S001";

export default function StudentDashboard() {
  const studentEnrollments = enrollments.filter(
    (e) => e.studentId === STUDENT_ID
  );
  const studentCourses = studentEnrollments.map((enrollment) => {
    const course = courses.find((c) => c.id === enrollment.courseId);
    return { ...course, ...enrollment };
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Welcome back!
        </h1>
        <p className="text-muted-foreground">
          Here is your learning progress and recent updates.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <h2 className="mb-4 font-headline text-2xl font-semibold">My Courses</h2>
            <div className="grid gap-4 sm:grid-cols-2">
            {studentCourses.map((course) => (
                <Card key={course.id}>
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{course.name}</CardTitle>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <BookOpen />
                    </div>
                    </div>
                    <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} aria-label={`${course.name} progress ${course.progress}%`} />
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="text-sm font-medium">
                    Current Grade: <span className="text-primary">{course.grade}</span>
                    </div>
                </CardFooter>
                </Card>
            ))}
            </div>
        </div>

        <div>
        <h2 className="mb-4 font-headline text-2xl font-semibold">
          Announcements
        </h2>
        <Card>
          <CardContent className="p-0">
            <div className="p-6">
                {announcements.slice(0, 3).map((announcement, index) => (
                    <div key={announcement.id}>
                        <div className="flex items-start gap-4 py-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-accent">
                            <Megaphone className="h-4 w-4"/>
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">{announcement.title}</h3>
                            <p className="text-xs text-muted-foreground">
                            {announcement.content}
                            </p>
                        </div>
                        </div>
                        {index < announcements.slice(0, 3).length -1 && <Separator/>}
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
