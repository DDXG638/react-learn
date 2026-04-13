import { useState, useEffect, useCallback, useRef } from 'react';

interface UseRequestOptions<T> {
  manual?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  onFinally?: () => void;
}

interface UseRequestState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useRequest<T>(
  requestFn: () => Promise<T>,
  options: UseRequestOptions<T> = {}
) {
  const { manual = false, onSuccess, onError, onFinally } = options;
  const [state, setState] = useState<UseRequestState<T>>({
    data: null,
    loading: false,
    error: null,
  });
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await requestFn();
      if (mountedRef.current) {
        setState({ data: result, loading: false, error: null });
        onSuccess?.(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setState({ data: null, loading: false, error });
        onError?.(error);
      }
    } finally {
      if (mountedRef.current) {
        onFinally?.();
      }
    }
  }, [requestFn, onSuccess, onError, onFinally]);

  useEffect(() => {
    if (!manual) {
      execute();
    }
  }, [manual, execute]);

  return { ...state, execute };
}