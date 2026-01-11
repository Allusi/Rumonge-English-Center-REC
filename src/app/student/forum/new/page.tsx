
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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useFirestore, useUser, useDoc } from '@/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where, doc } from 'firebase/firestore';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Student } from '@/lib/data';

const formSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters.'),
  content: z.string().min(20, 'Content must be at least 20 characters.'),
});

export default function NewForumTopicPage() {
  const firestore = useFirestore();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const userProfileRef = firestore && user ? doc(firestore, 'users', user.uid) : null;
  const { data: userProfile, loading: profileLoading } = useDoc<Student>(userProfileRef);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !user || !userProfile) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to create a topic.' });
      return;
    }
    try {
      await addDoc(collection(firestore, 'forum_topics'), {
        ...values,
        createdAt: serverTimestamp(),
        lastActivity: serverTimestamp(),
        createdById: user.uid,
        createdByName: userProfile.name || 'Anonymous',
        createdByPhotoURL: userProfile.photoURL || null,
        replyCount: 0,
        isPinned: false,
        isLocked: false,
      });

      // Create notification for admin
      const adminsQuery = query(collection(firestore, 'users'), where('role', '==', 'admin'));
      const adminSnapshot = await getDocs(adminsQuery);
      adminSnapshot.forEach(adminDoc => {
            addDoc(collection(firestore, 'notifications'), {
              userId: adminDoc.id,
              message: `New forum topic started: "${values.title}"`,
              link: `/student/forum`, // Adjust link as needed
              isRead: false,
              createdAt: serverTimestamp(),
          });
      });


      toast({ title: 'Success', description: 'Your topic has been posted.' });
      router.push('/student/forum');
    } catch (error) {
      console.error("Error creating topic: ", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not create topic. Please try again.' });
    }
  }
  
  const isLoading = userLoading || profileLoading;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/student/forum" passHref>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Start a New Topic
          </h1>
          <p className="text-muted-foreground">
            Share your thoughts or ask a question to the community.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Topic Details</CardTitle>
          <CardDescription>Create a clear title and provide details in the content.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a descriptive title for your topic" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write the main content of your post here..."
                        className="resize-y min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting || isLoading}>
                  {form.formState.isSubmitting || isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Posting...</>
                  ) : (
                    <>Post Topic <Send className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
