
'use client';
import {
  Megaphone,
  Users,
  BookCopy,
  Activity,
  UserPlus,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { collection, query, orderBy, limit, where } from 'firebase/firestore';
import type { Course, UserProfile, Announcement, Enrollment } from '@/lib/data';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  BarChart as RechartsBarChart,
  XAxis,
  YAxis,
  Bar,
  ResponsiveContainer,
} from 'recharts';

export default function AdminDashboard() {
  const firestore = useFirestore();
  const { user } = useUser();

  const { data: students } = useCollection<UserProfile>(
    firestore ? query(collection(firestore, 'users'), where('role', '==', 'student')) : null
  );
  const { data: courses } = useCollection<Course>(
    firestore ? collection(firestore, 'courses') : null
  );
  const { data: announcements } = useCollection<Announcement>(
    firestore
      ? query(collection(firestore, 'announcements'), orderBy('date', 'desc'))
      : null
  );
  const { data: enrollments } = useCollection<Enrollment>(
    firestore ? collection(firestore, 'enrollments') : null
  );

  const recentStudents =
    students
      ?.slice(-5)
      .reverse() || [];
  const recentAnnouncements = announcements?.slice(0, 3) || [];

  const enrollmentByCourse = courses?.map(course => {
    const count = enrollments?.filter(e => e.courseId === course.id).length || 0;
    return { name: course.name, count };
  }) || [];
  
  const studentSignups = students?.filter(s => s.createdAt).reduce((acc: { [key: string]: number }, student) => {
    const date = new Date(student.createdAt.seconds * 1000).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const studentSignupsChartData = studentSignups ? Object.entries(studentSignups).map(([date, count]) => ({ date, count })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];


  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Welcome, Admin!
          </h1>
          <p className="text-muted-foreground">
            Here is a complete overview of your school's activity.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/students/new">
            <Button variant="outline">
              <UserPlus className="mr-2 h-4 w-4" /> Add Student
            </Button>
          </Link>
          <Link href="/admin/announcements/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Announcement
            </Button>
          </Link>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/students">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently active students
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/courses">
          <Card className="hover-bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Courses
              </CardTitle>
              <BookCopy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courses?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Available courses</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/announcements">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Announcements
              </CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {announcements?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Published announcements
              </p>
            </CardContent>
          </Card>
        </Link>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Enrollments
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollments?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Student course enrollments
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
         <Card>
          <CardHeader>
            <CardTitle>Course Popularity</CardTitle>
            <CardDescription>
              Distribution of student enrollments across courses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="min-h-64 w-full">
               <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={enrollmentByCourse} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                     <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                     <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false}/>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Student Signups</CardTitle>
            <CardDescription>Daily student registrations.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={{}} className="min-h-64 w-full">
               <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={studentSignupsChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                     <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                     <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Announcements</CardTitle>
              <CardDescription>
                The latest three announcements published.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentAnnouncements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="flex items-start gap-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/50 text-accent">
                      <Megaphone />
                    </div>
                    <div>
                      <h3 className="font-semibold">{announcement.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {announcement.content}
                      </p>
                      <time className="text-xs text-muted-foreground">
                        {new Date(announcement.date).toLocaleDateString()}
                      </time>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Recently Joined Students</CardTitle>
              <CardDescription>
                The newest students who have registered.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentStudents.map((student) => (
                  <div key={student.id} className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {student.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {student.email}
                      </p>
                    </div>
                    <Link href={`/admin/students/${student.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
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
