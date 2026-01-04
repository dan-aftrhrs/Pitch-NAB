import React from 'react';

const movements = [
  { title: "Stories", subtitle: "The past, His story" },
  { title: "Laws", subtitle: "The boundaries, love." },
  { title: "Wisdom", subtitle: "The knowledge for the present." },
  { title: "Songs", subtitle: "Beyond the boundaries, grace." },
  { title: "Prophecy", subtitle: "The future, Hope." }
];

export const Movements: React.FC = () => {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl serif font-light">The Five Movements</h2>
        <p className="text-zinc-500 font-light max-w-lg mx-auto italic leading-relaxed">
          To bring a Forgotten Song back to the Sacred Library, you need to find the hidden elder and learn from them.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {movements.map((m, i) => (
          <div key={i} className="p-6 bg-zinc-50 border border-zinc-100 flex flex-col items-center text-center space-y-4 hover:bg-white hover:shadow-sm transition-all duration-500 group min-h-[160px] justify-center">
            <div className="w-8 h-8 rounded-full border border-zinc-300 flex items-center justify-center text-xs text-zinc-400 group-hover:border-zinc-800 group-hover:text-zinc-800 transition-colors">
              {i + 1}
            </div>
            <h3 className="serif text-xl font-medium">{m.title}</h3>
            <p className="text-[10px] uppercase tracking-widest text-zinc-400 leading-tight">{m.subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  );
};