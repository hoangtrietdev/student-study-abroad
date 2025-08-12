import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase';

// Query keys factory for better cache management
export const queryKeys = {
  all: ['supabase'] as const,
  tables: (table: string) => [...queryKeys.all, table] as const,
  table: (table: string, id?: string | number) => [...queryKeys.tables(table), id] as const,
  user: () => [...queryKeys.all, 'user'] as const,
  roadmapProgress: (userId?: string) => [...queryKeys.all, 'roadmap-progress', userId] as const,
};

// Hook for fetching data from Supabase tables
export function useSupabaseQuery<T>(
  table: string,
  options?: {
    select?: string;
    filter?: Record<string, unknown>;
    single?: boolean;
    enabled?: boolean;
  }
) {
  const { select = '*', filter = {}, single = false, enabled = true } = options || {};

  return useQuery({
    queryKey: queryKeys.table(table, JSON.stringify(filter)),
    queryFn: async () => {
      const supabase = createClient();
      let query = supabase.from(table).select(select);

      // Apply filters
      Object.entries(filter).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      if (single) {
        const { data, error } = await query.single();
        if (error) throw error;
        return data as T;
      } else {
        const { data, error } = await query;
        if (error) throw error;
        return data as T[];
      }
    },
    enabled,
  });
}

// Hook for mutations (insert, update, delete)
export function useSupabaseMutation<T>(
  table: string,
  operation: 'insert' | 'update' | 'delete' | 'upsert',
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    invalidateQueries?: string[];
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const supabase = createClient();
      let query;

      switch (operation) {
        case 'insert':
          query = supabase.from(table).insert(payload).select();
          break;
        case 'update':
          const { id, ...updateData } = payload;
          query = supabase.from(table).update(updateData).eq('id', id).select();
          break;
        case 'upsert':
          query = supabase.from(table).upsert(payload).select();
          break;
        case 'delete':
          query = supabase.from(table).delete().eq('id', payload.id);
          break;
        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as T;
    },
    onSuccess: (data) => {
      // Invalidate related queries
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        });
      } else {
        // Default: invalidate all table queries
        queryClient.invalidateQueries({ queryKey: queryKeys.tables(table) });
      }
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

// Hook for fetching current user
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.user(),
    queryFn: async () => {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for general fetch requests (non-Supabase)
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
