import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import GoogleOAuthWrapper from '@/components/GoogleOAuthWrapper';
import { ThemeProvider } from '@/components/ThemeProvider';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Toaster } from 'react-hot-toast';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NotesChain - Decentralized Note Taking",
  description: "Modern note-taking app with IPFS storage and Cardano blockchain integration. Secure, decentralized, and accessible anywhere.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AnimatedBackground />
          <GoogleOAuthWrapper>
            {children}
          </GoogleOAuthWrapper>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'rgba(36, 0, 70, 0.9)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                color: '#e0aaff',
                border: '1px solid rgba(224, 170, 255, 0.2)',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 10px 40px rgba(123, 44, 191, 0.3)',
                fontSize: '14px',
                fontWeight: '500',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
                style: {
                  background: 'rgba(36, 0, 70, 0.9)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#e0aaff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
                style: {
                  background: 'rgba(36, 0, 70, 0.9)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#e0aaff',
                },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
