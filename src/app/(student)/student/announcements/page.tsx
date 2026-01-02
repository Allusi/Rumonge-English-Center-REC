
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { useCollection, useFirestore } from "@/firebase";
import { collection, orderBy, query } from "firebase/firestore";
import type { Announcement } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Megaphone } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function StudentAnnouncementsPage() {
  const firestore = useFirestore();
  const announcementsQuery = firestore ? query(collection(firestore, 'announcements'), orderBy('date', 'desc')) : null;
  const { data: announcements, loading } = useCollection<Announcement>(announcementsQuery);

  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center gap-4">
            <Link href="/student/dashboard" passHref>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">
                    School Announcements
                </h1>
                <p className="text-muted-foreground">
                    Stay up-to-date with the latest news and updates.
                </p>
            </div>
      </div>
      
      <div className="space-y-4">
        {loading && (
          [...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {!loading && announcements?.map((announcement) => (
          <Card key={announcement.id}>
            <CardHeader className="flex flex-row items-start gap-4">
                 <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Megaphone className="h-6 w-6" />
                </div>
                <div className="flex-1">
                    <CardTitle>{announcement.title}</CardTitle>
                    <CardDescription>{new Date(announcement.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{announcement.content}</p>
            </CardContent>
          </Card>
        ))}

        {!loading && announcements?.length === 0 && (
          <Card>
            <CardContent className="p-10 text-center text-muted-foreground">
              <p>There are no announcements at this time.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
