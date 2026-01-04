import React from 'react';
import { Section } from './Section';

export const Contact: React.FC = () => {
  return (
    <Section className="scrolled-reveal py-32 md:py-48">
      <div className="max-w-2xl mx-auto text-center space-y-12">
        <div className="space-y-6">
          <h2 className="text-4xl md:text-5xl serif font-light italic">Join me in partnership</h2>
          <p className="text-lg md:text-xl font-light text-zinc-600 leading-relaxed px-6">
            notaBard isn’t just a game, it's an interactive parable. It's also a piece of art. I invite you to start thinking about how your skills and passion might align with this vision.
          </p>
          <div className="space-y-2 pt-8">
            <p className="text-zinc-400 italic font-light text-lg">
              Thanks for reading!
            </p>
            <p className="text-zinc-500 font-medium tracking-widest uppercase text-xs pt-4">
              dan.aftrhrs@gmail.com
            </p>
          </div>
        </div>

        <div className="pt-8">
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-zinc-400 text-sm font-light">
             <a 
               href="https://docs.google.com/document/d/1LCtyX4wMcUDVZK5skreg53vPPG-S-eqK76t17cG-Neo/edit?tab=t.0#heading=h.sjff5351ahfi" 
               target="_blank" 
               rel="noopener noreferrer" 
               className="hover:text-zinc-800 cursor-pointer transition-colors border-b border-transparent hover:border-zinc-200 pb-1"
             >
               Game Design Document
             </a>
             <a 
               href="https://docs.google.com/spreadsheets/d/18Hp2zO7bkQmQjpg9K_u3dZeu1rfU3MHAx359nx_uh8k/edit?gid=0#gid=0" 
               target="_blank" 
               rel="noopener noreferrer" 
               className="hover:text-zinc-800 cursor-pointer transition-colors border-b border-transparent hover:border-zinc-200 pb-1"
             >
               Research
             </a>
             <a 
               href="https://www.notion.so/afterhourscreative/not-a-Bard-cd7469681a484183b699c0e87c0352f5" 
               target="_blank" 
               rel="noopener noreferrer" 
               className="hover:text-zinc-800 cursor-pointer transition-colors border-b border-transparent hover:border-zinc-200 pb-1"
             >
               Notion
             </a>
          </div>
        </div>
      </div>
    </Section>
  );
};