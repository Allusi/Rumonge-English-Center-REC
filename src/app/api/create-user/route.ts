
import { onCall } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}

const db = admin.firestore();

const generateRandomKey = (length: number) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};


export const createUser = onCall(async (request) => {
    const data = request.data;
    
    // --- Generate Credentials ---
    const loginKey = generateRandomKey(8);
    const email = `${loginKey}@rec-online.app`;
    const password = 'password';

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
            createdAt: FieldValue.serverTimestamp(),
        });

        // 3. Create enrollment record
        const enrollmentDocRef = db.collection('enrollments').doc();
        batch.set(enrollmentDocRef, {
            studentId: uid,
            studentName: data.name,
            courseId: data.enrolledCourseId,
            courseName: data.courseName,
            enrolledAt: FieldValue.serverTimestamp(),
        });

        await batch.commit();

        return { success: true, loginKey: loginKey };

    } catch (error: any) {
        console.error('Error creating user:', error);
        // If a UID was created before the DB write failed, delete the auth user.
        if (uid) {
            await admin.auth().deleteUser(uid);
        }
        return { success: false, error: error.message || 'An unknown error occurred.' };
    }
});
