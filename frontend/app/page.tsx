'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Lock, Wallet, Upload, Sparkles, ArrowRight, Star, Quote } from 'lucide-react';

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    // Create floating particles
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
    }));
    setParticles(newParticles);

    // Track mouse for parallax effect
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-almond-cream via-desert-sand to-tan">
      {/* Floating Particles Background */}
      <div className="particles">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Animated Gradient Background */}
      <div 
        className="fixed inset-0 opacity-30"
        style={{
          background: 'linear-gradient(135deg, #ede0d4 0%, #e6ccb2 25%, #ddb892 50%, #b08968 75%, #9c6644 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradient 15s ease infinite',
        }}
      />

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-4 py-6 animate-fade-in-down">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <BookOpen className="w-8 h-8 text-coffee-bean group-hover:scale-110 transition-transform duration-300" />
              <Sparkles className="w-4 h-4 text-toffee-brown absolute -top-1 -right-1 animate-pulse-slow" />
            </div>
            <span className="text-2xl font-bold gradient-text">Notes App</span>
          </Link>
          <div className="flex gap-4">
            <Link 
              href="/login" 
              className="px-6 py-2 text-coffee-bean hover:text-toffee-brown transition-all duration-300 hover:scale-105 magnetic"
            >
              Login
            </Link>
            <Link 
              href="/register" 
              className="px-6 py-2 bg-coffee-bean text-almond-cream rounded-lg hover:bg-toffee-brown transition-all duration-300 shadow-lg hover:shadow-xl magnetic ripple-effect"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 py-20 mt-10">
        <div 
          className="max-w-4xl mx-auto text-center"
          style={{
            transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        >
          <div className="animate-fade-in-up">
            <h1 className="text-7xl md:text-8xl font-bold mb-6 gradient-text animate-scale-in">
              <span className="inline-block animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                Your Notes,
              </span>
              <br />
              <span className="inline-block animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                Decentralized
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-coffee-bean mb-12 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              A modern note-taking app with IPFS storage and Cardano wallet integration. 
              Keep your thoughts secure and accessible anywhere.
            </p>
            <Link 
              href="/register" 
              className="inline-flex items-center gap-3 px-10 py-5 bg-coffee-bean text-almond-cream text-lg rounded-xl hover:bg-toffee-brown transition-all duration-300 shadow-2xl hover:shadow-3xl magnetic ripple-effect animate-bounce-in"
              style={{ animationDelay: '0.7s' }}
            >
              Start Writing
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Scroll Indicator */}
          <div className="mt-20 animate-bounce">
            <div className="w-6 h-10 border-2 border-coffee-bean rounded-full mx-auto flex items-start justify-center p-2">
              <div className="w-1 h-3 bg-coffee-bean rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Gallery */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-16 gradient-text animate-fade-in-up">Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: BookOpen,
              title: 'Rich Text Editor',
              description: 'Format your notes with headings, bold, italics, and custom fonts.',
              color: 'from-coffee-bean to-toffee-brown',
              delay: '0.1s',
            },
            {
              icon: Lock,
              title: 'Secure Storage',
              description: 'Your notes are encrypted and stored securely in the database.',
              color: 'from-faded-copper to-coffee-bean',
              delay: '0.2s',
            },
            {
              icon: Upload,
              title: 'IPFS Integration',
              description: 'Export your notes to IPFS for decentralized, permanent storage.',
              color: 'from-tan to-faded-copper',
              delay: '0.3s',
            },
            {
              icon: Wallet,
              title: 'Cardano Wallet',
              description: 'Connect your Cardano wallet and store metadata on the blockchain.',
              color: 'from-desert-sand to-tan',
              delay: '0.4s',
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="group glass rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 animate-fade-in-up magnetic"
              style={{ animationDelay: feature.delay }}
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <feature.icon className="w-8 h-8 text-almond-cream" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-coffee-bean group-hover:text-toffee-brown transition-colors">
                {feature.title}
              </h3>
              <p className="text-coffee-bean/80 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-4 py-12 mt-20 border-t border-coffee-bean/20">
        <div className="text-center">
          <p className="text-coffee-bean/70">
            © 2025 Notes App. Built with Next.js, Express, and Prisma.
          </p>
        </div>
      </footer>
    </div>
  );
}
