import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Swords, Zap, Shield } from 'lucide-react';

interface MonarchAvatarProps {
  currentView: 'dashboard' | 'training' | 'skills';
  selectedAvatar: 'MONARC' | 'MYLORD' | null;
}

export const MonarchAvatar: React.FC<MonarchAvatarProps> = ({ currentView, selectedAvatar }) => {
  // Define animation variants for the character model
  const characterVariants = {
    dashboard: {
      y: [0, -8, 0],
      scale: 1,
      rotateY: [0, 5, 0, -5, 0],
      filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.5))',
      transition: {
        y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        rotateY: { duration: 6, repeat: Infinity, ease: "easeInOut" },
        filter: { duration: 3, repeat: Infinity, ease: "easeInOut" }
      }
    },
    training: {
      y: [0, -4, 0],
      scale: [1, 1.05, 1],
      rotate: [0, -2, 2, 0],
      filter: 'drop-shadow(0 0 30px rgba(239, 68, 68, 0.7))',
      transition: {
        y: { duration: 0.4, repeat: Infinity, ease: "easeInOut" },
        scale: { duration: 0.2, repeat: Infinity },
        rotate: { duration: 0.1, repeat: Infinity },
        filter: { duration: 0.5, repeat: Infinity, ease: "easeInOut" }
      }
    },
    skills: {
      y: [0, -20, 0],
      scale: 1.15,
      rotate: [0, 360],
      filter: 'drop-shadow(0 0 40px rgba(59, 130, 246, 0.8))',
      transition: {
        y: { duration: 8, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: 20, repeat: Infinity, ease: "linear" },
        filter: { duration: 4, repeat: Infinity, ease: "easeInOut" }
      }
    }
  };

  // Thematic particle effects based on view
  const particles = useMemo(() => {
    const color = currentView === 'training' ? 'rgba(239, 68, 68, 0.6)' : 
                  currentView === 'skills' ? 'rgba(59, 130, 246, 0.6)' : 
                  'rgba(139, 92, 246, 0.6)';
    return [...Array(12)].map((_, i) => ({
      id: i,
      color,
      delay: i * 0.3,
      size: Math.random() * 5 + 3
    }));
  }, [currentView]);

  const avatarImage = '/sung-jinwoo-amoled-5120x28880-15859.jpg';

  return (
    <div className="relative w-full h-80 flex items-center justify-center group perspective-1000">
      {/* Background Mana Well */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, 360],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className={`absolute inset-0 rounded-full blur-[100px] transition-colors duration-1000 ${
            currentView === 'training' ? 'bg-red-600' : 
            currentView === 'skills' ? 'bg-blue-600' : 'bg-primary'
          }`}
        />
      </div>

      {/* Character Model Container */}
      <motion.div
        variants={characterVariants}
        animate={currentView}
        className="relative z-10 w-full h-full flex items-center justify-center"
      >
        {/* Main Character Image */}
        <div className="relative w-56 h-72 md:w-64 md:h-80 flex items-center justify-center">
          <img 
            src={avatarImage} 
            alt="Shadow Monarch" 
            className="w-full h-full object-contain pointer-events-none drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] transition-all duration-500"
            onError={(e) => {
              // Fallback to image.png if MONARC/MYLORD fails
              const target = e.target as HTMLImageElement;
              if (target.src.includes('image.png')) {
                target.src = 'https://picsum.photos/seed/monarch/400/600?grayscale';
              } else {
                target.src = '/image.png';
              }
            }}
          />

          {/* Holographic Glitch Effect (Training Mode) */}
          {currentView === 'training' && (
            <motion.div
              animate={{
                opacity: [0, 0.5, 0],
                x: [-2, 2, -2],
              }}
              transition={{ duration: 0.1, repeat: Infinity }}
              className="absolute inset-0 pointer-events-none mix-blend-screen opacity-30"
            >
              <img src={avatarImage} className="w-full h-full object-contain filter hue-rotate-90 scale-105" alt="" />
            </motion.div>
          )}

          {/* Glowing Eyes Overlay */}
          <motion.div 
            className={`absolute top-[25%] left-[46%] w-2 h-2 rounded-full blur-[2px] shadow-[0_0_15px_#fff] transition-colors duration-500 ${
              currentView === 'training' ? 'bg-red-500 shadow-red-600' : 'bg-blue-500 shadow-blue-600'
            }`}
            animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div 
            className={`absolute top-[25%] left-[54%] w-2 h-2 rounded-full blur-[2px] shadow-[0_0_15px_#fff] transition-colors duration-500 ${
              currentView === 'training' ? 'bg-red-500 shadow-red-600' : 'bg-blue-500 shadow-blue-600'
            }`}
            animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />

          {/* View-Specific Overlays */}
          <AnimatePresence mode="wait">
            {currentView === 'training' && (
              <motion.div
                key="training-fx"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none"
              >
                <div className="absolute inset-0 bg-red-500/10 mix-blend-overlay animate-pulse" />
                <Swords className="absolute -top-4 -right-4 w-8 h-8 text-red-500 animate-bounce" />
              </motion.div>
            )}
            {currentView === 'skills' && (
              <motion.div
                key="skills-fx"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none"
              >
                <div className="absolute inset-0 bg-blue-500/10 mix-blend-screen animate-pulse" />
                <Zap className="absolute -top-6 left-1/2 -translate-x-1/2 w-10 h-10 text-blue-400 animate-pulse" />
              </motion.div>
            )}
            {currentView === 'dashboard' && (
              <motion.div
                key="dashboard-fx"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none"
              >
                <Shield className="absolute -top-4 -left-4 w-8 h-8 text-primary/60 animate-pulse" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Ambient Mana Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ y: 200, x: 100, opacity: 0 }}
            animate={{
              y: -100,
              x: Math.random() * 200 - 100,
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear"
            }}
            className="absolute rounded-full blur-[1px]"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              left: `${20 + Math.random() * 60}%`,
              bottom: '0%'
            }}
          />
        ))}
      </div>

      {/* System Scanline Overlay (Avatar Specific) */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-gradient-to-b from-transparent via-primary/20 to-transparent h-1/2 animate-scanline" />
    </div>
  );
};
