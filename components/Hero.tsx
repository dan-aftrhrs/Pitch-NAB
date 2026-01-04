
import React from 'react';

export const Hero: React.FC = () => {
  return (
    <section className="relative h-screen w-full flex flex-col items-center justify-start overflow-hidden bg-[#fdfcf8]">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=2000" 
          alt="Painterly valley" 
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute top-[25%] right-[15%] w-[50vw] h-[50vw] bg-white/30 blur-[100px] rounded-full mix-blend-overlay animate-pulse" />
      </div>

      {/* Frame Layer (The Cave) */}
      <div className="absolute inset-0 z-10 pointer-events-none select-none">
        <div className="absolute inset-0 bg-zinc-900" style={{
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 12% 12%, 8% 45%, 12% 88%, 35% 96%, 65% 94%, 92% 85%, 88% 45%, 90% 12%, 12% 12%)',
          maskImage: 'radial-gradient(circle at center, transparent 35%, black 85%)',
          WebkitMaskImage: 'radial-gradient(circle at center, transparent 35%, black 85%)'
        }}>
          <div className="w-full h-full opacity-30 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />
        </div>
      </div>

      {/* Hero Text - Positioned at 25vh (halfway between 0 and 50) */}
      <div className="relative z-30 text-center space-y-4 md:space-y-8 fade-in px-6 pt-[25vh]">
        <div className="space-y-2">
          <h1 className="text-6xl md:text-9xl font-light serif text-white tracking-tight drop-shadow-2xl">
            notaBard
          </h1>
          <p className="text-sm md:text-lg tracking-[0.3em] uppercase text-white/60 font-light">
            Listen First, Act Second
          </p>
        </div>
        <p className="text-base md:text-xl font-light italic text-white/90 serif drop-shadow-md max-w-[320px] md:max-w-xl mx-auto leading-relaxed">
          Follow along the musician's journey to learn to keep in step.
        </p>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-40 z-30">
        <div className="w-px h-12 bg-white animate-pulse" />
      </div>
    </section>
  );
};
