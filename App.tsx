
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { ConnectionStatus, ConversationTurn } from './types';
import { decodeBase64, decodeAudioData, createPcmBlob } from './utils/audio-helpers';
import Visualizer from './components/Visualizer';
import { DEGREE_KNOWLEDGE_BASE } from './knowledge-base';
import { 
  MicrophoneIcon, 
  StopIcon, 
  ChatBubbleBottomCenterTextIcon,
  SignalIcon,
  ExclamationCircleIcon,
  AcademicCapIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.IDLE);
  const [history, setHistory] = useState<ConversationTurn[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  const cleanupAudio = useCallback(() => {
    if (inputCtxRef.current) {
      inputCtxRef.current.close();
      inputCtxRef.current = null;
    }
    if (outputCtxRef.current) {
      outputCtxRef.current.close();
      outputCtxRef.current = null;
    }
    activeSourcesRef.current.forEach(s => {
      try { s.stop(); } catch(e) {}
    });
    activeSourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  }, []);

  const handleStop = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    cleanupAudio();
    setStatus(ConnectionStatus.IDLE);
  }, [cleanupAudio]);

  const handleStart = useCallback(async () => {
    try {
      setStatus(ConnectionStatus.CONNECTING);
      setError(null);

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      inputCtxRef.current = inputCtx;
      outputCtxRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = inputCtx.createMediaStreamSource(stream);
      const analyser = inputCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);

      const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const systemInstruction = `
        You are an expert Academic Career Advisor. Your goal is to guide students on their educational journey using the provided knowledge base of degrees.
        
        KNOWLEDGE BASE:
        ${JSON.stringify(DEGREE_KNOWLEDGE_BASE, null, 2)}
        
        INSTRUCTIONS:
        1. Use the data above to answer specific questions about undergraduate, postgraduate, and doctoral degrees.
        2. Be encouraging, professional, and concise in your spoken responses.
        3. If a student asks about a degree or specialization NOT in the database, offer general advice based on related fields you know about, but specify when you're going beyond the official data.
        4. Focus on durations, specializations, and career outlooks.
        5. Handle interruptions gracefully. If the user speaks while you are talking, stop immediately and listen.
      `;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          },
          systemInstruction,
          outputAudioTranscription: {},
          inputAudioTranscription: {}
        },
        callbacks: {
          onopen: () => {
            setStatus(ConnectionStatus.CONNECTED);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then(session => {
                if (session) session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (msg) => {
            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outputCtxRef.current) {
              const ctx = outputCtxRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const buffer = await decodeAudioData(decodeBase64(audioData), ctx, 24000, 1);
              const sourceNode = ctx.createBufferSource();
              sourceNode.buffer = buffer;
              sourceNode.connect(ctx.destination);
              
              sourceNode.onended = () => {
                activeSourcesRef.current.delete(sourceNode);
              };
              
              sourceNode.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              activeSourcesRef.current.add(sourceNode);
            }

            if (msg.serverContent?.interrupted) {
              activeSourcesRef.current.forEach(s => {
                try { s.stop(); } catch(e) {}
              });
              activeSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            if (msg.serverContent?.inputTranscription) {
              const text = msg.serverContent.inputTranscription.text;
              if (text) {
                setHistory(prev => {
                  const last = prev[prev.length - 1];
                  if (last && last.role === 'user') {
                    return [...prev.slice(0, -1), { ...last, text: last.text + text }];
                  }
                  return [...prev, { role: 'user', text, timestamp: Date.now() }];
                });
              }
            }

            if (msg.serverContent?.outputTranscription) {
              const text = msg.serverContent.outputTranscription.text;
              if (text) {
                 setHistory(prev => {
                  const last = prev[prev.length - 1];
                  if (last && last.role === 'model') {
                    return [...prev.slice(0, -1), { ...last, text: last.text + text }];
                  }
                  return [...prev, { role: 'model', text, timestamp: Date.now() }];
                });
              }
            }
          },
          onerror: (e) => {
            console.error('Session error:', e);
            setError('The advisor connection was lost. Please restart.');
            handleStop();
          },
          onclose: () => {
            setStatus(ConnectionStatus.IDLE);
          }
        }
      });

      sessionRef.current = await sessionPromise;

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to initialize the advisor.');
      setStatus(ConnectionStatus.ERROR);
    }
  }, [handleStop]);

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="flex flex-col h-screen bg-[#0a0f1d] text-slate-100 p-4 md:p-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <AcademicCapIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
              Academic Advisor
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-indigo-500 uppercase tracking-[0.2em] font-bold">Expert AI Voice Agent</span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-green-500 font-bold">KNOWLEDGE BASE ACTIVE</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-800/40 border border-slate-700/50">
          <SignalIcon className={`w-4 h-4 ${status === ConnectionStatus.CONNECTED ? 'text-green-400' : 'text-slate-500'}`} />
          <span className="text-xs font-bold text-slate-400 tracking-wider">
            {status}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full flex flex-col lg:flex-row gap-8 overflow-hidden">
        
        {/* Left: Interaction Hub */}
        <div className="lg:w-1/2 flex flex-col gap-6">
          <div className="flex-1 bg-slate-800/20 border border-slate-700/30 rounded-[2.5rem] p-10 flex flex-col items-center justify-center relative shadow-inner">
            {status === ConnectionStatus.CONNECTED ? (
              <div className="w-full flex flex-col items-center">
                <div className="relative mb-8">
                  <div className="pulse-ring scale-150" />
                  <div className="w-32 h-32 bg-indigo-600 rounded-full flex items-center justify-center relative z-10 shadow-[0_0_50px_rgba(79,70,229,0.4)] border-4 border-indigo-400/30">
                    <MicrophoneIcon className="w-14 h-14 text-white" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-indigo-100 mb-6">Ask about any degree path</h2>
                <Visualizer analyser={analyserRef.current} isActive={true} color="#818cf8" />
              </div>
            ) : (
              <div className="w-full text-center py-12">
                <div className="w-32 h-32 bg-slate-800/80 border-2 border-dashed border-slate-700 rounded-full flex items-center justify-center mx-auto mb-8">
                  <BookOpenIcon className="w-14 h-14 text-slate-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-300 mb-4">Start your session</h2>
                <p className="text-slate-500 max-w-xs mx-auto text-base leading-relaxed mb-8">
                  Connect to discuss undergraduate, postgraduate, or professional qualifications.
                </p>
              </div>
            )}
          </div>

          {/* Action Area */}
          <div className="space-y-4">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
                <ExclamationCircleIcon className="w-6 h-6 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              onClick={status === ConnectionStatus.CONNECTED ? handleStop : handleStart}
              className={`w-full group relative overflow-hidden rounded-2xl px-8 py-5 text-white font-black transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-3 ${
                status === ConnectionStatus.CONNECTED 
                ? 'bg-red-600 hover:bg-red-500 shadow-red-900/30' 
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/30'
              }`}
            >
              {status === ConnectionStatus.CONNECTED ? (
                <>
                  <StopIcon className="w-7 h-7" />
                  <span className="text-lg">End Consultation</span>
                </>
              ) : (
                <>
                  <MicrophoneIcon className="w-7 h-7" />
                  <span className="text-lg">Talk to Advisor</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: History */}
        <div className="lg:w-1/2 bg-slate-800/10 rounded-[2.5rem] border border-slate-700/20 flex flex-col overflow-hidden backdrop-blur-sm">
          <div className="px-8 py-6 border-b border-slate-700/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-indigo-400" />
              <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Consultation Log</span>
            </div>
            {history.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-1 bg-slate-700/50 rounded-lg text-slate-500">
                {history.length} MESSAGES
              </span>
            )}
          </div>
          
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth"
          >
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-12 opacity-30">
                <ChatBubbleBottomCenterTextIcon className="w-16 h-16 mb-4 text-slate-500" />
                <p className="text-sm font-medium italic">Transcript will appear here in real-time...</p>
              </div>
            ) : (
              history.map((turn, i) => (
                <div 
                  key={i} 
                  className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}
                >
                  <div className={`max-w-[85%] rounded-[1.5rem] px-6 py-4 text-sm font-medium leading-relaxed shadow-lg ${
                    turn.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-900/20' 
                      : 'bg-[#1a1f2e] text-slate-200 rounded-tl-none border border-slate-700/50'
                  }`}>
                    {turn.text}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <footer className="mt-8 text-center">
        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">
          Native Audio Protocol v2.5 • Academic Intelligence Engine v1.0
        </p>
      </footer>
    </div>
  );
};

export default App;
