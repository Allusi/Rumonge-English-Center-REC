
'use client';
import { useState } from "react";
import { ArrowLeft, MessageCircle, Bot, User } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCollection, useFirestore } from "@/firebase";
import { collection, orderBy, query } from "firebase/firestore";
import type { AITutorSession } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";


export default function AITutorAdminPage() {
  const firestore = useFirestore();
  const [selectedSession, setSelectedSession] = useState<AITutorSession | null>(null);

  const sessionsQuery = firestore ? query(collection(firestore, 'ai_tutor_sessions'), orderBy('lastActivity', 'desc')) : null;
  const { data: sessions, loading } = useCollection<AITutorSession>(sessionsQuery);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
         <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" passHref>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="font-headline text-3xl font-bold tracking-tight">
                AI Tutor Sessions
              </h1>
              <p className="text-muted-foreground">
                Review conversation histories from student AI tutor sessions.
              </p>
            </div>
        </div>
      </div>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Message Count</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                 [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
              )}
              {!loading && sessions?.map((session) => (
                <TableRow key={session.id} onClick={() => setSelectedSession(session)} className="cursor-pointer">
                  <TableCell className="font-medium">{session.studentName}</TableCell>
                  <TableCell>{session.lastActivity ? format(session.lastActivity.toDate(), 'PPP p') : 'N/A'}</TableCell>
                  <TableCell>{session.history.length}</TableCell>
                  <TableCell className="text-right">
                     <Button variant="outline" size="sm">View History</Button>
                  </TableCell>
                </TableRow>
              ))}
               {!loading && sessions?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No AI Tutor sessions have been recorded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={!!selectedSession} onOpenChange={(isOpen) => !isOpen && setSelectedSession(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Conversation History</DialogTitle>
            <DialogDescription>
              A log of the conversation between {selectedSession?.studentName} and the AI Tutor.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-6">
             <div className="space-y-4">
                {selectedSession?.history.map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 ${
                      message.role === "user" ? "justify-end" : ""
                    }`}
                  >
                    {message.role === "model" && (
                      <Avatar>
                        <AvatarFallback>REC</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-lg p-3 max-w-sm ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    {message.role === "user" && (
                      <Avatar>
                        <AvatarFallback><User/></AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
