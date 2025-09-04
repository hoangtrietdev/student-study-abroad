import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  DocumentData,
  WhereFilterOp
} from 'firebase/firestore';

// Query keys factory for better cache management
export const queryKeys = {
  all: ['firestore'] as const,
  collections: (collectionName: string) => [...queryKeys.all, collectionName] as const,
  document: (collectionName: string, id?: string) => [...queryKeys.collections(collectionName), id] as const,
  user: () => [...queryKeys.all, 'user'] as const,
  roadmapProgress: (userId?: string) => [...queryKeys.all, 'roadmap-progress', userId] as const,
};

// Hook for fetching data from Firestore collections
export function useFirestoreQuery<T extends DocumentData>(
  collectionName: string,
  options?: {
    filters?: Array<{ field: string; operator: WhereFilterOp; value: unknown }>;
    single?: boolean;
    enabled?: boolean;
  }
) {
  const { filters = [], single = false, enabled = true } = options || {};

  return useQuery({
    queryKey: queryKeys.document(collectionName, JSON.stringify(filters)),
    queryFn: async () => {
      const collectionRef = collection(db, collectionName);
      
      if (single && filters.length > 0) {
        // For single document queries with filters
        let q = query(collectionRef);
        filters.forEach(filter => {
          q = query(q, where(filter.field, filter.operator, filter.value));
        });
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          return { id: doc.id, ...doc.data() } as unknown as T;
        }
        return null;
      } else if (single) {
        // This would require a document ID, which isn't provided
        throw new Error('Single document query requires either an ID or filters');
      } else {
        // For collection queries
        let q = query(collectionRef);
        filters.forEach(filter => {
          q = query(q, where(filter.field, filter.operator, filter.value));
        });
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as unknown as T[];
      }
    },
    enabled,
  });
}

// Hook for getting a single document by ID
export function useFirestoreDoc<T extends DocumentData>(
  collectionName: string,
  documentId?: string,
  options?: {
    enabled?: boolean;
  }
) {
  const { enabled = true } = options || {};

  return useQuery({
    queryKey: queryKeys.document(collectionName, documentId),
    queryFn: async () => {
      if (!documentId) return null;
      
      const docRef = doc(db, collectionName, documentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as unknown as T;
      }
      return null;
    },
    enabled: enabled && !!documentId,
  });
}

// Hook for mutations (create, update, delete)
export function useFirestoreMutation<T extends DocumentData>(
  collectionName: string,
  operation: 'create' | 'update' | 'delete',
  options?: {
    onSuccess?: (data: T | void) => void;
    onError?: (error: Error) => void;
    invalidateQueries?: string[];
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const collectionRef = collection(db, collectionName);

      switch (operation) {
        case 'create':
          const docRef = await addDoc(collectionRef, payload);
          const newDoc = await getDoc(docRef);
          return { id: newDoc.id, ...newDoc.data() } as unknown as T;
        
        case 'update':
          const { id, ...updateData } = payload;
          if (!id || typeof id !== 'string') {
            throw new Error('Document ID is required for update operation');
          }
          const docToUpdate = doc(db, collectionName, id);
          await updateDoc(docToUpdate, updateData);
          const updatedDoc = await getDoc(docToUpdate);
          return { id: updatedDoc.id, ...updatedDoc.data() } as unknown as T;
        
        case 'delete':
          const { id: deleteId } = payload;
          if (!deleteId || typeof deleteId !== 'string') {
            throw new Error('Document ID is required for delete operation');
          }
          await deleteDoc(doc(db, collectionName, deleteId));
          return;
        
        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }
    },
    onSuccess: (data) => {
      // Invalidate related queries
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        });
      } else {
        // Default: invalidate all collection queries
        queryClient.invalidateQueries({ queryKey: queryKeys.collections(collectionName) });
      }
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

// Hook for general fetch requests (non-Firebase)
export function useFetch<T>(
  url: string,
  options?: {
    enabled?: boolean;
    fetchOptions?: RequestInit;
    queryKey?: string[];
  }
) {
  const { enabled = true, fetchOptions = {}, queryKey } = options || {};

  return useQuery({
    queryKey: queryKey || ['fetch', url],
    queryFn: async (): Promise<T> => {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
        ...fetchOptions,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    enabled,
  });
}

// Hook for POST mutations with fetch
export function usePostMutation<TData, TVariables>(
  url: string,
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
    invalidateQueries?: string[];
  }
) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(variables),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        });
      }
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}
