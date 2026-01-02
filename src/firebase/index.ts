
'use client';

// This file is the single source of truth for all Firebase-related exports.
// It simplifies imports across the application by providing a centralized module.

// Export core Firebase initialization and provider components.
export * from './config';
export { FirebaseProvider, useFirebase, useFirebaseApp, useAuth, useFirestore } from './provider';
export { FirebaseClientProvider } from './client-provider';

// Export authentication hooks.
export { useUser } from './auth/use-user';

// Export Firestore hooks for data fetching.
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';

// Export error handling utilities.
export { FirestorePermissionError, type SecurityRuleContext } from './errors';
export { errorEmitter } from './error-emitter';

// Export utility functions.
export { initializeFirebase } from './initialize';
