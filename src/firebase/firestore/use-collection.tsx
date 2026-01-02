
'use client';

import { useState, useEffect } from 'react';
import {
  onSnapshot,
  query,
  collection,
  type Firestore,
  type CollectionReference,
  type DocumentData,
  type Query,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

interface UseCollectionOptions<T> {
  initialData?: T[];
}

function getCollectionPath(ref: Query | CollectionReference): string {
    if (ref instanceof CollectionReference) {
        return ref.path;
    }
    // For queries, we can get the path from the collection reference it's built on.
    // This is a bit of a workaround as the public API doesn't directly expose the path on a Query.
    // We can assume the query is on a collection and get its path.
    // A more robust solution might inspect the internal _query object if needed, but this is safer.
    const collectionRef = collection(ref.firestore, ref.path);
    return collectionRef.path;
}

export function useCollection<T extends DocumentData>(
  ref: Query | CollectionReference | null,
  options?: UseCollectionOptions<T>
) {
  const [data, setData] = useState<T[] | null>(options?.initialData || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ref) {
      setLoading(false);
      setData(null);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        const result: T[] = [];
        snapshot.forEach((doc) => {
          result.push({ id: doc.id, ...doc.data() } as T);
        });
        setData(result);
        setLoading(false);
        setError(null);
      },
      (err) => {
        let path = 'unknown';
        if (ref) {
            // This is a simplified way. A query might not have a `path` property directly.
            // For a collectionRef, it's straightforward.
            if ('path' in ref) {
                path = ref.path;
            } else {
                 // For Query, the path isn't directly on the object. We can hack it, but it's fragile.
                 // A better way is to look at the internal _query property, but that's not public API.
                 // Let's assume the query is on a simple collection path for now.
                 // This part might need to be more robust depending on query complexity.
                 // For now, this will work for simple collection queries.
                 try {
                     const tempColl = collection(ref.firestore, ref.converter ? ref._query.path.segments.join('/') : (ref as any)._query.path.segments.join('/'));
                     path = tempColl.path;
                 } catch(e) {
                    console.error("Could not determine path from query", e);
                 }
            }
        }
        const permissionError = new FirestorePermissionError({
          path: path,
          operation: 'list',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [ref]);

  return { data, loading, error };
}
