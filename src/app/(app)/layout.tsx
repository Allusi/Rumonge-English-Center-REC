
'use client';

import { useUser, useDoc, useFirestore } from '@/firebase';
import AdminLayout from '@/app/(admin)/admin/layout';
import StudentLayout from '@/app/(student)/student/layout';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/data';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';


export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { user, loading: userLoading } = useUser();
    const router = useRouter();
    const firestore = useFirestore();

    const userDocRef = (firestore && user) ? doc(firestore, 'users', user.uid) : null;
    const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(userDocRef);

    useEffect(() => {
        if (!userLoading && !user) {
            router.push('/login');
        }
    }, [user, userLoading, router]);

    const isLoading = userLoading || profileLoading;

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }
    
    // After loading, if there's still no user, redirect to login.
    // This handles the case where the user might log out.
    if (!user) {
        return (
             <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }

    // If the user is authenticated but the profile doesn't exist (e.g., still being created),
    // continue to show a loading state instead of an error.
    if (!userProfile) {
         return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }

    if (userProfile.role === 'admin') {
        return <AdminLayout>{children}</AdminLayout>;
    }

    if (userProfile.role === 'student') {
        return <StudentLayout>{children}</StudentLayout>;
    }

    // Fallback or handle other roles if any
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <p>Unsupported user role.</p>
        </div>
    );
}

    