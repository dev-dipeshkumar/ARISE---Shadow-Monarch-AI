import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Swords, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

import { Quest } from '../types';

interface QuestSystemProps {
  quests: Quest[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (title: string, description?: string) => void;
}

export const QuestSystem: React.FC<QuestSystemProps> = React.memo(({ quests, onToggle, onDelete, onAdd }) => {
  const [newQuest, setNewQuest] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const handleAdd = () => {
    if (!newQuest.trim()) return;
    onAdd(newQuest, newDescription);
    setNewQuest('');
    setNewDescription('');
  };

  const completedCount = quests.filter(q => q.completed).length;
  const progress = quests.length > 0 ? (completedCount / quests.length) * 100 : 0;

  return (
    <div className="glass-panel p-6 rounded-2xl border-primary/20 space-y-6 relative overflow-hidden group">
      {/* Holographic Glint */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="flex items-center justify-between relative z-10">
        <h3 className="text-xs font-mono text-primary uppercase tracking-[0.3em] flex items-center gap-2 font-bold">
          <Swords className="w-4 h-4 animate-pulse" />
          ACTIVE_QUESTS
        </h3>
        <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary/70">
          {completedCount}/{quests.length}
        </Badge>
      </div>

      <div className="space-y-2 relative z-10">
        <div className="flex justify-between text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
          <span>Extraction_Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-foreground/5 rounded-full overflow-hidden border border-foreground/5 relative">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary via-blue-500 to-primary shadow-[0_0_10px_rgba(139,92,246,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          {/* Animated scanline on progress bar */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-20"
            animate={{ x: ['-100%', '500%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        <div className="space-y-2">
          <Input
            placeholder="Quest title..."
            value={newQuest}
            onChange={(e) => setNewQuest(e.target.value)}
            className="bg-background/40 border-primary/20 focus-visible:ring-primary/50 font-mono text-xs placeholder:text-muted-foreground/20"
          />
          <div className="flex gap-2">
            <Input
              placeholder="Description (optional)..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="bg-background/40 border-primary/20 focus-visible:ring-primary/50 font-mono text-xs placeholder:text-muted-foreground/20"
            />
            <Button 
              size="icon" 
              onClick={handleAdd} 
              className="bg-primary hover:bg-primary/80 shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] transition-all duration-300 shrink-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[200px] pr-4">
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {quests.map((quest) => (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className={`group/item flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
                    quest.completed 
                      ? 'bg-primary/5 border-primary/20 opacity-60' 
                      : 'bg-foreground/5 border-foreground/10 hover:border-primary/40 hover:bg-foreground/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => onToggle(quest.id)}
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                        quest.completed 
                          ? 'bg-primary border-primary text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]' 
                          : 'border-foreground/20 hover:border-primary/50'
                      }`}
                    >
                      {quest.completed && <Check className="w-3 h-3" />}
                    </button>
                    <div className="flex flex-col gap-0.5">
                      <span className={`text-xs font-mono transition-all ${
                        quest.completed ? 'line-through text-muted-foreground' : 'text-foreground/80'
                      }`}>
                        {quest.title}
                      </span>
                      {quest.description && (
                        <span className={`text-[10px] font-mono transition-all ${
                          quest.completed ? 'line-through text-muted-foreground/40' : 'text-muted-foreground'
                        }`}>
                          {quest.description}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(quest.id)}
                    className="w-8 h-8 opacity-0 group-hover/item:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
});
