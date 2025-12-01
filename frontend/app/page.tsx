import Link from 'next/link';
import { BookOpen, Lock, Wallet, Upload } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <nav className="flex justify-between items-center mb-20">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Notes App</span>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/login" 
              className="px-6 py-2 text-gray-700 hover:text-blue-600 transition"
            >
              Login
            </Link>
            <Link 
              href="/register" 
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Get Started
            </Link>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto text-center mt-20">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your Notes, Decentralized
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            A modern note-taking app with IPFS storage and Cardano wallet integration. 
            Keep your thoughts secure and accessible anywhere.
          </p>
          <Link 
            href="/register" 
            className="inline-block px-8 py-4 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
          >
            Start Writing
          </Link>
        </div>

        {/* Features Gallery */}
        <div className="mt-20">
          <h2 className="text-2xl font-semibold text-center mb-8 text-gray-900">Features</h2>
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            <div className="min-w-[280px] p-6 bg-white rounded-xl shadow-md snap-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Rich Text Editor</h3>
              <p className="text-gray-600">
                Format your notes with headings, bold, italics, and custom fonts.
              </p>
            </div>

            <div className="min-w-[280px] p-6 bg-white rounded-xl shadow-md snap-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Secure Storage</h3>
              <p className="text-gray-600">
                Your notes are encrypted and stored securely in the database.
              </p>
            </div>

            <div className="min-w-[280px] p-6 bg-white rounded-xl shadow-md snap-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">IPFS Integration</h3>
              <p className="text-gray-600">
                Export your notes to IPFS for decentralized, permanent storage.
              </p>
            </div>

            <div className="min-w-[280px] p-6 bg-white rounded-xl shadow-md snap-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Wallet className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Cardano Wallet</h3>
              <p className="text-gray-600">
                Connect your Cardano wallet and store metadata on the blockchain.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-20 border-t">
        <p className="text-center text-gray-600">
          © 2025 Notes App. Built with Next.js, Express, and Prisma.
        </p>
      </footer>
    </div>
  );
}
