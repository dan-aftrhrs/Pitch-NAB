
import React from 'react';
import { Section } from './Section';

export const Experience: React.FC = () => {
  const experiences = [
    "Wander through quiet, responsive environments",
    "Learn by paying attention rather than being instructed",
    "Play music that gently shapes the world",
    "Make mistakes without being punished for them",
    "Discover meaning slowly, through repetition and presence"
  ];

  return (
    <Section className="scrolled-reveal">
      <div className="max-w-2xl mx-auto space-y-12">
        <h2 className="text-3xl md:text-4xl serif font-light text-center">The Experience</h2>
        <div className="space-y-8">
          {experiences.map((text, i) => (
            <div key={i} className="group flex items-center gap-8 md:gap-12">
              <span className="text-zinc-300 group-hover:text-zinc-500 transition-colors text-xl font-light serif">0{i + 1}</span>
              <p className="text-lg md:text-xl font-light text-zinc-600 leading-snug">
                {text}
              </p>
            </div>
          ))}
        </div>
        <p className="text-center pt-12 text-zinc-400 italic font-light">
          The game is designed to slow the player down — not to frustrate them, but to help them notice.
        </p>
      </div>
    </Section>
  );
};
