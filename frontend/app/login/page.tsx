'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { FcGoogle } from 'react-icons/fc';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import api from '@/lib/api';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, setUser } = useAuthStore();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [googleError, setGoogleError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(emailOrUsername, password);
      router.push('/notes');
    } catch (error) {
      // Error handled by store
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
        router.push('/notes');
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      setGoogleError(
        error.response?.data?.error || 'Failed to sign in with Google'
      );
    }
  };

  const handleGoogleError = () => {
    setGoogleError('Google sign-in was cancelled or failed');
  };

  return (
    <div className='min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-50 px-4'>
      {/* Soft Layered Radial Gradients */}
      <div className='absolute inset-0 -z-10'>
        <div className='absolute w-[600px] h-[600px] bg-purple-300/30 rounded-full top-[-100px] left-[-150px] blur-[200px] animate-floatSlow'></div>
        <div className='absolute w-[500px] h-[500px] bg-pink-300/30 rounded-full top-[200px] right-[-100px] blur-[150px] animate-floatSlowReverse'></div>
        <div className='absolute w-[700px] h-[700px] bg-blue-300/30 rounded-full bottom-[-150px] left-[50px] blur-[250px] animate-floatSlow'></div>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#a1c4fd_0%,_transparent_60%),radial-gradient(circle_at_bottom_right,_#c2e9fb_0%,_transparent_60%),radial-gradient(circle_at_top_right,_#fbc2eb_0%,_transparent_60%),radial-gradient(circle_at_bottom_left,_#a6c1ee_0%,_transparent_60%)] opacity-70'></div>
      </div>
      {/* Floating Orbs */}
      <div className='absolute w-72 h-72 bg-blue-400/20 rounded-full blur-3xl top-20 left-10 animate-floatSlow'></div>
      <div className='absolute w-96 h-96 bg-purple-400/20 rounded-full blur-[100px] bottom-10 right-10 animate-floatSlowReverse'></div>

      <div className='w-full max-w-md relative z-10 animate-fadeInUp'>
        <Link
          href='/'
          className='flex items-center justify-center gap-2 mb-10 transition-transform duration-300 hover:scale-105'
        >
          <Image
            src='/images/batibot_logo-removebg-preview.png' // Make sure this file exists in public/images/logo.png
            alt='Notes App Logo'
            width={100}
            height={100}
            className='object-contain'
          />
          <span className='text-3xl font-extrabold text-gray-900 drop-shadow-md'>
            Notes App
          </span>
        </Link>

        {/* CARD */}
        <div className='bg-white/90 backdrop-blur-xl p-10 rounded-2xl shadow-xl border border-white/40 transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]'>
          <h1 className='text-3xl font-bold mb-6 text-center text-gray-900'>
            Welcome Back
          </h1>

          {(error || googleError) && (
            <div className='mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm animate-shake'>
              {error || googleError}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-5'>
            <div>
              <label className='block text-sm font-medium mb-1 text-gray-900'>
                Email or Username
              </label>
              <input
                type='text'
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 
              focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all'
                placeholder='email@example.com or username'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium mb-1 text-gray-900'>
                Password
              </label>
              <input
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 
              focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all'
                placeholder='••••••••'
                required
              />
            </div>

            <button
              type='submit'
              disabled={isLoading}
              className='w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium shadow-md 
    hover:bg-green-700 transition-colors duration-300 ease-in-out 
    hover:shadow-lg hover:scale-[1.02] disabled:opacity-50'
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className='flex items-center my-6'>
            <div className='flex-1 border-t border-gray-300'></div>
            <span className='px-4 text-sm text-gray-500'>or</span>
            <div className='flex-1 border-t border-gray-300'></div>
          </div>

          <div className='flex justify-center animate-fadeIn'>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme='outline'
              size='large'
              text='signin_with'
              shape='rectangular'
            />
          </div>

          <p className='mt-6 text-center text-sm text-gray-700'>
            Don’t have an account?{' '}
            <Link
              href='/register'
              className='text-blue-600 font-medium hover:underline'
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
