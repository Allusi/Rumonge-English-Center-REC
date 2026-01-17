
'use client';

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useAuth } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc, writeBatch, serverTimestamp, getDocs, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import type { EnrollmentRequest } from '@/lib/data';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Check, X, ArrowLeft, Loader2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';


export default function EnrollmentRequestsPage() {
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();
  const [filter, setFilter] = useState('pending');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const requestsQuery = firestore ? query(collection(firestore, 'enrollment_requests'), orderBy('requestDate', 'desc')) : null;
  const { data: allRequests, loading } = useCollection<EnrollmentRequest>(requestsQuery);

  const filteredRequests = useMemo(() => {
    if (!allRequests) return [];
    if (filter === 'all') return allRequests;
    return allRequests.filter(req => req.status === filter);
  }, [allRequests, filter]);
  
  const generateRandomKey = (length: number) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleApprove = async (request: EnrollmentRequest) => {
    if (!firestore || !auth) {
        toast({ variant: 'destructive', title: 'Error', description: 'Firebase is not properly configured.' });
        return;
    }
    setLoadingAction(request.id);

    const loginKey = generateRandomKey(8);
    const authEmail = `${loginKey}@rec-online.app`;
    const tempPassword = "password"; 

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, authEmail, tempPassword);
        const newUser = userCredential.user;

        const batch = writeBatch(firestore);

        const userDocRef = doc(firestore, 'users', newUser.uid);
        batch.set(userDocRef, {
            name: request.fullName,
            email: authEmail,
            loginKey: loginKey,
            role: 'student',
            status: 'active',
            age: request.age,
            address: request.address,
            enrolledCourseId: request.enrolledCourseId,
            englishLevel: request.englishLevel,
            phoneNumber: request.phoneNumber || null,
            maritalStatus: request.maritalStatus,
            educationalStatus: request.educationalStatus,
            learningReason: request.learningReason,
            createdAt: serverTimestamp(),
        });
        
        const enrollmentDocRef = doc(collection(firestore, 'enrollments'));
        batch.set(enrollmentDocRef, {
            studentId: newUser.uid,
            studentName: request.fullName,
            courseId: request.enrolledCourseId,
            courseName: request.courseName,
            enrolledAt: serverTimestamp(),
        });
        
        const notificationRef = doc(collection(firestore, 'notifications'));
        const approvalMessage = `Isabwa yawe yo kwiyandikisha yaremejwe. Urupfunguruzo rwawe rwo kwinjira ni: ${loginKey}. Koresha uru rupfunguruzo kugira winjire.`;
        batch.set(notificationRef, {
            userId: newUser.uid,
            message: approvalMessage,
            link: "/student/dashboard",
            isRead: false,
            createdAt: serverTimestamp(),
        });
        
        const requestRef = doc(firestore, 'enrollment_requests', request.id);
        batch.update(requestRef, { status: 'approved' });

        await batch.commit();

        toast({
            title: "Request Approved!",
            description: `${request.fullName} is now a student. Their login key is ${loginKey}.`,
            duration: 9000,
        });

    } catch (error: any) {
        console.error("Error approving request: ", error);
        toast({
            variant: "destructive",
            title: "Approval Failed",
            description: error.message || "An unexpected error occurred.",
        });
    } finally {
        setLoadingAction(null);
    }
  };

  const handleReject = async (request: EnrollmentRequest) => {
     if (!firestore) return;
     setLoadingAction(request.id);
     try {
        const requestRef = doc(firestore, 'enrollment_requests', request.id);
        await updateDoc(requestRef, { status: 'rejected' });
        toast({ title: "Request Rejected", description: `${request.fullName}'s enrollment request has been rejected.` });
     } catch (error) {
        console.error("Error rejecting request:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not reject the request." });
     } finally {
        setLoadingAction(null);
     }
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
          <h1 className="font-headline text-3xl font-bold tracking-tight">Enrollment Requests</h1>
          <p className="text-muted-foreground">Review and manage new student applications.</p>
        </div>
      </div>

       <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        <Card className="mt-4">
            <CardContent className="p-0">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {loading && Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                ))}
                {!loading && filteredRequests.map(request => (
                    <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.fullName}</TableCell>
                        <TableCell>{request.courseName}</TableCell>
                        <TableCell>{formatDistanceToNow(request.requestDate.toDate(), { addSuffix: true })}</TableCell>
                        <TableCell>
                            <Badge variant={
                                request.status === 'approved' ? 'secondary' :
                                request.status === 'rejected' ? 'destructive' :
                                'outline'
                            } className="capitalize">
                                {request.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                             {loadingAction === request.id ? (
                                <Button variant="ghost" size="icon" disabled>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                </Button>
                             ) : request.status === 'pending' ? (
                                <AlertDialog>
                                    <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onSelect={() => handleApprove(request)}>
                                            <Check className="mr-2 h-4 w-4"/> Approve
                                        </DropdownMenuItem>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                                <X className="mr-2 h-4 w-4"/> Reject
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                    </DropdownMenuContent>
                                    </DropdownMenu>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                            This will reject the enrollment request for {request.fullName}. This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleReject(request)} className="bg-destructive hover:bg-destructive/90">
                                                Yes, Reject
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            ) : (
                                <span className="text-xs text-muted-foreground">No actions</span>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
                {!loading && filteredRequests.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            No {filter} requests found.
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
