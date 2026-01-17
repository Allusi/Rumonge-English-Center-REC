'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
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
import { collection, query, where, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import type { Course } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

// Schema in English for validation, labels will be in Kirundi.
const formSchema = z.object({
  fullName: z.string().min(2, { message: 'Izina rigomba kuba rifise inyuguti zirenga zibiri.' }),
  age: z.coerce.number().min(5, { message: 'Imyaka igomba kuba irenga itanu.' }),
  address: z.string().min(3, { message: 'Aderesi irakenewe.' }),
  enrolledCourseId: z.string({ required_error: 'Hitamwo isomo.' }),
  englishLevel: z.string({ required_error: 'Hitamwo urugero rw\'icongereza.' }),
  phoneNumber: z.string().optional(),
  maritalStatus: z.enum(['single', 'married'], { required_error: 'Hitamwo ego canke oya.' }),
  educationalStatus: z.enum(['government_student', 'dropout', 'graduated', 'never_went_to_school'], { required_error: 'Hitamwo amashure yize.' }),
  learningReason: z.string().min(10, { message: 'Tubwire impamvu nkeyi igituma ushaka kwiga.' }),
});

export default function EnrollmentPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [submissionSuccess, setSubmissionSuccess] = useState(false);

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

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!firestore) {
            toast({ variant: 'destructive', title: 'Ikosa ryabaye', description: 'Firebase ntitunganijwe neza.' });
            return;
        }

        try {
            // Check for duplicate enrollment requests
            const requestsRef = collection(firestore, 'enrollment_requests');
            const qRequests = query(requestsRef, where('fullName', '==', values.fullName));
            const requestSnapshot = await getDocs(qRequests);
            const duplicateRequest = requestSnapshot.docs.some(doc => doc.data().phoneNumber === (values.phoneNumber || null));

            if (duplicateRequest) {
                toast({
                    variant: "destructive",
                    title: "Ibisabwa birasanzweho",
                    description: "Umuntu ufite iri zina n'iyi nimero ya terefone yamaze gusaba kwiyandikisha.",
                });
                return;
            }

            // Check for existing users with same details
            const usersRef = collection(firestore, 'users');
            const qUsers = query(usersRef, where('name', '==', values.fullName));
            const usersSnapshot = await getDocs(qUsers);
            const duplicateUser = usersSnapshot.docs.some(doc => doc.data().phoneNumber === (values.phoneNumber || null));
            
            if (duplicateUser) {
                toast({
                    variant: "destructive",
                    title: "Umunyeshuri asanzwe yanditswe",
                    description: "Umunyeshuri ufite iri zina n'iyi nimero ya terefone asanzwe yanditswe muri sisitemu.",
                });
                return;
            }


            const course = courses?.find(c => c.id === values.enrolledCourseId);
            await addDoc(collection(firestore, 'enrollment_requests'), {
                fullName: values.fullName,
                age: values.age,
                address: values.address,
                enrolledCourseId: values.enrolledCourseId,
                courseName: course?.name || 'Unknown Course',
                englishLevel: values.englishLevel,
                phoneNumber: values.phoneNumber || null,
                maritalStatus: values.maritalStatus,
                educationalStatus: values.educationalStatus,
                learningReason: values.learningReason,
                requestDate: serverTimestamp(),
                status: 'pending',
            });
            setSubmissionSuccess(true);
        } catch (error: any) {
            console.error("Error submitting enrollment request: ", error);
            toast({
                variant: "destructive",
                title: "Ukwiyandikisha Kuranse",
                description: "Habaye ikosa ryo gutanga amakuru. Subira ugerageze.",
            });
        }
    }
    
    if (submissionSuccess) {
      return (
        <main className="flex min-h-screen w-full items-center justify-center bg-background p-4">
          <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
          <Card className="w-full max-w-lg text-center shadow-2xl">
            <CardHeader className="items-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <CardTitle className="font-headline text-2xl tracking-tight">
                Urakoze kwiyandikisha!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Ibisabwa vyawe vyakiriwe neza. Umuyobozi w'ishure azobisuzuma hanyuma akumenyeshe. Uzohabwa urupfunguruzo rwo kwinjira hamwe n'ayandi makuru.
              </p>
              <Button asChild className="mt-6">
                <Link href="/">Subira ku rupapuro rwo kwinjira</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      );
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
                        Uzuza ifomu ikurikira kugira usabe kwiyandikisha nk'umunyeshure musha.
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
                                        <FormLabel>Hitamwo isomo ushaka</FormLabel>
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
                                        <FormItem>
                                            <FormLabel>Arubatse?</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Hitamwo ego canke oya" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="married">Ego</SelectItem>
                                                    <SelectItem value="single">Oya</SelectItem>
                                                </SelectContent>
                                            </Select>
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
                                {form.formState.isSubmitting ? 'Turindire...' : 'Rungika Ibisabwa'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </main>
    );
}
