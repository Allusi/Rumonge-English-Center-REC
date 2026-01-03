
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useFirestore, useUser, useDoc, useCollection } from '@/firebase';
import { doc, setDoc, serverTimestamp, query, collection, where } from 'firebase/firestore';
import type { Attendance, SchoolSettings, Student } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { format, getDay } from 'date-fns';
import { CalendarOff, CheckCircle, Loader2, PartyPopper } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const reasonSchema = z.object({
  reason: z.string().min(10, { message: 'Please provide a brief reason for your absence.' }),
});

export default function StudentAttendancePage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const today = new Date();
  const todayString = format(today, 'yyyy-MM-dd');
  const dayOfWeek = format(today, 'EEEE');

  const studentRef = firestore && user ? doc(firestore, 'users', user.uid) : null;
  const { data: studentProfile, loading: studentLoading } = useDoc<Student>(studentRef);

  const settingsRef = firestore ? doc(firestore, 'settings', 'school') : null;
  const { data: schoolSettings, loading: settingsLoading } = useDoc<SchoolSettings>(settingsRef);
  
  const attendanceQuery = (firestore && user) ? query(collection(firestore, 'attendance'), where('studentId', '==', user.uid), where('date', '==', todayString)) : null;
  const { data: attendanceRecords, loading: attendanceLoading } = useCollection<Attendance>(attendanceQuery);

  const todayAttendance = attendanceRecords?.[0];

  const form = useForm<z.infer<typeof reasonSchema>>({
    resolver: zodResolver(reasonSchema),
  });

  const handleMarkAttendance = async (status: 'present' | 'absent', reason?: string) => {
    if (!user || !firestore || !studentProfile) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not mark attendance, user profile not found.' });
        return;
    }

    try {
      const attendanceData: Omit<Attendance, 'id'> = {
        studentId: user.uid,
        studentName: studentProfile.name, // Use name from Firestore profile
        date: todayString,
        status,
        markedAt: serverTimestamp(),
      };
      if (reason) {
        attendanceData.reason = reason;
      }
      
      const newDocRef = doc(collection(firestore, 'attendance'));
      await setDoc(newDocRef, attendanceData);

      toast({
        title: 'Attendance Marked',
        description: `You have been marked as ${status} for today.`,
      });
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not mark attendance.' });
    }
  };
  
  const onAbsenceSubmit = (values: z.infer<typeof reasonSchema>) => {
    handleMarkAttendance('absent', values.reason);
  };
  
  const isLoading = userLoading || settingsLoading || attendanceLoading || studentLoading;

  if (isLoading) {
      return (
          <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">Daily Attendance</h1>
            <p className="text-muted-foreground">Mark your attendance for today.</p>
            <Skeleton className="mt-6 h-64 w-full" />
          </div>
      );
  }

  if (!isSchoolDay) {
      return (
          <div className='flex flex-col gap-6'>
               <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">Daily Attendance</h1>
                    <p className="text-muted-foreground">Today is {dayOfWeek}, {format(today, 'PPP')}</p>
                </div>
                <Alert>
                    <CalendarOff className="h-4 w-4" />
                    <AlertTitle>School is Closed Today!</AlertTitle>
                    <AlertDescription>
                        There are no classes scheduled for today. Enjoy your day off!
                    </AlertDescription>
                </Alert>
          </div>
      )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">Daily Attendance</h1>
        <p className="text-muted-foreground">Mark your attendance for {format(today, 'PPP')}.</p>
      </div>

      {todayAttendance ? (
        <Card className="flex flex-col items-center justify-center p-10 text-center">
            <CardHeader>
                {todayAttendance.status === 'present' ? (
                    <CheckCircle className="mx-auto h-16 w-16 text-green-500"/>
                ) : (
                    <PartyPopper className="mx-auto h-16 w-16 text-yellow-500" />
                )}
            </CardHeader>
            <CardContent>
                <h2 className="text-2xl font-semibold">You're all set!</h2>
                <p className="text-muted-foreground mt-2">
                    Your attendance has been marked as <strong className={todayAttendance.status === 'present' ? 'text-green-600' : 'text-destructive'}>{todayAttendance.status}</strong> for today.
                </p>
                {todayAttendance.status === 'absent' && todayAttendance.reason && (
                    <p className="text-sm mt-4 text-muted-foreground italic">Your reason: "{todayAttendance.reason}"</p>
                )}
            </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>I am Present</CardTitle>
              <CardDescription>Click the button below to mark yourself as present for today's classes.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button size="lg" className="w-full" onClick={() => handleMarkAttendance('present')}>
                Mark as Present
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>I will be Absent</CardTitle>
              <CardDescription>If you cannot attend school today, please provide a reason below.</CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onAbsenceSubmit)}>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason for Absence</FormLabel>
                        <FormControl>
                          <Textarea placeholder="e.g., I have a doctor's appointment." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" variant="destructive" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : 'Submit Absence'}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
      )}
    </div>
  );
}
