import React from 'react';
import { GenerativeMusic } from './GenerativeMusic';

export const GenerativeLoopsSection: React.FC = () => {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
         <h3 className="text-3xl md:text-4xl serif italic font-light">Generative Loops</h3>
         <p className="text-zinc-600 font-light leading-relaxed text-sm md:text-base">
           This is Airports by Brian Eno. He used 8 different pieces of music that have different length so when they are looped, it creates a composition that evolves indefinitely without repeating exactly.
         </p>
      </div>
      <div className="bg-white p-4 md:p-10 border border-zinc-100 rounded-sm shadow-sm">
        <GenerativeMusic />
      </div>
    </div>
  );
};