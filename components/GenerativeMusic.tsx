
import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Sampling Engine Configuration
 * Update these URLs with your own .wav files.
 */
const SAMPLE_URLS = [
  'audio/loop1.wav',
  'audio/loop2.wav',
  'audio/loop3.wav',
  'audio/loop4.wav',
  'audio/loop5.wav',
  'audio/loop6.wav',
  'audio/loop7.wav',
  'audio/loop8.wav'
];

const getNotePosition = (pitchStr: string): number => {
  const note = pitchStr[0].toUpperCase();
  const oct = parseInt(pitchStr.slice(-1));
  const base = (oct - 5) * 7; 
  const map: Record<string, number> = { 'C': 0, 'D': 1, 'E': 2, 'F': 3, 'G': 4, 'A': 5, 'B': 6 };
  return base + (map[note] ?? 0);
};

interface Note {
  freq: string;
  position: number; 
  offset: number;  
}

interface LoopItem {
  id: number;
  baseDuration: number;
  clef: 'treble' | 'bass';
  notes: Note[];
}

const PHRASES: LoopItem[] = [
  { id: 1, baseDuration: 17.069, clef: 'treble', notes: [{ freq: "BB5", position: getNotePosition("BB5"), offset: 11.645 }] },
  { id: 2, baseDuration: 20.752, clef: 'treble', notes: [{ freq: "EB5", position: getNotePosition("EB5"), offset: 7.163 }] },
  { id: 3, baseDuration: 23.157, clef: 'treble', notes: [{ freq: "F6", position: getNotePosition("F6"), offset: 3.840 }] },
  { id: 4, baseDuration: 27.999, clef: 'treble', notes: [{ freq: "BB6", position: getNotePosition("BB6"), offset: 11.594 }] },
  { id: 5, baseDuration: 29.501, clef: 'treble', notes: [{ freq: "EB6", position: getNotePosition("EB6"), offset: 11.824 }] },
  { id: 6, baseDuration: 30.034, clef: 'bass', notes: [{ freq: "EB4", position: getNotePosition("EB4"), offset: 8.693 }] },
  { id: 7, baseDuration: 31.101, clef: 'bass', notes: [{ freq: "BB3", position: getNotePosition("BB3"), offset: 5.696 }] },
  { id: 8, baseDuration: 38.049, clef: 'bass', notes: [{ freq: "EB4", position: getNotePosition("EB4"), offset: 6.768 }] }
];

export const GenerativeMusic: React.FC = () => {
  const [audioState, setAudioState] = useState<'uninitialized' | 'loading' | 'active'>('uninitialized');
  const [activeLoops, setActiveLoops] = useState<Set<number>>(new Set());
  const [progress, setProgress] = useState<Record<number, number>>({});
  const [isNoteFiring, setIsNoteFiring] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [timbre, setTimbre] = useState(0.3);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const buffersRef = useRef<Record<number, AudioBuffer>>({});
  
  const timersRef = useRef<Record<number, any>>({});
  const noteTimeoutsRef = useRef<Record<number, number[]>>({});
  const startTimeRef = useRef<Record<number, number>>({});
  const activeLoopsRef = useRef<Set<number>>(new Set());
  const timbreRef = useRef(0.3);

  useEffect(() => {
    activeLoopsRef.current = activeLoops;
  }, [activeLoops]);

  useEffect(() => {
    timbreRef.current = timbre;
    if (filterNodeRef.current && audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      const cutoff = 200 + (timbre * 6000); 
      const resonance = timbre * 5; 
      filterNodeRef.current.frequency.setTargetAtTime(cutoff, now, 0.1);
      filterNodeRef.current.Q.setTargetAtTime(resonance, now, 0.1);
    }
  }, [timbre]);

  const loadSamples = async (ctx: AudioContext) => {
    const loadedBuffers: Record<number, AudioBuffer> = {};
    const promises = SAMPLE_URLS.map(async (url, index) => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to load ${url}`);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        loadedBuffers[index + 1] = audioBuffer;
      } catch (e) {
        console.warn(`Could not load sample ${index + 1}:`, e);
      }
    });
    await Promise.all(promises);
    buffersRef.current = loadedBuffers;
  };

  const initAudio = async () => {
    if (audioState === 'loading' || audioState === 'active') return;
    setAudioState('loading');
    
    try {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      const ctx = new AudioContextClass();
      
      const master = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const compressor = ctx.createDynamicsCompressor();
      
      master.gain.setValueAtTime(0.7, ctx.currentTime);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, ctx.currentTime);

      compressor.threshold.setValueAtTime(-24, ctx.currentTime);
      compressor.knee.setValueAtTime(30, ctx.currentTime);
      compressor.ratio.setValueAtTime(12, ctx.currentTime);

      master.connect(filter);
      filter.connect(compressor);
      compressor.connect(ctx.destination);
      
      audioCtxRef.current = ctx;
      masterGainRef.current = master;
      filterNodeRef.current = filter;
      
      await loadSamples(ctx);
      
      if (ctx.state === 'suspended') await ctx.resume();
      setAudioState('active');
    } catch (e) {
      console.error("Audio failed to initialize", e);
      setAudioState('uninitialized');
    }
  };

  const playSample = (loopId: number, volume = 0.5) => {
    const ctx = audioCtxRef.current;
    const buffer = buffersRef.current[loopId];
    if (!ctx || !masterGainRef.current || !buffer) return;
    
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();

    source.buffer = buffer;
    
    // Fade in/out to avoid clicks
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.1);
    
    // Apply a slight variation in playback rate based on timbre
    source.playbackRate.setValueAtTime(0.98 + (timbreRef.current * 0.04), now);

    source.connect(gain);
    gain.connect(masterGainRef.current);
    
    source.start(now);
    
    // Clean up
    source.onended = () => {
      source.disconnect();
      gain.disconnect();
    };

    setIsNoteFiring(true);
    setTimeout(() => setIsNoteFiring(false), 200);
  };

  const stopLoop = useCallback((id: number) => {
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
    if (noteTimeoutsRef.current[id]) {
      noteTimeoutsRef.current[id].forEach(t => clearTimeout(t));
      delete noteTimeoutsRef.current[id];
    }
    delete startTimeRef.current[id];
    
    setActiveLoops(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const startLoop = useCallback((id: number, delayMs = 0) => {
    const phrase = PHRASES.find(p => p.id === id);
    if (!phrase || activeLoopsRef.current.has(id)) return;

    setActiveLoops(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    const cycle = () => {
      if (!activeLoopsRef.current.has(id)) return;
      
      startTimeRef.current[id] = Date.now();
      noteTimeoutsRef.current[id] = [];
      
      phrase.notes.forEach(note => {
        const tid = window.setTimeout(() => {
          if (activeLoopsRef.current.has(id)) {
            playSample(id);
          }
        }, note.offset * 1000);
        noteTimeoutsRef.current[id]?.push(tid);
      });

      timersRef.current[id] = setTimeout(() => {
        if (activeLoopsRef.current.has(id)) cycle();
      }, phrase.baseDuration * 1000);
    };

    if (delayMs > 0) {
      setTimeout(cycle, delayMs);
    } else {
      cycle();
    }
  }, []);

  const onFragmentToggle = async (id: number) => {
    setAutoMode(false); 
    if (audioState === 'uninitialized') {
      await initAudio();
    }
    if (activeLoopsRef.current.has(id)) {
      stopLoop(id);
    } else {
      startLoop(id);
    }
  };

  const resetAndAutoInit = async () => {
    if (audioState === 'uninitialized') {
      await initAudio();
    }
    
    PHRASES.forEach(p => stopLoop(p.id));
    setAutoMode(true);
    
    PHRASES.forEach((p, i) => {
      startLoop(p.id, i * 200);
    });
  };

  useEffect(() => {
    const itv = setInterval(() => {
      const up: Record<number, number> = {};
      activeLoops.forEach(id => {
        const s = startTimeRef.current[id];
        const p = PHRASES.find(f => f.id === id);
        if (s && p) {
          const elapsed = (Date.now() - s) / 1000;
          up[id] = (elapsed / p.baseDuration) * 100;
        }
      });
      setProgress(up);
    }, 50);
    return () => clearInterval(itv);
  }, [activeLoops]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-16 py-4 select-none">
      {audioState !== 'active' ? (
        <div className="p-20 border border-zinc-100 bg-zinc-50/50 rounded-sm text-center space-y-8">
          <div className="space-y-4">
            <h4 className="serif italic text-4xl text-zinc-800">
              {audioState === 'loading' ? 'Loading Fragments...' : 'The library is hushed.'}
            </h4>
            <p className="text-zinc-500 font-light text-base max-w-sm mx-auto leading-relaxed">
              {audioState === 'loading' 
                ? 'Preparing 8 generative loops from the archive.' 
                : 'Experience the sample-based generative system. Each loop is a distinct recording that phases naturally.'}
            </p>
          </div>
          <button 
            onClick={initAudio}
            disabled={audioState === 'loading'}
            className="group relative px-12 py-5 bg-zinc-900 text-white text-[11px] uppercase tracking-[0.5em] overflow-hidden hover:bg-black transition-all shadow-xl disabled:opacity-50"
          >
            {audioState === 'loading' ? 'Decoding Audio...' : 'Awaken Audio Engine'}
          </button>
        </div>
      ) : (
        <>
          {/* Loop Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {PHRASES.map(p => {
              const active = activeLoops.has(p.id);
              const bufferLoaded = !!buffersRef.current[p.id];
              return (
                <button
                  key={p.id}
                  onClick={() => onFragmentToggle(p.id)}
                  disabled={!bufferLoaded}
                  className={`relative h-64 border transition-all duration-700 flex flex-col items-center justify-center rounded-sm overflow-hidden
                    ${!bufferLoaded ? 'opacity-30 cursor-not-allowed' : ''}
                    ${active ? 'bg-zinc-900 border-zinc-800 shadow-2xl' : 'bg-white border-zinc-100 hover:border-zinc-300'}`}
                >
                  <div className={`absolute inset-x-12 h-[70px] flex flex-col justify-between pointer-events-none transition-opacity duration-700 ${active ? 'opacity-30' : 'opacity-10'}`}>
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-full h-[1px] ${active ? 'bg-zinc-400' : 'bg-zinc-600'}`} />
                    ))}
                  </div>

                  <div className={`absolute left-10 text-5xl serif italic transition-colors duration-700 ${active ? 'text-zinc-700' : 'text-zinc-100'}`}>
                    {p.clef === 'treble' ? '♜' : '♞'}
                  </div>

                  <div className="relative w-full h-[70px] px-20 flex items-center justify-center">
                    <div className={`text-[10px] tracking-[0.2em] uppercase font-light transition-colors duration-500 ${active ? 'text-white' : 'text-zinc-300'}`}>
                       {active ? 'Emitting' : 'Muted'}
                    </div>
                  </div>

                  <div className={`mt-10 text-[10px] uppercase tracking-[0.4em] font-light transition-colors duration-500 ${active ? 'text-zinc-400' : 'text-zinc-300'}`}>
                    WAV {p.id} ({p.baseDuration.toFixed(1)}s)
                  </div>
                  
                  {active && (
                    <div 
                      className="absolute bottom-0 left-0 h-1 bg-white/40 transition-all duration-100 ease-linear"
                      style={{ width: `${progress[p.id] || 0}%` }}
                    />
                  )}

                  <div className={`absolute top-6 right-6 w-2 h-2 rounded-full transition-all duration-1000 ${active ? 'bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,1)] animate-pulse' : 'bg-zinc-50'}`} />
                </button>
              );
            })}
          </div>

          {/* Timbre Controls */}
          <div className="flex flex-col items-center gap-12 pt-16 border-t border-zinc-100">
            
            <div className="w-full max-w-md space-y-6">
               <div className="flex justify-between items-end px-2">
                 <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Dusty / Low</span>
                 <span className="serif italic text-lg text-zinc-800">Cello Material Density</span>
                 <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Pure / Bright</span>
               </div>
               <div className="relative group px-2">
                 <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  value={timbre} 
                  onChange={(e) => setTimbre(parseFloat(e.target.value))}
                  className="w-full h-1 bg-zinc-100 appearance-none cursor-pointer accent-zinc-900 rounded-full hover:bg-zinc-200 transition-colors"
                 />
                 <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-[0.3em] text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    Tone Shift: {(timbre * 100).toFixed(0)}%
                 </div>
               </div>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-10 mt-8">
              <button 
                onClick={resetAndAutoInit}
                className={`px-12 py-5 border text-[10px] uppercase tracking-[0.4em] transition-all shadow-sm
                  ${autoMode ? 'bg-black text-white border-black' : 'bg-white text-zinc-900 border-zinc-900 hover:bg-zinc-50'}`}
              >
                {autoMode ? 'System Running' : 'Engage All Fragments'}
              </button>
              
              <button 
                onClick={() => {
                  setAutoMode(false);
                  PHRASES.forEach(p => stopLoop(p.id));
                }}
                className="px-12 py-5 border border-zinc-100 text-zinc-400 text-[10px] uppercase tracking-[0.4em] hover:text-zinc-900 hover:border-zinc-900 transition-all"
              >
                Silence All
              </button>

              <div className="flex items-center gap-6 px-10 py-4 bg-zinc-50 rounded-full border border-zinc-100">
                <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-400">Output Signal:</span>
                <div className="flex items-end gap-1 h-4 w-12">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-1 transition-all duration-75 ${isNoteFiring ? 'bg-zinc-800' : 'bg-zinc-200'}`}
                      style={{ height: isNoteFiring ? `${20 + Math.random() * 80}%` : '15%' }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-[11px] uppercase tracking-[0.8em] text-zinc-300 font-light">
                Fragments Active: {activeLoops.size} / {PHRASES.length}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
