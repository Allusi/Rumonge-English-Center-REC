'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useFirestore, useDoc } from '@/firebase';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import type { UserProfile } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MarkPresentPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const studentId = searchParams.get('studentId');
    const firestore = useFirestore();
    const { toast } = useToast();
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already_marked'>('loading');
    const [message, setMessage] = useState('Marking attendance...');

    const studentRef = firestore && studentId ? doc(firestore, 'users', studentId) : null;
    const { data: student, loading: studentLoading } = useDoc<UserProfile>(studentRef);

    useEffect(() => {
        if (studentLoading) return;
        if (!studentId || !firestore || !student) {
            setStatus('error');
            setMessage(studentId ? 'Student not found.' : 'No student ID provided.');
            return;
        }

        const markAttendance = async () => {
            const today = new Date();
            const todayString = format(today, 'yyyy-MM-dd');

            const attendanceQuery = query(
                collection(firestore, 'attendance'),
                where('studentId', '==', studentId),
                where('date', '==', todayString)
            );

            const querySnapshot = await getDocs(attendanceQuery);
            if (!querySnapshot.empty) {
                setStatus('already_marked');
                setMessage(`${student.name} is already marked as ${querySnapshot.docs[0].data().status} for today.`);
                return;
            }

            try {
                const newDocRef = doc(collection(firestore, 'attendance'));
                await setDoc(newDocRef, {
                    studentId: studentId,
                    studentName: student.name,
                    date: todayString,
                    status: 'present',
                    markedAt: serverTimestamp(),
                });
                setStatus('success');
                setMessage(`Attendance for ${student.name} marked as present!`);
                toast({
                    title: 'Attendance Marked',
                    description: `${student.name} has been marked as present.`,
                });
            } catch (error) {
                console.error("Error marking attendance: ", error);
                setStatus('error');
                setMessage('An unexpected error occurred.');
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Could not mark attendance.',
                });
            }
        };

        markAttendance();

    }, [studentId, firestore, toast, student, studentLoading]);

    const getStatusContent = () => {
        switch (status) {
            case 'loading':
                return { icon: <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" />, title: "Processing..." };
            case 'success':
                return { icon: <CheckCircle className="h-16 w-16 text-green-500" />, title: "Success!" };
            case 'already_marked':
                 return { icon: <CheckCircle className="h-16 w-16 text-yellow-500" />, title: "Already Marked" };
            case 'error':
                return { icon: <XCircle className="h-16 w-16 text-destructive" />, title: "Error" };
            default:
                return { icon: null, title: '' };
        }
    };

    const { icon, title } = getStatusContent();

    return (
        <main className="flex min-h-screen w-full items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="flex justify-center mb-4">{icon}</div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{message}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => router.push('/admin/attendance')}>
                        Back to Attendance
                    </Button>
                </CardContent>
            </Card>
        </main>
    );
}
