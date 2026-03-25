import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const MotionPath = motion.path as any;
const MotionG = motion.g as any;
const MotionCircle = motion.circle as any;

export const MoleculeDiagram: React.FC = () => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setActive(prev => !prev), 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-80 flex items-center justify-center overflow-hidden">
      {/* Abstract Cell Membrane */}
      <svg viewBox="0 0 400 200" className="w-full h-full max-w-2xl">
        <defs>
          <linearGradient id="membraneGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4CAF50" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#1E5631" stopOpacity="0.8" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Lipid Bilayer Background */}
        <MotionPath 
          d="M0,100 Q100,80 200,100 T400,100"
          stroke="url(#membraneGrad)"
          strokeWidth="40"
          fill="none"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          transition={{ duration: 2 }}
        />

        {/* Aquaporin Channel */}
        <MotionG
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
           <rect x="180" y="60" width="40" height="80" rx="10" fill="#4CAF50" fillOpacity="0.8" stroke="#A5D6A7" strokeWidth="2" />
           <rect x="190" y="60" width="20" height="80" fill="#1E5631" fillOpacity="0.5" />
        </MotionG>

        {/* Water Molecules (H2O) flowing through */}
        {[...Array(5)].map((_, i) => (
          <MotionCircle
            key={i}
            cx="200"
            cy="150"
            r="4"
            fill="#00BFFF"
            filter="url(#glow)"
            initial={{ y: 0, opacity: 0 }}
            animate={{ 
              y: -100 - (i * 10), 
              opacity: [0, 1, 0] 
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              delay: i * 0.4,
              ease: "linear" 
            }}
          />
        ))}

        {/* ABA Signal Molecules */}
        {[...Array(3)].map((_, i) => (
          <MotionCircle
            key={`aba-${i}`}
            cx={50 + i * 50}
            cy="80"
            r="6"
            fill="#FFD700"
            filter="url(#glow)"
            animate={{ 
              x: [0, 20, 0],
              y: [0, 10, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              delay: i * 0.8 
            }}
          />
        ))}
        
        {/* Labels */}
        <text x="50" y="180" fill="#A5D6A7" fontSize="10" fontFamily="sans-serif">Cytoplasm</text>
        <text x="300" y="40" fill="#A5D6A7" fontSize="10" fontFamily="sans-serif">Extracellular Space</text>
        <text x="230" y="100" fill="white" fontSize="12" fontWeight="bold">Aquaporin Channel</text>
      </svg>
    </div>
  );
};