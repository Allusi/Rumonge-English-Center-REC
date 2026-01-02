
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useCollection, useFirestore, useAuth } from '@/firebase';
import { collection, query, where, addDoc, serverTimestamp, writeBatch, doc } from 'firebase/firestore';
import type { Course } from '@/lib/data';
import { ArrowLeft, Image } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

const formSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }).optional().or(z.literal('')),
  age: z.coerce.number().min(5, { message: 'Age must be at least 5.' }),
  address: z.string().min(5, { message: 'Address is required.' }),
  profilePhoto: z.any().optional(),
  enrolledCourseId: z.string({ required_error: 'Please select a course.' }),
  englishLevel: z.string({ required_error: 'Please select an English level.' }),
  phoneNumber: z.string().optional(),
  maritalStatus: z.enum(['single', 'married'], { required_error: 'Marital status is required.' }),
  educationalStatus: z.enum(['government_student', 'dropout', 'graduated', 'never_went_to_school'], { required_error: 'Educational status is required.' }),
  learningReason: z.string().min(10, { message: 'Please provide a reason for learning English.' }),
});

export default function NewStudentPage() {
    const firestore = useFirestore();
    const auth = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const coursesQuery = firestore ? query(collection(firestore, 'courses'), where('isEnabled', '==', true)) : null;
    const { data: courses, loading: coursesLoading } = useCollection<Course>(coursesQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        fullName: '',
        email: '',
        age: undefined,
        address: '',
        phoneNumber: '',
        learningReason: '',
    },
  });

  const generateRandomKey = (length: number) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
     if (!auth || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firebase not configured.' });
      return;
    }

    try {
      const loginKey = generateRandomKey(8);
      // We create a fake email for Firebase Auth, as it requires an email format.
      // The student will log in with the `loginKey`, not this email.
      const authEmail = `${loginKey}@rec-online.app`;
      const tempPassword = Math.random().toString(36).slice(-8);

      const userCredential = await createUserWithEmailAndPassword(auth, authEmail, tempPassword);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: values.fullName,
        // photoURL could be set here after uploading the image to Firebase Storage
      });
      
      const course = courses?.find(c => c.id === values.enrolledCourseId);

      const batch = writeBatch(firestore);

      // 1. Create student user profile
      const userDocRef = doc(firestore, "users", user.uid);
      batch.set(userDocRef, {
        name: values.fullName,
        email: values.email || null,
        loginKey: loginKey,
        role: 'student',
        age: values.age,
        address: values.address,
        enrolledCourseId: values.enrolledCourseId,
        englishLevel: values.englishLevel,
        phoneNumber: values.phoneNumber,
        maritalStatus: values.maritalStatus,
        educationalStatus: values.educationalStatus,
        learningReason: values.learningReason,
        createdAt: serverTimestamp(),
      });
      
      // 2. Create enrollment record
      const enrollmentDocRef = doc(collection(firestore, 'enrollments'));
      batch.set(enrollmentDocRef, {
          studentId: user.uid,
          studentName: values.fullName,
          courseId: values.enrolledCourseId,
          courseName: course?.name || 'Unknown Course',
          enrolledAt: serverTimestamp(),
      });

      await batch.commit();
      
      toast({
        title: "Student Registered Successfully!",
        description: `${values.fullName} has been added. Their registration key is ${loginKey}.`,
        duration: 9000
      });

      router.push('/admin/students');

    } catch (error: any) {
      console.error("Error registering student: ", error);
      let description = "An unexpected error occurred during registration.";
      if (error.code === 'auth/email-already-in-use') {
        description = "A user with this key already exists. Please try again.";
      }
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: description,
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center gap-4">
        <Link href="/admin/students" passHref>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
          <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">
                Add a New Student
            </h1>
            <p className="text-muted-foreground">
                Fill out the form below to register a new student in the system.
            </p>
          </div>
        </div>
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter student's full name" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Email Address (Optional)</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="student@example.com" {...field} />
                            </FormControl>
                             <FormDescription>Used for communication, not for login.</FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Enter student's age" {...field} value={field.value ?? ''} onChange={event => field.onChange(+event.target.value)} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter student's address" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Phone Number (Optional)</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter student's phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="profilePhoto"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Profile Photo</FormLabel>
                                <FormControl>
                                     <div className="flex items-center gap-4">
                                        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                                            <Image className="text-muted-foreground" />
                                        </div>
                                        <Button type="button" variant="outline">
                                            Upload Photo
                                            <Input type="file" className="sr-only" accept="image/*" onChange={(e) => field.onChange(e.target.files?.[0])}/>
                                        </Button>
                                    </div>
                                </FormControl>
                                <FormDescription>Photo upload is not yet implemented.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-8">
                     <FormField
                        control={form.control}
                        name="enrolledCourseId"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Enroll in Course</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder={coursesLoading ? "Loading courses..." : "Select a course to enroll"} />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {courses?.map((course) => (
                                        <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                                    ))}
                                    {!coursesLoading && courses?.length === 0 && (
                                        <div className="p-4 text-sm text-muted-foreground">No enabled courses available.</div>
                                    )}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="englishLevel"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>English Level</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select student's English level" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="A1">A1 (Beginner)</SelectItem>
                                    <SelectItem value="A2">A2 (Elementary)</SelectItem>
                                    <SelectItem value="B1">B1 (Intermediate)</SelectItem>
                                    <SelectItem value="B2">B2 (Upper Intermediate)</SelectItem>
                                    <SelectItem value="C1">C1 (Advanced)</SelectItem>
                                    <SelectItem value="C2">C2 (Proficient)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="maritalStatus"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                            <FormLabel>Marital Status</FormLabel>
                            <FormControl>
                                <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex space-x-4"
                                >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl><RadioGroupItem value="single" /></FormControl>
                                    <FormLabel className="font-normal">Single</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl><RadioGroupItem value="married" /></FormControl>
                                    <FormLabel className="font-normal">Married</FormLabel>
                                </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="educationalStatus"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Educational Status</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select student's educational background" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="government_student">Government Student</SelectItem>
                                    <SelectItem value="dropout">Dropout</SelectItem>
                                    <SelectItem value="graduated">Graduated</SelectItem>
                                    <SelectItem value="never_went_to_school">Never Went to School</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                      <FormField
                        control={form.control}
                        name="learningReason"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Why do you want to learn English?</FormLabel>
                            <FormControl>
                                <Textarea
                                placeholder="Tell us a little bit about student's motivation"
                                className="resize-none"
                                {...field}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Registering...' : 'Register Student'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

    