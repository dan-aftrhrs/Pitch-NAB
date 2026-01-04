import React from 'react';
import { Section } from './Section';
import { GenerativeMusic } from './GenerativeMusic';

export const MusicSystem: React.FC = () => {
  return (
    <Section className="scrolled-reveal">
      <div className="space-y-32">
        {/* PHILOSOPHY SECTION */}
        <div className="bg-zinc-900 text-zinc-100 p-12 md:p-24 rounded-sm flex flex-col md:flex-row items-center gap-12 border border-zinc-800 shadow-2xl">
          <div className="md:w-1/2 space-y-8">
            <h2 className="text-4xl md:text-5xl serif font-light italic leading-tight">
              Music in notaBard isn’t a soundtrack — it’s a conversation.
            </h2>
            <div className="space-y-6 text-lg font-light text-zinc-400 leading-relaxed">
              <p>
                Sound originates from the player and is interpreted, amplified, and responded to by the world. When actions are aligned, music becomes expressive and transformative. 
              </p>
              <p>
                When they aren’t, it still works — just quietly and simply.
              </p>
              <div className="pt-4">
                <p className="text-zinc-200 serif italic text-2xl">
                  The goal isn’t perfection.
                </p>
                <p className="text-zinc-200 serif italic text-2xl">
                  It’s willingness.
                </p>
              </div>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center items-center">
              <div className="relative flex items-center justify-center w-72 h-72">
                <div className="absolute inset-0 border border-zinc-800 rounded-full animate-[spin_25s_linear_infinite]" />
                <div className="absolute inset-10 border border-zinc-700 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
                <div className="absolute inset-20 border border-zinc-800 rounded-full animate-[spin_60s_linear_infinite]" />
                <div className="w-32 h-32 bg-zinc-400/5 rounded-full blur-3xl animate-pulse" />
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)]" />
              </div>
          </div>
        </div>

        {/* INTERACTIVE SECTION */}
        <div className="space-y-16">
          <div className="text-center space-y-6 max-w-2xl mx-auto">
             <h3 className="text-3xl md:text-4xl serif italic font-light">Generative Loops</h3>
             <div className="space-y-4 text-zinc-600 font-light leading-relaxed">
               <p>
                 This system utilizes 8 independent piano loops. Because each fragment cycles at its own specific length, they slowly drift in and out of phase with each other.
               </p>
               <p>
                 Initialize the archive to load the fragments, then toggle them on to hear a composition that evolves indefinitely without ever repeating exactly.
               </p>
             </div>
             <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 pt-8 font-medium">
               Interactive Parable #01 — Systems over Symmetry
             </p>
          </div>
          <div className="bg-white p-6 md:p-12 border border-zinc-100 rounded-sm shadow-sm">
            <GenerativeMusic />
          </div>
        </div>
      </div>
    </Section>
  );
};