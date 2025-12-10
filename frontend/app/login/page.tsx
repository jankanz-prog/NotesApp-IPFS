'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { BookOpen, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import api from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, setUser } = useAuthStore();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!emailOrUsername) newErrors.emailOrUsername = 'Email or username is required';
    if (!password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setFieldErrors({});
    try {
      await login(emailOrUsername, password);
      router.push('/notes');
    } catch (error) {
      // Error handled by store
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      setGoogleError('');
      const response = await api.post('/auth/google', {
        credential: credentialResponse.credential,
      });

      if (response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        router.push('/notes');
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      setGoogleError(error.response?.data?.error || 'Failed to sign in with Google');
    }
  };

  const handleGoogleError = () => {
    setGoogleError('Google sign-in was cancelled or failed');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-almond-cream via-desert-sand to-tan px-4 py-12">
      <div className="w-full max-w-md animate-scale-in">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 animate-fade-in-down group">
          <div className="relative">
            <BookOpen className="w-8 h-8 text-coffee-bean group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute inset-0 bg-coffee-bean/20 rounded-full blur-md animate-pulse-slow" />
          </div>
          <span className="text-2xl font-bold gradient-text">Notes App</span>
        </Link>

        {/* Login Card */}
        <div className="glass rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-center mb-8 gradient-text animate-fade-in-down">Welcome Back</h1>

            {/* Error Messages */}
            {(error || googleError) && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error || googleError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email/Username Input */}
              <div>
                <label className="block text-sm font-medium mb-2 text-coffee-bean">Email or Username</label>
                <input
                  type="text"
                  value={emailOrUsername}
                  onChange={(e) => {
                    setEmailOrUsername(e.target.value);
                    setFieldErrors({ ...fieldErrors, emailOrUsername: '' });
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 text-coffee-bean ${
                    fieldErrors.emailOrUsername
                      ? 'border-red-500 focus:ring-red-500 animate-shake'
                      : 'border-faded-copper/30 focus:border-coffee-bean focus:ring-coffee-bean'
                  }`}
                  placeholder="email@example.com or username"
                  required
                />
                {fieldErrors.emailOrUsername && (
                  <p className="mt-1 text-sm text-red-600 animate-fade-in-down">{fieldErrors.emailOrUsername}</p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium mb-2 text-coffee-bean">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFieldErrors({ ...fieldErrors, password: '' });
                    }}
                    className={`w-full px-4 py-3 pr-12 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 text-coffee-bean ${
                      fieldErrors.password
                        ? 'border-red-500 focus:ring-red-500 animate-shake'
                        : 'border-faded-copper/30 focus:border-coffee-bean focus:ring-coffee-bean'
                    }`}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-coffee-bean/60 hover:text-coffee-bean transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-1 text-sm text-red-600 animate-fade-in-down">{fieldErrors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-coffee-bean border-faded-copper/30 rounded focus:ring-coffee-bean cursor-pointer"
                  />
                  <span className="text-sm text-coffee-bean group-hover:text-toffee-brown transition-colors">
                    Remember me
                  </span>
                </label>
                <Link
                  href="#"
                  className="text-sm text-coffee-bean hover:text-toffee-brown transition-colors underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-coffee-bean text-almond-cream rounded-lg hover:bg-toffee-brown transition-all duration-300 shadow-lg hover:shadow-xl magnetic ripple-effect disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-faded-copper/30"></div>
              <span className="px-4 text-sm text-coffee-bean/60">or</span>
              <div className="flex-1 border-t border-faded-copper/30"></div>
            </div>

            {/* Google Sign In */}
            <div className="flex justify-center animate-fade-in-up">
              <div className="transform hover:scale-105 transition-transform duration-300">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                />
              </div>
            </div>

            {/* Sign Up Link */}
            <p className="mt-6 text-center text-sm text-coffee-bean/70">
              Don't have an account?{' '}
              <Link href="/register" className="text-coffee-bean font-semibold hover:text-toffee-brown transition-colors underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
