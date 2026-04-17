import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Mic, Swords, LayoutDashboard, ChevronRight, Shield, Cpu, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Spline from '@splinetool/react-spline';

interface LandingPageProps {
  onEnter: (avatar: 'MONARC' | 'MYLORD') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const [showAvatarSelection, setShowAvatarSelection] = useState(false);

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
      {/* Background Spline Section */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 w-full h-full opacity-60 dark:opacity-80">
          <Spline 
            scene="https://prod.spline.design/PUm40dnp615oOZEQ/scene.splinecode" 
            className="w-full h-full"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.2)_0%,transparent_70%)] pointer-events-none" />
        <div className="holographic-overlay opacity-10 dark:opacity-20 pointer-events-none" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 text-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8 max-w-4xl pointer-events-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-[10px] font-mono tracking-[0.4em] uppercase mb-4 backdrop-blur-md shadow-[0_0_20px_rgba(139,92,246,0.2)]">
            <Sparkles className="w-3 h-3 animate-pulse" />
            System_Initialization_v7.2
          </div>
          
          <div className="relative group">
            <h1 className="text-7xl md:text-9xl font-display font-black tracking-tighter leading-none relative z-10">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-blue-400 animate-hologram drop-shadow-[0_0_30px_rgba(139,92,246,0.5)]">
                ARISE
              </span>
            </h1>
            <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          </div>
          
          <p className="text-xl md:text-2xl font-mono text-muted-foreground tracking-[0.2em] uppercase max-w-2xl mx-auto leading-relaxed">
            The Ultimate Shadow Monarch <span className="text-foreground font-bold">AI Interface</span>
          </p>

          <div className="pt-12">
            <Button 
              size="lg"
              onClick={() => setShowAvatarSelection(true)}
              className="group relative px-16 py-10 bg-transparent border border-primary/50 hover:border-primary text-foreground font-display font-bold text-2xl tracking-[0.3em] rounded-none overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(139,92,246,0.3)]"
            >
              <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative z-10 flex items-center gap-4">
                ACTIVATE
                <ChevronRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
              </span>
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
            </Button>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 flex flex-col items-center gap-2 opacity-60"
        >
          <span className="text-[10px] font-mono tracking-[0.5em] uppercase text-primary">Explore Protocols</span>
          <div className="w-[1px] h-16 bg-gradient-to-b from-primary via-primary/50 to-transparent" />
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-40 px-4 md:px-8 max-w-7xl mx-auto pointer-events-none">
        <div className="text-center mb-20 space-y-4 pointer-events-auto">
          <h2 className="text-3xl font-display font-bold tracking-[0.2em] uppercase">System Capabilities</h2>
          <div className="w-24 h-1 bg-primary mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pointer-events-auto">
          <FeatureCard 
            icon={<Zap className="w-8 h-8" />}
            title="Neural Link"
            description="Advanced AI chat console powered by Gemini 1.5 Pro. Real-time shadow extraction and contextual intelligence."
            delay={0.1}
          />
          <FeatureCard 
            icon={<Mic className="w-8 h-8" />}
            title="Voice Resonance"
            description="Full hands-free interaction with high-fidelity voice processing and real-time audio visualization."
            delay={0.2}
          />
          <FeatureCard 
            icon={<Swords className="w-8 h-8" />}
            title="Quest Protocol"
            description="Gamified task management system. Level up your rank through daily training and shadow missions."
            delay={0.3}
          />
          <FeatureCard 
            icon={<LayoutDashboard className="w-8 h-8" />}
            title="Monarch Dashboard"
            description="Real-time monitoring of Strength, Agility, and Mana. Watch your stats evolve as you grow in power."
            delay={0.4}
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-40 border-y border-foreground/5 bg-foreground/[0.01] backdrop-blur-sm pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-16 text-center pointer-events-auto">
          <StatItem label="Sync Stability" value="99.9%" />
          <StatItem label="Shadows Extracted" value="1.2M+" />
          <StatItem label="Mana Capacity" value="∞" />
          <StatItem label="Monarch Rank" value="S-Rank" />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-32 px-4 text-center border-t border-foreground/5 overflow-hidden bg-transparent pointer-events-none">
        <div className="relative z-10 space-y-10 pointer-events-auto">
          <div className="flex items-center justify-center gap-6 opacity-30">
            <Shield className="w-6 h-6" />
            <div className="w-20 h-[1px] bg-foreground" />
            <Cpu className="w-6 h-6" />
            <div className="w-20 h-[1px] bg-foreground" />
            <Zap className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground font-mono text-xs tracking-[0.6em] uppercase">
              System_End_of_Transmission
            </p>
            <p className="text-primary/40 font-mono text-[10px] tracking-[0.4em] uppercase">
              ARISE_PROTOCOL_ACTIVE
            </p>
          </div>
          <div className="pt-12">
            <motion.p 
              animate={{ 
                textShadow: [
                  "0 0 10px rgba(139,92,246,0.5)",
                  "0 0 30px rgba(139,92,246,0.8)",
                  "0 0 10px rgba(139,92,246,0.5)"
                ],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-primary font-display font-black text-2xl tracking-[0.5em] uppercase"
            >
              Powered by Dipesh Kumar
            </motion.p>
          </div>
        </div>
      </footer>

      {/* Avatar Selection Popup */}
      <AnimatePresence>
        {showAvatarSelection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl glass-panel p-12 rounded-3xl border-primary/30 overflow-hidden"
            >
              <button 
                onClick={() => setShowAvatarSelection(false)}
                className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-8 h-8" />
              </button>

              <div className="text-center mb-12 space-y-4">
                <h2 className="text-4xl font-display font-black tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary">
                  Choose Your Avatar
                </h2>
                <p className="text-muted-foreground font-mono tracking-widest uppercase text-sm">Select your neural representation</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <AvatarOption 
                  name="MONARC"
                  image="/sung-jinwoo-amoled-5120x28880-15859.jpg"
                  description="The Original Shadow Sovereign"
                  onClick={() => onEnter('MONARC')}
                  color="primary"
                />
                <AvatarOption 
                  name="MYLORD"
                  image="/sung-jinwoo-amoled-5120x28880-15859.jpg"
                  description="The Ascended Eternal Ruler"
                  onClick={() => onEnter('MYLORD')}
                  color="blue"
                />
              </div>

              {/* Decorative Corner */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 blur-3xl rounded-full" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AvatarOption = ({ name, image, description, onClick, color }: { name: string, image: string, description: string, onClick: () => void, color: 'primary' | 'blue' }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`group cursor-pointer relative p-8 rounded-2xl border border-foreground/10 bg-foreground/5 hover:border-${color}/50 hover:bg-${color}/10 transition-all duration-500 overflow-hidden`}
  >
    <div className="relative z-10 flex flex-col items-center gap-6">
      <div className="w-48 h-64 rounded-xl overflow-hidden border border-foreground/10 group-hover:border-primary/50 transition-colors shadow-2xl">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${name}/400/600?grayscale`;
          }}
        />
      </div>
      <div className="text-center space-y-2">
        <h3 className={`text-3xl font-display font-black tracking-[0.3em] text-${color} group-hover:shadow-text-glow transition-all`}>
          {name}
        </h3>
        <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase">{description}</p>
      </div>
    </div>
    {/* Hover Glow */}
    <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-${color}/20 opacity-0 group-hover:opacity-100 transition-opacity`} />
  </motion.div>
);

const FeatureCard = ({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="glass-panel p-10 rounded-2xl border-primary/20 hover:border-primary/50 transition-all group relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
      {icon}
    </div>
    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 border border-primary/30 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(139,92,246,0.2)]">
      {icon}
    </div>
    <h3 className="text-3xl font-display font-bold mb-4 tracking-tight">{title}</h3>
    <p className="text-muted-foreground font-mono text-base leading-relaxed">{description}</p>
  </motion.div>
);

const StatItem = ({ label, value }: { label: string, value: string }) => (
  <div className="space-y-3">
    <div className="text-5xl md:text-6xl font-mono font-black text-foreground shadow-text-glow tracking-tighter">{value}</div>
    <div className="text-[12px] font-mono text-primary tracking-[0.4em] uppercase font-bold">{label}</div>
  </div>
);
