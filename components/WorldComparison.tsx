
import React, { useState } from 'react';

export const WorldComparison: React.FC = () => {
  const [isSpiritual, setIsSpiritual] = useState(false);

  return (
    <div className="relative w-full aspect-video md:aspect-[21/9] overflow-hidden rounded-sm group cursor-pointer border border-zinc-200 shadow-xl mx-auto"
         onMouseEnter={() => setIsSpiritual(true)}
         onMouseLeave={() => setIsSpiritual(false)}>
      
      {/* Human World (Dark/Shadowy) - Default State */}
      <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out bg-zinc-950"
           style={{ opacity: isSpiritual ? 0 : 1 }}>
        <img 
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000" 
          alt="Human World" 
          className="w-full h-full object-cover grayscale brightness-[0.3] contrast-125"
        />
        <div className="absolute inset-0 bg-zinc-900/60 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="serif italic text-3xl md:text-5xl text-white drop-shadow-2xl tracking-wide opacity-80 group-hover:opacity-0 transition-opacity duration-500">
            The Human World
          </p>
        </div>
      </div>

      {/* Spiritual World (Bright/Vibrant) - Hover State */}
      <div className="absolute inset-0 bg-white transition-opacity duration-1000 ease-in-out"
           style={{ opacity: isSpiritual ? 1 : 0 }}>
        <img 
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000" 
          alt="Spiritual World" 
          className="w-full h-full object-cover saturate-[1.2] brightness-110"
        />
        <div className="absolute inset-0 bg-yellow-400/5 mix-blend-overlay" />
        {/* Living Pulse indicator */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/40 rounded-full animate-ping" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="serif italic text-3xl md:text-5xl text-zinc-900 drop-shadow-sm tracking-wide">
            The Other World
          </p>
        </div>
      </div>
    </div>
  );
};
