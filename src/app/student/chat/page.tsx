
'use client';

import { useCollection, useDoc, useFirestore, useUser } from '@/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import type { ChatMessage, Student } from '@/lib/data';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useRef } from 'react';
import { doc } from 'firebase/firestore';
import { ScrollArea } from '@/components/ui/scroll-area';

const chatSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty.'),
});

export default function GroupChatPage() {
  const firestore = useFirestore();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const userProfileRef = firestore && user ? doc(firestore, 'users', user.uid) : null;
  const { data: userProfile, loading: profileLoading } = useDoc<Student>(userProfileRef);

  const messagesQuery = firestore ? query(collection(firestore, 'chat_messages'), orderBy('createdAt', 'asc'),) : null;
  const { data: messages, loading: messagesLoading } = useCollection<ChatMessage>(messagesQuery);
  
  const form = useForm<z.infer<typeof chatSchema>>({
    resolver: zodResolver(chatSchema),
    defaultValues: { content: '' },
  });

  const onSubmit = async (values: z.infer<typeof chatSchema>) => {
    if (!firestore || !user || !userProfile) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to send a message.'});
        return;
    };

    await addDoc(collection(firestore, 'chat_messages'), {
        content: values.content,
        createdAt: serverTimestamp(),
        createdById: user.uid,
        createdByName: userProfile.name || 'Anonymous',
        createdByPhotoURL: userProfile.photoURL || null,
    });
    form.reset();
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);
  
  const isLoading = userLoading || profileLoading || messagesLoading;

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-100px)]">
      <div className="flex items-center gap-4">
        <Link href="/student/dashboard" passHref>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Group Chat</h1>
          <p className="text-muted-foreground">
            A real-time chat for all students and admins.
          </p>
        </div>
      </div>
      
      <Card className="flex-1 flex flex-col">
        <CardContent className="p-6 flex-1 overflow-hidden">
             <ScrollArea className="h-full" ref={scrollAreaRef}>
                 <div className="space-y-6 pr-4">
                    {isLoading && (
                        Array.from({length: 5}).map((_, i) => <MessageSkeleton key={i} />)
                    )}
                    {!isLoading && messages?.map(message => (
                        <div key={message.id} className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={message.createdByPhotoURL} alt={message.createdByName} />
                                <AvatarFallback>{message.createdByName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <p className="font-semibold">{message.createdByName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {message.createdAt ? formatDistanceToNow(message.createdAt.toDate(), { addSuffix: true }) : 'sending...'}
                                    </p>
                                </div>
                                <div className="p-3 bg-muted rounded-lg mt-1">
                                    <p className="whitespace-pre-wrap">{message.content}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {!isLoading && messages?.length === 0 && (
                        <div className="text-center text-muted-foreground py-12">
                            <p>No messages yet. Be the first to say hello!</p>
                        </div>
                    )}
                 </div>
            </ScrollArea>
        </CardContent>
        <CardFooter className="pt-4 border-t">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex items-start gap-2">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Textarea placeholder="Type your message..." {...field} className="min-h-12 resize-none" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="icon" disabled={form.formState.isSubmitting || isLoading}>
                {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </Form>
        </CardFooter>
      </Card>
    </div>
  );
}

function MessageSkeleton() {
    return (
         <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
                <div className="flex items-baseline gap-2">
                    <Skeleton className="h-4 w-24"/>
                    <Skeleton className="h-3 w-16"/>
                </div>
                <Skeleton className="h-10 w-3/4"/>
            </div>
        </div>
    )
}
