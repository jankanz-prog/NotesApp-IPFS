'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/forgot-password', { email });
      
      setIsSuccess(true);
      
      // In development, show the reset URL
      if (response.data.resetUrl) {
        setResetUrl(response.data.resetUrl);
      }
      
      toast.success('Password reset link sent! Check your email.');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to send reset link';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
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
          </div>

          <div className="auth-card rounded-2xl overflow-hidden">
            <div className="text-center pt-8 pb-6 px-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Check Your Email</h1>
              <p className="text-purple-300/70 text-sm">
                If an account with that email exists, we've sent a password reset link.
              </p>
            </div>

            {resetUrl && (
              <div className="px-8 pb-6">
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <p className="text-xs text-purple-300/60 mb-2">Development Mode - Reset Link:</p>
                  <a 
                    href={resetUrl}
                    className="text-sm text-purple-400 hover:text-purple-300 break-all underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {resetUrl}
                  </a>
                </div>
              </div>
            )}

            <div className="px-8 py-6 text-center" style={{ background: 'rgba(26, 10, 46, 0.5)', borderTop: '1px solid rgba(168, 85, 247, 0.15)' }}>
              <button
                onClick={() => router.push('/login')}
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Forgot Password?</h1>
            <p className="text-purple-300/70 text-sm">
              Enter your email and we'll send you a link to reset your password
            </p>
          </div>

          {error && (
            <div className="mx-8 mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="px-8 pb-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-purple-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          <div className="px-8 py-6 text-center" style={{ background: 'rgba(26, 10, 46, 0.5)', borderTop: '1px solid rgba(168, 85, 247, 0.15)' }}>
            <button
              onClick={() => router.push('/login')}
              className="text-purple-300/70 text-sm flex items-center justify-center gap-2 hover:text-purple-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


