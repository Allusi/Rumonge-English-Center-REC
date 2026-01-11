
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
import { useCollection, useDoc, useFirestore } from '@/firebase';
import { collection, query, where, doc, updateDoc } from 'firebase/firestore';
import type { Course, UserProfile } from '@/lib/data';
import { ArrowLeft, Image as ImageIcon, KeyRound, UserCheck, UserX } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams, notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';

const formSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  age: z.coerce.number().min(5, { message: 'Age must be at least 5.' }),
  address: z.string().min(5, { message: 'Address is required.' }),
  status: z.enum(['active', 'inactive']),
  profilePhoto: z.any().optional(),
  enrolledCourseId: z.string({ required_error: 'Please select a course.' }),
  englishLevel: z.string({ required_error: 'Please select an English level.' }),
  phoneNumber: z.string().optional(),
  maritalStatus: z.enum(['single', 'married'], { required_error: 'Marital status is required.' }),
  educationalStatus: z.enum(['government_student', 'dropout', 'graduated', 'never_went_to_school'], { required_error: 'Educational status is required.' }),
  learningReason: z.string().min(10, { message: 'Please provide a reason for learning English.' }),
});

export default function EditStudentPage() {
    const firestore = useFirestore();
    const router = useRouter();
    const params = useParams();
    const studentId = params.studentId as string;
    const { toast } = useToast();
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const studentRef = firestore && studentId ? doc(firestore, 'users', studentId) : null;
    const { data: student, loading: studentLoading } = useDoc<UserProfile>(studentRef);

    const coursesQuery = firestore ? query(collection(firestore, 'courses'), where('isEnabled', '==', true)) : null;
    const { data: courses, loading: coursesLoading } = useCollection<Course>(coursesQuery);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: '',
            age: 0,
            address: '',
            status: 'inactive',
            enrolledCourseId: '',
            englishLevel: '',
            phoneNumber: '',
            maritalStatus: 'single',
            educationalStatus: 'government_student',
            learningReason: '',
        },
    });

    useEffect(() => {
        if (student) {
            form.reset({
                fullName: student.name,
                age: student.age,
                address: student.address,
                status: student.status,
                enrolledCourseId: student.enrolledCourseId,
                englishLevel: student.englishLevel,
                phoneNumber: student.phoneNumber,
                maritalStatus: student.maritalStatus,
                educationalStatus: student.educationalStatus,
                learningReason: student.learningReason,
            });
            if (student.photoURL) {
                setPreviewImage(student.photoURL);
            }
        }
    }, [student, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!studentRef) return;
        
        try {
            await updateDoc(studentRef, {
                name: values.fullName,
                age: values.age,
                address: values.address,
                status: values.status,
                enrolledCourseId: values.enrolledCourseId,
                englishLevel: values.englishLevel,
                phoneNumber: values.phoneNumber,
                maritalStatus: values.maritalStatus,
                educationalStatus: values.educationalStatus,
                learningReason: values.learningReason,
            });
            
            toast({
                title: 'Profile Updated',
                description: "The student's information has been successfully updated.",
            });
            
            router.push(`/admin/students/${studentId}`);

        } catch (error) {
            console.error("Error updating student:", error);
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: 'Could not update student profile. Please try again.',
            });
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue('profilePhoto', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    if (studentLoading) {
        return <div className="flex justify-center items-center h-full"><Skeleton className="w-full h-96" /></div>;
    }
    
    if (!student && !studentLoading) {
        return notFound();
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Link href={`/admin/students/${studentId}`} passHref>
                <Button variant="outline" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                </Link>
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">
                        Edit Student Profile
                    </h1>
                    <p className="text-muted-foreground">
                        Update the details for {student?.name}.
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
                             <FormItem>
                                <FormLabel>Registration Key</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        value={student.loginKey}
                                        readOnly
                                        disabled
                                        className="pl-9"
                                    />
                                    </div>
                                </FormControl>
                                <FormDescription>The registration key cannot be changed here. Use the "Generate New Key" on the students list page.</FormDescription>
                            </FormItem>
                             <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                    <FormLabel className="text-base">
                                        Student Status
                                    </FormLabel>
                                    <FormDescription>
                                        Set student to active or inactive. Inactive students may have restricted access.
                                    </FormDescription>
                                    </div>
                                    <FormControl>
                                        <div className="flex items-center gap-2">
                                            <UserX className={`h-5 w-5 transition-colors ${field.value === 'inactive' ? 'text-destructive' : 'text-muted-foreground'}`} />
                                            <Switch
                                                checked={field.value === 'active'}
                                                onCheckedChange={(checked) => field.onChange(checked ? 'active' : 'inactive')}
                                            />
                                            <UserCheck className={`h-5 w-5 transition-colors ${field.value === 'active' ? 'text-green-600' : 'text-muted-foreground'}`} />
                                        </div>
                                    </FormControl>
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
                                        <Input type="number" placeholder="Enter student's age" {...field} />
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
                                                <Avatar className="w-24 h-24">
                                                    {previewImage ? (
                                                        <AvatarImage src={previewImage} alt="Profile preview" />
                                                    ) : (
                                                        <AvatarFallback className="text-3xl">
                                                            <ImageIcon className="h-10 w-10 text-muted-foreground" />
                                                        </AvatarFallback>
                                                    )}
                                                </Avatar>
                                                <Button type="button" variant="outline" asChild>
                                                    <label htmlFor="photo-upload">
                                                        Upload Photo
                                                        <Input id="photo-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange}/>
                                                    </label>
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormDescription>Photo upload is not yet implemented. This is a visual placeholder.</FormDescription>
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
                                    <Select onValueChange={field.onChange} value={field.value}>
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
                                    <Select onValueChange={field.onChange} value={field.value}>
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
                                        value={field.value}
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
                                    <Select onValueChange={field.onChange} value={field.value}>
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
                        {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                    </form>
                </Form>
                </CardContent>
            </Card>
        </div>
    );
}
