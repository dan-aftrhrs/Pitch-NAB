
import React from 'react';
import { Section } from './Section';

export const Influences: React.FC = () => {
  const influences = [
    { title: "Planet of Lana", desc: "painterly tone and quiet wonder" },
    { title: "Wandersong", desc: "music as expression and relationship" },
    { title: "Tunic", desc: "learning through observation" },
    { title: "Hollow Knight", desc: "a world that exists independently" }
  ];

  return (
    <Section className="scrolled-reveal">
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl serif font-light">Tone & Influences</h2>
          <p className="text-zinc-500 font-light max-w-xl mx-auto">
            notaBard aims for restraint and warmth rather than spectacle. 
            It’s inspired by games that trust the player.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {influences.map((inf, i) => (
            <div key={i} className="border-l border-zinc-200 pl-6 space-y-2">
              <h3 className="serif text-xl italic font-medium text-zinc-800">{inf.title}</h3>
              <p className="text-sm font-light text-zinc-500 tracking-wide uppercase">{inf.desc}</p>
            </div>
          ))}
        </div>

        <div className="pt-12 text-center">
          <p className="text-zinc-400 text-sm font-light">
            If something feels too loud, too explicit, or too clever, it probably doesn’t belong here.
          </p>
        </div>
      </div>
    </Section>
  );
};
