'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { FcGoogle } from 'react-icons/fc';
import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(email, username, password);
      router.push('/notes');
    } catch (error) {
      // Error handled by store
    }
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

      {/* Sign Up Card */}
      <div className='w-full max-w-md relative z-10 animate-fadeInUp'>
        <Link
          href='/'
          className='flex items-center justify-center gap-2 mb-10 transition-transform duration-300 hover:scale-105'
        >
          <Image
            src='/images/batibot_logo-removebg-preview.png'
            alt='Notes App Logo'
            width={100}
            height={100}
            className='object-contain'
          />
          <span className='text-3xl font-extrabold text-gray-900 drop-shadow-md'>
            Notes App
          </span>
        </Link>

        <div className='bg-white/90 backdrop-blur-xl p-10 rounded-2xl shadow-xl border border-white/40 transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]'>
          <h1 className='text-3xl font-bold mb-6 text-center text-gray-900'>
            Create Account
          </h1>

          {error && (
            <div className='mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm animate-shake'>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-5'>
            <div>
              <label className='block text-sm font-medium mb-1 text-gray-900'>
                Username
              </label>
              <input
                type='text'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 transition-all'
                placeholder='johndoe'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium mb-1 text-gray-900'>
                Email
              </label>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 transition-all'
                placeholder='you@example.com'
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
                className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 transition-all'
                placeholder='••••••••'
                required
                minLength={6}
              />
            </div>

            <button
              type='submit'
              disabled={isLoading}
              className='w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium shadow-md 
    hover:bg-green-700 transition-colors duration-300 ease-in-out 
    hover:shadow-lg hover:scale-[1.02] disabled:opacity-50'
            >
              {isLoading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>

          <div className='flex items-center my-6'>
            <div className='flex-1 border-t border-gray-300'></div>
            <span className='px-4 text-sm text-gray-500'>or</span>
            <div className='flex-1 border-t border-gray-300'></div>
          </div>

          <button
            type='button'
            onClick={() => console.log('Google sign-in clicked')}
            className='w-full flex items-center justify-center gap-3 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700 font-medium'
          >
            <FcGoogle className='w-5 h-5' />
            Sign up with Google
          </button>

          <p className='mt-6 text-center text-sm text-gray-700'>
            Already have an account?{' '}
            <Link
              href='/login'
              className='text-blue-600 font-medium hover:underline'
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
