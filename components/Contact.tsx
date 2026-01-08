import React from 'react';
import { Section } from './Section';

export const Contact: React.FC = () => {
  return (
    <Section className="scrolled-reveal py-32 md:py-48">
      <div className="max-w-2xl mx-auto text-center space-y-12">
        <div className="space-y-6">
          <h2 className="text-4xl md:text-5xl serif font-light italic">Let's get this journey started.</h2>
          <p className="text-lg md:text-xl font-light text-zinc-600 leading-relaxed px-6">
            Join me in partnership to build notaBard. <br/>
            This is not just a game, it's an interactive parable. It's also a piece of art we build collectively.
          </p>
          <div className="space-y-2 pt-8">
            <p className="text-zinc-400 italic font-light text-lg">
              Thanks for reading!
            </p>
          </div>
        </div>

        <div className="pt-8 space-y-8">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Below are a few more resources for you.</p>
          <div className="flex flex-col md:flex-row justify-center items-center gap-y-10 md:gap-x-12 px-6">
             <div className="flex flex-col items-center gap-2 max-w-[200px]">
               <a 
                 href="https://docs.google.com/document/d/1LCtyX4wMcUDVZK5skreg53vPPG-S-eqK76t17cG-Neo/edit?tab=t.0#heading=h.sjff5351ahfi" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="text-zinc-800 hover:text-amber-600 font-medium transition-colors border-b border-zinc-200 pb-1"
               >
                 Game Design Document
               </a>
               <p className="text-[10px] text-zinc-400 italic">A living document that we will be using and updating as we go along, to keep everyone on the same page.</p>
             </div>

             <div className="flex flex-col items-center gap-2 max-w-[200px]">
               <a 
                 href="https://www.notion.so/not-a-Bard-cd7469681a484183b699c0e87c0352f5?source=copy_link" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="text-zinc-800 hover:text-amber-600 font-medium transition-colors border-b border-zinc-200 pb-1"
               >
                 Project Notion
               </a>
               <p className="text-[10px] text-zinc-400 italic">Our central collaboration space for lore, tasks, and team coordination.</p>
             </div>

             <div className="flex flex-col items-center gap-2 max-w-[200px]">
               <a 
                 href="https://docs.google.com/spreadsheets/d/18Hp2zO7bkQmQjpg9K_u3dZeu1rfU3MHAx359nx_uh8k/edit?gid=0#gid=0" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="text-zinc-800 hover:text-amber-600 font-medium transition-colors border-b border-zinc-200 pb-1"
               >
                 Research
               </a>
               <p className="text-[10px] text-zinc-400 italic">This is Dan's little spreadsheet of research and inspirations.</p>
             </div>
          </div>
        </div>
      </div>
    </Section>
  );
};