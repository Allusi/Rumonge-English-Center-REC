
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Course } from '@/lib/data';
import { Image } from 'lucide-react';

const formSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
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
    const { data: courses } = useCollection<Course>(
        firestore ? collection(firestore, 'courses') : null
    );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        fullName: '',
        age: undefined,
        address: '',
        phoneNumber: '',
        learningReason: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real application, you would handle the form submission,
    // including creating a user in Firebase Auth, uploading the photo to Firebase Storage,
    // and saving the student data to Firestore.
    console.log(values);
    alert('Student registration submitted! Check the console for the form data.');
  }

  return (
    <div className="flex flex-col gap-6">
       <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Add a New Student
          </h1>
          <p className="text-muted-foreground">
            Fill out the form below to register a new student in the system.
          </p>
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
                        name="age"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Enter student's age" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
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
                                    <SelectValue placeholder="Select a course to enroll" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {courses?.map(course => (
                                        <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                                    ))}
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
                <Button type="submit">Register Student</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
