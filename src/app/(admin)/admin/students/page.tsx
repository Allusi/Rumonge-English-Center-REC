
'use client';
import {
  Plus,
  ArrowLeft,
  Search,
  RefreshCw
} from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, doc, updateDoc } from 'firebase/firestore';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Student } from '@/lib/data';
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


export default function StudentsPage() {
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: students, loading } = useCollection<Student>(
    firestore ? query(collection(firestore, 'users'), where('role', '==', 'student')) : null
  );

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    return students.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  const generateRandomKey = (length: number) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleGenerateKey = async (student: Student) => {
    if (!firestore) return;
    const newKey = generateRandomKey(8);
    const newEmail = `${newKey}@rec-online.app`;
    const studentRef = doc(firestore, "users", student.id);
    try {
        await updateDoc(studentRef, { 
            loginKey: newKey,
            email: newEmail, // Also update the email used for auth
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

  const handleRowClick = (studentId: string) => {
    router.push(`/admin/students/${studentId}`);
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
                        <TableCell className="text-right">
                           <Skeleton className="h-8 w-32 ml-auto" />
                        </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
              {!loading && filteredStudents && filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
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
                    <TableCell className="text-right">
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                   <RefreshCw className="mr-2 h-4 w-4" />
                                    Generate Key
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Generate New Login Key?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will generate a new login key for {student.name} and invalidate their old key. The student will need to be given the new key to log in. Are you sure?
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
                                    Yes, Generate New Key
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                !loading && (
                    <TableRow>
                        <TableCell colSpan={2} className="h-24 text-center">
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
