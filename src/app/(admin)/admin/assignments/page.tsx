
'use client';
import { Plus, MoreHorizontal, FilePenLine, Trash2, ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";
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
} from "@/components/ui/alert-dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCollection, useFirestore } from "@/firebase";
import { collection, deleteDoc, doc, orderBy, query, getDocs, writeBatch, serverTimestamp } from "firebase/firestore";
import type { Assignment } from "@/lib/data";
import { initialAssignment } from "@/lib/assignments-data";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";


export default function AssignmentsPage() {
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const assignmentsCollection = firestore ? collection(firestore, 'assignments') : null;

  useEffect(() => {
    const seedAssignment = async () => {
        if (firestore && assignmentsCollection) {
            const snapshot = await getDocs(assignmentsCollection);
            if (snapshot.empty) {
                const batch = writeBatch(firestore);
                const docRef = doc(assignmentsCollection);
                batch.set(docRef, { ...initialAssignment, createdAt: serverTimestamp() });
                await batch.commit();
            }
        }
    };
    seedAssignment();
  }, [firestore, assignmentsCollection]);

  const assignmentsQuery = assignmentsCollection ? query(assignmentsCollection, orderBy('createdAt', 'desc')) : null;
  const { data: assignments, loading } = useCollection<Assignment>(assignmentsQuery);

  const handleDelete = async (assignmentId: string) => {
    if (!firestore) return;
    try {
        await deleteDoc(doc(firestore, "assignments", assignmentId));
        toast({
            title: "Success",
            description: "Assignment deleted successfully.",
        });
    } catch (error) {
        console.error("Error deleting assignment: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not delete the assignment. Please try again.",
        });
    }
  };

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
                Assignments
              </h1>
              <p className="text-muted-foreground">
                Manage and create assignments for your courses.
              </p>
            </div>
        </div>
        <Link href="/admin/assignments/new" passHref>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Assignment
          </Button>
        </Link>
      </div>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                 [...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
              )}
              {!loading && assignments?.map((assignment) => (
                <TableRow key={assignment.id} onClick={() => router.push(`/admin/assignments/edit/${assignment.id}`)} className="cursor-pointer">
                  <TableCell className="font-medium">{assignment.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1">
                        <BookOpen className="h-3 w-3" />
                        {assignment.courseName}
                    </Badge>
                  </TableCell>
                  <TableCell>{assignment.createdAt ? format(assignment.createdAt.toDate(), 'PPP') : 'Just now'}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                           onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/admin/assignments/edit/${assignment.id}`)}}>
                          <FilePenLine className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                               <DropdownMenuItem
                                  className="text-destructive"
                                  onSelect={(e) => e.preventDefault()}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the
                                    assignment.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => handleDelete(assignment.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                >
                                    Delete
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
               {!loading && assignments?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No assignments found. Get started by creating one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
