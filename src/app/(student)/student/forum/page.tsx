
'use client';

import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { ForumTopic } from '@/lib/data';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, MessageSquare, Pin, Lock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMemo } from 'react';

export default function ForumPage() {
  const firestore = useFirestore();
  const topicsQuery = firestore ? query(collection(firestore, 'forum_topics'), orderBy('lastActivity', 'desc')) : null;
  const { data: topics, loading } = useCollection<ForumTopic>(topicsQuery);

  const { pinned, unpinned } = useMemo(() => {
    const pinned = topics?.filter(t => t.isPinned) || [];
    const unpinned = topics?.filter(t => !t.isPinned) || [];
    return { pinned, unpinned };
  }, [topics]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Community Forum</h1>
          <p className="text-muted-foreground">
            Discuss topics, ask questions, and connect with other students.
          </p>
        </div>
        <Link href="/student/forum/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Topic
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {loading && Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        
        {!loading && (pinned.length > 0 || unpinned.length > 0) ? (
            <>
                {pinned.map(topic => (
                    <TopicCard key={topic.id} topic={topic} />
                ))}
                {unpinned.map(topic => (
                    <TopicCard key={topic.id} topic={topic} />
                ))}
            </>
        ) : !loading && (
            <Card className="text-center py-12">
                <CardContent>
                    <h3 className="text-xl font-semibold">No Topics Yet</h3>
                    <p className="text-muted-foreground mt-2">Be the first to start a conversation!</p>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}

function TopicCard({ topic }: { topic: ForumTopic }) {
  return (
    <Link href={`/student/forum/${topic.id}`} className="block">
      <Card className="hover:bg-muted/50 transition-colors">
        <CardContent className="p-4 flex items-center gap-4">
          <Avatar className="h-12 w-12 hidden sm:flex">
            <AvatarImage src={topic.createdByPhotoURL} alt={topic.createdByName} />
            <AvatarFallback>{topic.createdByName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <div className="flex items-center gap-2">
                {topic.isPinned && <Pin className="h-4 w-4 text-primary" />}
                {topic.isLocked && <Lock className="h-4 w-4 text-destructive" />}
                <h3 className="font-semibold text-lg">{topic.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Started by {topic.createdByName} • {formatDistanceToNow(topic.createdAt.toDate(), { addSuffix: true })}
            </p>
          </div>
          <div className="text-right text-sm text-muted-foreground flex flex-col items-center">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>{topic.replyCount || 0}</span>
            </div>
            <p className="whitespace-nowrap mt-1">
              Last reply {formatDistanceToNow(topic.lastActivity.toDate(), { addSuffix: true })}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

    