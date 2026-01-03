
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
  FilePenLine,
  KeyRound,
  ShieldCheck,
  ShieldX,
  Percent,
  Building,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCollection, useDoc, useFirestore, useUser } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import type { Student, Course, Assignment, AssignmentSubmission } from '@/lib/data';
import { notFound, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value?: React.ReactNode }) => (
    <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="text-lg font-semibold">{value || 'N/A'}</div>
        </div>
    </div>
);

export default function ProfilePage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userDocRef = firestore && user ? doc(firestore, 'users', user.uid) : null;
  const { data: userProfile, loading: profileLoading } = useDoc<Student>(userDocRef);

  const courseRef = firestore && userProfile?.enrolledCourseId ? doc(firestore, 'courses', userProfile.enrolledCourseId) : null;
  const { data: course, loading: courseLoading } = useDoc<Course>(courseRef);
  
  const { data: submissions, loading: submissionsLoading } = useCollection<AssignmentSubmission>(
    firestore && user && userProfile?.role === 'student' ? query(collection(firestore, 'submissions'), where('studentId', '==', user.uid)) : null
  );

  const { data: assignments, loading: assignmentsLoading } = useCollection<Assignment>(
    firestore && userProfile?.enrolledCourseId && userProfile?.role === 'student' ? query(collection(firestore, 'assignments'), where('courseId', '==', userProfile.enrolledCourseId)) : null
  );
  
  const averageGrade = useMemo(() => {
    if (!submissions || submissions.length === 0 || !assignments) return null;

    const assignmentMaxMarks = new Map<string, number>();
    assignments.forEach(a => assignmentMaxMarks.set(a.id, a.maxMarks));

    const gradedSubmissions = submissions.filter(s => s.status === 'graded' && s.marks !== undefined);
    if (gradedSubmissions.length === 0) return null;

    const { totalMarks, totalMaxMarks } = gradedSubmissions.reduce(
        (acc, sub) => {
            const maxMarks = assignmentMaxMarks.get(sub.assignmentId) || 100;
            acc.totalMarks += sub.marks!;
            acc.totalMaxMarks += maxMarks;
            return acc;
        },
        { totalMarks: 0, totalMaxMarks: 0 }
    );
    
    return totalMaxMarks > 0 ? Math.round((totalMarks / totalMaxMarks) * 100) : 0;
  }, [submissions, assignments]);


  const isLoading = useMemo(() => {
    if (userLoading || profileLoading) return true;
    if (!userProfile) return false; // Not loading if there's no profile
    if (userProfile.role === 'student') {
        return courseLoading || submissionsLoading || assignmentsLoading;
    }
    return false; // Admins don't have extra data to load on this page
  }, [userLoading, profileLoading, userProfile, courseLoading, submissionsLoading, assignmentsLoading]);


  if (isLoading) {
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

  if (!userProfile) {
    notFound();
  }

  const educationalStatusMap = {
    government_student: 'Government Student',
    dropout: 'Dropout',
    graduated: 'Graduated',
    never_went_to_school: 'Never Went to School'
  };
  
  const handleEditClick = () => {
    if (userProfile.role === 'admin') {
      // Admins don't have an edit page yet, so we can disable this or route to a future page.
      // For now, let's assume admins can't edit their profile from here.
    } else {
       router.push(`/admin/students/${user.id}/edit`);
    }
  }

  return (
    <div className="flex flex-col gap-8">
       <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Avatar className="h-24 w-24">
                    {userProfile.photoURL && <AvatarImage src={userProfile.photoURL} alt={userProfile.name} />}
                    <AvatarFallback className="text-3xl">{userProfile.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                    <div className='flex items-center gap-4'>
                         <h1 className="font-headline text-4xl font-bold tracking-tight">{userProfile.name}</h1>
                         <Badge variant={userProfile.status === 'active' ? 'secondary' : 'destructive'} className="capitalize text-base">
                            {userProfile.status === 'active' ? <ShieldCheck className="mr-2 h-4 w-4"/> : <ShieldX className="mr-2 h-4 w-4"/>}
                            {userProfile.status}
                         </Badge>
                    </div>
                     <p className="text-l text-muted-foreground flex items-center gap-2 mt-1">
                        {userProfile.role === 'student' ? <KeyRound className="h-5 w-5" /> : <Building className="h-5 w-5" />} 
                        {userProfile.role === 'student' ? userProfile.loginKey : userProfile.email}
                     </p>
                </div>
            </div>
            {userProfile.role === 'student' && (
                 <Button onClick={handleEditClick}>
                    <FilePenLine className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
            )}
      </div>

      <Card>
        <CardHeader>
            <CardTitle>My Information</CardTitle>
            <CardDescription>Your personal and academic details.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 pt-4">
            <DetailItem icon={<User />} label="Full Name" value={userProfile.name} />
            <DetailItem icon={<AtSign />} label="Login Email" value={userProfile.email} />
            
            {userProfile.role === 'student' ? (
                <>
                    <DetailItem icon={<Cake />} label="Age" value={userProfile.age} />
                    <DetailItem icon={<Home />} label="Address" value={userProfile.address} />
                    <DetailItem icon={<Phone />} label="Phone Number" value={userProfile.phoneNumber} />
                    <DetailItem icon={<BookOpen />} label="Enrolled Course" value={course?.name || 'Not Enrolled'} />
                    <DetailItem icon={<GraduationCap />} label="English Level" value={<Badge variant="secondary">{userProfile.englishLevel}</Badge>} />
                     <DetailItem 
                        icon={<Percent />} 
                        label="Average Grade" 
                        value={averageGrade !== null ? <Badge className="text-base">{averageGrade}%</Badge> : 'No grades yet'} 
                    />
                    <DetailItem icon={<Heart />} label="Marital Status" value={<span className="capitalize">{userProfile.maritalStatus}</span>} />
                    <DetailItem icon={<Briefcase />} label="Educational Status" value={educationalStatusMap[userProfile.educationalStatus as keyof typeof educationalStatusMap] || 'N/A'} />
                    <DetailItem icon={<HelpCircle />} label="Reason for Learning" value={<p className="text-base font-normal">{userProfile.learningReason}</p>} />
                </>
            ) : (
                 <DetailItem icon={<ShieldCheck />} label="Role" value={<span className="capitalize">{userProfile.role}</span>} />
            )}
        </CardContent>
      </Card>
    </div>
  );
}
