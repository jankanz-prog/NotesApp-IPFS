'use client';

import React, { useEffect, useState } from 'react';
import { BookOpen, Lock, Upload, Wallet, ArrowRight, Menu, X } from 'lucide-react';

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 15,
        y: (e.clientY / window.innerHeight - 0.5) * 15,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: BookOpen,
      title: 'Rich Text Editor',
      description: 'Format your notes with headings, bold, italics, and custom fonts.',
    },
    {
      icon: Lock,
      title: 'Secure Storage',
      description: 'Your notes are encrypted and stored securely in the database.',
    },
    {
      icon: Upload,
      title: 'IPFS Integration',
      description: 'Export your notes to IPFS for decentralized, permanent storage.',
    },
    {
      icon: Wallet,
      title: 'Cardano Wallet',
      description: 'Connect your Cardano wallet and store metadata on the blockchain.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-purple-500/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-600 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                <BookOpen className="w-7 h-7 text-purple-400 relative z-10" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                NotesChain
              </span>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href="/login"
                className="px-5 py-2 text-purple-200 hover:text-white transition-colors font-medium"
              >
                Login
              </a>
              <a
                href="/register"
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 font-semibold"
              >
                Get Started
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-purple-200 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-purple-500/10">
              <a
                href="/login"
                className="block px-4 py-2 text-purple-200 hover:text-white hover:bg-purple-500/10 rounded-lg transition-colors font-medium"
              >
                Login
              </a>
              <a
                href="/register"
                className="block px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-center font-semibold"
              >
                Get Started
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 min-h-[80vh] flex items-center">
        <div className="container mx-auto max-w-6xl w-full">
          <div
            className="text-center transition-transform duration-100 ease-out"
            style={{
              transform: `translate(${mousePosition.x * 0.05}px, ${mousePosition.y * 0.05}px)`,
            }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 leading-tight">
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Your Notes,
              </span>
              <span className="block bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Decentralized
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-purple-200 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
              A modern note-taking app with IPFS storage and Cardano wallet integration.
              Keep your thoughts secure and accessible anywhere.
            </p>
            <a
              href="/register"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-base sm:text-lg rounded-xl transition-all duration-300 shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/50 font-semibold group"
            >
              Start Writing
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Features Section */}
      <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-950/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 sm:mb-16 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/10 hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-2"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-purple-100 group-hover:text-white transition-colors">
                  {feature.title}
                </h3>
                <p className="text-purple-300/70 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 px-4 sm:px-6 lg:px-8 border-t border-purple-500/10">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-purple-300/60 text-sm">
            © 2025 NotesChain. Built with Next.js, Express, and Prisma.
          </p>
        </div>
      </footer>
    </div>
  );
}
