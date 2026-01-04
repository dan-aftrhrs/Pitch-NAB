import React from 'react';

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
    <div className="max-w-3xl mx-auto space-y-10 md:space-y-16">
      <h2 className="text-3xl md:text-4xl serif font-light text-center">Proposed Roles</h2>
      
      <div className="space-y-6 text-center max-w-2xl mx-auto px-6">
        <p className="text-zinc-600 font-light leading-relaxed text-sm md:text-base">
          The way I would love to work on this project is by giving everyone agency to lead and envision one discipline. After that, the shape of the team will grow naturally. Whether you work collaboratively or solo is up to you. We will have monthly "Brain Trusts" to review and get external input on our progress.
        </p>
        <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-zinc-400 italic">
          Collaborators in these areas
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {roles.map((role, i) => (
          <div key={i} className="p-6 md:p-8 border border-zinc-100 bg-[#fdfcf8] hover:border-zinc-400 hover:shadow-sm transition-all duration-700 flex items-center justify-center md:justify-start">
            <div className="flex items-center gap-6">
              <span className="text-zinc-200 text-xs serif">0{i+1}</span>
              <p className="text-zinc-700 font-light text-sm md:text-base">{role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};