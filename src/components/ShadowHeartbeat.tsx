import React from 'react';
import { motion } from 'motion/react';

export const ShadowHeartbeat: React.FC = React.memo(() => {
  return (
    <div className="relative flex items-center justify-center w-48 h-48">
      {/* Rotating Energy Rings */}
      <motion.div
        className="absolute w-full h-full rounded-full border border-primary/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_var(--color-shadow-purple)]" />
      </motion.div>
      
      <motion.div
        className="absolute w-4/5 h-4/5 rounded-full border border-blue-500/20"
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_var(--color-shadow-blue)]" />
      </motion.div>

      {/* Outer Ripple */}
      <motion.div
        className="absolute w-32 h-32 rounded-full bg-primary/10"
        animate={{
          scale: [1, 2, 1],
          opacity: [0.3, 0, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Core Orb Container */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        {/* Energy Core */}
        <motion.div
          className="absolute inset-0 rounded-full bg-primary shadow-[0_0_50px_rgba(139,92,246,0.6)] animate-layered-glow"
          animate={{
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Internal Detail */}
        <div className="absolute inset-2 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-tr from-primary/40 via-blue-400/40 to-transparent"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>
      </div>
    </div>
  );
});
