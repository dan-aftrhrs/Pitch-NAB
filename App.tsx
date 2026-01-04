import React, { useEffect } from 'react';
import { Hero } from './components/Hero';
import { Section } from './components/Section';
import { MusicSystem } from './components/MusicSystem';
import { Roles } from './components/Roles';
import { Contact } from './components/Contact';
import { WorldComparison } from './components/WorldComparison';
import { Movements } from './components/Movements';
import { Pillars } from './components/Pillars';

const App: React.FC = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.scrolled-reveal').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen selection:bg-[#e9e4d4]">
      {/* SECTION 1 — HERO */}
      <Hero />

      <main className="max-w-5xl mx-auto px-6 md:px-12 space-y-32 md:space-y-48 pb-32">
        
        {/* SECTION 2 — THE VISION */}
        <Section className="scrolled-reveal mt-24">
          <div className="max-w-2xl mx-auto text-center space-y-12">
            <div className="space-y-4">
              <h2 className="text-sm uppercase tracking-[0.4em] text-zinc-400">The Vision</h2>
              <p className="text-2xl md:text-3xl font-light leading-relaxed text-zinc-800 serif italic">
                A blend of Studio Ghibli wonder, the joy of musical performance, and the allegorical depth of C.S. Lewis.
              </p>
            </div>
            <div className="space-y-6 text-lg font-light text-zinc-600 leading-relaxed text-left border-l border-zinc-200 pl-8">
              <p>
                You are not a bard. You are just a musician pulled into a parallel reality.
              </p>
              <p>
                Tasked with finding <strong>Elders</strong> who have internalized the <strong>Forgotten Songs</strong>, you must bring them back to the <strong>Sacred Library</strong> with the help of a <strong>black cat</strong> and using a <strong>cello</strong> that reacts to the Spirit World.
              </p>
              <p className="italic text-zinc-500">
                It’s a parable about Keeping in Step. The art of "Shema" — listening and responding.
              </p>
            </div>
          </div>
        </Section>

        {/* SECTION 3 — THE WORLD (PARALLEL) */}
        <Section className="scrolled-reveal space-y-16 flex flex-col items-center">
          <div className="text-center space-y-6">
            <h2 className="text-3xl md:text-4xl serif font-light">Two worlds, One reality.</h2>
          </div>
          <div className="w-full max-w-4xl">
            <WorldComparison />
          </div>
        </Section>

        {/* SECTION 4 — MOVEMENTS */}
        <Section className="scrolled-reveal">
          <Movements />
        </Section>

        {/* SECTION 5 — PILLARS */}
        <Section className="scrolled-reveal">
          <Pillars />
        </Section>

        {/* SECTION 6 — MUSIC AS A SYSTEM */}
        <MusicSystem />

        {/* SECTION 7 — ROLES */}
        <Roles />

        {/* SECTION 8 — INVITATION */}
        <Contact />

      </main>

      <footer className="text-center py-12 text-zinc-400 text-xs tracking-widest uppercase">
        &copy; 2026 Aftrhrs Studio — Play: A space between work and rest.
      </footer>
    </div>
  );
};

export default App;