
'use client';
import {
  Plus,
  ArrowLeft,
  Copy,
} from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
import { Student } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';


export default function StudentsPage() {
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const { data: students, loading } = useCollection<Student>(
    firestore ? query(collection(firestore, 'users'), where('role', '==', 'student')) : null
  );

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast({
        title: "Student Key Copied!",
        description: `The key (email) for registration has been copied to your clipboard.`
    });
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
                           <Skeleton className="h-8 w-24 ml-auto" />
                        </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
              {!loading && students && students.length > 0 ? (
                students.map((student) => (
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
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent row click
                                handleCopyEmail(student.email);
                            }}
                        >
                           <Copy className="mr-2 h-4 w-4" />
                            Copy Key
                        </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                !loading && (
                    <TableRow>
                        <TableCell colSpan={2} className="h-24 text-center">
                            No students found.
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
