
'use client';
import {
  Plus,
  ArrowLeft,
  Search,
  RefreshCw,
  MoreVertical,
  Trash2,
  UserCheck,
  UserX,
  GraduationCap,
} from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  TableHead
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { UserProfile, AssignmentSubmission, Assignment } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
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
import { Badge } from '@/components/ui/badge';


export default function StudentsPage() {
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: students, loading: studentsLoading } = useCollection<UserProfile>(
    firestore ? query(collection(firestore, 'users'), where('role', '==', 'student')) : null
  );
  
  const { data: submissions, loading: submissionsLoading } = useCollection<AssignmentSubmission>(
    firestore ? collection(firestore, 'submissions') : null
  );
  
  const { data: assignments, loading: assignmentsLoading } = useCollection<Assignment>(
      firestore ? collection(firestore, 'assignments') : null
  );

  const studentGrades = useMemo(() => {
    if (!students || !submissions || !assignments) return new Map<string, number>();

    const assignmentMaxMarks = new Map<string, number>();
    assignments.forEach(a => assignmentMaxMarks.set(a.id, a.maxMarks));
    
    const gradesMap = new Map<string, { totalMarks: number, totalMaxMarks: number }>();
    submissions.forEach(sub => {
      if (sub.status === 'graded' && sub.marks !== undefined) {
        const studentId = sub.studentId;
        const maxMarks = assignmentMaxMarks.get(sub.assignmentId) || 100;
        
        const current = gradesMap.get(studentId) || { totalMarks: 0, totalMaxMarks: 0 };
        gradesMap.set(studentId, {
          totalMarks: current.totalMarks + sub.marks,
          totalMaxMarks: current.totalMaxMarks + maxMarks
        });
      }
    });

    const averageGrades = new Map<string, number>();
    gradesMap.forEach((value, key) => {
        if (value.totalMaxMarks > 0) {
            averageGrades.set(key, Math.round((value.totalMarks / value.totalMaxMarks) * 100));
        } else {
            averageGrades.set(key, 0);
        }
    });

    return averageGrades;
  }, [students, submissions, assignments]);


  const filteredAndSortedStudents = useMemo(() => {
    if (!students) return [];
    
    const filtered = students.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return filtered.sort((a, b) => {
        const gradeA = studentGrades.get(a.id) ?? -1;
        const gradeB = studentGrades.get(b.id) ?? -1;
        return gradeB - gradeA;
    });

  }, [students, searchTerm, studentGrades]);

  const generateRandomKey = (length: number) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleGenerateKey = async (student: UserProfile) => {
    if (!firestore) return;
    const newKey = generateRandomKey(8);
    const newEmail = `${newKey}@rec-online.app`;
    const studentRef = doc(firestore, "users", student.id);
    try {
        await updateDoc(studentRef, { 
            loginKey: newKey,
            email: newEmail,
        });
        toast({
            title: "New Key Generated!",
            description: `A new login key has been generated for ${student.name}. The old key will no longer work.`
        });
    } catch(error) {
        console.error("Error generating new key:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not generate a new key. Please try again."
        });
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!firestore) return;
    try {
      // Note: This only deletes the Firestore record.
      // For a complete solution, you would also need to delete the user from Firebase Authentication,
      // which typically requires a backend function (e.g., Cloud Function).
      await deleteDoc(doc(firestore, "users", studentId));
      toast({
        title: "Student Deleted",
        description: "The student's record has been removed.",
      });
    } catch (error) {
      console.error("Error deleting student:", error);
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: "Could not delete the student record. Please try again.",
      });
    }
  };
  
  const handleToggleStatus = async (student: UserProfile) => {
    if (!firestore) return;
    const newStatus = student.status === 'active' ? 'inactive' : 'active';
    const studentRef = doc(firestore, "users", student.id);
    try {
        await updateDoc(studentRef, { status: newStatus });
        toast({
            title: "Status Updated",
            description: `${student.name}'s status has been set to ${newStatus}.`
        });
    } catch(error) {
        console.error("Error updating status:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not update student status. Please try again."
        });
    }
  };


  const handleRowClick = (studentId: string) => {
    router.push(`/admin/students/${studentId}`);
  };

  const loading = studentsLoading || submissionsLoading || assignmentsLoading;

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
                Student Management
              </h1>
              <p className="text-muted-foreground">
                View and manage all registered students.
              </p>
            </div>
        </div>
        <Link href="/admin/students/new" passHref>
            <Button>
                <Plus className="mr-2 h-4 w-4" /> Add New Student
            </Button>
        </Link>
      </div>
      
       <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search students..."
            className="w-full bg-background pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Avg. Grade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <>
                  {[...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <Skeleton className="h-6 w-40" />
                            </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell className="text-right">
                           <Skeleton className="h-8 w-8 ml-auto" />
                        </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
              {!loading && filteredAndSortedStudents && filteredAndSortedStudents.length > 0 ? (
                filteredAndSortedStudents.map((student) => {
                  const averageGrade = studentGrades.get(student.id);
                  return (
                  <TableRow key={student.id} onClick={() => handleRowClick(student.id)} className="cursor-pointer">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          {student.photoURL && <AvatarImage src={student.photoURL} alt={student.name} />}
                          <AvatarFallback>
                            {student.name?.charAt(0) || 'S'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold">{student.name}</span>
                      </div>
                    </TableCell>
                     <TableCell>
                        {averageGrade !== undefined ? (
                             <Badge variant="secondary" className="text-base gap-2">
                                <GraduationCap className="h-4 w-4"/>
                                {averageGrade}%
                             </Badge>
                        ) : (
                            <Badge variant="outline">N/A</Badge>
                        )}
                    </TableCell>
                    <TableCell>
                        <Badge variant={student.status === 'active' ? 'secondary' : 'outline'}>
                            {student.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => e.stopPropagation()}
                                >
                                <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleToggleStatus(student); }}>
                                    {student.status === 'active' ? <UserX className="mr-2" /> : <UserCheck className="mr-2" />}
                                    Set {student.status === 'active' ? 'Inactive' : 'Active'}
                                </DropdownMenuItem>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.stopPropagation()}>
                                            <RefreshCw className="mr-2" />
                                            Generate New Key
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Generate New Login Key?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will generate a new login key for {student.name} and invalidate their old one. Are you sure?
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleGenerateKey(student);
                                            }}
                                        >
                                            Yes, Generate
                                        </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem className="text-destructive" onSelect={(e) => e.stopPropagation()}>
                                            <Trash2 className="mr-2" />
                                            Delete Student
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete {student.name}'s record. Their authentication account will NOT be deleted automatically.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-destructive hover:bg-destructive/90"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteStudent(student.id);
                                            }}
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
                  )
                })
              ) : (
                !loading && (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            {students && students.length > 0 ? 'No students match your search.' : 'No students found.'}
                        </TableCell>
                    </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
