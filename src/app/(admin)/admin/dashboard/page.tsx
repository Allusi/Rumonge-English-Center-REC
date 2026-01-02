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
import { useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { announcements, courses, enrollments } from '@/lib/data';

interface Student {
  id: string;
  name: string;
  email: string;
}

export default function AdminDashboard() {
  const firestore = useFirestore();
  const { data: students } = useCollection<Student>(
    firestore ? collection(firestore, 'users') : null
  );

  const recentStudents = students?.slice(-5).reverse() || [];
  const recentAnnouncements = announcements.slice(0, 3);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            A complete overview of your school's activity.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <UserPlus className="mr-2 h-4 w-4" /> Add Student
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Announcement
          </Button>
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
              <div className="text-2xl font-bold">{students?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Currently active students
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/courses">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Courses
              </CardTitle>
              <BookCopy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courses.length}</div>
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
              <div className="text-2xl font-bold">{announcements.length}</div>
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
            <div className="text-2xl font-bold">{enrollments.length}</div>
            <p className="text-xs text-muted-foreground">
              Student course enrollments
            </p>
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
                        {announcement.date}
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
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
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
