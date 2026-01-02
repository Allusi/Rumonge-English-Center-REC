
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  onSnapshot,
  query,
  collection,
  type Firestore,
  type CollectionReference,
  type DocumentData,
  type Query,
  queryEqual,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

interface UseCollectionOptions<T> {
  initialData?: T[];
}

function useMemoizedQuery<T extends Query | CollectionReference | null>(query: T): T {
    const previousQueryRef = useRef<T | null>(null);
  
    if (query) {
      if (!previousQueryRef.current || !queryEqual(previousQueryRef.current as Query, query as Query)) {
        previousQueryRef.current = query;
      }
    } else {
        previousQueryRef.current = null;
    }
  
    return previousQueryRef.current as T;
  }

export function useCollection<T extends DocumentData>(
  ref: Query | CollectionReference | null,
  options?: UseCollectionOptions<T>
) {
  const [data, setData] = useState<T[] | null>(options?.initialData || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const memoizedRef = useMemoizedQuery(ref);

  useEffect(() => {
    if (!memoizedRef) {
      setLoading(false);
      setData(null);
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      memoizedRef,
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
         if (memoizedRef) {
            if ('path' in memoizedRef) {
                path = memoizedRef.path;
            } else {
                 try {
                     const tempColl = collection(memoizedRef.firestore, (memoizedRef as any)._query.path.segments.join('/'));
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
  }, [memoizedRef]);

  return { data, loading, error };
}
