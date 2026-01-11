
'use client';

import { useState } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import type { ForumTopic } from '@/lib/data';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Pin, PinOff, Lock, Unlock, Trash2, MessageSquare, ArrowLeft } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminForumManagementPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const topicsQuery = firestore ? query(collection(firestore, 'forum_topics'), orderBy('lastActivity', 'desc')) : null;
  const { data: topics, loading, error } = useCollection<ForumTopic>(topicsQuery);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);

  const handleTogglePin = async (topic: ForumTopic) => {
    if (!firestore) return;
    const topicRef = doc(firestore, 'forum_topics', topic.id);
    await updateDoc(topicRef, { isPinned: !topic.isPinned });
    toast({ title: 'Success', description: `Topic has been ${!topic.isPinned ? 'pinned' : 'unpinned'}.` });
  };

  const handleToggleLock = async (topic: ForumTopic) => {
    if (!firestore) return;
    const topicRef = doc(firestore, 'forum_topics', topic.id);
    await updateDoc(topicRef, { isLocked: !topic.isLocked });
    toast({ title: 'Success', description: `Topic has been ${!topic.isLocked ? 'locked' : 'unlocked'}.` });
  };

  const handleDeleteTopic = async () => {
    if (!firestore || !selectedTopic) return;
    
    const batch = writeBatch(firestore);
    const topicRef = doc(firestore, 'forum_topics', selectedTopic.id);
    // Note: This doesn't delete subcollections (posts) in the client SDK.
    // A Cloud Function would be needed for full cleanup. For now, we delete the topic.
    batch.delete(topicRef);
    
    await batch.commit();
    toast({ title: 'Success', description: 'Topic has been deleted.' });
    setDialogOpen(false);
    setSelectedTopic(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard" passHref>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Forum Management</h1>
          <p className="text-muted-foreground">Moderate and manage all forum topics.</p>
        </div>
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Topic</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Replies</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))}
              {!loading && topics?.map(topic => (
                <TableRow key={topic.id}>
                  <TableCell className="font-medium">{topic.title}</TableCell>
                  <TableCell>{topic.createdByName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground"/>
                        {topic.replyCount || 0}
                    </div>
                  </TableCell>
                  <TableCell>{formatDistanceToNow(topic.lastActivity.toDate(), { addSuffix: true })}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                        {topic.isPinned && <Badge variant="secondary"><Pin className="mr-1 h-3 w-3"/> Pinned</Badge>}
                        {topic.isLocked && <Badge variant="destructive"><Lock className="mr-1 h-3 w-3"/> Locked</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Moderation</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleTogglePin(topic)}>
                          {topic.isPinned ? <PinOff className="mr-2" /> : <Pin className="mr-2" />}
                          {topic.isPinned ? 'Unpin Topic' : 'Pin Topic'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleLock(topic)}>
                           {topic.isLocked ? <Unlock className="mr-2" /> : <Lock className="mr-2" />}
                           {topic.isLocked ? 'Unlock Topic' : 'Lock Topic'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedTopic(topic); setDialogOpen(true); }}>
                            <Trash2 className="mr-2"/>
                            Delete Topic
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && topics?.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">No topics found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the topic "{selectedTopic?.title}" and all its posts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTopic} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    