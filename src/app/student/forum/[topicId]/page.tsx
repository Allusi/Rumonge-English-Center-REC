
'use client';

import { useDoc, useCollection, useFirestore, useUser } from '@/firebase';
import { doc, collection, query, orderBy, addDoc, serverTimestamp, writeBatch, increment } from 'firebase/firestore';
import type { ForumTopic, ForumPost, UserProfile } from '@/lib/data';
import { useParams, notFound, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Loader2, Lock, Pin } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { format, formatDistanceToNow } from 'date-fns';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const replySchema = z.object({
  content: z.string().min(5, 'Reply must be at least 5 characters.'),
});

export default function ForumTopicPage() {
  const params = useParams();
  const topicId = params.topicId as string;
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const topicRef = firestore ? doc(firestore, 'forum_topics', topicId) : null;
  const { data: topic, loading: topicLoading } = useDoc<ForumTopic>(topicRef);

  const postsQuery = firestore ? query(collection(firestore, `forum_topics/${topicId}/posts`), orderBy('createdAt', 'asc')) : null;
  const { data: posts, loading: postsLoading } = useCollection<ForumPost>(postsQuery);
  
  const userProfileRef = firestore && user ? doc(firestore, 'users', user.uid) : null;
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const form = useForm<z.infer<typeof replySchema>>({
    resolver: zodResolver(replySchema),
    defaultValues: { content: '' },
  });

  const onSubmit = async (values: z.infer<typeof replySchema>) => {
    if (!firestore || !user) return;

    if (topic?.isLocked) {
        toast({ variant: 'destructive', title: 'Topic Locked', description: 'This topic is locked and cannot receive new replies.' });
        return;
    }

    const batch = writeBatch(firestore);
    
    // Add new post
    const newPostRef = doc(collection(firestore, `forum_topics/${topicId}/posts`));
    batch.set(newPostRef, {
        topicId: topicId,
        content: values.content,
        createdAt: serverTimestamp(),
        createdById: user.uid,
        createdByName: userProfile?.name || user.displayName || 'Anonymous',
        createdByPhotoURL: userProfile?.photoURL || user.photoURL || null,
    });

    // Update topic metadata
    const topicDocRef = doc(firestore, 'forum_topics', topicId);
    batch.update(topicDocRef, {
        replyCount: increment(1),
        lastActivity: serverTimestamp(),
    });

    // Notify topic owner
    if (topic && user.uid !== topic.createdById) {
      const notificationRef = doc(collection(firestore, 'notifications'));
      const authorName = userProfile?.name || user.displayName || 'Someone';
      batch.set(notificationRef, {
        userId: topic.createdById,
        message: `${authorName} replied to your topic: "${topic.title}"`,
        link: `/student/forum/${topicId}`,
        isRead: false,
        createdAt: serverTimestamp(),
      });
    }

    await batch.commit();
    form.reset();
    toast({ title: 'Success', description: 'Your reply has been posted.' });
  };

  const isLoading = topicLoading || postsLoading;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!topic) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/student/forum" passHref>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
                {topic.isPinned && <Pin className="h-5 w-5 text-primary" />}
                <h1 className="font-headline text-3xl font-bold tracking-tight">{topic.title}</h1>
            </div>
            <p className="text-muted-foreground">
              Started by {topic.createdByName} • {topic.createdAt ? format(topic.createdAt.toDate(), 'PPP') : 'Just now'}
            </p>
          </div>
        </div>
      </div>
      
      {topic.isLocked && (
        <Alert variant="destructive">
            <Lock className="h-4 w-4" />
            <AlertTitle>This topic is locked.</AlertTitle>
            <AlertDescription>No new replies can be added to this conversation.</AlertDescription>
        </Alert>
      )}

      {/* Initial Post */}
      <Card>
        <CardHeader className="flex flex-row items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={topic.createdByPhotoURL} alt={topic.createdByName} />
            <AvatarFallback>{topic.createdByName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{topic.createdByName}</p>
            <p className="text-sm text-muted-foreground">{topic.createdAt ? format(topic.createdAt.toDate(), 'PPP p') : 'Just now'}</p>
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{topic.content}</p>
        </CardContent>
      </Card>
      
      <Separator />

      {/* Replies */}
      <div className="space-y-6">
        {posts?.map(post => (
          <Card key={post.id} className="bg-muted/50">
            <CardHeader className="flex flex-row items-start gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.createdByPhotoURL} alt={post.createdByName} />
                <AvatarFallback>{post.createdByName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{post.createdByName}</p>
                <p className="text-sm text-muted-foreground">{post.createdAt ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : 'Just now'}</p>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">{post.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reply Form */}
      {!topic.isLocked && (
        <Card>
            <CardHeader>
                <CardTitle>Post a Reply</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea placeholder="Write your reply..." {...field} className="min-h-32"/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end">
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Posting...</> : <>Post Reply <Send className="ml-2 h-4 w-4" /></>}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
      )}
    </div>
  );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-9 w-9"/>
                <div className="space-y-2">
                    <Skeleton className="h-8 w-80"/>
                    <Skeleton className="h-4 w-48"/>
                </div>
            </div>
            <Card><CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full"/>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24"/>
                        <Skeleton className="h-3 w-32"/>
                    </div>
                </div>
                <Skeleton className="h-20 w-full"/>
            </CardContent></Card>
            <Separator />
            <div className="space-y-6">
                {Array.from({length: 2}).map((_, i) => (
                    <Card key={i}><CardContent className="p-4 space-y-3">
                         <div className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full"/>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20"/>
                                <Skeleton className="h-3 w-28"/>
                            </div>
                        </div>
                        <Skeleton className="h-12 w-full"/>
                    </CardContent></Card>
                ))}
            </div>
        </div>
    );
}
