
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useCollection, useDoc } from '@/firebase';
import { doc, setDoc, collection, query, where, orderBy } from 'firebase/firestore';
import type { SchoolSettings, Attendance } from '@/lib/data';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

const settingsSchema = z.object({
  activeDays: z.array(z.string()).min(1, 'Please select at least one active day.'),
});

export default function AdminAttendancePage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const settingsRef = firestore ? doc(firestore, 'settings', 'school') : null;
  const { data: schoolSettings, loading: settingsLoading } = useDoc<SchoolSettings>(settingsRef);

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    if (schoolSettings) {
      form.setValue('activeDays', schoolSettings.activeDays);
    }
  }, [schoolSettings, form]);

  const selectedDateString = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
  
  const attendanceQuery = firestore ? query(collection(firestore, 'attendance'), where('date', '==', selectedDateString), orderBy('studentName')) : null;
  const { data: attendanceRecords, loading: attendanceLoading } = useCollection<Attendance>(attendanceQuery);


  async function onSubmit(values: z.infer<typeof settingsSchema>) {
    if (!settingsRef) return;
    try {
      await setDoc(settingsRef, { activeDays: values.activeDays }, { merge: true });
      toast({ title: 'Success', description: 'Active school days have been updated.' });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save settings.' });
    }
  }
  
  const isLoading = settingsLoading || attendanceLoading;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard" passHref>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">
            Attendance Management
            </h1>
            <p className="text-muted-foreground">
            Set active school days and monitor daily student attendance.
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Active School Days</CardTitle>
              <CardDescription>
                Select the days of the week when school is in session.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="activeDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Active Days</FormLabel>
                        <FormControl>
                          <ToggleGroup
                            type="multiple"
                            variant="outline"
                            className="grid grid-cols-2 gap-2 sm:grid-cols-4"
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            {daysOfWeek.map(day => (
                              <ToggleGroupItem key={day} value={day} className="w-full">
                                {day.substring(0, 3)}
                              </ToggleGroupItem>
                            ))}
                          </ToggleGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Saving...' : 'Save Settings'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Daily Attendance Log</CardTitle>
              <CardDescription>
                Select a date to view attendance records for that day.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6 md:flex-row md:items-start">
               <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                disabled={(date) => date > new Date()}
              />
              <div className="flex-1 w-full">
                <h3 className="mb-4 text-lg font-medium text-center md:text-left">
                  Records for {selectedDate ? format(selectedDate, 'PPP') : 'today'}
                </h3>
                <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reason for Absence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading && Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                      </TableRow>
                    ))}
                    {!isLoading && attendanceRecords?.length === 0 && (
                       <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                          No attendance records found for this date.
                        </TableCell>
                      </TableRow>
                    )}
                    {!isLoading && attendanceRecords?.map(record => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.studentName}</TableCell>
                        <TableCell>
                          <Badge variant={record.status === 'present' ? 'secondary' : 'destructive'}>
                             {record.status === 'present' ? <CheckCircle2 className="mr-1 h-3 w-3"/> : <XCircle className="mr-1 h-3 w-3"/>}
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">{record.reason || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
