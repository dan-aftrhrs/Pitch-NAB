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
      <h2 className="text-3xl md:text-4xl serif font-light text-center">Roles and Teams</h2>
      
      <div className="space-y-8 text-center max-w-2xl mx-auto px-6">
        <p className="text-zinc-600 font-light leading-relaxed text-sm md:text-base">
          The following are the disciplines in gaming this game. My hope is that there will be a primary leader and helpers for each team. The shape of the team will grow naturally. If working solo make sense to you, do it. If you need a team, it's a perfect opportunity to collaborate.
        </p>
        
        <div className="p-6 bg-zinc-50 border border-zinc-100 rounded-sm italic text-zinc-500 text-sm leading-relaxed">
          "We will be running a monthly 'brain trust', that is where we all bring our progress to the team and we all give some ideas and feedback. It is up to the core team leader to decide which ones to implement."
        </div>

        <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-zinc-400 font-bold pt-4 text-center w-full">
          Current Areas
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {roles.map((role, i) => (
          <div key={i} className="p-6 md:p-8 border border-zinc-100 bg-[#fdfcf8] hover:border-zinc-400 hover:shadow-sm transition-all duration-700 flex items-center justify-center md:justify-start group">
            <div className="flex items-center gap-6">
              <span className="text-zinc-200 text-xs serif group-hover:text-amber-500 transition-colors">0{i+1}</span>
              <p className="text-zinc-700 font-light text-sm md:text-base">{role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};