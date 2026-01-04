import React, { useState, useRef } from 'react';

const SAMPLES = [
  'https://reverbmachine.com/wp-content/uploads/2022/09/eno-mfa-piano-01.mp3',
  'https://reverbmachine.com/wp-content/uploads/2022/09/eno-mfa-piano-02.mp3',
  'https://reverbmachine.com/wp-content/uploads/2022/09/eno-mfa-piano-03.mp3',
  'https://reverbmachine.com/wp-content/uploads/2022/09/eno-mfa-piano-04.mp3',
  'https://reverbmachine.com/wp-content/uploads/2022/09/eno-mfa-piano-05.mp3',
  'https://reverbmachine.com/wp-content/uploads/2022/09/eno-mfa-piano-06.mp3',
  'https://reverbmachine.com/wp-content/uploads/2022/09/eno-mfa-piano-07.mp3',
  'https://reverbmachine.com/wp-content/uploads/2022/09/eno-mfa-piano-01.mp3' // Variation slot
];

export const GenerativeMusic: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [buffers, setBuffers] = useState<AudioBuffer[] | null>(null);
  const [active, setActive] = useState<boolean[]>(new Array(SAMPLES.length).fill(false));
  
  const ctx = useRef<AudioContext | null>(null);
  const sources = useRef<(AudioBufferSourceNode | null)[]>(new Array(SAMPLES.length).fill(null));

  const initialize = async () => {
    setLoading(true);
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    ctx.current = audioCtx;
    
    try {
      const responses = await Promise.all(SAMPLES.map(url => fetch(url)));
      const arrayBuffers = await Promise.all(responses.map(res => res.arrayBuffer()));
      const decoded = await Promise.all(arrayBuffers.map(ab => audioCtx.decodeAudioData(ab)));
      setBuffers(decoded);
    } catch (err) {
      console.error("Archive connection failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFragment = (i: number) => {
    if (!ctx.current || !buffers) return;
    if (ctx.current.state === 'suspended') ctx.current.resume();

    if (sources.current[i]) {
      // STOP: If already playing, stop the source and clear the ref
      try {
        sources.current[i]?.stop();
      } catch (e) {}
      sources.current[i] = null;
      setActive(prev => {
        const next = [...prev];
        next[i] = false;
        return next;
      });
    } else {
      // START: Create a new source node, set to loop, and play
      const source = ctx.current.createBufferSource();
      source.buffer = buffers[i];
      source.loop = true;
      source.connect(ctx.current.destination);
      source.start();
      sources.current[i] = source;
      setActive(prev => {
        const next = [...prev];
        next[i] = true;
        return next;
      });
    }
  };

  if (!buffers) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-zinc-50 border border-zinc-100 rounded-sm">
        <button 
          onClick={initialize}
          disabled={loading}
          className="px-12 py-5 bg-zinc-900 text-white text-[11px] uppercase tracking-[0.5em] hover:bg-black transition-all disabled:opacity-30 shadow-xl"
        >
          {loading ? 'Fetching Archive...' : 'Initialize Music Fragments'}
        </button>
        <p className="mt-6 text-[10px] text-zinc-400 uppercase tracking-widest font-light">
          Requires active internet connection to stream fragments
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {buffers.map((_, i) => (
        <button
          key={i}
          onClick={() => toggleFragment(i)}
          className={`relative h-40 border rounded-sm flex flex-col items-center justify-center transition-all duration-700
            ${active[i] ? 'bg-zinc-900 border-zinc-800 text-white shadow-2xl scale-[1.02] z-10' : 'bg-white border-zinc-100 text-zinc-300 hover:border-zinc-300 hover:text-zinc-600'}`}
        >
          <span className="text-[9px] uppercase tracking-[0.3em] mb-2 font-light opacity-50">Archive</span>
          <span className={`serif italic text-3xl transition-colors ${active[i] ? 'text-white' : 'text-zinc-800'}`}>0{i + 1}</span>
          {active[i] && (
            <div className="absolute bottom-6 w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
          )}
        </button>
      ))}
    </div>
  );
};