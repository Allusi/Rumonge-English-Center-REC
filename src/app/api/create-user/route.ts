import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      databaseURL: firebaseConfig.databaseURL,
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
  }
}


const db = admin.firestore();

const generateRandomKey = (length: number) => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export async function POST(req: Request) {
    if (req.method !== 'POST') {
      return NextResponse.json({ success: false, error: 'Method Not Allowed' }, { status: 405 });
    }

    const data = await req.json();
    const loginKey = generateRandomKey(8);
    const email = `${loginKey}@rec-online.app`;
    const password = 'password'; // Temporary static password

    let uid;

    try {
      // 1. Create user in Firebase Authentication
      const userRecord = await admin.auth().createUser({
        email: email,
        password: password,
        displayName: data.name,
      });
      uid = userRecord.uid;

      const batch = db.batch();

      // 2. Create user profile in Firestore
      const userDocRef = db.collection('users').doc(uid);
      batch.set(userDocRef, {
        name: data.name,
        email: email,
        loginKey: loginKey,
        role: 'student',
        status: 'active',
        age: data.age,
        address: data.address,
        enrolledCourseId: data.enrolledCourseId,
        englishLevel: data.englishLevel,
        phoneNumber: data.phoneNumber || null,
        maritalStatus: data.maritalStatus,
        educationalStatus: data.educationalStatus,
        learningReason: data.learningReason,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 3. Create enrollment record
      const enrollmentDocRef = db.collection('enrollments').doc();
      batch.set(enrollmentDocRef, {
        studentId: uid,
        studentName: data.name,
        courseId: data.enrolledCourseId,
        courseName: data.courseName,
        enrolledAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await batch.commit();

      return NextResponse.json({ success: true, loginKey: loginKey }, { status: 200 });

    } catch (error: any) {
      console.error('Error creating user:', error);
      // If a UID was created before the DB write failed, delete the auth user.
      if (uid) {
        try {
          await admin.auth().deleteUser(uid);
        } catch (cleanupError) {
          console.error(`Failed to clean up auth user ${uid}:`, cleanupError);
        }
      }
       return NextResponse.json({ success: false, error: error.message || 'An unknown error occurred.' }, { status: 500 });
    }
}
