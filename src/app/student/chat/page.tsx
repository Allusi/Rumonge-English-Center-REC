
'use client';

import { useCollection, useDoc, useFirestore, useUser } from '@/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, writeBatch, doc } from 'firebase/firestore';
import type { ChatMessage, UserProfile } from '@/lib/data';
import { ArrowLeft, Send, Loader2, MessageSquareReply, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useRef, useState, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

const chatSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty.'),
});

export default function GroupChatPage() {
  const firestore = useFirestore();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentionPopover, setShowMentionPopover] = useState(false);

  const userProfileRef = firestore && user ? doc(firestore, 'users', user.uid) : null;
  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(userProfileRef);

  const messagesQuery = firestore ? query(collection(firestore, 'chat_messages'), orderBy('createdAt', 'asc')) : null;
  const { data: messages, loading: messagesLoading } = useCollection<ChatMessage>(messagesQuery);
  
  const allUsersQuery = firestore ? query(collection(firestore, 'users')) : null;
  const { data: allUsers, loading: usersLoading } = useCollection<UserProfile>(allUsersQuery);

  const filteredUsers = useMemo(() => {
    if (!mentionQuery || !allUsers) return [];
    return allUsers.filter(u => u.name.toLowerCase().includes(mentionQuery.toLowerCase()));
  }, [mentionQuery, allUsers]);


  const form = useForm<z.infer<typeof chatSchema>>({
    resolver: zodResolver(chatSchema),
    defaultValues: { content: '' },
  });
  
  const handleReply = (message: ChatMessage) => {
    setReplyTo(message);
    textareaRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  const getMentions = (content: string) => {
    const mentionRegex = /@(\w+\s\w+|\w+)/g;
    let match;
    const mentions = new Set<string>();
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.add(match[1]);
    }
    return Array.from(mentions);
  };
  
  const findUserByName = (name: string) => {
    return allUsers?.find(u => u.name.toLowerCase() === name.toLowerCase());
  };

  const handleMentionSelect = (name: string) => {
    const currentContent = form.getValues('content');
    const lastAt = currentContent.lastIndexOf('@');
    const newContent = `${currentContent.substring(0, lastAt)}@${name} `;
    form.setValue('content', newContent);
    setShowMentionPopover(false);
    setMentionQuery('');
    textareaRef.current?.focus();
  };
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    form.setValue('content', value);

    const lastAt = value.lastIndexOf('@');
    if (lastAt > -1 && value.substring(lastAt + 1).indexOf(' ') === -1) {
      const query = value.substring(lastAt + 1);
      setMentionQuery(query);
      setShowMentionPopover(true);
    } else {
      setShowMentionPopover(false);
    }
  };


  const onSubmit = async (values: z.infer<typeof chatSchema>) => {
    if (!firestore || !user ) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to send a message.'});
        return;
    };
     if (!userProfile) {
         toast({ variant: 'destructive', title: 'Error', description: 'Could not load your profile to send a message.'});
        return;
    }

    const batch = writeBatch(firestore);

    const messageContent = replyTo 
        ? `> ${replyTo.createdByName}: ${replyTo.content.substring(0, 50)}...\n\n${values.content}`
        : values.content;

    const newMsgRef = doc(collection(firestore, 'chat_messages'));
    batch.set(newMsgRef, {
        content: messageContent,
        createdAt: serverTimestamp(),
        createdById: user.uid,
        createdByName: userProfile.name || user.displayName,
        createdByPhotoURL: userProfile.photoURL || user.photoURL || null,
        replyTo: replyTo ? {
            id: replyTo.id,
            name: replyTo.createdByName,
            uid: replyTo.createdById,
        } : null,
    });

    const mentionedNames = getMentions(values.content);
    mentionedNames.forEach(name => {
        const mentionedUser = findUserByName(name);
        if (mentionedUser && mentionedUser.id !== user.uid) {
            const notifRef = doc(collection(firestore, 'notifications'));
            batch.set(notifRef, {
                userId: mentionedUser.id,
                message: `${userProfile.name} mentioned you in the group chat.`,
                link: "/chat",
                isRead: false,
                createdAt: serverTimestamp(),
            });
        }
    });

    if (replyTo && replyTo.createdById !== user.uid) {
        const replyNotifRef = doc(collection(firestore, 'notifications'));
        batch.set(replyNotifRef, {
            userId: replyTo.createdById,
            message: `${userProfile.name} replied to your message.`,
            link: "/chat",
            isRead: false,
            createdAt: serverTimestamp(),
        });
    }

    await batch.commit();
    form.reset();
    setReplyTo(null);
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);
  
  const isLoading = userLoading || profileLoading || messagesLoading || usersLoading;
  
  const renderMessageContent = (content: string) => {
    const parts = content.split(/(@\w+\s\w+|@\w+)/g);
    return parts.map((part, index) => {
        if (part.startsWith('@')) {
            const name = part.substring(1);
            const user = findUserByName(name);
            return (
                <span key={index} className="bg-primary/10 text-primary font-semibold rounded px-1 py-0.5">
                    {part}
                </span>
            );
        }
        return part;
    });
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-100px)]">
      <div className="flex items-center gap-4">
        <Link href={`/${userProfile?.role}/dashboard` || "#"} >
            <Button variant="outline" size="icon" className="h-9 w-9" disabled={!userProfile}>
                <ArrowLeft className="h-4 w-4" />
            </Button>
        </Link>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">REC Online Group</h1>
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
                        <div key={message.id} className="flex items-start gap-3 group">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={message.createdByPhotoURL} alt={message.createdByName} />
                                <AvatarFallback>{message.createdByName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-baseline gap-2">
                                    <p className="font-semibold">{message.createdByName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {message.createdAt ? formatDistanceToNow(message.createdAt.toDate(), { addSuffix: true }) : 'sending...'}
                                    </p>
                                </div>
                                <div className="p-3 bg-muted rounded-lg mt-1 group-hover:bg-muted/80 transition-colors relative">
                                    <p className="whitespace-pre-wrap">{renderMessageContent(message.content)}</p>
                                    <Button variant="ghost" size="icon" className="absolute -top-3 -right-3 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleReply(message)}>
                                        <MessageSquareReply className="h-4 w-4" />
                                    </Button>
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
          <div className="w-full">
            {replyTo && (
                <div className="flex items-center justify-between text-sm bg-muted p-2 rounded-t-md">
                    <div className="text-muted-foreground truncate">
                        Replying to <strong>{replyTo.createdByName}</strong>: <em>{replyTo.content.substring(0,50)}...</em>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={cancelReply}>
                        <X className="h-4 w-4"/>
                    </Button>
                </div>
            )}
            <Popover open={showMentionPopover} onOpenChange={setShowMentionPopover}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex items-start gap-2">
                <PopoverAnchor asChild>
                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                    <FormItem className="flex-1">
                        <FormControl>
                        <Textarea 
                            placeholder="Type your message... use @ to mention" 
                            {...field} 
                            ref={textareaRef}
                            onChange={handleContentChange}
                            className={`min-h-12 resize-none ${replyTo ? 'rounded-t-none' : ''}`} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </PopoverAnchor>
                <Button type="submit" size="icon" disabled={form.formState.isSubmitting || isLoading}>
                    {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
                </Button>
                </form>
            </Form>
             <PopoverContent className="w-64 p-0">
                <Command>
                  <CommandInput placeholder="Tag a user..." />
                  <CommandList>
                    <CommandEmpty>No user found.</CommandEmpty>
                    <CommandGroup>
                        {filteredUsers.map(u => (
                            <CommandItem key={u.id} onSelect={() => handleMentionSelect(u.name)}>
                                <Avatar className="mr-2 h-8 w-8">
                                    <AvatarImage src={u.photoURL} alt={u.name} />
                                    <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                {u.name}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
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

    