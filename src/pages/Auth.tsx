import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithFacebook, getCurrentUser, resetPassword } from '../lib/supabase-auth';
import { useNotifications } from '../hooks/useNotifications';
import { supabase } from '../lib/supabase';
import { Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotifications();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);


  const handleSocialSignIn = async (provider: 'google' | 'facebook') => {
    setIsLoading(true);
    const providerName = provider === 'google' ? 'Google' : 'Facebook';
    showNotification('info', t('auth.connecting_to', { provider: providerName }));

    try {
      const { error } = await (
        provider === 'google' ? signInWithGoogle() : signInWithFacebook()
      );

      if (error) {
        console.error(`❌ Ошибка входа через ${provider}:`, error);
        showNotification('error', error.message);
        return;
      }

      console.log(`✅ Успешное подключение к ${provider}`);
    } catch (error) {
      console.error(`❌ Ошибка входа через ${provider}:`, error);
      showNotification('error', t('auth.error_occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    console.log('🔍 Инициируем вход через Google...');
    setIsLoading(true);
    showNotification('info', 'Переадресация на страницу входа Google...');
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
      console.log('✅ Успешный вход через Google');
    } catch (error) {
      console.error('❌ Ошибка входа через Google:', error);
      showNotification('error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp && password !== confirmPassword) {
        throw new Error(t('auth.passwords_dont_match'));
      }

      const { data, error } = isSignUp
        ? await signUpWithEmail(email, password)
        : await signInWithEmail(email, password);

      console.log('Sign in/up response:', { data, error, email });

      if (error) throw error;

      if (isSignUp) {
        showNotification('success', t('auth.registration_successful'));
        setIsSignUp(false);
      } else {
        navigate('/profile');
      }
    } catch (error: any) {
      console.error('Auth error details:', {
        message: error?.message,
        status: error?.status,
        error
      });

      let errorMessage = t('auth.error_occurred');

      if (error?.message) {
        const msg = error.message.toLowerCase();
        console.log('Error message (lowercase):', msg);

        if (msg.includes('invalid') && (msg.includes('credentials') || msg.includes('password') || msg.includes('email') || msg.includes('login'))) {
          errorMessage = t('auth.invalid_credentials');
        } else if (msg.includes('email not confirmed') || msg.includes('confirmation')) {
          errorMessage = t('auth.email_not_confirmed');
        } else if (msg.includes('user not found') || msg.includes('no user')) {
          errorMessage = t('auth.user_not_found');
        } else if (msg.includes('too many') || msg.includes('rate limit')) {
          errorMessage = t('auth.too_many_requests');
        } else if (msg.includes('network') || msg.includes('fetch')) {
          errorMessage = t('auth.network_error');
        } else {
          errorMessage = error.message;
        }
      }

      showNotification('error', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      showNotification('error', t('auth.enter_email_for_reset'));
      setError(t('auth.enter_email_for_reset'));
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const { error } = await resetPassword(email);
      if (error) throw error;

      showNotification('success', t('auth.reset_password_sent'));
      setShowForgotPassword(false);
    } catch (error: any) {
      console.error('Reset password error:', error);
      const errorMsg = error.message || t('auth.reset_password_error');
      showNotification('error', errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔍 Auth.tsx загружен, текущий путь:', location.pathname);

    const clearAuthData = () => {
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('supabase.auth.refreshToken');
      localStorage.removeItem('supabase.auth.expires_at');
      localStorage.removeItem('supabase.auth.provider');
    };

    const checkSession = async (skipRedirect = false) => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('📡 Проверка текущей сессии:', session);

        if (error) {
          if (error.message.includes('refresh_token_not_found')) {
            clearAuthData();
            if (!skipRedirect) {
              navigate('/auth');
            }
            return;
          }
          throw error;
        }

        if (session?.user) {
          console.log('✅ Сессия найдена! Перенаправляем в профиль...');
          navigate('/profile');
        } else {
          console.log('⚠️ Сессия не найдена');
          clearAuthData();
          if (!skipRedirect) {
            navigate('/auth');
          }
        }
      } catch (error) {
        console.error('❌ Ошибка получения сессии:', error);
        showNotification('error', t('auth.error_occurred'));
        navigate('/auth');
      }
    };

    const handleCallback = async () => {
      console.log('🔍 Обрабатываем callback аутентификации...');
      const params = new URLSearchParams(location.search || location.hash.slice(1));
      
      const authError = params.get('error');
      const errorDescription = params.get('error_description');
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      const code = params.get('code');
      const id_token = params.get('id_token');

      console.log('🔍 Данные из URL:', {
        error: authError,
        errorDescription,
        access_token,
        refresh_token,
        hasCode: !!code,
        hasIdToken: !!id_token
      });

      if (authError) {
        console.error('❌ Ошибка аутентификации:', authError, errorDescription);
        showNotification('error', errorDescription || authError);
        navigate('/auth');
      } else if (access_token || refresh_token) {
        console.log('✅ Токены найдены! Сохраняем...');
        if (access_token) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token: refresh_token || null
          });
          if (sessionError) {
            console.error('❌ Ошибка установки сессии:', sessionError);
            showNotification('error', t('auth.session_error'));
            return;
          }
        }
        navigate('/profile');
      } else {
        console.log('⚠️ Проверяем сессию...');
        checkSession();
      }
    };

    if (location.pathname === '/auth/v1/callback') {
      handleCallback();
    } else {
      checkSession(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Состояние аутентификации изменилось:', event, session);
      if (event === 'SIGNED_IN' && session?.access_token) {
        console.log('✅ Пользователь вошел, перенаправляем в профиль...');
        navigate('/profile');
      } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        console.log('⚠️ Пользователь вышел или удален');
        clearAuthData();
        navigate('/auth');
      } 
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location, showNotification]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          {isSignUp ? t('auth.register_title') : t('auth.login_title')}
        </h1>

        {location.pathname === '/auth/v1/callback' && (
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {/* Primary Social Login Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => handleSocialSignIn('google')}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg border transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            <img src="https://www.google.com/favicon.ico" alt="" className="w-5 h-5" />
            {t('auth.sign_in_with_google')}
          </button>
          
          <button
            onClick={() => handleSocialSignIn('facebook')}
            className="w-full flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#1874EA] text-white px-6 py-3 rounded-lg transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            <img src="https://www.facebook.com/favicon.ico" alt="" className="w-5 h-5" />
            {t('auth.sign_in_with_facebook')}
          </button>
        </div>

        {/* Email Login Toggle Button */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">{t('auth.or')}</span>
          </div>
        </div>

        <button
          onClick={() => setShowEmailForm(!showEmailForm)}
          className="w-full flex items-center justify-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Mail size={20} />
          {t('auth.sign_in_with_email')}
        </button>

        <div className={`mt-6 overflow-hidden transition-all duration-300 ${
          showEmailForm ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.email')}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.password')}
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                disabled={isLoading}
                autoComplete={isSignUp ? "new-password" : "current-password"}
              />
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.confirm_password')}
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
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 transition-all hover:shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div>
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {isSignUp ? t('auth.registering') : t('auth.signing_in')}
                  </div>
                </div>
              ) : (
                isSignUp ? t('auth.register') : t('auth.sign_in')
              )}
            </button>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setPassword('');
                  setConfirmPassword('');
                  setError(null);
                }}
                className="text-sm text-cyan-600 hover:text-cyan-700 transition-colors"
                disabled={isLoading}
              >
                {isSignUp ? t('auth.already_have_account') : t('auth.no_account')}
              </button>

              {!isSignUp && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-gray-600 hover:text-gray-700 transition-colors"
                  disabled={isLoading}
                >
                  {t('auth.forgot_password')}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}