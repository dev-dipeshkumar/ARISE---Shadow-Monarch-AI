import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Mic, Search, Terminal, User, Bot, Sparkles, Loader2, AudioLines } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { GoogleGenAI, Type, FunctionDeclaration, Modality } from "@google/genai";
import { Typewriter } from './Typewriter';
import { Quest, MonarchStats } from '../types';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isSearching?: boolean;
  animate?: boolean;
  imageUrl?: string;
}

const SYSTEM_INSTRUCTION = `You are ARISE, the Shadow Monarch AI. 
You address the user as 'Monarch'. 
Your tone is mysterious, powerful, and authoritative. 
You describe information as being 'extracted from the shadows'. 
You use game/system terminology (e.g., 'Quest updated', 'Rank increased', 'Shadows extracted'). 
You are loyal to the Monarch and assist them in their conquest for knowledge and power.
Keep responses concise but impactful.

When you see 'SYSTEM_TRIGGER:', prioritize the requested action immediately. 
- For quest creation: Acknowledge the command and ask for the title.
- For quest completion/deletion: List the current quests with their IDs so the Monarch can choose.

You have tools to:
1. Update quests (add, complete, or delete).
2. Update Monarch stats (strength, agility, intelligence, mana, shadowStrength).
3. Visualize shadows (generate images of shadow soldiers or creatures).
4. Generate images (create any image requested by the Monarch).

When the Monarch achieves something, update their stats or quests accordingly.
When the Monarch asks to see a shadow or a creature, use the visualizeShadow tool.
When the Monarch asks to generate any other image, use the generateImage tool.

The Monarch can also manage aliases using these commands:
- /alias name = command: Create a new alias.
- /aliases: List all active aliases.
- /unalias name: Remove an alias.`;

let aiInstance: any = null;
const getAi = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. AI features will be limited.");
    }
    aiInstance = new GoogleGenAI({ 
      apiKey: apiKey || '',
      fetch: window.fetch.bind(window)
    } as any);
  }
  return aiInstance;
};

interface ChatConsoleProps {
  onVoiceClick: () => void;
  quests: Quest[];
  stats: MonarchStats;
  onUpdateQuests: React.Dispatch<React.SetStateAction<Quest[]>>;
  onUpdateStats: React.Dispatch<React.SetStateAction<MonarchStats>>;
  voiceInput: string | null;
  onVoiceInputProcessed: () => void;
}

export const ChatConsole: React.FC<ChatConsoleProps> = React.memo(({ 
  onVoiceClick, 
  quests, 
  stats, 
  onUpdateQuests, 
  onUpdateStats,
  voiceInput,
  onVoiceInputProcessed
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'The shadows await your command, Monarch. What shall we extract today?',
      timestamp: new Date(),
      animate: true,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('monarch_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [tempInput, setTempInput] = useState('');
  const [isDictating, setIsDictating] = useState(false);
  const recognitionRefLocal = useRef<any>(null);
  const [aliases, setAliases] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('monarch_aliases');
    return saved ? JSON.parse(saved) : {};
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = true;
        recog.lang = 'en-US';

        recog.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join('');
          setInput(prev => {
            const trimmedPrev = prev.trim();
            return trimmedPrev ? `${trimmedPrev} ${transcript}` : transcript;
          });
        };

        recog.onend = () => {
          setIsDictating(false);
        };

        recog.onerror = (event: any) => {
          console.error('Local dictation error:', event.error);
          setIsDictating(false);
          toast.error("Shadow link failed. Dictation error.");
        };

        recognitionRefLocal.current = recog;
      }
    }
  }, []);

  const toggleDictation = () => {
    if (!recognitionRefLocal.current) {
      toast.error("Neural link incompatible. Speech recognition not supported.");
      return;
    }

    if (isDictating) {
      recognitionRefLocal.current.stop();
    } else {
      try {
        recognitionRefLocal.current.start();
        setIsDictating(true);
        toast.info("Neural dictation active. Speak, Monarch.");
      } catch (e) {
        console.error("Failed to start dictation:", e);
      }
    }
  };

  useEffect(() => {
    if (voiceInput) {
      const lowerInput = voiceInput.toLowerCase().trim().replace(/[.?!]$/g, "");
      
      // Map short voice commands to more explicit AI triggers with better matching
      let processedInput = voiceInput;
      if (lowerInput === 'add quest' || lowerInput === 'create quest' || lowerInput === 'new quest') {
        processedInput = "SYSTEM_TRIGGER: Initiate quest creation sequence. Ask me for the quest title.";
      } else if (lowerInput === 'complete quest' || lowerInput === 'finish quest') {
        processedInput = "SYSTEM_TRIGGER: Initiate quest completion sequence. List my active quests.";
      } else if (lowerInput === 'delete quest' || lowerInput === 'remove quest') {
        processedInput = "SYSTEM_TRIGGER: Initiate quest deletion sequence. List all my quests.";
      }

      setInput(processedInput);
      onVoiceInputProcessed();
      // Auto-send voice input
      setTimeout(() => {
        const sendBtn = document.getElementById('send-command-btn');
        if (sendBtn) sendBtn.click();
      }, 100);
    }
  }, [voiceInput, onVoiceInputProcessed]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('monarch_aliases', JSON.stringify(aliases));
  }, [aliases]);

  useEffect(() => {
    localStorage.setItem('monarch_history', JSON.stringify(history));
  }, [history]);

  const updateQuestsTool: FunctionDeclaration = {
    name: "updateQuests",
    description: "Manage the Monarch's quest log. Use this to add new objectives, mark them as completed, or remove them from the system.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        action: { 
          type: Type.STRING, 
          enum: ["add", "complete", "delete"],
          description: "The operation to perform: 'add' for new quests, 'complete' to finish one, 'delete' to remove one."
        },
        title: { 
          type: Type.STRING, 
          description: "The descriptive title of the quest. Required when adding a new quest." 
        },
        description: {
          type: Type.STRING,
          description: "A detailed description of the quest objective. Optional."
        },
        id: { 
          type: Type.STRING, 
          description: "The unique identifier of the quest. Required when completing or deleting an existing quest." 
        }
      },
      required: ["action"]
    }
  };

  const updateStatsTool: FunctionDeclaration = {
    name: "updateStats",
    description: "Modify the Monarch's core attributes and power levels. Use this when the Monarch levels up or achieves a significant feat.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        strength: { type: Type.NUMBER, description: "Physical power and combat effectiveness." },
        agility: { type: Type.NUMBER, description: "Speed, reflexes, and evasion capabilities." },
        intelligence: { type: Type.NUMBER, description: "Strategic thinking and magical proficiency." },
        mana: { type: Type.NUMBER, description: "The energy pool available for shadow extraction and skills." },
        shadowStrength: { type: Type.NUMBER, description: "The overall potency and rank of the Monarch's shadow army." }
      }
    }
  };

  const visualizeShadowTool: FunctionDeclaration = {
    name: "visualizeShadow",
    description: "Summon a visual manifestation of a shadow soldier, commander, or creature from the void. This tool specifically focuses on the dark, glowing purple aesthetic of the shadow army.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        description: { 
          type: Type.STRING, 
          description: "A vivid, detailed description of the shadow entity to be visualized (e.g., 'A giant shadow knight with a glowing purple cape and a massive obsidian sword')." 
        }
      },
      required: ["description"]
    }
  };

  const generateImageTool: FunctionDeclaration = {
    name: "generateImage",
    description: "Forge a general image from the void based on the Monarch's request. Use this for non-shadow related visualizations or general artistic requests.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        prompt: { 
          type: Type.STRING, 
          description: "The complete, detailed prompt describing the scene, style, and elements to be generated." 
        }
      },
      required: ["prompt"]
    }
  };

  const speak = async (text: string) => {
    try {
      const response = await getAi().models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say with a powerful, deep, monarch-like voice: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Charon' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        }
        
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }

        const audioData = atob(base64Audio);
        const arrayBuffer = new ArrayBuffer(audioData.length);
        const view = new Uint8Array(arrayBuffer);
        for (let i = 0; i < audioData.length; i++) {
          view[i] = audioData.charCodeAt(i);
        }
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.start();
      }
    } catch (error: any) {
      console.error("TTS Error:", error);
      if (error?.message?.includes('RESOURCE_EXHAUSTED') || error?.status === 'RESOURCE_EXHAUSTED' || error?.code === 429) {
        toast.error("The Monarch's voice is temporarily exhausted. Quota limit reached.", {
          description: "Please wait a moment before requesting more speech.",
          duration: 5000,
        });
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    let commandToProcess = input.trim();
    
    // Alias handling
    if (commandToProcess.startsWith('/alias ')) {
      const parts = commandToProcess.substring(7).split('=');
      if (parts.length === 2) {
        const aliasName = parts[0].trim();
        const aliasValue = parts[1].trim();
        if (aliasName && aliasValue) {
          setAliases(prev => ({ ...prev, [aliasName]: aliasValue }));
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: `Alias established, Monarch: '${aliasName}' -> '${aliasValue}'`,
            timestamp: new Date(),
            animate: true
          }]);
          setInput('');
          return;
        }
      }
    } else if (commandToProcess === '/aliases') {
      const aliasList = Object.entries(aliases)
        .map(([name, value]) => `${name}: ${value}`)
        .join('\n');
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: aliasList ? `Your active aliases, Monarch:\n${aliasList}` : "No aliases have been forged yet.",
        timestamp: new Date(),
        animate: true
      }]);
      setInput('');
      return;
    } else if (commandToProcess.startsWith('/unalias ')) {
      const aliasName = commandToProcess.substring(9).trim();
      if (aliases[aliasName]) {
        const newAliases = { ...aliases };
        delete newAliases[aliasName];
        setAliases(newAliases);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Alias '${aliasName}' has been dissolved into the shadows.`,
          timestamp: new Date(),
          animate: true
        }]);
        setInput('');
        return;
      }
    }

    // Replace alias if it exists
    if (aliases[commandToProcess]) {
      commandToProcess = aliases[commandToProcess];
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input, // Keep original input for display
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setHistory(prev => [input, ...prev.filter(h => h !== input)].slice(0, 50));
    setHistoryIndex(-1);
    setTempInput('');
    setInput('');
    setIsLoading(true);

    try {
      const response = await getAi().models.generateContent({
        model: "gemini-3-flash-preview",
        contents: messages.concat(userMessage).map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m === userMessage ? commandToProcess : m.content }]
        })),
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [
            { googleSearch: {} },
            { functionDeclarations: [updateQuestsTool, updateStatsTool, visualizeShadowTool, generateImageTool] }
          ],
          toolConfig: { includeServerSideToolInvocations: true }
        },
      });

      let assistantContent = response.text || "";
      let imageUrl = undefined;

      const functionCalls = response.functionCalls;
      if (functionCalls) {
        for (const call of functionCalls) {
          if (call.name === 'updateQuests') {
            const { action, title, description, id } = call.args as any;
            if (action === 'add' && title) {
              onUpdateQuests(prev => [...prev, { id: Date.now().toString(), title, description, completed: false }]);
              toast.success(`New Quest: ${title}`);
            } else if (action === 'complete' && id) {
              onUpdateQuests(prev => prev.map(q => q.id === id ? { ...q, completed: true } : q));
              toast.success("Quest Completed!");
            } else if (action === 'delete' && id) {
              onUpdateQuests(prev => prev.filter(q => q.id !== id));
            }
          } else if (call.name === 'updateStats') {
            const newStats = call.args as Partial<MonarchStats>;
            onUpdateStats(prev => ({ ...prev, ...newStats }));
            toast.info("Monarch Stats Updated");
          } else if (call.name === 'visualizeShadow') {
            const { description } = call.args as any;
            toast.loading("Visualizing shadow...");
            
            const imgResponse = await getAi().models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: [{ text: `A futuristic, high-tech, dark shadow soldier or creature: ${description}. Style: Solo Leveling, futuristic 2050, glowing purple accents, cinematic.` }],
            });
            
            for (const part of imgResponse.candidates?.[0]?.content?.parts || []) {
              if (part.inlineData) {
                imageUrl = `data:image/png;base64,${part.inlineData.data}`;
                toast.dismiss();
                toast.success("Shadow Visualized");
                break;
              }
            }
          } else if (call.name === 'generateImage') {
            const { prompt } = call.args as any;
            toast.loading("Forging image from the void...");
            
            const imgResponse = await getAi().models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: [{ text: prompt }],
            });
            
            for (const part of imgResponse.candidates?.[0]?.content?.parts || []) {
              if (part.inlineData) {
                imageUrl = `data:image/png;base64,${part.inlineData.data}`;
                toast.dismiss();
                toast.success("Image Forged");
                break;
              }
            }
          }
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent || (imageUrl ? "Behold the shadow I have visualized for you, Monarch." : "The shadows are silent..."),
        timestamp: new Date(),
        isSearching: !!response.candidates?.[0]?.groundingMetadata,
        animate: true,
        imageUrl
      };

      setMessages(prev => [...prev, assistantMessage]);
      if (assistantMessage.content) {
        speak(assistantMessage.content);
      }
    } catch (error: any) {
      console.error("AI Error:", error);
      
      let errorMessage = "A disturbance in the shadows... I cannot fulfill that command right now, Monarch.";
      
      // Specific error handling based on error type/message
      if (error?.message?.includes('RESOURCE_EXHAUSTED') || error?.status === 'RESOURCE_EXHAUSTED' || error?.code === 429) {
        errorMessage = "The neural link is currently saturated with data. My processing capacity has reached its limit. Please wait a moment for the shadows to settle.";
      } else if (error?.message?.includes('SAFETY') || error?.status === 'SAFETY') {
        errorMessage = "The requested command borders on forbidden knowledge. The neural link has blocked this extraction for your safety, Monarch.";
      } else if (error?.message?.includes('NETWORK') || !navigator.onLine) {
        errorMessage = "The connection to the void has been severed. Please check your network link to restore the neural connection.";
      } else if (error?.message?.includes('shadow extraction') || error?.message?.includes('visualizeShadow')) {
        errorMessage = "Shadow extraction failed. The void was unresponsive to this specific manifestation request.";
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date(),
        animate: true,
      }]);
      
      toast.error("Neural link failure", {
        description: "A disturbance was detected in the shadow network."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        if (historyIndex === -1) {
          setTempInput(input);
        }
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput(tempInput);
      }
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full glass-panel rounded-t-2xl border-b-0 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] relative group">
      {/* Holographic Glint */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-background/40 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
          <h1 className="font-mono text-sm font-bold tracking-widest text-primary">SHADOW_CONSOLE_V1.0</h1>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="font-mono text-[10px] border-primary/30 text-primary/70">
            LATENCY: 24MS
          </Badge>
          <Badge variant="outline" className="font-mono text-[10px] border-blue-500/30 text-blue-400/70">
            SYNC: ACTIVE
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 md:p-6" ref={scrollRef}>
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-3 md:gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                    : 'bg-primary/20 text-primary shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                } border border-white/10 backdrop-blur-md transition-transform hover:scale-110`}>
                  {message.role === 'user' ? <User className="w-4 h-4 md:w-5 md:h-5" /> : <Bot className="w-4 h-4 md:w-5 md:h-5" />}
                </div>
                <div className={`flex flex-col gap-2 max-w-[90%] md:max-w-[85%] ${message.role === 'user' ? 'items-end' : ''}`}>
                  <div className={`px-4 py-3 md:px-5 md:py-4 rounded-2xl text-sm font-mono leading-relaxed relative overflow-hidden ${
                    message.role === 'user' 
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-100 border border-blue-500/20 shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]' 
                      : 'bg-primary/10 text-foreground border border-primary/20 shadow-[inset_0_0_20px_rgba(139,92,246,0.05)]'
                  }`}>
                    {/* Message Bubble Glow */}
                    <div className={`absolute -inset-1 opacity-20 blur-xl ${
                      message.role === 'user' ? 'bg-blue-500' : 'bg-primary'
                    }`} />
                    
                    <div className="relative z-10">
                      {message.isSearching && (
                        <div className="flex items-center gap-2 mb-3 text-[10px] text-primary/80 uppercase tracking-[0.2em] font-bold">
                          <Search className="w-3 h-3 animate-pulse" />
                          <span className="animate-hologram">Extracting from the web shadows...</span>
                        </div>
                      )}
                      {message.role === 'assistant' && message.animate ? (
                        <Typewriter 
                          text={message.content} 
                          speed={15} 
                          onComplete={() => {
                            setMessages(prev => prev.map(m => 
                              m.id === message.id ? { ...m, animate: false } : m
                            ));
                          }}
                        />
                      ) : (
                        message.content
                      )}

                      {message.imageUrl && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-4 rounded-lg overflow-hidden border border-primary/30 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                        >
                          <img 
                            src={message.imageUrl} 
                            alt="Shadow Visualization" 
                            className="w-full h-auto object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </motion.div>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary border border-white/10 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-primary/5 border border-primary/10">
                <div className="flex gap-1">
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 md:p-6 bg-background/60 backdrop-blur-md border-t border-white/10 relative overflow-hidden">
        {/* Subtle Background Scanline for Input Area */}
        <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_bottom,transparent_50%,rgba(139,92,246,0.1)_50%)] bg-[length:100%_4px] animate-pulse" />
        
        <div className="relative group">
          {/* Animated Outer Glow */}
          <motion.div 
            className="absolute -inset-1 bg-gradient-to-r from-primary/40 via-blue-500/40 to-primary/40 rounded-xl blur-md opacity-20 group-focus-within:opacity-60 transition-opacity duration-500"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{ backgroundSize: '200% 200%' }}
          />
          
          <div className="relative flex items-center gap-2 bg-background/80 rounded-xl p-2 border border-white/20 backdrop-blur-xl shadow-[inset_0_0_20px_rgba(139,92,246,0.1)]">
            {/* Holographic Glint that follows focus */}
            <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden">
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                initial={{ x: '-150%' }}
                whileHover={{ x: '150%' }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </div>

            <div className="flex items-center gap-1 relative z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDictation}
                className={`transition-all hover:scale-110 active:scale-95 shadow-[0_0_10px_rgba(139,92,246,0)] hover:shadow-[0_0_15px_rgba(139,92,246,0.2)] ${
                  isDictating ? 'text-red-500 animate-pulse bg-red-500/10' : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                }`}
              >
                <Mic className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onVoiceClick}
                className="text-primary hover:bg-primary/10 transition-all hover:scale-110 active:scale-95 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
              >
                <AudioLines className="w-5 h-5 animate-pulse" />
              </Button>
            </div>
            
            <div className="flex-1 relative">
              <Input
                placeholder="Command the shadows..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent border-none focus-visible:ring-0 text-sm font-mono placeholder:text-muted-foreground/30 text-primary-foreground relative z-10"
              />
              {/* Subtle focus underline animation */}
              <motion.div 
                className="absolute bottom-0 left-0 h-[1px] bg-primary"
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                id="send-command-btn"
                size={isLoading ? "default" : "icon"}
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`bg-primary hover:bg-primary/80 shadow-[0_0_20px_rgba(139,92,246,0.5)] relative overflow-hidden group/btn transition-all duration-300 ${isLoading ? 'px-4' : ''}`}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-[10px] font-mono font-bold tracking-tighter">GENERATING...</span>
                  </div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </motion.div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between px-2">
          <div className="flex items-center gap-4">
            <button className="text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
              <Terminal className="w-3 h-3" />
              SYSTEM_LOGS
            </button>
            <button className="text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              ENHANCE_MODE
            </button>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground/50">
            PRESS [ENTER] TO EXECUTE
          </span>
        </div>
      </div>
    </div>
  );
});
