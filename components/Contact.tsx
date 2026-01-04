
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
          <div className="flex justify-center gap-12 text-zinc-400 text-sm font-light">
             <span className="hover:text-zinc-800 cursor-pointer transition-colors border-b border-transparent hover:border-zinc-200 pb-1">Discord</span>
             <span className="hover:text-zinc-800 cursor-pointer transition-colors border-b border-transparent hover:border-zinc-200 pb-1">Instagram</span>
             <span className="hover:text-zinc-800 cursor-pointer transition-colors border-b border-transparent hover:border-zinc-200 pb-1">Journal</span>
          </div>
        </div>
      </div>
    </Section>
  );
};
