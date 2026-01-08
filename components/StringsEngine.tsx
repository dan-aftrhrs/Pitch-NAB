import React, { useState, useEffect, useRef } from 'react';

interface KnobProps {
  label: string;
  value: number;
  color: string;
  onChange: (val: number) => void;
}

const ControlKnob: React.FC<KnobProps> = ({ label, value, color, onChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const lastY = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastY.current = e.clientY;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaY = lastY.current - e.clientY;
      const sensitivity = 0.005;
      const newValue = Math.max(0, Math.min(1, value + deltaY * sensitivity));
      onChange(newValue);
      lastY.current = e.clientY;
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, value, onChange]);

  return (
    <div 
      className="flex flex-col items-center gap-3 cursor-ns-resize select-none group"
      onMouseDown={handleMouseDown}
    >
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full bg-zinc-900 border border-zinc-800 shadow-inner group-hover:border-zinc-700 transition-colors" />
        
        {/* Pointer */}
        <div 
          className="absolute w-1.5 h-5 rounded-full transition-transform duration-75 ease-out"
          style={{ 
            backgroundColor: color,
            transform: `rotate(${(value * 270) - 135}deg) translateY(-10px)`,
            boxShadow: isDragging ? `0 0 15px ${color}` : `0 0 8px ${color}44`
          }}
        />
        
        {/* Center Cap */}
        <div className="absolute w-8 h-8 rounded-full bg-zinc-800 shadow-lg border border-zinc-700" />
      </div>
      
      <div className="flex flex-col items-center">
        <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-1">
          {label}
        </span>
        <span className="text-[10px] font-mono text-zinc-600">
          {Math.round(value * 100)}
        </span>
      </div>
    </div>
  );
};

const C4_FREQ = 261.63;

export const StringsEngine: React.FC = () => {
  const [params, setParams] = useState({
    tension: 0.6,
    detune: 0.1,
    impulse: 0.0,
    decay: 0.4
  });
  const [isActive, setIsActive] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const audioCtx = useRef<AudioContext | null>(null);
  const workletNode = useRef<AudioWorkletNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const rhythmInterval = useRef<number | null>(null);
  const paramsRef = useRef(params);

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

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
      
      node.parameters.get('freq')?.setValueAtTime(C4_FREQ, ctx.currentTime);
      updateNodeParams(params);
    } catch (e) {
      console.error("Failed to load worklet", e);
    }
  };

  const updateNodeParams = (p: typeof params) => {
    if (!workletNode.current || !audioCtx.current) return;
    const nodeParams = workletNode.current.parameters;
    const now = audioCtx.current.currentTime;
    nodeParams.get('tension')?.setTargetAtTime(p.tension, now, 0.05);
    nodeParams.get('detune')?.setTargetAtTime(p.detune, now, 0.05);
    nodeParams.get('impulseType')?.setTargetAtTime(p.impulse, now, 0.05);
    nodeParams.get('decay')?.setTargetAtTime(p.decay, now, 0.05);
  };

  useEffect(() => {
    if (isLoaded) updateNodeParams(params);
  }, [params, isLoaded]);

  // Automatic Plucking Engine
  useEffect(() => {
    if (isActive && isLoaded) {
      const trigger = () => {
        if (!workletNode.current || !audioCtx.current) return;
        const gate = workletNode.current.parameters.get('gate');
        const now = audioCtx.current.currentTime;
        gate?.cancelScheduledValues(now);
        gate?.setValueAtTime(0, now);
        gate?.setValueAtTime(1, now + 0.001);
        gate?.setValueAtTime(0, now + 0.01);
      };

      const tempo = 1200; 
      if (rhythmInterval.current) clearInterval(rhythmInterval.current);
      rhythmInterval.current = window.setInterval(trigger, tempo);
      trigger();
    } else {
      if (rhythmInterval.current) clearInterval(rhythmInterval.current);
    }
    return () => { if (rhythmInterval.current) clearInterval(rhythmInterval.current); };
  }, [isActive, isLoaded]);

  const toggleEngine = async () => {
    if (!isLoaded) await initAudio();
    if (audioCtx.current?.state === 'suspended') await audioCtx.current.resume();
    setIsActive(!isActive);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;
      
      ctx.beginPath();
      const color = isActive ? '#f59e0b' : '#27272a';
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5 + (params.detune * 2);
      
      const amplitude = isActive ? (30 + params.decay * 30) : 1;
      const freqVis = 1.0 + (params.tension * 5.0);
      
      ctx.moveTo(0, centerY);
      for (let x = 0; x <= width; x++) {
        const normalizedX = x / width;
        const envelope = Math.sin(normalizedX * Math.PI);
        const y = centerY + Math.sin(normalizedX * Math.PI * freqVis + phase) * amplitude * envelope;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      
      if (isActive) {
        phase += 0.05 + (params.tension * 0.15);
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(requestRef.current);
  }, [isActive, params]);

  return (
    <div className="flex flex-col items-center gap-12 py-16">
      <div className="text-center space-y-6 max-w-xl px-6">
        <h3 className="text-4xl md:text-5xl serif italic font-light tracking-tight">The String Engine <span className="text-xs uppercase tracking-widest text-zinc-400 align-middle ml-2">(OP-1 Inspired)</span></h3>
        <p className="text-zinc-500 font-light text-sm md:text-base leading-relaxed">
          A physical modeling synth mimicking the iconic OP-1 String engine, based on the Karplus-Strong string synthesis algorithm. Tune the tension for brightness, adjust detune for richness, and select your impulse transient.
          <br/><span className="text-[10px] text-zinc-400 italic">Drag the knobs to shape the sound. Best with headphones.</span>
        </p>
      </div>

      <div className="w-full max-w-md bg-zinc-950 rounded-[2.5rem] p-10 border border-zinc-800 shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

        <div className="bg-black w-full aspect-[16/9] rounded-2xl mb-12 border border-zinc-900 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
          <canvas ref={canvasRef} width={400} height={200} className="w-full h-full opacity-80" />
          <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
             <div className="text-[9px] uppercase tracking-[0.4em] font-bold text-zinc-800">
               OP-1 // STRINGS
             </div>
             <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' : 'bg-zinc-800'}`} />
          </div>
        </div>

        {/* 4 Control Knobs */}
        <div className="grid grid-cols-2 gap-y-12 gap-x-8 mb-12">
          <ControlKnob 
            label="Tension" 
            value={params.tension} 
            color="#22c55e" 
            onChange={(val) => setParams(prev => ({ ...prev, tension: val }))} 
          />
          <ControlKnob 
            label="Detune" 
            value={params.detune} 
            color="#3b82f6" 
            onChange={(val) => setParams(prev => ({ ...prev, detune: val }))} 
          />
          <ControlKnob 
            label="Impulse" 
            value={params.impulse} 
            color="#f4f4f5" 
            onChange={(val) => setParams(prev => ({ ...prev, impulse: val }))} 
          />
          <ControlKnob 
            label="Decay" 
            value={params.decay} 
            color="#f97316" 
            onChange={(val) => setParams(prev => ({ ...prev, decay: val }))} 
          />
        </div>

        <button onClick={toggleEngine}
          className={`w-full py-5 rounded-2xl font-bold text-[10px] uppercase tracking-[0.5em] transition-all duration-500 border
            ${isActive 
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' 
              : 'bg-zinc-900 border-zinc-800 text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800'}`}>
          {isActive ? 'Cease Playback' : 'Initiate Engine'}
        </button>
      </div>
    </div>
  );
};