
import React, { useState, useEffect, useRef, useCallback } from 'react';

const noteToFreq = (noteName: string): number => {
  const notesMap: Record<string, number> = {
    'C': 0, 'C#': 1, 'DB': 1, 'D': 2, 'D#': 3, 'EB': 3, 'E': 4, 'F': 5, 
    'F#': 6, 'GB': 6, 'G': 7, 'G#': 8, 'AB': 8, 'A': 9, 'A#': 10, 'BB': 10, 'B': 11
  };
  const regex = /^([A-Ga-g][#bB]?)(-?\d+)$/;
  const match = noteName.match(regex);
  if (!match) return 440;
  
  const pitch = match[1].toUpperCase().replace('B', 'B'); 
  const octave = parseInt(match[2], 10);
  const semitonesFromC = notesMap[pitch];
  
  if (semitonesFromC === undefined) return 440;
  const midiNote = (octave + 1) * 12 + semitonesFromC;
  return 440 * Math.pow(2, (midiNote - 69) / 12);
};

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
  { 
    id: 1, baseDuration: 17.069, clef: 'treble', 
    notes: [{ freq: "BB5", position: getNotePosition("BB5"), offset: 11.645 }] 
  },
  { 
    id: 2, baseDuration: 20.752, clef: 'treble',
    notes: [
      { freq: "BB3", position: getNotePosition("BB3"), offset: 0 },
      { freq: "EB5", position: getNotePosition("EB5"), offset: 7.163 }
    ] 
  },
  { 
    id: 3, baseDuration: 23.157, clef: 'treble',
    notes: [
      { freq: "F6", position: getNotePosition("F6"), offset: 3.840 },
      { freq: "EB6", position: getNotePosition("EB6"), offset: 4.779 },
      { freq: "BB5", position: getNotePosition("BB5"), offset: 5.856 }
    ] 
  },
  { 
    id: 4, baseDuration: 27.999, clef: 'treble', 
    notes: [
      { freq: "BB5", position: getNotePosition("BB5"), offset: 9.712 },
      { freq: "EB6", position: getNotePosition("EB6"), offset: 10.037 },
      { freq: "F6", position: getNotePosition("F6"), offset: 11.050 },
      { freq: "BB6", position: getNotePosition("BB6"), offset: 11.594 }
    ] 
  },
  { 
    id: 5, baseDuration: 29.501, clef: 'treble',
    notes: [
      { freq: "EB6", position: getNotePosition("EB6"), offset: 11.824 },
      { freq: "BB5", position: getNotePosition("BB5"), offset: 16.261 }
    ] 
  },
  { 
    id: 6, baseDuration: 30.034, clef: 'bass',
    notes: [
      { freq: "EB4", position: getNotePosition("EB4"), offset: 8.693 },
      { freq: "BB3", position: getNotePosition("BB3"), offset: 10.384 }
    ] 
  },
  { 
    id: 7, baseDuration: 31.101, clef: 'bass', 
    notes: [{ freq: "BB3", position: getNotePosition("BB3"), offset: 5.696 }] 
  },
  { 
    id: 8, baseDuration: 38.049, clef: 'bass', 
    notes: [
      { freq: "EB4", position: getNotePosition("EB4"), offset: 6.768 },
      { freq: "BB3", position: getNotePosition("BB3"), offset: 9.659 }
    ] 
  }
];

export const GenerativeMusic: React.FC = () => {
  const [audioState, setAudioState] = useState<'uninitialized' | 'active'>('uninitialized');
  const [activeLoops, setActiveLoops] = useState<Set<number>>(new Set());
  const [progress, setProgress] = useState<Record<number, number>>({});
  const [isNoteFiring, setIsNoteFiring] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  
  const [timbre, setTimbre] = useState(0.3);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  
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
      const cutoff = 400 + (timbre * 4000); 
      const resonance = timbre * 12; 
      filterNodeRef.current.frequency.setTargetAtTime(cutoff, now, 0.1);
      filterNodeRef.current.Q.setTargetAtTime(resonance, now, 0.1);
    }
  }, [timbre]);

  const initAudio = async () => {
    if (audioCtxRef.current) return;
    try {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      const ctx = new AudioContextClass();
      
      const master = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const compressor = ctx.createDynamicsCompressor();
      
      master.gain.setValueAtTime(0.4, ctx.currentTime);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, ctx.currentTime);
      filter.Q.setValueAtTime(1, ctx.currentTime);

      // Limiter settings to prevent crashing on volume peaks
      compressor.threshold.setValueAtTime(-24, ctx.currentTime);
      compressor.knee.setValueAtTime(30, ctx.currentTime);
      compressor.ratio.setValueAtTime(12, ctx.currentTime);
      compressor.attack.setValueAtTime(0.003, ctx.currentTime);
      compressor.release.setValueAtTime(0.25, ctx.currentTime);

      master.connect(filter);
      filter.connect(compressor);
      compressor.connect(ctx.destination);
      
      audioCtxRef.current = ctx;
      masterGainRef.current = master;
      filterNodeRef.current = filter;
      compressorRef.current = compressor;
      
      if (ctx.state === 'suspended') await ctx.resume();
      
      setAudioState('active');
      playNote(noteToFreq("BB4"), 0.3);
    } catch (e) {
      console.error("Audio failed to initialize", e);
    }
  };

  const playNote = (freq: number, volume = 0.5) => {
    const ctx = audioCtxRef.current;
    if (!ctx || !masterGainRef.current) return;
    
    // Safety check: sometimes context suspends due to lack of interaction
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    const t = timbreRef.current;
    
    // Decay base: 0.6s at low timbre, up to 6s at high
    const decayBase = (0.6 + (t * 5.4)) * Math.max(0.1, 1.2 - (Math.log2(freq / 110) * 0.15));

    const createOsc = (f: number, v: number, d: number, type: OscillatorType = 'sine', detuneValue = 0) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(f, now);
      osc.detune.setValueAtTime(detuneValue, now);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.setTargetAtTime(v * volume, now, 0.005); 
      // setTargetAtTime approaches 0 asymptotically. 
      // We schedule a stop at 8 * timeConstant which is virtually silent.
      gain.gain.setTargetAtTime(0, now + 0.05, d); 

      osc.connect(gain);
      gain.connect(masterGainRef.current!);
      
      osc.start(now);
      
      // Cleanup: Crucial to prevent node accumulation
      const stopTime = now + (d * 8) + 0.5;
      osc.stop(stopTime);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    };

    const detuneRange = t * 12; 
    
    createOsc(freq, 0.8, decayBase, 'triangle', 0); 
    // String layering
    if (t > 0.1) {
      createOsc(freq, 0.3 * t, decayBase, 'sawtooth', -detuneRange);
      createOsc(freq, 0.3 * t, decayBase, 'sawtooth', detuneRange);
    }
    
    createOsc(freq * 2, 0.2, decayBase * 0.7, 'sine', detuneRange * 0.5);    
    createOsc(freq * 4, 0.1 * (1 + t), decayBase * 0.4, 'sine', -detuneRange);    
    
    // Percussive transient
    const hammer = ctx.createOscillator();
    const hammerGain = ctx.createGain();
    hammer.frequency.setValueAtTime(freq * 10, now);
    hammerGain.gain.setValueAtTime(0, now);
    hammerGain.gain.setTargetAtTime(volume * (0.5 - (t * 0.4)), now, 0.002);
    hammerGain.gain.setTargetAtTime(0, now + 0.005, 0.008);
    hammer.connect(hammerGain);
    hammerGain.connect(masterGainRef.current);
    hammer.start(now);
    hammer.stop(now + 0.1);
    hammer.onended = () => {
      hammer.disconnect();
      hammerGain.disconnect();
    };

    setIsNoteFiring(true);
    setTimeout(() => setIsNoteFiring(false), 200);
  };

  const triggerFragmentNote = (noteName: string) => {
    const f = noteToFreq(noteName);
    if (isNaN(f)) return;
    playNote(f, 0.5);
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
            triggerFragmentNote(note.freq);
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
      {audioState === 'uninitialized' ? (
        <div className="p-20 border border-zinc-100 bg-zinc-50/50 rounded-sm text-center space-y-8">
          <div className="space-y-4">
            <h4 className="serif italic text-4xl text-zinc-800">The library is hushed.</h4>
            <p className="text-zinc-500 font-light text-base max-w-sm mx-auto leading-relaxed">
              Experience the generative tape-loop system. All fragments start simultaneously; phasing is determined by internal silence and loop geometry.
            </p>
          </div>
          <button 
            onClick={initAudio}
            className="group relative px-12 py-5 bg-zinc-900 text-white text-[11px] uppercase tracking-[0.5em] overflow-hidden hover:bg-black transition-all shadow-xl"
          >
            Awaken Audio Engine
          </button>
        </div>
      ) : (
        <>
          {/* Loop Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {PHRASES.map(p => {
              const active = activeLoops.has(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => onFragmentToggle(p.id)}
                  className={`relative h-64 border transition-all duration-700 flex flex-col items-center justify-center rounded-sm overflow-hidden
                    ${active ? 'bg-zinc-900 border-zinc-800 shadow-2xl' : 'bg-white border-zinc-100 hover:border-zinc-300'}`}
                >
                  <div className={`absolute inset-x-12 h-[70px] flex flex-col justify-between pointer-events-none transition-opacity duration-700 ${active ? 'opacity-30' : 'opacity-10'}`}>
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-full h-[1px] ${active ? 'bg-zinc-400' : 'bg-zinc-600'}`} />
                    ))}
                  </div>

                  <div className={`absolute left-10 text-5xl serif italic transition-colors duration-700 ${active ? 'text-zinc-700' : 'text-zinc-100'}`}>
                    {p.clef === 'treble' ? '𝄞' : '𝄢'}
                  </div>

                  <div className="relative w-full h-[70px] px-20">
                    {p.notes.map((note, idx) => (
                      <div 
                        key={idx}
                        className={`absolute w-4 h-3 rounded-[50%] rotate-[-20deg] transition-all duration-1000
                          ${active ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'bg-zinc-200 opacity-20'}`}
                        style={{
                          left: `${(note.offset / p.baseDuration) * 100}%`,
                          bottom: `${24 + note.position * 6}px`
                        }}
                      />
                    ))}
                  </div>

                  <div className={`mt-10 text-[10px] uppercase tracking-[0.4em] font-light transition-colors duration-500 ${active ? 'text-zinc-400' : 'text-zinc-300'}`}>
                    Loop {p.id} ({p.baseDuration.toFixed(1)}s)
                  </div>
                  
                  {active && (
                    <div 
                      className="absolute bottom-0 left-0 h-1 bg-white/40 transition-all duration-100 ease-linear"
                      style={{ width: `${progress[p.id] || 0}%` }}
                    />
                  )}

                  <div className={`absolute top-6 right-6 w-2 h-2 rounded-full transition-all duration-1000 ${active ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,1)] animate-pulse' : 'bg-zinc-50'}`} />
                </button>
              );
            })}
          </div>

          {/* Timbre Controls */}
          <div className="flex flex-col items-center gap-12 pt-16 border-t border-zinc-100">
            
            <div className="w-full max-w-md space-y-6">
               <div className="flex justify-between items-end px-2">
                 <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Muted Felt</span>
                 <span className="serif italic text-lg text-zinc-800">String Tension / Resonance</span>
                 <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Infinite Strings</span>
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
                    Current Tension: {(timbre * 100).toFixed(0)}%
                 </div>
               </div>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-10 mt-8">
              <button 
                onClick={resetAndAutoInit}
                className={`px-12 py-5 border text-[10px] uppercase tracking-[0.4em] transition-all shadow-sm
                  ${autoMode ? 'bg-black text-white border-black' : 'bg-white text-zinc-900 border-zinc-900 hover:bg-zinc-50'}`}
              >
                {autoMode ? 'Generative Cloud: Active' : 'Start Full Phasing Cloud'}
              </button>
              
              <button 
                onClick={() => {
                  setAutoMode(false);
                  PHRASES.forEach(p => stopLoop(p.id));
                }}
                className="px-12 py-5 border border-zinc-100 text-zinc-400 text-[10px] uppercase tracking-[0.4em] hover:text-zinc-900 hover:border-zinc-900 transition-all"
              >
                Clear All
              </button>

              <div className="flex items-center gap-6 px-10 py-4 bg-zinc-50 rounded-full border border-zinc-100">
                <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-400">Audio Signal:</span>
                <div className="flex items-end gap-1 h-4 w-12">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-1 transition-all duration-75 ${isNoteFiring ? 'bg-zinc-800' : 'bg-zinc-200'}`}
                      style={{ height: isNoteFiring ? `${20 + Math.random() * 80}%` : '15%' }}
                    />
                  ))}
                </div>
                <button 
                  onClick={() => playNote(noteToFreq("BB5"), 0.6)}
                  className="text-[10px] uppercase tracking-[0.2em] text-zinc-800 font-bold hover:underline"
                >
                  Trigger Pulse
                </button>
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-[11px] uppercase tracking-[0.8em] text-zinc-300 font-light">
                Channels Active: {activeLoops.size} / {PHRASES.length}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
