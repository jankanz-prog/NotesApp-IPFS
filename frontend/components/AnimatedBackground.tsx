'use client';

import { motion } from 'framer-motion';

/**
 * AnimatedBackground Component
 * Creates a subtle, slow-moving gradient animation using Vivid Nightfall colors
 * Blends darkest colors (#10002b, #240046) with soft accents (#3c096c, #5a189a)
 */
export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #10002b 0%, #240046 50%, #10002b 100%)',
          backgroundSize: '200% 200%',
        }}
      />
      
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          background: 'linear-gradient(135deg, #10002b 0%, #240046 25%, #3c096c 50%, #5a189a 75%, #240046 100%)',
          backgroundSize: '200% 200%',
          opacity: 0.6,
        }}
      />
      
      {/* Floating orbs for depth */}
      <motion.div
        className="absolute top-20 left-20 w-96 h-96 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: 'radial-gradient(circle, #3c096c 0%, transparent 70%)',
          opacity: 0.3,
        }}
      />
      
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl"
        animate={{
          x: [0, -100, 0],
          y: [0, -50, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        style={{
          background: 'radial-gradient(circle, #5a189a 0%, transparent 70%)',
          opacity: 0.25,
        }}
      />
      
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        style={{
          background: 'radial-gradient(circle, #7b2cbf 0%, transparent 70%)',
        }}
      />
      
      {/* Subtle noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

