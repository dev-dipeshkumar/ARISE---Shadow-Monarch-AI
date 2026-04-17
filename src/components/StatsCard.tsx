import React from 'react';
import { motion } from 'motion/react';
import { Swords, Wind, Cpu, Sparkles, Zap, Trophy } from 'lucide-react';
import { MonarchStats } from '../types';

interface StatsCardProps {
  stats: MonarchStats;
}

export const StatsCard: React.FC<StatsCardProps> = ({ stats }) => {
  const statItems = [
    { 
      label: 'STRENGTH', 
      value: stats.strength, 
      icon: <Swords className="w-4 h-4" />, 
      color: 'text-red-500', 
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      max: 500 
    },
    { 
      label: 'AGILITY', 
      value: stats.agility, 
      icon: <Wind className="w-4 h-4" />, 
      color: 'text-blue-400', 
      bg: 'bg-blue-400/10',
      border: 'border-blue-400/30',
      max: 500 
    },
    { 
      label: 'INTELLIGENCE', 
      value: stats.intelligence, 
      icon: <Cpu className="w-4 h-4" />, 
      color: 'text-purple-400', 
      bg: 'bg-purple-400/10',
      border: 'border-purple-400/30',
      max: 500 
    },
    { 
      label: 'MANA', 
      value: stats.mana, 
      icon: <Sparkles className="w-4 h-4" />, 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      max: 100 
    },
    { 
      label: 'SHADOW STRENGTH', 
      value: stats.shadowStrength, 
      icon: <Zap className="w-4 h-4" />, 
      color: 'text-primary', 
      bg: 'bg-primary/10',
      border: 'border-primary/30',
      max: 100 
    },
  ];

  return (
    <div className="glass-panel p-6 rounded-2xl border-primary/20 relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors duration-700" />
      
      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-[0.3em] font-bold flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary animate-pulse" />
            Monarch_Status
          </h3>
          <div className="px-2 py-0.5 rounded border border-primary/30 bg-primary/5 text-[8px] font-mono text-primary tracking-widest animate-pulse">
            S-RANK_ACTIVE
          </div>
        </div>

        <div className="grid gap-5">
          {statItems.map((stat, index) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2 group/item"
            >
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${stat.bg} ${stat.border} border transition-all group-hover/item:scale-110`}>
                    <span className={stat.color}>{stat.icon}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono tracking-widest group-hover/item:text-foreground transition-colors">
                    {stat.label}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <motion.span 
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    className="text-xl font-bold font-mono text-foreground/90 shadow-text-glow"
                  >
                    {stat.value}
                  </motion.span>
                  <span className="text-[8px] text-muted-foreground font-mono">/{stat.max}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(stat.value / stat.max) * 100}%` }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: index * 0.1 + 0.5 }}
                  className={`absolute inset-0 rounded-full ${stat.color.replace('text', 'bg')}`}
                >
                  {/* Animated Glow Overlay */}
                  <motion.div
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* System Footer */}
        <div className="pt-4 border-t border-foreground/5 flex justify-between items-center">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`w-1 h-1 rounded-full ${i < 4 ? 'bg-primary' : 'bg-foreground/10'}`} />
            ))}
          </div>
          <span className="text-[8px] font-mono text-primary/40 tracking-widest uppercase">
            Neural_Sync: 98.4%
          </span>
        </div>
      </div>
    </div>
  );
};
