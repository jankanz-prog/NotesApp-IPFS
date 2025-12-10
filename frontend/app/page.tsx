import Link from 'next/link';
import { BookOpen, Lock, Wallet, Upload } from 'lucide-react';
import Image from 'next/image' // ✅ correct


export default function Home() {
  return (
    <div className='min-h-screen relative bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-x-hidden'>
      {/* Soft Animated Gradient Layer */}
      <div
        className='absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat'
        style={{ backgroundImage: "url('')" }} // put your image in public/images/
      ></div>
      <div className='absolute inset-0 bg-gradient-to-tr from-blue-200 via-purple-200 to-pink-200 opacity-40 blur-2xl bg-[length:300%_300%] animate-gradient -z-10'></div>

      {/* Floating Aura Lights */}
      <div className='absolute inset-0 pointer-events-none'>
        <div className='absolute top-12 left-20 w-96 h-96 bg-blue-300/40 rounded-full blur-3xl animate-floatSlow'></div>
        <div className='absolute bottom-20 right-24 w-80 h-80 bg-pink-300/30 rounded-full blur-2xl animate-floatSlow delay-500'></div>
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-300/20 rounded-full blur-[120px] animate-floatSlow delay-1000'></div>
      </div>

      {/* Glow Rings */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute w-[600px] h-[600px] border border-white/10 rounded-full left-[-200px] top-[200px] animate-spinSlow'></div>
        <div className='absolute w-[400px] h-[400px] border border-white/10 rounded-full right-[-150px] top-[300px] animate-spinSlowReverse'></div>
      </div>

      {/* Floating Sparkles */}
      <div className='absolute inset-0 pointer-events-none'>
        <div className='absolute w-2 h-2 bg-white/70 rounded-full blur-sm top-32 left-1/4 animate-twinkle'></div>
        <div className='absolute w-2 h-2 bg-white/70 rounded-full blur-sm top-1/3 right-20 animate-twinkle delay-300'></div>
        <div className='absolute w-2 h-2 bg-white/70 rounded-full blur-sm bottom-40 left-40 animate-twinkle delay-700'></div>
        <div className='absolute w-2 h-2 bg-white/70 rounded-full blur-sm bottom-20 right-1/3 animate-twinkle delay-1000'></div>
      </div>

      {/* Glassmorphism Grid */}
      <div className='absolute inset-0 pointer-events-none opacity-[0.06]'>
        <div className='absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:50px_50px]'></div>
      </div>

      {/* MAIN CONTENT */}
      <div className='container mx-auto px-4 py-16 relative z-10'>
        {/* Navbar */}
        <nav className='flex justify-between items-center mb-20'>
          <div className='flex items-center gap-2 animate-bounceSlow'>
            <Image
              src='/images/batibot_logo-removebg-preview.png' // Make sure this file exists in public/images/logo.png
              alt='Notes App Logo'
              width={100}
              height={100}
              className='object-contain'
            />
            <span className='text-3xl font-bold text-gray-900'>Notes App</span>
          </div>

          <div className='flex gap-4'>
            <Link
              href='/login'
              className='px-6 py-2 text-gray-700 hover:text-blue-600 transition'
            >
              Login
            </Link>
            <Link
              href='/register'
              className='px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-xl transition'
            >
              Get Started
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <div className='max-w-4xl mx-auto text-center mt-20'>
          <h1
            className='
    text-7xl font-extrabold mb-8
    bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600
    bg-clip-text text-transparent
    animate-gradientMove animate-floatPulse
    drop-shadow-[0_0_25px_rgba(99,102,241,0.4)]
  '
          >
            Your Notes, Decentralized
          </h1>

          <p className='text-xl text-gray-600 mb-12 animate-fade-in delay-200'>
            A modern note-taking app with IPFS storage and Cardano wallet
            integration. Keep your thoughts secure and accessible anywhere.
          </p>
          <Link
            href='/register'
            className='inline-block px-8 py-4 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-2xl animate-bounce'
          >
            Start Writing
          </Link>
        </div>

        {/* Features Section */}
        <div className='mt-28'>
          <h2 className='text-2xl font-semibold text-center mb-12 text-gray-900 animate-fadeIn delay-300'>
            Features
          </h2>

          <div className='flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide'>
            {[
              {
                icon: <BookOpen className='w-6 h-6 text-blue-600' />,
                title: 'Rich Text Editor',
                desc: 'Format your notes with styles and headings.',
                bg: 'bg-blue-100',
              },
              {
                icon: <Lock className='w-6 h-6 text-purple-600' />,
                title: 'Secure Storage',
                desc: 'Encrypted note storage for your privacy.',
                bg: 'bg-purple-100',
              },
              {
                icon: <Upload className='w-6 h-6 text-green-600' />,
                title: 'IPFS Integration',
                desc: 'Store notes permanently on IPFS.',
                bg: 'bg-green-100',
              },
              {
                icon: <Wallet className='w-6 h-6 text-orange-600' />,
                title: 'Cardano Wallet',
                desc: 'Connect wallets & save metadata.',
                bg: 'bg-orange-100',
              },
            ].map((f, i) => (
              <div
                key={i}
                className='min-w-[280px] p-6 bg-white rounded-xl shadow-md snap-center hover:scale-105 hover:shadow-xl transition animate-float'
                style={{ animationDelay: `${i * 200}ms` }}
              >
                <div
                  className={`w-12 h-12 ${f.bg} rounded-lg flex items-center justify-center mb-4`}
                >
                  {f.icon}
                </div>
                <h3 className='text-xl font-semibold text-gray-900'>
                  {f.title}
                </h3>
                <p className='text-gray-600'>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className='container mx-auto px-4 py-8 mt-20 border-t'>
        <p className='text-center text-gray-600'>
          © 2025 Notes App. Built with Next.js, Express, and Prisma.
        </p>
      </footer>
    </div>
  );
}
