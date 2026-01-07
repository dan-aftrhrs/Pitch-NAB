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

const C4_FREQ = 261.63;

export const StringsEngine: React.FC = () => {
  const [morph, setMorph] = useState(0.5); 
  const [isActive, setIsActive] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const audioCtx = useRef<AudioContext | null>(null);
  const workletNode = useRef<AudioWorkletNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const rhythmInterval = useRef<number | null>(null);
  const morphRef = useRef(morph);
  const lastTriggerTime = useRef(0);

  useEffect(() => {
    morphRef.current = morph;
  }, [morph]);

  // Parameter Mapping (Re-aligned based on user perception)
  // Left (0.0): Muted Piano | Middle (0.5): Steel Guitar | Right (1.0): Bowed Cello
  const getParams = (m: number) => {
    if (m < 0.35) {
      // MUTED PIANO (Woody, highly damped, percussive)
      return {
        tension: 0.85,     
        damping: 0.95,     
        excitation: 0.95,  
        material: 0.15     
      };
    } else if (m < 0.65) {
      // STEEL GUITAR (Resonant, bright, metallic)
      return {
        tension: 0.75,     
        damping: 0.3,      
        excitation: 0.7,   
        material: 0.4      
      };
    } else {
      // BOWED CELLO (Low tension, slow resonance, body focus)
      return {
        tension: 0.25,     
        damping: 0.15,     
        excitation: 0.85,  
        material: 0.95     
      };
    }
  };

  const params = getParams(morph);

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
      updateNodeParams(getParams(morph));
    } catch (e) {
      console.error("Failed to load worklet", e);
    }
  };

  const updateNodeParams = (pValues: ReturnType<typeof getParams>) => {
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
        
        const currentMorph = morphRef.current;

        if (currentMorph < 0.35) {
          // Muted Piano: Quick percussive impact
          gate?.cancelScheduledValues(now);
          gate?.setValueAtTime(0, now);
          gate?.setTargetAtTime(1.0, now + 0.002, 0.005);
          gate?.setTargetAtTime(0, now + 0.05, 0.01);
        } else if (currentMorph < 0.65) {
          // Steel Guitar: Resonant pluck
          gate?.cancelScheduledValues(now);
          gate?.setValueAtTime(0, now);
          gate?.setTargetAtTime(0.9, now + 0.005, 0.02);
          gate?.setTargetAtTime(0, now + 0.2, 0.15);
        } else {
          // Bowed Cello: Breathing "swelling" bow stroke
          gate?.cancelScheduledValues(now);
          gate?.setValueAtTime(0, now);
          gate?.setTargetAtTime(1.2, now + 0.15, 0.35); 
          gate?.setTargetAtTime(0, now + 1.5, 0.7);     
        }
      };

      const tempo = morph < 0.65 ? 1800 : 4500; 
      
      if (rhythmInterval.current) clearInterval(rhythmInterval.current);
      rhythmInterval.current = window.setInterval(trigger, tempo);
      trigger();
    } else {
      if (rhythmInterval.current) clearInterval(rhythmInterval.current);
    }
    return () => { if (rhythmInterval.current) clearInterval(rhythmInterval.current); };
  }, [isActive, isLoaded, morph < 0.35, morph < 0.65]);

  const toggleEngine = async () => {
    if (!isLoaded) await initAudio();
    if (audioCtx.current?.state === 'suspended') await audioCtx.current.resume();
    
    const nextState = !isActive;
    setIsActive(nextState);

    if (!nextState && workletNode.current && audioCtx.current) {
      const gate = workletNode.current.parameters.get('gate');
      gate?.cancelScheduledValues(audioCtx.current.currentTime);
      gate?.setTargetAtTime(0, audioCtx.current.currentTime, 0.15);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;
      
      ctx.beginPath();
      const hue = 25 + (morph * 25);
      const sat = 30 + (morph * 55);
      const color = isActive ? `hsla(${hue}, ${sat}%, 70%, 0.9)` : '#27272a';
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.0 + (params.material * 1.5);
      
      const amplitude = isActive ? (params.excitation * 45 * (1 - params.damping * 0.45)) : 2;
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
        phase += 0.08 + (params.tension * 0.2);
        ctx.shadowBlur = 10;
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
        <h3 className="text-4xl md:text-5xl serif italic font-light tracking-tight">The String Engine <span className="text-xs uppercase tracking-widest text-zinc-400 align-middle ml-2">(Experimental)</span></h3>
        <p className="text-zinc-500 font-light text-sm md:text-base leading-relaxed">
          Based on the Karplus-Strong string synthesis algorithm. Morph through three profiles: a woody muted piano, a metallic steel guitar, and the deep, rhythmic stroke of a bowed cello.
          <br/><span className="text-[10px] text-zinc-400 italic">May not be fully supported on all mobile devices.</span>
        </p>
      </div>

      <div className="w-full max-w-md bg-zinc-950 rounded-[2.5rem] p-10 border border-zinc-800 shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

        <div className="bg-black w-full aspect-[16/9] rounded-2xl mb-10 border border-zinc-900 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
          <canvas ref={canvasRef} width={400} height={200} className="w-full h-full opacity-90" />
          <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
            <div className="space-y-1">
              <div className="text-[8px] uppercase tracking-[0.3em] font-bold text-zinc-700">Timbre_Profile</div>
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-500/80">
                {morph < 0.35 ? 'MUTED_PIANO' : morph > 0.65 ? 'BOWED_CELLO' : 'STEEL_GUITAR'}
              </div>
            </div>
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-amber-500 animate-pulse' : 'bg-zinc-800'}`} />
          </div>
        </div>

        <div className="mb-10 space-y-4 px-2">
           <div className="flex justify-between text-[8px] uppercase tracking-[0.3em] font-bold text-zinc-500">
              <span>Piano</span>
              <span>Guitar</span>
              <span>Cello</span>
           </div>
           <input 
             type="range" min="0" max="1" step="0.001" value={morph}
             onChange={(e) => setMorph(parseFloat(e.target.value))}
             className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all"
           />
        </div>

        <div className="grid grid-cols-4 gap-4 mb-10 opacity-50">
          <ReadOnlyKnob label="Tension" value={params.tension} color="#22c55e" />
          <ReadOnlyKnob label="Damping" value={params.damping} color="#3b82f6" />
          <ReadOnlyKnob label="Pressure" value={params.excitation} color="#f4f4f5" />
          <ReadOnlyKnob label="Body" value={params.material} color="#f97316" />
        </div>

        <button onClick={toggleEngine}
          className={`w-full py-5 rounded-2xl font-bold text-[11px] uppercase tracking-[0.5em] transition-all duration-700 border
            ${isActive 
              ? 'bg-amber-500/5 border-amber-500/30 text-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.1)]' 
              : 'bg-zinc-900 border-zinc-800 text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800'}`}>
          {isActive ? 'Silence Engine' : 'Initialize String'}
        </button>
      </div>
    </div>
  );
};