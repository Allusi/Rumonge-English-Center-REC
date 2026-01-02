
'use client';

import {
  User,
  AtSign,
  Cake,
  Home,
  Phone,
  BookOpen,
  GraduationCap,
  Heart,
  Briefcase,
  HelpCircle,
  ArrowLeft,
  FilePenLine,
  KeyRound,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Student, Course } from '@/lib/data';
import { notFound, useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value?: React.ReactNode }) => (
    <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-lg font-semibold">{value || 'N/A'}</p>
        </div>
    </div>
);

export default function StudentProfilePage() {
  const params = useParams();
  const studentId = params.studentId as string;
  const firestore = useFirestore();

  const studentRef = firestore && studentId ? doc(firestore, 'users', studentId) : null;
  const { data: student, loading: studentLoading } = useDoc<Student>(studentRef);

  const courseRef = firestore && student?.enrolledCourseId ? doc(firestore, 'courses', student.enrolledCourseId) : null;
  const { data: course, loading: courseLoading } = useDoc<Course>(courseRef);

  if (studentLoading || courseLoading) {
    return (
        <div className="space-y-6">
             <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-6 w-64" />
                    </div>
                </div>
                 <Skeleton className="h-10 w-28" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-6 w-32" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
  }

  if (!student) {
    return notFound();
  }

  const educationalStatusMap = {
    government_student: 'Government Student',
    dropout: 'Dropout',
    graduated: 'Graduated',
    never_went_to_school: 'Never Went to School'
  };

  return (
    <div className="flex flex-col gap-8">
       <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link href="/admin/students" passHref>
                <Button variant="outline" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                </Link>
                <div className="flex items-center gap-4">
                    <Avatar className="h-24 w-24">
                        {student.photoURL && <AvatarImage src={student.photoURL} alt={student.name} />}
                        <AvatarFallback className="text-3xl">{student.name?.charAt(0) || 'S'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="font-headline text-4xl font-bold tracking-tight">{student.name}</h1>
                        <p className="text-l text-muted-foreground flex items-center gap-2">
                            <KeyRound className="h-5 w-5" /> {student.loginKey}
                        </p>
                    </div>
                </div>
            </div>
            <Link href={`/admin/students/${studentId}/edit`} passHref>
                <Button>
                    <FilePenLine className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
            </Link>
      </div>


      <Card>
        <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>Detailed profile of {student.name}.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 pt-4">
            <DetailItem icon={<User />} label="Full Name" value={student.name} />
            <DetailItem icon={<AtSign />} label="Email Address" value={student.email} />
            <DetailItem icon={<Cake />} label="Age" value={student.age} />
            <DetailItem icon={<Home />} label="Address" value={student.address} />
            <DetailItem icon={<Phone />} label="Phone Number" value={student.phoneNumber} />
            <DetailItem icon={<BookOpen />} label="Enrolled Course" value={course?.name || 'Not Enrolled'} />
            <DetailItem icon={<GraduationCap />} label="English Level" value={<Badge variant="secondary">{student.englishLevel}</Badge>} />
            <DetailItem icon={<Heart />} label="Marital Status" value={<span className="capitalize">{student.maritalStatus}</span>} />
            <DetailItem icon={<Briefcase />} label="Educational Status" value={educationalStatusMap[student.educationalStatus as keyof typeof educationalStatusMap] || 'N/A'} />
            <DetailItem icon={<HelpCircle />} label="Reason for Learning" value={<p className="text-base font-normal">{student.learningReason}</p>} />
        </CardContent>
      </Card>
    </div>
  );
}
