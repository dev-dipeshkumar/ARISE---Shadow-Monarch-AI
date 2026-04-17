import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Shield, Zap, Swords, LayoutDashboard, Mic, Cpu, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ParticleBackground } from './components/ParticleBackground';
import { ChatConsole } from './components/ChatConsole';
import { VoiceMode } from './components/VoiceMode';
import { QuestSystem } from './components/QuestSystem';
import { MonarchAvatar } from './components/MonarchAvatar';
import { StatsCard } from './components/StatsCard';
import { LandingPage } from './components/LandingPage';
import { Toaster } from 'sonner';

import { Quest, MonarchStats } from './types';

export default function App() {
  const [showApp, setShowApp] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<'MONARC' | 'MYLORD' | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'training' | 'skills'>('dashboard');
  const [isVoiceModeOpen, setIsVoiceModeOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('monarch_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark'; // Default to dark for Monarch vibe
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('monarch_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const [quests, setQuests] = useState<Quest[]>([
    { id: '1', title: 'Extract information from the shadows', completed: true },
    { id: '2', title: 'Level up your Monarch Rank', completed: false },
    { id: '3', title: 'Complete the daily training', completed: false },
  ]);
  const [stats, setStats] = useState<MonarchStats>({
    strength: 245,
    agility: 189,
    intelligence: 312,
    mana: 98,
    shadowStrength: 84,
  });

  const handleEnter = (avatar: 'MONARC' | 'MYLORD') => {
    setSelectedAvatar(avatar);
    setShowWelcome(true);
    
    // After 5 seconds (length of animation), show the actual app
    setTimeout(() => {
      setShowWelcome(false);
      setShowApp(true);
    }, 5000);
  };

  const handleToggleQuest = useCallback((id: string) => {
    setQuests(prev => prev.map(q => q.id === id ? { ...q, completed: !q.completed } : q));
  }, []);

  const handleDeleteQuest = useCallback((id: string) => {
    setQuests(prev => prev.filter(q => q.id !== id));
  }, []);

  const handleAddQuest = useCallback((title: string, description?: string) => {
    setQuests(prev => [...prev, { id: Date.now().toString(), title, description, completed: false }]);
  }, []);

  const questProps = useMemo(() => ({
    quests,
    onToggle: handleToggleQuest,
    onDelete: handleDeleteQuest,
    onAdd: handleAddQuest,
  }), [quests, handleToggleQuest, handleDeleteQuest, handleAddQuest]);

  const [voiceInput, setVoiceInput] = useState<string | null>(null);

  if (showWelcome) {
    return (
      <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center overflow-hidden">
        <video
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          onEnded={() => {
            setShowWelcome(false);
            setShowApp(true);
          }}
        >
          <source src="/Welcome Animation.mp4" type="video/mp4" />
        </video>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="relative z-10 text-center space-y-4"
        >
          <h2 className="text-5xl md:text-7xl font-display font-black tracking-[0.5em] text-foreground drop-shadow-[0_0_30px_rgba(139,92,246,0.8)]">
            WELCOME
          </h2>
          <h3 className="text-4xl md:text-6xl font-display font-black tracking-[0.3em] text-primary animate-pulse">
            {selectedAvatar}
          </h3>
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-60" />
      </div>
    );
  }

  if (!showApp) {
    return <LandingPage onEnter={handleEnter} />;
  }

  return (
    <div className="relative min-h-screen flex flex-col text-foreground selection:bg-primary/30 selection:text-primary-foreground overflow-hidden">
      <ParticleBackground />
      <div className="holographic-overlay" />
      <div className="scanline" />
      <Toaster position="top-right" theme={theme} richColors />

      {/* Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 h-16 border-b border-white/10 bg-background/60 backdrop-blur-xl px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4 md:gap-8">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/40 shadow-[0_0_30px_rgba(139,92,246,0.5)] group-hover:shadow-[0_0_50px_rgba(139,92,246,0.8)] transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-transparent to-blue-500/40 animate-pulse" />
                <Zap className="w-8 h-8 text-primary animate-layered-glow relative z-10 fill-primary/20" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.3)_0%,transparent_70%)] animate-pulse" />
              </div>
              {/* Orbital Rings */}
              <div className="absolute -inset-2 border border-primary/20 rounded-2xl animate-[spin_10s_linear_infinite] pointer-events-none" />
              <div className="absolute -inset-4 border border-blue-500/10 rounded-2xl animate-[spin_15s_linear_infinite_reverse] pointer-events-none" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black tracking-[0.5em] text-2xl bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-blue-400 animate-hologram drop-shadow-[0_0_15px_rgba(139,92,246,0.6)]">
                  MONARCH
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                <span className="text-[8px] font-mono text-primary/60 tracking-[0.6em] uppercase">Neural_Link_v7.2</span>
              </div>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => setCurrentView('dashboard')}
              className={`text-[10px] font-mono transition-all flex items-center gap-2 tracking-widest group hover:scale-105 active:scale-95 ${
                currentView === 'dashboard' ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <LayoutDashboard className={`w-3.5 h-3.5 transition-transform ${currentView === 'dashboard' ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="relative overflow-hidden">
                DASHBOARD
                <span className={`absolute bottom-0 left-0 w-full h-[1px] bg-primary transition-all duration-300 shadow-[0_0_8px_rgba(139,92,246,0.8)] ${
                  currentView === 'dashboard' ? 'translate-x-0' : 'transform translate-x-[-100%] group-hover:translate-x-0'
                }`} />
              </span>
            </button>
            <button 
              onClick={() => setCurrentView('training')}
              className={`text-[10px] font-mono transition-all flex items-center gap-2 tracking-widest group hover:scale-105 active:scale-95 ${
                currentView === 'training' ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <Swords className={`w-3.5 h-3.5 transition-transform ${currentView === 'training' ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="relative overflow-hidden">
                TRAINING
                <span className={`absolute bottom-0 left-0 w-full h-[1px] bg-primary transition-all duration-300 shadow-[0_0_8px_rgba(139,92,246,0.8)] ${
                  currentView === 'training' ? 'translate-x-0' : 'transform translate-x-[-100%] group-hover:translate-x-0'
                }`} />
              </span>
            </button>
            <button 
              onClick={() => setCurrentView('skills')}
              className={`text-[10px] font-mono transition-all flex items-center gap-2 tracking-widest group hover:scale-105 active:scale-95 ${
                currentView === 'skills' ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 transition-transform ${currentView === 'skills' ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="relative overflow-hidden">
                SKILLS
                <span className={`absolute bottom-0 left-0 w-full h-[1px] bg-primary transition-all duration-300 shadow-[0_0_8px_rgba(139,92,246,0.8)] ${
                  currentView === 'skills' ? 'translate-x-0' : 'transform translate-x-[-100%] group-hover:translate-x-0'
                }`} />
              </span>
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-primary/80 hover:text-primary hover:bg-primary/10 transition-all"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          <div className="hidden lg:flex items-center gap-3">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 mb-0.5">
                <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[6px] font-mono text-primary/40 tracking-widest uppercase">Sync_Stable</span>
              </div>
              <Badge 
                variant="outline" 
                className="border-primary/30 text-primary font-mono text-[10px] tracking-widest bg-primary/10 px-3 py-0.5 gap-2 items-center shadow-[0_0_15px_rgba(139,92,246,0.3)] border-glow group"
              >
                <Cpu className="w-3 h-3 group-hover:rotate-12 transition-transform" />
                PNS: <span className="text-foreground font-bold relative">
                  2nd
                  <span className="absolute -top-1 -right-1 w-1 h-1 bg-primary rounded-full animate-ping" />
                </span>
              </Badge>
            </div>
            <div className="h-8 w-[1px] bg-white/10" />
          </div>
          
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden text-primary/80 hover:text-primary hover:bg-primary/10">
                  <Menu className="w-6 h-6" />
                </Button>
              }
            />
            <SheetContent side="left" className="bg-background/95 border-r border-white/10 p-6 backdrop-blur-2xl">
              <div className="space-y-8 mt-8">
                <div className="space-y-4">
                  <h3 className="text-xs font-mono text-primary/60 uppercase tracking-[0.3em] font-bold">System_Navigation</h3>
                  <div className="grid gap-2">
                    <Button variant="ghost" className="justify-start font-mono text-sm hover:bg-primary/10 hover:text-primary transition-all group text-foreground">
                      <LayoutDashboard className="w-4 h-4 mr-3 group-hover:scale-110" />
                      DASHBOARD
                    </Button>
                    <Button variant="ghost" className="justify-start font-mono text-sm hover:bg-primary/10 hover:text-primary transition-all group text-foreground">
                      <Swords className="w-4 h-4 mr-3 group-hover:scale-110" />
                      TRAINING
                    </Button>
                    <Button variant="ghost" className="justify-start font-mono text-sm hover:bg-primary/10 hover:text-primary transition-all group text-foreground">
                      <Zap className="w-4 h-4 mr-3 group-hover:scale-110" />
                      SKILLS
                    </Button>
                  </div>
                </div>
                <QuestSystem {...questProps} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-24 pb-8 px-4 md:px-8 flex flex-col lg:flex-row gap-8 max-w-[1600px] mx-auto w-full min-h-[calc(100vh-6rem)] lg:h-[calc(100vh-2rem)] overflow-hidden lg:overflow-visible">
        <AnimatePresence mode="wait">
          {currentView === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col lg:flex-row w-full gap-8 overflow-y-auto lg:overflow-visible pb-20 lg:pb-0"
            >
              {/* Left Sidebar - Quests (Desktop) */}
              <aside className="hidden lg:flex flex-col w-80 shrink-0 gap-6">
                <QuestSystem {...questProps} />
                <div className="glass-panel p-6 rounded-2xl border-primary/20 space-y-4 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/40" />
                  <h3 className="text-xs font-mono text-primary uppercase tracking-[0.3em] flex items-center gap-2 font-bold">
                    <Zap className="w-4 h-4 animate-pulse" />
                    SYSTEM_STATUS
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-muted-foreground">MANA_REGEN</span>
                      <span className="text-blue-400">{stats.mana}%</span>
                    </div>
                    <div className="h-1 bg-foreground/5 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-blue-500" 
                        initial={{ width: 0 }} 
                        animate={{ width: `${stats.mana}%` }} 
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-muted-foreground">SHADOW_STRENGTH</span>
                      <span className="text-primary">LVL. {stats.shadowStrength}</span>
                    </div>
                    <div className="h-1 bg-foreground/5 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-primary" 
                        initial={{ width: 0 }} 
                        animate={{ width: `${stats.shadowStrength}%` }} 
                      />
                    </div>
                  </div>
                </div>
              </aside>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col min-w-0">
                <ChatConsole 
                  onVoiceClick={() => setIsVoiceModeOpen(true)} 
                  quests={quests}
                  stats={stats}
                  onUpdateQuests={setQuests}
                  onUpdateStats={setStats}
                  voiceInput={voiceInput}
                  onVoiceInputProcessed={() => setVoiceInput(null)}
                />
              </div>

              {/* Right Sidebar - Stats/Info (Desktop) */}
              <aside className="hidden xl:flex flex-col w-64 shrink-0 gap-6">
                <StatsCard stats={stats} />
                
                <div className="flex-1 glass-panel p-6 rounded-2xl border-primary/20 flex flex-col items-center justify-center text-center gap-4 relative group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <MonarchAvatar currentView={currentView} selectedAvatar={selectedAvatar} />

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentView}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-2"
                    >
                      <p className="text-[11px] font-mono text-primary tracking-widest uppercase font-bold">
                        {currentView === 'dashboard' && `Welcome back, ${selectedAvatar}.`}
                        {currentView === 'training' && "Sharpen your blade."}
                        {currentView === 'skills' && "Ascend to new heights."}
                      </p>
                      <p className="text-[10px] font-mono text-muted-foreground leading-relaxed italic px-2">
                        {currentView === 'dashboard' && "The shadows have been restless in your absence."}
                        {currentView === 'training' && "Every strike brings you closer to absolute power."}
                        {currentView === 'skills' && "Unlock the latent potential within your soul."}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </aside>
            </motion.div>
          )}

          {currentView === 'training' && (
            <motion.div 
              key="training"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col items-center justify-center gap-8"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-display font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-primary to-blue-400 animate-hologram">
                  TRAINING GROUNDS
                </h2>
                <p className="text-muted-foreground font-mono text-sm tracking-widest uppercase">Prepare for the next extraction, Monarch.</p>
              </div>
              <div className="w-full max-w-2xl">
                <QuestSystem {...questProps} />
              </div>
            </motion.div>
          )}

          {currentView === 'skills' && (
            <motion.div 
              key="skills"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex-1 flex flex-col items-center justify-center gap-8"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-display font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-primary to-blue-400 animate-hologram">
                  SKILL TREE
                </h2>
                <p className="text-muted-foreground font-mono text-sm tracking-widest uppercase">Your power grows with every shadow extracted.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                {Object.entries(stats).map(([key, value]) => (
                  <div key={key} className="glass-panel p-8 rounded-2xl border-primary/20 text-center space-y-2 group hover:border-primary/50 transition-all">
                    <span className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase group-hover:text-primary transition-colors">{key}</span>
                    <div className="text-4xl font-bold font-mono text-foreground shadow-text-glow">{value}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Overlays */}
      <VoiceMode 
        isOpen={isVoiceModeOpen} 
        onClose={() => setIsVoiceModeOpen(false)} 
        onResult={(text) => {
          setVoiceInput(text);
          setIsVoiceModeOpen(false);
        }}
      />

      {/* Footer Decoration */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-20" />
      
      {/* Signature */}
      <div className="fixed bottom-4 right-8 z-50 pointer-events-none">
        <p className="text-[10px] font-mono text-primary/40 tracking-[0.4em] uppercase">
          Powered by Dipesh Kumar
        </p>
      </div>
    </div>
  );
}


