import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNotifications } from '../hooks/useNotifications';
import { useTranslation } from 'react-i18next';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotifications();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const params = new URLSearchParams(location.search);
      const errorParam = params.get('error');
      const errorCode = params.get('error_code');
      const errorDescription = params.get('error_description');

      if (errorParam || errorCode) {
        setHasError(true);
        setIsVerifying(false);
        if (errorCode === 'otp_expired') {
          setError(t('auth.reset_link_expired'));
        } else if (errorDescription) {
          setError(errorDescription);
        } else {
          setError(t('auth.reset_link_invalid'));
        }
        return;
      }

      let retries = 0;
      const maxRetries = 10;

      const waitForSession = async () => {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) {
            console.error('Error getting session:', error);
            setHasError(true);
            setError(error.message || t('auth.reset_link_invalid'));
            setIsVerifying(false);
            return;
          }

          if (session) {
            console.log('Session found:', session.user.email);
            setIsVerifying(false);
            return;
          }

          retries++;
          if (retries < maxRetries) {
            setTimeout(waitForSession, 500);
          } else {
            console.error('Session not found after retries');
            setHasError(true);
            setError(t('auth.reset_link_invalid'));
            setIsVerifying(false);
          }
        } catch (err: any) {
          console.error('Error checking session:', err);
          setHasError(true);
          setError(err.message || t('auth.error_occurred'));
          setIsVerifying(false);
        }
      };

      setTimeout(waitForSession, 100);
    };

    checkSession();
  }, [location, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (password !== confirmPassword) {
        throw new Error(t('auth.passwords_dont_match'));
      }

      if (password.length < 6) {
        throw new Error(t('auth.password_too_short'));
      }

      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      showNotification('success', t('auth.password_updated'));
      navigate('/auth');
    } catch (error: any) {
      console.error('Reset password error:', error);
      const errorMsg = error.message || t('auth.error_occurred');
      setError(errorMsg);
      showNotification('error', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 mb-4">
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              {t('auth.verifying_reset_link')}
            </h1>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t('auth.reset_link_error')}
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/auth')}
              className="w-full bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 transition-colors"
            >
              {t('auth.back_to_login')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          {t('auth.reset_password_title')}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.new_password')}
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
              disabled={isLoading}
              autoComplete="new-password"
              placeholder={t('auth.password_min_length')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.confirm_new_password')}
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 transition-all hover:shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {t('auth.updating')}
              </div>
            ) : (
              t('auth.update_password')
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/auth')}
            className="w-full text-center text-sm text-cyan-600 hover:text-cyan-700 transition-colors"
            disabled={isLoading}
          >
            {t('auth.back_to_login')}
          </button>
        </form>
      </div>
    </div>
  );
}
