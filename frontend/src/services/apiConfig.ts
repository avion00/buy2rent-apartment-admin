import { AxiosInstance } from 'axios';

// Export the configured axios instance for reuse
export const configureAxios = (axiosInstance: AxiosInstance) => {
  // Add custom retry logic
  axiosInstance.interceptors.response.use(
    response => response,
    async error => {
      const config = error.config;
      
      // Check if we should retry
      if (!config || !config.retry) {
        config.retry = { count: 0, maxRetries: 3 };
      }
      
      const { count, maxRetries } = config.retry;
      
      // Retry on network errors or 5xx errors
      const shouldRetry = 
        count < maxRetries && 
        (!error.response || error.response.status >= 500);
      
      if (shouldRetry) {
        config.retry.count += 1;
        
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, count), 10000);
        console.log(`Retrying request (attempt ${count + 1}/${maxRetries})...`, config.url);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return axiosInstance(config);
      }
      
      return Promise.reject(error);
    }
  );

  // Add request timing for performance monitoring
  axiosInstance.interceptors.request.use(
    (config: any) => {
      config.metadata = { startTime: new Date().getTime() };
      return config;
    },
    (error: any) => {
      return Promise.reject(error);
    }
  );

  // Log response times
  axiosInstance.interceptors.response.use(
    (response: any) => {
      const endTime = new Date().getTime();
      const duration = endTime - response.config.metadata?.startTime;
      if (duration > 1000) {
        console.warn(`Slow API call: ${response.config.url} took ${duration}ms`);
      }
      return response;
    },
    (error: any) => {
      if (error.config?.metadata) {
        const endTime = new Date().getTime();
        const duration = endTime - error.config.metadata.startTime;
        console.error(`Failed API call: ${error.config.url} after ${duration}ms`);
      }
      return Promise.reject(error);
    }
  );
};

// Utility function for parallel requests with progress tracking
export const parallelRequests = async <T,>(
  requests: Array<() => Promise<T>>,
  onProgress?: (completed: number, total: number) => void
): Promise<T[]> => {
  let completed = 0;
  const total = requests.length;
  
  const results = await Promise.all(
    requests.map(async (request) => {
      const result = await request();
      completed++;
      onProgress?.(completed, total);
      return result;
    })
  );
  
  return results;
};

// Debounced request helper for search/filter operations
export const createDebouncedRequest = <T extends (...args: any[]) => any>(
  func: T,
  delay: number = 300
): T & { cancel: () => void } => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  const debounced = (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          const result = await func(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  };
  
  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
  
  return debounced as T & { cancel: () => void };
};
