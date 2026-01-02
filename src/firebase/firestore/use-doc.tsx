
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  onSnapshot,
  type DocumentReference,
  type DocumentData,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';


interface UseDocOptions<T> {
  initialData?: T;
}

function useMemoizedDocRef<T extends DocumentReference | null>(docRef: T): T {
    const previousDocRefRef = useRef<T | null>(null);

    if (docRef) {
        if (!previousDocRefRef.current || previousDocRefRef.current.path !== docRef.path) {
            previousDocRefRef.current = docRef;
        }
    } else {
        previousDocRefRef.current = null;
    }

    return previousDocRefRef.current as T;
}


export function useDoc<T extends DocumentData>(
  ref: DocumentReference | null,
  options?: UseDocOptions<T>
) {
  const [data, setData] = useState<T | null>(options?.initialData || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const memoizedRef = useMemoizedDocRef(ref);

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
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        const permissionError = new FirestorePermissionError({
          path: memoizedRef.path,
          operation: 'get',
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
