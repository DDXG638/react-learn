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
  const [state, setState] = useState<UseRequestState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  // 使用 ref 存储配置，避免依赖变化导致无限循环
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // 追踪组件是否已卸载
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
        optionsRef.current.onSuccess?.(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setState({ data: null, loading: false, error });
        optionsRef.current.onError?.(error);
      }
    } finally {
      if (mountedRef.current) {
        optionsRef.current.onFinally?.();
      }
    }
  }, [requestFn]);

  useEffect(() => {
    if (!optionsRef.current.manual) {
      execute();
    }
  }, [execute]);

  return { ...state, execute };
}