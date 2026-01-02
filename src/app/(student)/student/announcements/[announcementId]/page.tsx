
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { useDoc, useFirestore, useUser } from "@/firebase";
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import type { Announcement } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Megaphone } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notFound, useParams } from "next/navigation";
import { useEffect } from "react";

export default function StudentAnnouncementDetailsPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const params = useParams();
  const announcementId = params.announcementId as string;
  
  const announcementRef = firestore ? doc(firestore, 'announcements', announcementId) : null;
  const { data: announcement, loading: announcementLoading } = useDoc<Announcement>(announcementRef);

  useEffect(() => {
    const markAsRead = async () => {
      if (user && firestore && announcementId && !announcementLoading) {
        const readReceiptRef = doc(firestore, `announcements/${announcementId}/readBy`, user.uid);
        const docSnap = await getDoc(readReceiptRef);
        if (!docSnap.exists()) {
          // Mark as read
          await setDoc(readReceiptRef, { readAt: serverTimestamp() });
          
          // Increment read count
          if (announcementRef) {
            await updateDoc(announcementRef, {
              readCount: increment(1)
            });
          }
        }
      }
    };
    markAsRead();
  }, [user, firestore, announcementId, announcementRef, announcementLoading]);


  const isLoading = announcementLoading || userLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-9 rounded-md" />
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
            </div>
        </div>
        <Card>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
        </Card>
      </div>
    );
  }

  if (!announcement) {
    return notFound();
  }

  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center gap-4">
            <Link href="/student/announcements" passHref>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
                <h1 className="font-headline text-3xl font-bold tracking-tight">
                    Announcement
                </h1>
                <p className="text-muted-foreground">
                    Read the full details of the announcement.
                </p>
            </div>
      </div>
      
       <Card>
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
    </div>
  );
}
