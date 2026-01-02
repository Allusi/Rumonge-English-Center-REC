
import { onRequest } from 'firebase-functions/v1/https';
import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { setGlobalOptions } from 'firebase-functions/v2';

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

setGlobalOptions({ region: 'us-central1' });
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

export const createUser = onRequest(
  { cors: true, },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    const data = req.body;
    logger.info('Received user creation request with data:', data);

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
      logger.info(`Successfully created auth user with UID: ${uid}`);

      const batch = db.batch();

      // 2. Create user profile in Firestore
      const userDocRef = db.collection('users').doc(uid);
      batch.set(userDocRef, {
        name: data.name,
        email: email, // Save the generated email
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
      logger.info('Prepared user document for batch write.');

      // 3. Create enrollment record
      const enrollmentDocRef = db.collection('enrollments').doc();
      batch.set(enrollmentDocRef, {
        studentId: uid,
        studentName: data.name,
        courseId: data.enrolledCourseId,
        courseName: data.courseName,
        enrolledAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      logger.info('Prepared enrollment document for batch write.');

      await batch.commit();
      logger.info('Successfully committed Firestore batch write.');

      res.status(200).send({ success: true, loginKey: loginKey });
    } catch (error: any) {
      logger.error('Error creating user:', error);
      // If a UID was created before the DB write failed, delete the auth user.
      if (uid) {
        try {
          await admin.auth().deleteUser(uid);
          logger.warn(`Cleaned up partially created auth user with UID: ${uid}`);
        } catch (cleanupError) {
          logger.error(`Failed to clean up auth user ${uid}:`, cleanupError);
        }
      }
      res.status(500).send({
        success: false,
        error: error.message || 'An unknown error occurred.',
      });
    }
  }
);
