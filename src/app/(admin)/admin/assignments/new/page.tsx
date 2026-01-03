
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useCollection, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Course } from '@/lib/data';
import { generateAssignment } from '@/ai/flows/generate-assignment-flow';
import { useState } from 'react';

const formSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  instructions: z.string().min(10, { message: 'Instructions must be at least 10 characters.' }),
  courseId: z.string({ required_error: 'Please select a course.' }),
  maxMarks: z.coerce.number().min(1, "Maximum marks must be at least 1."),
});

export default function NewAssignmentPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState('');

  const coursesQuery = firestore ? query(collection(firestore, 'courses'), where('isEnabled', '==', true)) : null;
  const { data: courses, loading: coursesLoading } = useCollection<Course>(coursesQuery);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      instructions: '',
      courseId: '',
      maxMarks: 100,
    },
  });

  const handleGenerateAssignment = async () => {
    if (!aiTopic) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please enter a topic.' });
        return;
    }
    setIsGenerating(true);
    try {
        const result = await generateAssignment({ topic: aiTopic });
        form.setValue('title', result.title, { shouldValidate: true });
        form.setValue('instructions', result.instructions, { shouldValidate: true });
        toast({ title: 'Assignment Generated', description: 'The AI has drafted an assignment for you.' });
    } catch (error) {
        console.error("Error generating assignment:", error);
        toast({ variant: 'destructive', title: 'AI Error', description: 'Could not generate assignment. Please try again.' });
    } finally {
        setIsGenerating(false);
        const closeButton = document.getElementById('ai-dialog-close');
        if (closeButton) closeButton.click();
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'Firestore is not available.' });
        return;
    }
    try {
        const course = courses?.find(c => c.id === values.courseId);
        await addDoc(collection(firestore, 'assignments'), {
            ...values,
            courseName: course?.name || 'Unknown Course',
            createdAt: serverTimestamp(),
            status: 'draft',
        });
        toast({ title: 'Success', description: 'Assignment draft created successfully.' });
        router.push('/admin/assignments');
    } catch (error) {
        console.error("Error creating assignment: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not create assignment. Please try again.' });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/assignments" passHref>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            New Assignment
          </h1>
          <p className="text-muted-foreground">
            Create a new assignment for a course. It will be saved as a draft.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                 <div>
                    <CardTitle>Assignment Details</CardTitle>
                    <CardDescription>Fill in the title, instructions, and select the course.</CardDescription>
                </div>
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <Sparkles className="mr-2 h-4 w-4" />
                            AI Generate
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Generate Assignment with AI</DialogTitle>
                            <DialogDescription>
                                Enter a topic from the course material (e.g., "English Alphabet") and the AI will generate an assignment for you.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="ai-topic" className="text-right">
                                    Topic
                                </Label>
                                <Input
                                    id="ai-topic"
                                    value={aiTopic}
                                    onChange={(e) => setAiTopic(e.target.value)}
                                    className="col-span-3"
                                    placeholder="e.g., Greetings and Introductions"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">Cancel</Button>
                            </DialogClose>
                            <Button onClick={handleGenerateAssignment} disabled={isGenerating}>
                                {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Generating...</> : 'Generate'}
                            </Button>
                        </DialogFooter>
                        <DialogClose id="ai-dialog-close" className="hidden"/>
                    </DialogContent>
                </Dialog>
            </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 'My Summer Vacation Essay'" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="courseId"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel>Course</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                          <SelectTrigger>
                              <SelectValue placeholder={coursesLoading ? "Loading courses..." : "Select a course"} />
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
              </div>
              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write the full instructions for the assignment here..."
                        className="resize-y min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxMarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Marks</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="100" {...field} className="w-40" />
                    </FormControl>
                    <FormDescription>The total marks this assignment is out of.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Saving...' : 'Save as Draft'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
