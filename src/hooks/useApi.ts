import { useState, useEffect } from 'react';
import { ApiResponse, PaginatedResponse } from '../types';

// Generic hook for API calls
export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall();
        
        if (result.error) {
          setError(result.error);
        } else {
          setData(result.data || null);
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: () => fetchData() };
}

// Hook for paginated API calls
export function usePaginatedApi<T>(
  apiCall: (params: any) => Promise<PaginatedResponse<T>>,
  initialParams: any = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [params, setParams] = useState(initialParams);

  const fetchData = async (newParams?: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentParams = newParams || params;
      const result = await apiCall(currentParams);
      
      setData(result.data);
      setPagination({
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateParams = (newParams: any) => {
    const updatedParams = { ...params, ...newParams };
    setParams(updatedParams);
    fetchData(updatedParams);
  };

  const goToPage = (page: number) => {
    updateParams({ page });
  };

  const changeLimit = (limit: number) => {
    updateParams({ limit, page: 1 });
  };

  return {
    data,
    loading,
    error,
    pagination,
    params,
    updateParams,
    goToPage,
    changeLimit,
    refetch: () => fetchData()
  };
}

// Hook for mutations (create, update, delete)
export function useMutation<T, P = any>(
  mutationFn: (params: P) => Promise<ApiResponse<T>>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const mutate = async (params: P): Promise<ApiResponse<T>> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await mutationFn(params);
      
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.data || null);
      }
      
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  return {
    mutate,
    loading,
    error,
    data,
    reset
  };
}