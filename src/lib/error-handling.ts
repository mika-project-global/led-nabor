import { useNotifications } from '../hooks/useNotifications';

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public metadata?: Record<string, unknown>,
    public severity?: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    public retryable?: boolean = false
  ) {
    super(message);
    this.name = 'AppError';
    this.timestamp = new Date();
  }

  public retryCount = 0;
  public lastRetryTime?: Date;

  public timestamp: Date;

  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      metadata: this.metadata,
      retryable: this.retryable,
      retryCount: this.retryCount,
      lastRetryTime: this.lastRetryTime,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }

  public canRetry(): boolean {
    if (!this.retryable || this.retryCount >= 3) {
      return false;
    }

    if (!this.lastRetryTime) {
      return true;
    }

    // Exponential backoff
    const backoff = Math.pow(2, this.retryCount) * 1000;
    const now = new Date();
    return now.getTime() - this.lastRetryTime.getTime() >= backoff;
  }
}

export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    // Analyze error type and set appropriate severity and retryability
    const isNetworkError = error.name === 'NetworkError' || 
      error.message.toLowerCase().includes('network') ||
      error.message.toLowerCase().includes('timeout');

    const severity = isNetworkError ? 'high' : 'medium';
    const retryable = isNetworkError || error.name === 'TimeoutError';

    return new AppError(
      error.message,
      error.name,
      { originalStack: error.stack },
      severity,
      retryable
    );
  }
  
  return new AppError(
    'An unexpected error occurred',
    'UNKNOWN_ERROR',
    { originalError: error },
    'high',
    false
  );
}

export function useErrorHandler() {
  const { showNotification } = useNotifications();

  return async (error: unknown, retryFn?: () => Promise<void>) => {
    const appError = handleError(error);
    
    // Enhanced error logging
    console.error('Application error:', {
      ...appError.toJSON(),
      environment: process.env.NODE_ENV,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });

    // Show user-friendly notification based on severity
    const duration = appError.severity === 'critical' ? 0 : 5000;
    showNotification('error', appError.message, duration);

    // Store error in session storage for error reporting
    const errors = JSON.parse(sessionStorage.getItem('app_errors') || '[]');
    errors.push(appError.toJSON());
    sessionStorage.setItem('app_errors', JSON.stringify(errors.slice(-10)));

    // Handle retries if possible
    if (retryFn && appError.canRetry()) {
      appError.retryCount++;
      appError.lastRetryTime = new Date();

      try {
        await retryFn();
        // If retry succeeds, log recovery
        console.log('Operation recovered after retry:', {
          error: appError.toJSON(),
          retryCount: appError.retryCount
        });
      } catch (retryError) {
        // If retry fails, recursively handle the new error
        return handleError(retryError);
      }
    }

    return appError;
  };
}