
"use client";

import { CreditCard, LogOut, User as UserIcon, Bell } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { signOut } from "firebase/auth";
import { collection, doc, query, where, orderBy, limit, writeBatch, Timestamp } from "firebase/firestore";
import { formatDistanceToNow } from 'date-fns';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth, useDoc, useFirestore, useUser, useCollection } from "@/firebase";
import type { UserProfile, Notification } from "@/lib/data";

export function UserNav() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user: authUser, loading: authLoading } = useUser();

  const userDocRef = (firestore && authUser) ? doc(firestore, 'users', authUser.uid) : null;
  const { data: userProfile, loading: profileLoading } = useDoc<UserProfile>(userDocRef);

  const notificationsQuery = (firestore && authUser) 
    ? query(
        collection(firestore, 'notifications'), 
        where('userId', '==', authUser.uid),
        orderBy('createdAt', 'asc'),
        limit(10)
      )
    : null;
  const { data: notifications, loading: notificationsLoading } = useCollection<Notification>(notificationsQuery);
  
  const sortedNotifications = useMemo(() => {
    if (!notifications) return [];
    // Since we query ascending to avoid index, we reverse here to show newest first.
    return [...notifications].reverse();
  }, [notifications]);

  const unreadCount = useMemo(() => {
      if (!notifications) return 0;
      return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push("/login");
    }
  };

  const handleMarkNotificationsAsRead = async () => {
    if (!firestore || !notifications) return;
    const unread = notifications.filter(n => !n.isRead);
    if (unread.length === 0) return;
    
    const batch = writeBatch(firestore);
    unread.forEach(notification => {
        const notifRef = doc(firestore, 'notifications', notification.id);
        batch.update(notifRef, { isRead: true });
    });
    await batch.commit();
  };

  const isLoading = authLoading || profileLoading;

  if (!isClient || isLoading) {
    return <Skeleton className="h-9 w-9 rounded-full" />;
  }
  
  const displayName = userProfile?.name || authUser?.displayName || "User";
  const displayEmail = userProfile?.email || authUser?.email || "";
  const avatarFallback = displayName?.charAt(0).toUpperCase() || "U";

  return (
    <div className="flex items-center gap-4">
      <DropdownMenu onOpenChange={(open) => { if(open && unreadCount > 0) handleMarkNotificationsAsRead() }}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5"/>
            {unreadCount > 0 && (
                <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                    {unreadCount}
                </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="end">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
           {notificationsLoading && <DropdownMenuItem>Loading...</DropdownMenuItem>}
           {!notificationsLoading && sortedNotifications && sortedNotifications.length === 0 && <DropdownMenuItem>No new notifications.</DropdownMenuItem>}
           {!notificationsLoading && sortedNotifications && sortedNotifications.map(notif => (
            <Link href={notif.link} key={notif.id}>
              <DropdownMenuItem className="flex flex-col items-start whitespace-normal">
                <p className={`text-sm ${!notif.isRead ? 'font-bold' : ''}`}>{notif.message}</p>
                <p className="text-xs text-muted-foreground">{notif.createdAt ? formatDistanceToNow(notif.createdAt.toDate(), { addSuffix: true }) : 'Just now'}</p>
              </DropdownMenuItem>
            </Link>
           ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
              {userProfile?.photoURL && (
                <AvatarImage
                  src={userProfile.photoURL}
                  alt={displayName}
                  width={36}
                  height={36}
                />
              )}
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {displayEmail}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <Link href="/profile" passHref>
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem disabled>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

    