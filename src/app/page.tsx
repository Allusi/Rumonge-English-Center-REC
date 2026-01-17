
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
import { useCollection, useFirestore, useAuth } from '@/firebase';
import { collection, query, where, doc, setDoc, serverTimestamp, addDoc, getDocs, writeBatch } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import type { Course } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Logo } from '@/components/logo';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from 'next/link';

// Schema in English for validation, labels will be in Kirundi.
const formSchema = z.object({
  fullName: z.string().min(2, { message: 'Izina rigomba kuba rifise inyuguti zirenga zibiri.' }),
  age: z.coerce.number().min(5, { message: 'Imyaka igomba kuba irenga itanu.' }),
  address: z.string().min(3, { message: 'Aderesi irakenewe.' }),
  enrolledCourseId: z.string({ required_error: 'Hitamwo isomo.' }),
  englishLevel: z.string({ required_error: 'Hitamwo urugero rw\'icongereza.' }),
  phoneNumber: z.string().optional(),
  maritalStatus: z.enum(['single', 'married'], { required_error: 'Hitamwo iratangwa.' }),
  educationalStatus: z.enum(['government_student', 'dropout', 'graduated', 'never_went_to_school'], { required_error: 'Hitamwo amashure yize.' }),
  learningReason: z.string().min(10, { message: 'Tubwire impamvu nkeyi igituma ushaka kwiga.' }),
});

export default function EnrollmentWizardPage() {
    const firestore = useFirestore();
    const auth = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [loginKey, setLoginKey] = useState('');

    const coursesQuery = firestore ? query(collection(firestore, 'courses'), where('isEnabled', '==', true)) : null;
    const { data: courses, loading: coursesLoading } = useCollection<Course>(coursesQuery);

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

    const generateRandomKey = (length: number) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!firestore || !auth) {
            toast({ variant: 'destructive', title: 'Ikosa ryabaye', description: 'Firebase ntitunganijwe neza.' });
            return;
        }

        const newLoginKey = generateRandomKey(8);
        const authEmail = `${newLoginKey}@rec-online.app`;
        const tempPassword = "password"; 

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, authEmail, tempPassword);
            const user = userCredential.user;

            const batch = writeBatch(firestore);

            const userDocRef = doc(firestore, 'users', user.uid);
            const course = courses?.find(c => c.id === values.enrolledCourseId);

            batch.set(userDocRef, {
                name: values.fullName,
                email: authEmail,
                loginKey: newLoginKey,
                role: 'student',
                status: 'active',
                age: values.age,
                address: values.address,
                enrolledCourseId: values.enrolledCourseId,
                englishLevel: values.englishLevel,
                phoneNumber: values.phoneNumber || null,
                maritalStatus: values.maritalStatus,
                educationalStatus: values.educationalStatus,
                learningReason: values.learningReason,
                createdAt: serverTimestamp(),
            });
            
            const enrollmentDocRef = doc(collection(firestore, 'enrollments'));
            batch.set(enrollmentDocRef, {
                studentId: user.uid,
                studentName: values.fullName,
                courseId: values.enrolledCourseId,
                courseName: course?.name || 'Unknown Course',
                enrolledAt: serverTimestamp(),
            });

            // Welcome notification for the new student
            const welcomeNotifRef = doc(collection(firestore, 'notifications'));
            batch.set(welcomeNotifRef, {
                userId: user.uid,
                message: "Kaze muri REC Online! Tangura ikiyago n'abanyeshure bagenzawe.",
                link: "/student/chat",
                isRead: false,
                createdAt: serverTimestamp(),
            });

            await batch.commit();

            setLoginKey(newLoginKey);
            setRegistrationSuccess(true);

        } catch (error: any) {
            console.error("Error registering student: ", error);
            toast({
                variant: "destructive",
                title: "Iyandikishwa Ryaranse",
                description: error.message || "Habaye ikosa.",
            });
        }
    }

    return (
        <main className="flex min-h-screen w-full items-center justify-center bg-background p-4">
            <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            <Card className="w-full max-w-2xl shadow-2xl">
                <CardHeader className="items-center text-center">
                    <Logo />
                    <CardTitle className="font-headline text-3xl tracking-tight">
                        Iyandikishe - REC Online
                    </CardTitle>
                    <CardDescription>
                        Uzuza ifomu ikurikira kugira wiyandikishe nk'umunyeshure musha.
                        Mumaze kwiyandikisha, muzohabwa urupfunguruzo rudasanzwe rwo kwinjira.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Izina Ryose</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Andika izina ryawe ryose" {...field} />
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
                                        <FormLabel>Imyaka</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Andika imyaka yawe" {...field} value={field.value ?? ''} onChange={event => field.onChange(+event.target.value)} />
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
                                        <FormLabel>Aderesi</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Aho uba" {...field} />
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
                                        <FormLabel>Nimero ya Terefone (Si ngombwa)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Andika nimero yawe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="enrolledCourseId"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Iyandikishe mw'isomo</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={coursesLoading ? "Turindire..." : "Hitamwo isomo"} />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {courses?.map((course) => (
                                                    <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                                                ))}
                                                {!coursesLoading && courses?.length === 0 && (
                                                    <div className="p-4 text-sm text-muted-foreground">Nta masomo ariho.</div>
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
                                        <FormLabel>Urugero rw'icongereza</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Hitamwo urugero" />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="A1">A1 (Ugitangura)</SelectItem>
                                                <SelectItem value="A2">A2 (Urizako)</SelectItem>
                                                <SelectItem value="B1">B1 (Ugeze hagati)</SelectItem>
                                                <SelectItem value="B2">B2 (Ugeze hagati cane)</SelectItem>
                                                <SelectItem value="C1">C1 (Umunyamwuga)</SelectItem>
                                                <SelectItem value="C2">C2 (Umunyamwuga cane)</SelectItem>
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
                                        <FormLabel>Iratangwa</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex space-x-4"
                                            >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl><RadioGroupItem value="single" /></FormControl>
                                                <FormLabel className="font-normal">Ingaragu</FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl><RadioGroupItem value="married" /></FormControl>
                                                <FormLabel className="font-normal">Yubatse</FormLabel>
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
                                        <FormLabel>Amashure yize</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Hitamwo amashure yize" />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="government_student">Umunyeshure wa Reta</SelectItem>
                                                <SelectItem value="dropout">Yarasivye</SelectItem>
                                                <SelectItem value="graduated">Yaronse impapuro</SelectItem>
                                                <SelectItem value="never_went_to_school">Ntivyigeze gushika mw'ishure</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="learningReason"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>N'igiki gituma ushaka kwiga icongereza?</FormLabel>
                                    <FormControl>
                                        <Textarea
                                        placeholder="Tubwire gatoyi kubituma ushaka kwiga"
                                        className="resize-none"
                                        {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end">
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Turindire...' : 'Emeza Iyandikishwa'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <AlertDialog open={registrationSuccess}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Mwiyandikishije neza!</AlertDialogTitle>
                    <AlertDialogDescription>
                        Kaze muri REC Online! Urupfunguruzo rwawe rwo kwinjira ni:
                        <div className="my-4 p-2 bg-muted rounded-md text-center font-mono text-lg tracking-widest">{loginKey}</div>
                        Bikora neza, ubike uru rupfunguruzo ahantu heza. Uzorukoresha kugira winjire.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <Link href="/login" passHref>
                        <AlertDialogAction>Genda ku rupapuro rwo kwinjira</AlertDialogAction>
                    </Link>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </main>
    );
}

    