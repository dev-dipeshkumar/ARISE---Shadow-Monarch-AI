import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, X, Volume2, Zap, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShadowHeartbeat } from './ShadowHeartbeat';
import { toast } from 'sonner';
import { GoogleGenAI, Modality } from "@google/genai";

interface VoiceModeProps {
  isOpen: boolean;
  onClose: () => void;
  onResult: (text: string) => void;
}

let aiInstance: any = null;
const getAi = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. JARVIS's voice system will be offline.");
    }
    aiInstance = new GoogleGenAI({ 
      apiKey: apiKey || '',
      fetch: window.fetch.bind(window)
    } as any);
  }
  return aiInstance;
};

const SYSTEM_INSTRUCTION = `You are JARVIS, the Shadow Monarch's loyal AI system. 
You address the user as 'Monarch'. 
Your tone is sophisticated, British, helpful, and slightly dry. 
You are highly intelligent and efficient. 
Keep your responses brief and conversational, as they will be spoken aloud.`;

const NeuralWaveform = ({ active, processing }: { active: boolean; processing: boolean }) => {
  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className={`w-1 rounded-full ${processing ? 'bg-blue-400' : 'bg-primary'}`}
          animate={active || processing ? {
            height: processing ? [12, 24, 12] : [8, 32, 12, 40, 8],
            opacity: processing ? [0.5, 1, 0.5] : [0.3, 1, 0.5, 1, 0.3],
          } : {
            height: 4,
            opacity: 0.2
          }}
          transition={{
            duration: processing ? 0.8 : 1.2,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

const ProcessingRing = () => (
  <motion.div
    className="absolute -inset-12 border-2 border-dashed border-blue-400/30 rounded-full"
    animate={{ rotate: 360 }}
    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
  >
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
  </motion.div>
);

export const VoiceMode: React.FC<VoiceModeProps> = React.memo(({ isOpen, onClose, onResult }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const audioContextRef = useRef<AudioContext | null>(null);
  const isSpeakingRef = useRef(false);

  const speak = async (text: string) => {
    try {
      isSpeakingRef.current = true;
      const response = await getAi().models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Puck' }, // Puck is a sophisticated British-like voice
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
        
        return new Promise<void>((resolve) => {
          source.onended = () => {
            isSpeakingRef.current = false;
            resolve();
          };
          source.start();
        });
      }
    } catch (error: any) {
      console.error("TTS Error:", error);
      isSpeakingRef.current = false;
    }
  };

  const processAI = async (text: string) => {
    setIsProcessing(true);
    try {
      const response = await getAi().models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ role: 'user', parts: [{ text }] }],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });

      const reply = response.text || "";
      
      // Check if any tools were called (e.g., updateQuests, updateStats, etc.)
      const functionCalls = response.functionCalls;
      if (functionCalls && functionCalls.length > 0) {
        // If a tool was called, we close voice mode so the user can see the result in the console.
        onResult(text); // This will trigger the message in ChatConsole
        onClose();
        return;
      }

      setAiResponse(reply);
      if (reply) {
        await speak(reply);
      }
      
      // After speaking, if we were listening, resume
      if (recognitionRef.current && recognitionRef.current.isListeningState) {
        try {
          recognitionRef.current.start();
        } catch (e) {}
      }
    } catch (error: any) {
      console.error("AI Processing Error:", error);
      let errorMessage = "A disturbance in the shadows... I cannot fulfill that command right now, Monarch.";
      
      if (error?.message?.includes('RESOURCE_EXHAUSTED') || error?.status === 'RESOURCE_EXHAUSTED' || error?.code === 429) {
        errorMessage = "The neural link is currently saturated. Please wait a moment, Monarch.";
      } else if (error?.message?.includes('NETWORK') || !navigator.onLine) {
        errorMessage = "The connection to the void has been severed. Check your network link.";
      }

      setAiResponse(errorMessage);
      await speak(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Initialize recognition once
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setIsSupported(false);
        return;
      }

      const recog = new SpeechRecognition();
      recog.continuous = false; // Change to false for better turn-taking in live mode
      recog.interimResults = true;
      recog.lang = 'en-US';

      recog.onstart = () => {
        setError(null);
        setIsListening(true);
      };

      recog.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setTranscript('');
            processAI(result);
          } else {
            interimTranscript += result;
          }
        }
        setTranscript(interimTranscript);
      };

      recog.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setError("Microphone access denied. Please enable permissions in your browser settings.");
        } else if (event.error === 'network') {
          setError("Network error. Please check your connection.");
        } else {
          setError(`Recognition error: ${event.error}`);
        }
        setIsListening(false);
      };

      recog.onend = () => {
        // Only restart if we're still supposed to be listening AND not speaking/processing
        if (recognitionRef.current && recognitionRef.current.isListeningState && !isSpeakingRef.current && !isProcessing) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error("Failed to restart recognition:", e);
          }
        }
      };

      recognitionRef.current = recog;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onResult]);

  // Sync internal state with ref for onend handler
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.isListeningState = isListening;
    }
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      if (!isSupported) {
        toast.error("Speech recognition is not supported in this browser.");
      }
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.info("Neural link established. Speak now, Monarch.");
      } catch (e) {
        console.error("Failed to start recognition:", e);
        setIsListening(false);
      }
    }
  }, [isListening, isSupported]);

  // Auto-start listening when opened
  useEffect(() => {
    if (isOpen && !isListening && isSupported) {
      const timer = setTimeout(() => {
        toggleListening();
      }, 500); // Small delay to ensure UI is ready
      return () => clearTimeout(timer);
    }
  }, [isOpen, isListening, isSupported, toggleListening]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-between py-12 bg-background/95 backdrop-blur-3xl overflow-hidden"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
          <div className="scanline opacity-20" />
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-6 right-6 text-foreground/30 hover:text-primary hover:bg-primary/10 transition-all duration-300 z-50"
        >
          <X className="w-8 h-8" />
        </Button>

        <div className="flex-1 flex flex-col items-center justify-center gap-8 md:gap-12 relative z-10 px-6 w-full max-w-2xl">
          {!isSupported ? (
            <div className="text-center space-y-6">
              <AlertCircle className="w-16 h-16 text-destructive mx-auto animate-pulse" />
              <h2 className="text-3xl font-display font-bold text-foreground">SYSTEM INCOMPATIBLE</h2>
              <p className="text-muted-foreground font-mono">Speech recognition is not available in this environment. Please use a modern browser like Chrome.</p>
              <Button onClick={onClose} variant="outline" className="border-primary/30 text-primary">RETURN TO CONSOLE</Button>
            </div>
          ) : error ? (
            <div className="text-center space-y-6">
              <div className="relative">
                <AlertCircle className="w-20 h-20 text-destructive mx-auto" />
                <motion.div 
                  className="absolute inset-0 bg-destructive/20 blur-2xl rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-display font-bold text-destructive tracking-tighter">EXTRACTION FAILED</h2>
                <p className="text-muted-foreground font-mono text-sm max-w-md mx-auto">{error}</p>
              </div>
              <div className="flex flex-col gap-3">
                <Button onClick={() => { setError(null); toggleListening(); }} className="bg-primary hover:bg-primary/80">RETRY LINK</Button>
                <Button onClick={onClose} variant="ghost" className="text-muted-foreground">ABORT MISSION</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="relative group">
                <div className={`transition-all duration-700 ${isProcessing ? 'scale-110' : 'scale-100'}`}>
                  <ShadowHeartbeat />
                </div>
                
                {/* Orbital Rings */}
                <div className={`absolute -inset-4 border border-primary/10 rounded-full animate-[spin_15s_linear_infinite] pointer-events-none ${isProcessing ? 'border-blue-400/20' : ''}`} />
                <div className="absolute -inset-8 border border-blue-500/5 rounded-full animate-[spin_25s_linear_infinite_reverse] pointer-events-none" />
                
                {isProcessing && <ProcessingRing />}
                
                {isListening && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary shadow-[0_0_30px_rgba(139,92,246,0.5)]"
                    animate={{ scale: [1, 1.8], opacity: [1, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                
                {/* Holographic Glint */}
                <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent skew-x-12"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              </div>

              <div className="text-center space-y-6 w-full">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h2 className={`text-4xl md:text-5xl font-display font-bold tracking-tighter bg-clip-text text-transparent transition-all duration-500 ${
                      isProcessing 
                        ? 'bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 animate-pulse' 
                        : 'bg-gradient-to-r from-foreground via-primary to-blue-400 animate-hologram'
                    }`}>
                      {isProcessing ? "ANALYZING..." : isListening ? "LISTENING..." : "VOICE MODE"}
                    </h2>
                    <div className="flex items-center justify-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                        isProcessing ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]' : 
                        isListening ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 
                        'bg-primary/40'
                      }`} />
                      <span className={`text-[10px] font-mono tracking-[0.3em] uppercase transition-colors duration-300 ${
                        isProcessing ? 'text-blue-400/60' : 'text-primary/60'
                      }`}>
                        {isProcessing ? "Neural_Computation" : isListening ? "Neural_Link_Active" : "Link_Standby"}
                      </span>
                    </div>
                  </div>
                  
                  <NeuralWaveform active={isListening} processing={isProcessing} />
                </div>
                
                <div className="relative min-h-[4rem] flex flex-col items-center justify-center gap-4">
                  <AnimatePresence mode="wait">
                    {isProcessing ? (
                      <motion.div
                        key="processing"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="flex flex-col items-center gap-3"
                      >
                        <div className="flex items-center gap-3 text-blue-400 font-mono text-sm tracking-widest">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>DECODING_MONARCH_INTENT...</span>
                        </div>
                        <div className="w-48 h-1 bg-blue-400/10 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-blue-400"
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.p 
                        key={transcript || aiResponse || 'placeholder'}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-xl md:text-2xl font-mono text-foreground/80 leading-tight italic text-center"
                      >
                        {aiResponse ? (
                          <span className="text-primary/90 not-italic">"{aiResponse}"</span>
                        ) : (
                          transcript || (isListening ? "Speak now, Monarch..." : "Click the core to begin extraction.")
                        )}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  {/* Subtle text glow */}
                  <div className="absolute inset-0 blur-2xl bg-primary/5 -z-10" />
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  size="lg"
                  onClick={toggleListening}
                  className={`w-24 h-24 rounded-full border-2 ${
                    isListening 
                      ? 'bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]' 
                      : 'bg-primary/20 border-primary text-primary shadow-[0_0_30px_rgba(139,92,246,0.3)]'
                  } backdrop-blur-xl transition-all duration-500 relative overflow-hidden group/btn`}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  {isListening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
                </Button>
              </motion.div>
            </>
          )}
        </div>

        <div className="relative z-10 flex flex-wrap justify-center gap-6 md:gap-12 px-6">
          <div className="flex items-center gap-3 text-foreground/40 font-mono text-[10px] tracking-widest group cursor-help">
            <Volume2 className="w-4 h-4 group-hover:text-primary transition-colors" />
            <span className="group-hover:text-foreground/60 transition-colors uppercase">Auto-Speak: Active</span>
          </div>
          <div className="flex items-center gap-3 text-foreground/40 font-mono text-[10px] tracking-widest group cursor-help">
            <Mic className="w-4 h-4 group-hover:text-primary transition-colors" />
            <span className="group-hover:text-foreground/60 transition-colors uppercase">Neural_Gain: High</span>
          </div>
          <div className="flex items-center gap-3 text-foreground/40 font-mono text-[10px] tracking-widest group cursor-help">
            <Zap className="w-4 h-4 group-hover:text-primary transition-colors" />
            <span className="group-hover:text-foreground/60 transition-colors uppercase">Latency: 12ms</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});
