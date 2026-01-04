import React, { useEffect, useRef, useState } from 'react';
import { Hero } from './components/Hero';
import { MusicPhilosophy } from './components/MusicPhilosophy';
import { GenerativeLoopsSection } from './components/GenerativeLoopsSection';
import { Roles } from './components/Roles';
import { Contact } from './components/Contact';
import { WorldComparison } from './components/WorldComparison';
import { Pillars } from './components/Pillars';

const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);

  const sections = [
    { id: 'hero', title: 'Home' },
    { id: 'vision', title: 'The Vision' },
    { id: 'world', title: 'Two Worlds' },
    { id: 'pillars', title: 'Pillars' },
    { id: 'philosophy', title: 'Philosophy' },
    { id: 'loops', title: 'Loops' },
    { id: 'roles', title: 'Roles' },
    { id: 'contact', title: 'Contact' }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sections.findIndex(s => s.id === entry.target.id);
            if (index !== -1 && index !== activeSection) {
              setActiveSection(index);
            }
          }
        });
      },
      { 
        threshold: 0.6,
        root: null
      }
    );

    document.querySelectorAll('.snap-section').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [activeSection]);

  const scrollToSection = (index: number) => {
    const targetId = sections[index].id;
    const element = document.getElementById(targetId);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const nextSection = () => {
    if (activeSection < sections.length - 1) {
      scrollToSection(activeSection + 1);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#fdfcf8]">
      {/* GLOBAL NAVIGATION: SIDE DOTS */}
      <nav className="fixed right-6 md:right-10 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-5">
        {sections.map((section, i) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(i)}
            className="group flex items-center justify-end gap-4 py-1 outline-none"
            aria-label={`Go to ${section.title}`}
          >
            <span className={`text-[9px] uppercase tracking-[0.3em] transition-all duration-300 pointer-events-none ${activeSection === i ? 'text-zinc-900 opacity-100 translate-x-0' : 'text-zinc-400 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`}>
              {section.title}
            </span>
            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeSection === i ? 'bg-zinc-900 scale-125' : 'bg-zinc-200 group-hover:bg-zinc-400'}`} />
          </button>
        ))}
      </nav>

      {/* SNAP CONTAINER */}
      <div 
        ref={containerRef}
        className="snap-container hide-scrollbar"
      >
        <div id="hero" className="snap-section">
          <Hero />
        </div>

        <div id="vision" className="snap-section px-6">
          <div className="max-w-2xl mx-auto text-center space-y-12">
            <div className="space-y-4">
              <h2 className="text-sm uppercase tracking-[0.4em] text-zinc-400">The Vision</h2>
              <p className="text-2xl md:text-3xl font-light leading-relaxed text-zinc-800 serif italic">
                A blend of Studio Ghibli wonder, the joy of musical performance, and the allegorical depth of C.S. Lewis.
              </p>
            </div>
            <div className="space-y-6 text-lg font-light text-zinc-600 leading-relaxed text-left border-l border-zinc-200 pl-8">
              <p>You are not a bard. You are just a musician pulled into a parallel reality.</p>
              <p>Tasked with finding <strong>Elders</strong> who have internalized the <strong>Forgotten Songs</strong>, you must bring them back to the <strong>Sacred Library</strong> with the help of a <strong>black cat</strong>.</p>
              <p className="italic text-zinc-500 text-base">It’s a parable about Keeping in Step. The art of "Shema" — listening and responding.</p>
            </div>
          </div>
        </div>

        <div id="world" className="snap-section px-6">
          <div className="w-full max-w-5xl space-y-12">
            <h2 className="text-3xl md:text-4xl serif font-light text-center">Two worlds, One reality.</h2>
            <WorldComparison />
          </div>
        </div>

        <div id="pillars" className="snap-section px-6">
          <div className="w-full max-w-5xl overflow-y-auto max-h-[90vh] py-12 hide-scrollbar">
            <Pillars />
          </div>
        </div>

        <div id="philosophy" className="snap-section px-6">
          <div className="w-full max-w-5xl">
            <MusicPhilosophy />
          </div>
        </div>

        <div id="loops" className="snap-section px-6">
          <div className="w-full max-w-5xl">
            <GenerativeLoopsSection />
          </div>
        </div>

        <div id="roles" className="snap-section px-6">
          <div className="w-full max-w-5xl">
            <Roles />
          </div>
        </div>

        <div id="contact" className="snap-section px-6 flex flex-col items-center justify-center">
          <Contact />
          <footer className="absolute bottom-12 left-0 w-full text-center text-zinc-400 text-[10px] tracking-[0.5em] uppercase">
            &copy; 2026 Aftrhrs Studio
          </footer>
        </div>
      </div>

      {/* FLOATING NEXT ARROW */}
      {activeSection < sections.length - 1 && (
        <button 
          onClick={nextSection}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 p-4 group transition-all duration-300 outline-none"
          aria-label="Next Section"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-[9px] uppercase tracking-[0.3em] text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Descend
            </span>
            <svg width="24" height="14" viewBox="0 0 24 14" fill="none" className="stroke-zinc-300 group-hover:stroke-zinc-800 transition-colors duration-300">
              <path d="M2 2L12 12L22 2" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
        </button>
      )}
    </div>
  );
};

export default App;