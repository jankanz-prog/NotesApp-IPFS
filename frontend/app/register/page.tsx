'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Eye, EyeOff, Lock, Mail, User, Loader2, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

export default function RegisterPage() {
  const router = useRouter();
  const { register, user, isLoading: authLoading, initializeAuth } = useAuthStore();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (user) {
      router.push('/notes');
    }
  }, [user, router]);

  const getPasswordStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength();

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength === 2) return 'bg-yellow-500';
    if (passwordStrength === 3) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength === 2) return 'Fair';
    if (passwordStrength === 3) return 'Good';
    return 'Strong';
  };

  const validateStep = () => {
    if (step === 1) {
      if (!email || !username) {
        setError('Please fill in all fields');
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Please enter a valid email');
        return false;
      }
      if (username.length < 3) {
        setError('Username must be at least 3 characters');
        return false;
      }
    }
    if (step === 2) {
      if (!password || !confirmPassword) {
        setError('Please fill in all fields');
        return false;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        return false;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setIsLoading(true);
    try {
      await register(email, username, password);
      setShowSuccess(true);
      toast.success('Account created successfully!');
      setTimeout(() => {
        router.push('/notes');
      }, 2000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Registration failed';
      setError(errorMsg);
      toast.error(errorMsg);
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async () => {
    toast.success('Google sign-up successful!');
    router.push('/notes');
  };

  const handleGoogleError = () => {
    toast.error('Google sign-up failed');
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a0a2e] via-[#16082a] to-[#1a0a2e] px-4 py-8">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Account Created!</h1>
          <p className="text-purple-300/70">Redirecting to your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '1rem',
      backgroundImage: 'linear-gradient(to bottom right, #1a0a2e, #16082a, #1a0a2e)',
    }}>
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

        <div 
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(42, 18, 69, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            boxShadow: '0 25px 50px -12px rgba(123, 44, 191, 0.25)',
          }}
        >
          <div className="px-8 pt-6">
            <div className="flex justify-between mb-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    s < step ? 'bg-purple-500 text-white' :
                    s === step ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                    'bg-[#1a0a2e]/60 text-purple-300/50'
                  }`}>
                    {s < step ? <CheckCircle className="w-4 h-4" /> : s}
                  </div>
                  {s < 3 && (
                    <div className={`w-16 sm:w-24 h-1 mx-2 rounded ${
                      s < step ? 'bg-purple-500' : 'bg-[#1a0a2e]/60'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center pt-4 pb-4 px-8">
            <h1 className="text-2xl font-bold text-white mb-1">Create Account</h1>
            <p className="text-purple-300/70 text-sm">
              {step === 1 && 'Enter your email and username'}
              {step === 2 && 'Create a secure password'}
              {step === 3 && 'Review your information'}
            </p>
          </div>

          {error && (
            <div className="mx-8 mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <div className="px-8 pb-6 space-y-5">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-purple-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                      style={{
                        background: 'rgba(26, 10, 46, 0.6)',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                      }}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">Username</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-purple-400" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                      style={{
                        background: 'rgba(26, 10, 46, 0.6)',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                      }}
                      placeholder="johndoe"
                    />
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-purple-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                      style={{
                        background: 'rgba(26, 10, 46, 0.6)',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                      }}
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-all ${
                              passwordStrength >= level ? getStrengthColor() : 'bg-[#1a0a2e]/60'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-purple-300/60">Strength: {getStrengthText()}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-purple-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 bg-[#1a0a2e]/60 border border-purple-500/30 rounded-xl text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="bg-[#1a0a2e]/40 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-purple-300/60 text-sm">Email</span>
                    <span className="text-white text-sm">{email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-300/60 text-sm">Username</span>
                    <span className="text-white text-sm">{username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-300/60 text-sm">Password</span>
                    <span className="text-white text-sm">••••••••</span>
                  </div>
                </div>
                <p className="text-purple-300/50 text-xs text-center">
                  By creating an account, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-3 bg-[#1a0a2e]/60 border border-purple-500/30 text-purple-300 font-semibold rounded-xl hover:bg-[#1a0a2e]/80 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading || authLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {(isLoading || authLoading) ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              )}
            </div>

            {step === 1 && (
              <>
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
                    text="signup_with"
                    shape="rectangular"
                  />
                </div>
              </>
            )}
          </div>

          <div className="px-8 py-6 bg-[#1a0a2e]/40 border-t border-purple-500/10 text-center">
            <p className="text-purple-300/70 text-sm">
              Already have an account?{' '}
              <a href="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}