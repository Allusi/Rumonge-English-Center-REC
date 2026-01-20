'use client';

import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, getDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, RefreshCw, ArrowLeft, CameraOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const qrboxFunction = (viewfinderWidth: number, viewfinderHeight: number) => {
    const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
    const qrboxSize = Math.floor(minEdge * 0.8);
    return {
        width: qrboxSize,
        height: qrboxSize,
    };
}

export default function ScanAttendancePage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [lastScannedStudent, setLastScannedStudent] = useState<{name: string; status: 'success' | 'already_marked' | 'error'; message: string} | null>(null);
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

    const startScanner = () => {
        if (!html5QrCodeRef.current || html5QrCodeRef.current.isScanning) return;
        setLastScannedStudent(null);
        setScanResult(null);
        
        html5QrCodeRef.current.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: qrboxFunction },
            (decodedText, decodedResult) => {
                // on success
                setScanResult(decodedText);
                if (html5QrCodeRef.current?.isScanning) {
                    html5QrCodeRef.current.stop();
                }
            },
            (errorMessage) => {
                // on failure
            }
        ).catch(err => {
            console.error("Scanner start error:", err);
            setHasCameraPermission(false);
        });
    }

    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (!html5QrCodeRef.current) {
                html5QrCodeRef.current = new Html5Qrcode('qr-reader');
            }
            
            Html5Qrcode.getCameras().then(devices => {
                if (devices && devices.length) {
                    setHasCameraPermission(true);
                    startScanner();
                } else {
                    setHasCameraPermission(false);
                }
            }).catch(err => {
                console.error("Error getting cameras:", err);
                setHasCameraPermission(false);
            });
        }


        return () => {
            if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
                html5QrCodeRef.current.stop().catch(err => console.error("Error stopping scanner on unmount:", err));
            }
        };
    }, []);

    useEffect(() => {
        if (scanResult) {
            handleScan(scanResult);
        }
    }, [scanResult]);
    
    const handleScan = async (url: string) => {
        setProcessing(true);
        setLastScannedStudent(null);
        try {
            const studentId = new URL(url).searchParams.get('studentId');

            if (!studentId || !firestore) {
                setLastScannedStudent({name: 'Unknown', status: 'error', message: 'Invalid QR code. Not a valid student link.'});
                return;
            }

            const studentRef = doc(firestore, 'users', studentId);
            const studentSnap = await getDoc(studentRef);

            if (!studentSnap.exists()) {
                setLastScannedStudent({name: 'Unknown Student', status: 'error', message: 'Student ID from QR code not found in the database.'});
                return;
            }
            const student = studentSnap.data() as UserProfile;

            const todayString = format(new Date(), 'yyyy-MM-dd');
            const attendanceQuery = query(
                collection(firestore, 'attendance'),
                where('studentId', '==', studentId),
                where('date', '==', todayString)
            );
            const querySnapshot = await getDocs(attendanceQuery);

            if (!querySnapshot.empty) {
                setLastScannedStudent({name: student.name, status: 'already_marked', message: `Already marked as ${querySnapshot.docs[0].data().status} for today.`});
                return;
            }
            
            const newDocRef = doc(collection(firestore, 'attendance'));
            await setDoc(newDocRef, {
                studentId: studentId,
                studentName: student.name,
                date: todayString,
                status: 'present',
                markedAt: serverTimestamp(),
            });

            setLastScannedStudent({name: student.name, status: 'success', message: 'Attendance marked as present.'});
            toast({
                title: 'Attendance Marked',
                description: `${student.name} has been marked as present.`,
            });

        } catch (error) {
            console.error("Error processing scan:", error);
            if (error instanceof TypeError) { // Catches invalid URL errors
                 setLastScannedStudent({name: 'Invalid QR Code', status: 'error', message: 'The scanned QR code does not contain a valid URL.'});
            } else {
                 setLastScannedStudent({name: 'Error', status: 'error', message: 'An unexpected error occurred while processing the QR code.'});
            }
        } finally {
            setProcessing(false);
        }
    }
    
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/attendance" passHref>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight">
                    Scan Attendance
                    </h1>
                    <p className="text-muted-foreground">
                    Point a student's QR code at the camera to mark them present.
                    </p>
                </div>
            </div>
            
            <Card>
                <CardContent className="pt-6">
                    <div id="qr-reader" className="w-full rounded-lg border bg-muted" style={{ minHeight: '300px' }}></div>
                    
                    {hasCameraPermission === false && (
                         <div className="mt-4 text-center p-4 border rounded-lg bg-destructive/10 text-destructive">
                             <div className="flex flex-col items-center gap-2">
                                <CameraOff className="h-12 w-12" />
                                <p className="font-bold text-lg">Camera Permission Denied</p>
                                <p>Please grant camera permissions in your browser settings to use the scanner.</p>
                             </div>
                         </div>
                    )}

                    {(processing || lastScannedStudent) && (
                        <div className="mt-4 text-center p-4 border rounded-lg">
                           {processing && <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />}
                           {lastScannedStudent && (
                                <div className="flex flex-col items-center gap-2">
                                     {lastScannedStudent.status === 'success' && <CheckCircle className="h-12 w-12 text-green-500" />}
                                     {lastScannedStudent.status === 'already_marked' && <CheckCircle className="h-12 w-12 text-yellow-500" />}
                                     {lastScannedStudent.status === 'error' && <XCircle className="h-12 w-12 text-destructive" />}
                                    <p className="font-bold text-lg">{lastScannedStudent.name}</p>
                                    <p className="text-muted-foreground">{lastScannedStudent.message}</p>
                                    <Button onClick={startScanner} className="mt-4">
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Scan Next Student
                                    </Button>
                               </div>
                           )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
