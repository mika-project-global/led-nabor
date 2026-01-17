import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { trackEvent } from '../lib/analytics';
import { AppError, handleError } from '../lib/error-handling';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const appError = handleError(error);
    this.setState({ 
      error: appError,
      errorInfo 
    });
    this.logError(appError, errorInfo);
  }

  private logError(error: AppError, errorInfo: ErrorInfo) {
    trackEvent('error', {
      props: {
        type: 'react_error',
        message: error.message,
        code: error.code,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent
      }
    });

    // Сохраняем ошибку для анализа
    localStorage.setItem('last_error', JSON.stringify({
      error: error.toString(),
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    }));
  }

  private resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    // Плавное восстановление
    try {
      // Очищаем кэш компонента
      localStorage.removeItem('last_error');
      
      // Пробуем восстановить состояние
      this.forceUpdate();
    } catch (e) {
      // Если не удалось восстановиться, перезагружаем страницу
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50" role="alert" aria-live="assertive">
          <div className="max-w-md w-full mx-auto p-6 text-center" role="alert">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-red-600" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Что-то пошло не так
            </h1>
            <p className="text-gray-600 mb-6">
              Произошла ошибка при загрузке страницы. Пожалуйста, попробуйте обновить страницу.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className="mt-4 p-4 bg-gray-100 rounded-lg text-left overflow-auto text-sm" tabIndex={0}>
                <code className="text-red-600">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </code>
              </pre>
            )}
            <button
              onClick={this.resetError}
              className="inline-flex items-center gap-2 bg-cyan-500 text-white px-6 py-2 rounded-lg hover:bg-cyan-600 transition-colors"
              aria-label="Обновить страницу"
              tabIndex={0}
              autoFocus
            >
              <RefreshCw size={20} />
              Обновить страницу
            </button>
            <p className="mt-4 text-sm text-gray-500">
              Если проблема повторяется, пожалуйста,{' '}
              <a href="/support" className="text-cyan-600 hover:text-cyan-700">
                свяжитесь с поддержкой
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}