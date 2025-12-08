'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { BookOpen, CheckCircle, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error } = useAuthStore();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const totalSteps = 3;

  useEffect(() => {
    // Calculate password strength
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z\d]/)) strength++;
    setPasswordStrength(strength);
  }, [password]);

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!email) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = 'Invalid email format';
      }
      if (!username) newErrors.username = 'Username is required';
      else if (username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }
    }

    if (currentStep === 2) {
      if (!password) newErrors.password = 'Password is required';
      else if (password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
      else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < totalSteps) {
        setStep(step + 1);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    try {
      await register(email, username, password);
      setShowSuccess(true);
      setTimeout(() => {
        router.push('/notes');
      }, 2000);
    } catch (error) {
      // Error handled by store
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-yellow-500';
    if (passwordStrength <= 3) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-almond-cream via-desert-sand to-tan px-4 py-12">
      <div className="w-full max-w-md animate-scale-in">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 animate-fade-in-down">
          <BookOpen className="w-8 h-8 text-coffee-bean" />
          <span className="text-2xl font-bold gradient-text">Notes App</span>
        </Link>

        {/* Registration Card */}
        <div className="glass rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
          {/* Progress Indicator */}
          <div className="bg-gradient-to-r from-coffee-bean to-toffee-brown px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-almond-cream">Step {step} of {totalSteps}</span>
              <span className="text-sm text-almond-cream/80">{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-almond-cream/20 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-almond-cream rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Success State */}
          {showSuccess ? (
            <div className="p-8 text-center animate-bounce-in">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-coffee-bean mb-2">Account Created!</h2>
              <p className="text-coffee-bean/70">Redirecting to your notes...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-8">
              <h1 className="text-3xl font-bold text-center mb-8 gradient-text">Create Account</h1>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-shake">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Step 1: Email & Username */}
              {step === 1 && (
                <div className="space-y-6 animate-fade-in-right">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-coffee-bean">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors({ ...errors, email: '' });
                      }}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 text-coffee-bean ${
                        errors.email
                          ? 'border-red-500 focus:ring-red-500 animate-shake'
                          : 'border-faded-copper/30 focus:border-coffee-bean focus:ring-coffee-bean'
                      }`}
                      placeholder="you@example.com"
                      required
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 animate-fade-in-down">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-coffee-bean">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setErrors({ ...errors, username: '' });
                      }}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 text-coffee-bean ${
                        errors.username
                          ? 'border-red-500 focus:ring-red-500 animate-shake'
                          : 'border-faded-copper/30 focus:border-coffee-bean focus:ring-coffee-bean'
                      }`}
                      placeholder="johndoe"
                      required
                    />
                    {errors.username && (
                      <p className="mt-1 text-sm text-red-600 animate-fade-in-down">{errors.username}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Password */}
              {step === 2 && (
                <div className="space-y-6 animate-fade-in-right">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-coffee-bean">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setErrors({ ...errors, password: '' });
                        }}
                        className={`w-full px-4 py-3 pr-12 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 text-coffee-bean ${
                          errors.password
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
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600 animate-fade-in-down">{errors.password}</p>
                    )}
                    {password && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                passwordStrength >= level ? getPasswordStrengthColor() : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-coffee-bean/60">
                          Strength: {passwordStrength === 0 ? 'None' : passwordStrength === 1 ? 'Weak' : passwordStrength === 2 ? 'Fair' : passwordStrength === 3 ? 'Good' : 'Strong'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-coffee-bean">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setErrors({ ...errors, confirmPassword: '' });
                        }}
                        className={`w-full px-4 py-3 pr-12 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 text-coffee-bean ${
                          errors.confirmPassword
                            ? 'border-red-500 focus:ring-red-500 animate-shake'
                            : 'border-faded-copper/30 focus:border-coffee-bean focus:ring-coffee-bean'
                        }`}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-coffee-bean/60 hover:text-coffee-bean transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600 animate-fade-in-down">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <div className="space-y-6 animate-fade-in-right">
                  <div className="bg-almond-cream/50 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-sm text-coffee-bean/60">Email</p>
                      <p className="text-coffee-bean font-medium">{email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-coffee-bean/60">Username</p>
                      <p className="text-coffee-bean font-medium">{username}</p>
                    </div>
                    <div>
                      <p className="text-sm text-coffee-bean/60">Password</p>
                      <p className="text-coffee-bean font-medium">••••••••</p>
                    </div>
                  </div>
                  <p className="text-sm text-center text-coffee-bean/70">
                    Review your information and click "Create Account" to finish.
                  </p>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-8">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 px-4 py-3 border-2 border-coffee-bean text-coffee-bean rounded-lg hover:bg-coffee-bean hover:text-almond-cream transition-all duration-300 magnetic"
                  >
                    Back
                  </button>
                )}
                {step < totalSteps ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 px-4 py-3 bg-coffee-bean text-almond-cream rounded-lg hover:bg-toffee-brown transition-all duration-300 shadow-lg hover:shadow-xl magnetic ripple-effect"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-coffee-bean text-almond-cream rounded-lg hover:bg-toffee-brown transition-all duration-300 shadow-lg hover:shadow-xl magnetic ripple-effect disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-almond-cream border-t-transparent rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Footer Links */}
          {!showSuccess && (
            <div className="px-8 pb-6 text-center">
              <p className="text-sm text-coffee-bean/70">
                Already have an account?{' '}
                <Link href="/login" className="text-coffee-bean font-semibold hover:text-toffee-brown transition-colors underline">
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
