import React from 'react';
import { Section } from './Section';

export const Roles: React.FC = () => {
  const roles = [
    "Story and narrative",
    "Gameplay and systems",
    "Interactive music and sound design",
    "Art and Animation",
    "Marketing and engagement",
    "Admin and tools"
  ];

  return (
    <Section className="scrolled-reveal">
      <div className="max-w-3xl mx-auto space-y-12">
        <h2 className="text-3xl md:text-4xl serif font-light text-center">Proposed Roles</h2>
        
        <div className="space-y-6 text-center max-w-2xl mx-auto px-6">
          <p className="text-zinc-600 font-light leading-relaxed">
            The way I would love to work on this project is by giving everyone agency to lead and envision one discipline. After that, the shape of the team will grow naturally. Whether you work collaboratively or solo is up to you. We will have monthly "Brain Trusts" to review and get external input on our progress.
          </p>
          <p className="text-sm text-zinc-400 italic">
            Depending on interest, we’re open to collaborators in these areas:
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role, i) => (
            <div key={i} className="p-6 border border-zinc-100 bg-[#fdfcf8] hover:border-zinc-300 transition-colors">
              <p className="text-zinc-700 font-light text-center md:text-left">{role}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};