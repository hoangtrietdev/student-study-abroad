// Debounce helper function with retry capability
export function createDebouncedFunction<T>(
  fn: (...args: T[]) => Promise<void>,
  wait: number = 2000,
  maxRetries: number = 3,
  retryDelay: number = 3000
) {
  let timeout: NodeJS.Timeout | null = null;
  let retryCount = 0;

  const executeWithRetry = async (...args: T[]) => {
    try {
      await fn(...args);
      retryCount = 0; // Reset retry count on success
    } catch (error) {
      console.error(`Failed to execute. Retry ${retryCount + 1}/${maxRetries}`, error);
      if (retryCount < maxRetries) {
        retryCount++;
        return new Promise((resolve) => {
          setTimeout(() => {
            executeWithRetry(...args).then(resolve);
          }, retryDelay);
        });
      } else {
        retryCount = 0; // Reset retry count after max retries
        throw error;
      }
    }
  };

  return (...args: T[]): void => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      executeWithRetry(...args).catch(console.error);
    }, wait);
  };
};
