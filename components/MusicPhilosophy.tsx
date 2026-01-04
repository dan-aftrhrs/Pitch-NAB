import React from 'react';

export const MusicPhilosophy: React.FC = () => {
  return (
    <div className="bg-zinc-900 text-zinc-100 p-8 md:p-20 rounded-sm flex flex-col md:flex-row items-center gap-12 border border-zinc-800 shadow-2xl">
      <div className="md:w-1/2 space-y-8">
        <h2 className="text-3xl md:text-5xl serif font-light italic leading-tight">
          Music in notaBard isn’t a soundtrack — it’s a conversation.
        </h2>
        <div className="space-y-6 text-base md:text-lg font-light text-zinc-400 leading-relaxed">
          <p>
            As the player move and acts in the world, every move has a sound that the world responds to. However when the actions are aligned with visible or hidden rhythms of the world, it responds with movement, music and sometimes magic.
          </p>
          <div className="pt-4 space-y-2">
            <p className="text-zinc-200 serif italic text-xl md:text-2xl">
              The goal is to move from perfection to partnership.
            </p>
            <p className="text-zinc-400 serif italic text-lg opacity-60">
              It’s willingness.
            </p>
          </div>
        </div>
      </div>
      <div className="md:w-1/2 flex justify-center items-center">
          <div className="relative flex items-center justify-center w-56 h-56 md:w-72 md:h-72">
            <div className="absolute inset-0 border border-zinc-800 rounded-full animate-[spin_25s_linear_infinite]" />
            <div className="absolute inset-10 border border-zinc-700 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
            <div className="absolute inset-20 border border-zinc-800 rounded-full animate-[spin_60s_linear_infinite]" />
            <div className="w-32 h-32 bg-zinc-400/5 rounded-full blur-3xl animate-pulse" />
            <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
          </div>
      </div>
    </div>
  );
};