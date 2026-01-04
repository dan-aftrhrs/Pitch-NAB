import React, { useState, useEffect, useRef } from 'react';

interface KnobProps {
  label: string;
  value: number;
  color: string;
}

const ReadOnlyKnob: React.FC<KnobProps> = ({ label, value, color }) => {
  return (
    <div className="flex flex-col items-center gap-2 group pointer-events-none">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-zinc-900 border border-zinc-800 shadow-inner" />
        <div 
          className="absolute w-1 h-4 rounded-full transition-transform duration-300 ease-out"
          style={{ 
            backgroundColor: color,
            transform: `rotate(${(value * 270) - 135}deg) translateY(-8px)`,
            boxShadow: `0 0 10px ${color}66`
          }}
        />
        <div className="absolute w-6 h-6 rounded-full bg-zinc-800 shadow-lg border border-zinc-700" />
      </div>
      <span className="text-[8px] uppercase tracking-widest font-bold text-zinc-600">
        {label}
      </span>
    </div>
  );
};

// Constant frequency for C4
const C4_FREQ = 261.63;

export const StringsEngine: React.FC = () => {
  const [morph, setMorph] = useState(0.5); // 0 = Piano, 1 = Cello
  const [isActive, setIsActive] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const audioCtx = useRef<AudioContext | null>(null);
  const workletNode = useRef<AudioWorkletNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const rhythmInterval = useRef<number | null>(null);
  const lastTriggerTime = useRef(0);

  // Parameter Mapping
  const params = {
    tension: 0.85 - (morph * 0.65),      // 0.85 (Piano) -> 0.2 (Cello)
    damping: 0.2 + (morph * 0.75),      // 0.2 (Piano) -> 0.95 (Cello)
    excitation: 0.8 - (morph * 0.25),   // 0.8 (Piano) -> 0.55 (Cello - Bow Pressure)
    material: 0.15 + (morph * 0.8)      // 0.15 (Piano) -> 0.95 (Cello/Body)
  };

  const initAudio = async () => {
    if (audioCtx.current) return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    try {
      const response = await fetch('string-morph-processor.js');
      const scriptText = await response.text();
      const blob = new Blob([scriptText], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      await ctx.audioWorklet.addModule(url);
      const node = new AudioWorkletNode(ctx, 'string-morph-processor');
      node.connect(ctx.destination);
      workletNode.current = node;
      audioCtx.current = ctx;
      setIsLoaded(true);
      
      const p = node.parameters;
      const now = ctx.currentTime;
      p.get('freq')?.setValueAtTime(C4_FREQ, now);
      updateNodeParams(params);
    } catch (e) {
      console.error("Failed to load worklet", e);
    }
  };

  const updateNodeParams = (pValues: typeof params) => {
    if (!workletNode.current) return;
    const p = workletNode.current.parameters;
    const now = audioCtx.current!.currentTime;
    p.get('tension')?.setTargetAtTime(pValues.tension, now, 0.1);
    p.get('damping')?.setTargetAtTime(pValues.damping, now, 0.1);
    p.get('excitation')?.setTargetAtTime(pValues.excitation, now, 0.1);
    p.get('material')?.setTargetAtTime(pValues.material, now, 0.1);
  };

  useEffect(() => {
    if (isLoaded) updateNodeParams(params);
  }, [morph, isLoaded]);

  // Rhythm Engine
  useEffect(() => {
    if (isActive && isLoaded) {
      const trigger = () => {
        if (!workletNode.current || !audioCtx.current) return;
        const gate = workletNode.current.parameters.get('gate');
        const now = audioCtx.current.currentTime;
        
        // Prevent double triggers within 200ms
        if (now - lastTriggerTime.current < 0.2) return;
        lastTriggerTime.current = now;

        if (morph < 0.7) {
          // Piano Pluck
          gate?.cancelScheduledValues(now);
          gate?.setValueAtTime(0, now);
          gate?.setTargetAtTime(1.0, now + 0.001, 0.004);
          const release = 0.04 + (0.12 * morph);
          gate?.setTargetAtTime(0, now + release, 0.04);
        } else {
          // Cello Sustain
          gate?.cancelScheduledValues(now);
          // Initial "kick" to start oscillation
          gate?.setValueAtTime(1.2, now); 
          gate?.setTargetAtTime(1.0, now + 0.2, 0.4);
        }
      };

      if (morph < 0.7) {
        if (rhythmInterval.current) clearInterval(rhythmInterval.current);
        rhythmInterval.current = window.setInterval(trigger, 1800);
        trigger();
      } else {
        if (rhythmInterval.current) clearInterval(rhythmInterval.current);
        trigger(); 
      }
    } else {
      if (rhythmInterval.current) clearInterval(rhythmInterval.current);
    }
    return () => { if (rhythmInterval.current) clearInterval(rhythmInterval.current); };
  }, [isActive, morph, isLoaded]);

  const toggleEngine = async () => {
    if (!isLoaded) await initAudio();
    if (audioCtx.current?.state === 'suspended') await audioCtx.current.resume();
    
    const nextState = !isActive;
    setIsActive(nextState);

    if (!nextState && workletNode.current && audioCtx.current) {
      const gate = workletNode.current.parameters.get('gate');
      gate?.cancelScheduledValues(audioCtx.current.currentTime);
      gate?.setTargetAtTime(0, audioCtx.current.currentTime, 0.2);
    }
  };

  // Visualization Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;
      
      ctx.beginPath();
      const hue = 25 + (morph * 25);
      const sat = 30 + (morph * 50);
      const color = isActive ? `hsla(${hue}, ${sat}%, 70%, 0.8)` : '#27272a';
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.8 + (params.material * 1.5);
      
      const amplitude = isActive ? (params.excitation * 42 * (1 - params.damping * 0.42)) : 2;
      const freqVis = 1.3 + (params.tension * 4.5);
      
      ctx.moveTo(0, centerY);
      for (let x = 0; x <= width; x++) {
        const normalizedX = x / width;
        const envelope = Math.sin(normalizedX * Math.PI);
        const y = centerY + Math.sin(normalizedX * Math.PI * freqVis + phase) * amplitude * envelope;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      
      if (isActive) {
        phase += 0.07 + (params.tension * 0.18);
        ctx.shadowBlur = 12;
        ctx.shadowColor = color;
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(requestRef.current);
  }, [isActive, params, morph]);

  return (
    <div className="flex flex-col items-center gap-12 py-16">
      <div className="text-center space-y-6 max-w-xl px-6">
        <h3 className="text-4xl md:text-5xl serif italic font-light tracking-tight">The String Engine</h3>
        <p className="text-zinc-500 font-light text-sm md:text-base leading-relaxed">
          Physical modeling of a single C4 string. Move from the brittle, percussive strike of a <strong>Muted Piano</strong> to the deep, resonant sustain of a <strong>Bowed Cello</strong>.
        </p>
      </div>

      <div className="w-full max-w-md bg-zinc-950 rounded-[2.5rem] p-10 border border-zinc-800 shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

        {/* OLED Visualizer */}
        <div className="bg-black w-full aspect-[16/9] rounded-2xl mb-10 border border-zinc-900 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
          <canvas 
            ref={canvasRef} 
            width={400} 
            height={200} 
            className="w-full h-full opacity-90"
          />
          
          <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
            <div className="space-y-1">
              <div className="text-[8px] uppercase tracking-[0.3em] font-bold text-zinc-700">Timbre_Profile</div>
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-500/80">
                {morph < 0.3 ? 'SOFT_HAMMER' : morph > 0.7 ? 'DEEP_CELLO' : 'WOOD_RESONANCE'}
              </div>
            </div>
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-amber-500 animate-pulse' : 'bg-zinc-800'}`} />
          </div>
          
          <div className="absolute top-4 right-6 text-[8px] uppercase tracking-widest font-bold text-zinc-800">
            C4 — RESONANT
          </div>
        </div>

        {/* Morph Slider */}
        <div className="mb-10 space-y-4 px-2">
           <div className="flex justify-between text-[8px] uppercase tracking-[0.3em] font-bold text-zinc-500">
              <span>Muted Piano</span>
              <span>Bowed Cello</span>
           </div>
           <input 
             type="range" 
             min="0" 
             max="1" 
             step="0.001" 
             value={morph}
             onChange={(e) => setMorph(parseFloat(e.target.value))}
             className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all"
           />
        </div>

        {/* Read-Only Visual Knobs */}
        <div className="grid grid-cols-4 gap-4 mb-10 opacity-60">
          <ReadOnlyKnob label="Tension" value={params.tension} color="#22c55e" />
          <ReadOnlyKnob label="Damping" value={params.damping} color="#3b82f6" />
          <ReadOnlyKnob label="Force" value={params.excitation} color="#f4f4f5" />
          <ReadOnlyKnob label="Wood" value={params.material} color="#f97316" />
        </div>

        <button 
          onClick={toggleEngine}
          className={`w-full py-5 rounded-2xl font-bold text-[11px] uppercase tracking-[0.5em] transition-all duration-700 border
            ${isActive 
              ? 'bg-amber-500/5 border-amber-500/30 text-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.1)]' 
              : 'bg-zinc-900 border-zinc-800 text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800'}`}
        >
          {isActive ? 'Silence Instrument' : 'Initialize Engine'}
        </button>

        <div className="mt-8 text-center">
          <span className="text-[7px] uppercase tracking-[0.6em] text-zinc-700 font-bold">
            Phys_Mod • MORPH_ENGINE • AFTRHRS_DSP
          </span>
        </div>
      </div>
    </div>
  );
};