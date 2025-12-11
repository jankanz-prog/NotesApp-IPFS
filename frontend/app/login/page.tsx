'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import api from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isLoading: authLoading, initializeAuth, setUser } = useAuthStore();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleError, setGoogleError] = useState('');

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (user) {
      router.push('/notes');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!emailOrUsername || !password) {
      setError('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await login(emailOrUsername, password);
      toast.success('Login successful!');
      router.push('/notes');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Login failed';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    try {
      setGoogleError('');
      const response = await api.post('/auth/google', {
        credential: credentialResponse.credential,
      });

      if (response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        toast.success('Google login successful!');
        router.push('/notes');
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      const errorMsg = error.response?.data?.error || 'Failed to sign in with Google';
      setGoogleError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google sign-in failed');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center justify-center gap-2">
            <BookOpen className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold gradient-text">
              NotesChain
            </span>
          </a>
          <p className="text-purple-300/60 text-sm mt-1">Decentralized Note Taking</p>
        </div>

        <div className="auth-card rounded-2xl overflow-hidden">
          <div className="text-center pt-8 pb-6 px-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-purple-300/70 text-sm">Sign in to continue to your notes</p>
          </div>

          {(error || googleError) && (
            <div className="mx-8 mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm text-center">{error || googleError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="px-8 pb-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Email or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-purple-400" />
                </div>
                <input
                  type="text"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  className="auth-input w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none transition-all"
                  placeholder="email@example.com or username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-purple-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input w-full pl-12 pr-12 py-3 rounded-xl focus:outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-500 focus:ring-purple-500/50"
                  style={{
                    background: 'rgba(26, 10, 46, 0.6)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                  }}
                />
                <span className="text-sm text-purple-300/80">Remember me</span>
              </label>
              <a href="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading || authLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {(isLoading || authLoading) ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-purple-500/20"></div>
              <span className="text-purple-300/50 text-sm">or</span>
              <div className="flex-1 h-px bg-purple-500/20"></div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                size="large"
                text="signin_with"
                shape="rectangular"
              />
            </div>
          </form>

          <div className="px-8 py-6 text-center" style={{ background: 'rgba(26, 10, 46, 0.5)', borderTop: '1px solid rgba(168, 85, 247, 0.15)' }}>
            <p className="text-purple-300/70 text-sm">
              Do not have an account?{' '}
              <a href="/register" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
