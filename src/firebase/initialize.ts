
'use client';

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

type FirebaseInstances = {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

let firebaseApp: FirebaseInstances;

export function initializeFirebase(): FirebaseInstances {
  if (firebaseApp) {
    return firebaseApp;
  }

  const apps = getApps();
  const app = apps.length
    ? apps[0]
    : initializeApp(firebaseConfig);

  const auth = getAuth(app);
  const firestore = getFirestore(app);

  firebaseApp = { app, auth, firestore };
  return firebaseApp;
}
