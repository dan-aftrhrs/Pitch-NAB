import React from 'react';

const movements = [
  { title: "Stories", subtitle: "The past; His story" },
  { title: "Law", subtitle: "the boundary, love." },
  { title: "Wisdom", subtitle: "Applied knowledge for the present" },
  { title: "Songs", subtitle: "Beyond the boundaries; grace" },
  { title: "Prophecy", subtitle: "Hope oriented toward the future" }
];

export const Movements: React.FC = () => {
  return (
    <div className="space-y-12 py-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl serif font-light">The Five Movements</h2>
        <p className="text-zinc-500 font-light max-w-lg mx-auto italic leading-relaxed text-sm md:text-base">
          To bring a Forgotten Song back to the Sacred Library, you must gather the internalised wisdom of the Elders into written form.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        {movements.map((m, i) => (
          <div key={i} className="p-8 bg-white border border-zinc-100 flex flex-col items-center text-center space-y-4 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-700 group min-h-[200px] justify-center">
            <div className="w-10 h-10 rounded-full border border-zinc-100 flex items-center justify-center text-xs text-zinc-300 group-hover:border-amber-500 group-hover:text-amber-500 transition-colors duration-500">
              {i + 1}
            </div>
            <h3 className="serif text-2xl font-light text-zinc-800">{m.title}</h3>
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 leading-tight group-hover:text-zinc-600 transition-colors">{m.subtitle}</p>
          </div>
        ))}
      </div>
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-300 font-bold">1 Book • 5 Movements</p>
      </div>
    </div>
  );
};