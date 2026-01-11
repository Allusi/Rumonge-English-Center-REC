
'use client';

import { useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import type { Notification as NotificationData } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

export function NotificationPermissionRequester() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !firestore) return;
    if (!('Notification' in window)) {
        console.log("This browser does not support desktop notification");
        return;
    }

    const requestPermissionAndListen = async () => {
        let permission = Notification.permission;
        
        if (permission === 'default') {
            permission = await Notification.requestPermission();
        }

        if (permission === 'granted') {
             const notificationsQuery = query(
                collection(firestore, 'notifications'), 
                where('userId', '==', user.uid),
                where('createdAt', '>', Timestamp.now()) // Listen for future notifications
            );

            const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
                 if (snapshot.metadata.hasPendingWrites) {
                    return; // Ignore local changes
                }

                snapshot.docChanges().forEach((change) => {
                    if (change.type === "added") {
                        const newNotification = change.doc.data() as NotificationData;
                        
                        if(newNotification.isRead) return;

                        // Check if the service worker is available to show the notification
                        if (navigator.serviceWorker && 'showNotification' in ServiceWorkerRegistration.prototype) {
                           navigator.serviceWorker.ready.then(registration => {
                             registration.showNotification('REC Online', {
                               body: newNotification.message,
                               icon: '/icon-192x192.png',
                               badge: '/icon-192x192.png',
                               data: { url: newNotification.link }
                             });
                           });
                        } else {
                            // Fallback for browsers that don't support service worker notifications
                            // This will only work if the tab is active
                            new Notification('REC Online', {
                                body: newNotification.message,
                                icon: '/icon-192x192.png'
                            });
                        }
                    }
                });
            }, (error) => {
                console.error("Error listening for notifications: ", error);
            });

            // Also listen for clicks on notifications shown by the service worker
            const handleNotificationClick = (event: any) => {
                const url = event.notification.data?.url;
                if (url) {
                    clients.openWindow(url);
                }
                event.notification.close();
            };

            navigator.serviceWorker.ready.then(registration => {
               registration.addEventListener('notificationclick', handleNotificationClick);
            });

            return () => {
                unsubscribe();
                navigator.serviceWorker.ready.then(registration => {
                    registration.removeEventListener('notificationclick', handleNotificationClick);
                });
            };
        } else if (permission === 'denied') {
            console.log('Notification permission denied.');
        }
    }

    requestPermissionAndListen();

  }, [user, firestore, toast]);

  return null;
}
