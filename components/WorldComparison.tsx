import React, { useState } from 'react';

const REGIONS = [
  { id: 'story', url: 'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?auto=format&fit=crop&q=80&w=500' }, // Story
  { id: 'kitchen', url: 'https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?auto=format&fit=crop&q=80&w=500' }, // Kitchen (Pots & Pans)
  { id: 'wisdom', url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=500' }, // Wisdom (Steampunk Gears)
  { id: 'songs', url: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&q=80&w=500' }, // Songs (Sheet Music)
  { id: 'prophecy', url: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?auto=format&fit=crop&q=80&w=500' }  // Prophecy (Stars)
];

export const WorldComparison: React.FC = () => {
  const [isSpiritual, setIsSpiritual] = useState(false);

  return (
    <div className="w-full space-y-10 md:space-y-14">
      {/* Main Banner */}
      <div className="relative w-full aspect-video md:aspect-[21/7] overflow-hidden rounded-sm group cursor-pointer border border-zinc-200 shadow-xl"
           onMouseEnter={() => setIsSpiritual(true)}
           onMouseLeave={() => setIsSpiritual(false)}>
        
        {/* Human World (Muted/Shadowy) - Default State */}
        <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out bg-zinc-900"
             style={{ opacity: isSpiritual ? 0 : 1 }}>
          <img 
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000" 
            alt="Human World" 
            className="w-full h-full object-cover grayscale brightness-[0.5] contrast-[1.1]"
          />
          <div className="absolute inset-0 bg-zinc-900/30 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/40 rounded-full animate-ping" />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="serif italic text-3xl md:text-5xl text-zinc-900 drop-shadow-sm tracking-wide">
              The Other World
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-center text-[10px] uppercase tracking-[0.5em] text-zinc-950 font-semibold">
          Five Regions
        </h3>
        
        {/* Region Grid (Single Row of 5) */}
        <div className="grid grid-cols-5 gap-3 md:gap-6 w-full max-w-4xl mx-auto">
          {REGIONS.map((region) => (
            <div 
              key={region.id} 
              className="aspect-square relative overflow-hidden group border border-zinc-100 transition-all duration-700 hover:border-zinc-300 shadow-sm"
            >
              <img 
                src={region.url} 
                alt={region.id} 
                className={`w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 ${isSpiritual ? 'grayscale-0' : 'grayscale contrast-[1.1]'}`}
              />
              <div className={`absolute inset-0 transition-colors duration-700 ${isSpiritual ? 'bg-transparent' : 'bg-zinc-900/5'}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};