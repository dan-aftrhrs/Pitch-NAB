
import React from 'react';

const pillars = [
  { 
    title: "1. Keep in Step", 
    desc: "Everything in the world has rhythm. The game slows the player down enough to notice first and act second, rewarding attentiveness and alignment rather than dominance or speed. Galatians 5:25" 
  },
  { 
    title: "2. Never Play Alone", 
    desc: "We are the player’s creative partner. The world we create, the characters we write, the environments we illustrate, and the systems we build all respond to the player’s actions so that play feels shared rather than solitary." 
  },
  { 
    title: "3. The World is a Living System", 
    desc: "Music is not just a backdrop; the art breathes and the story evolves with your choices. The world is a living, responsive system that reacts to player action." 
  },
  { 
    title: "4. Art Imitates Life", 
    desc: "The world draws from our own lived experiences and real-life historical events to give weight. We will allow our daily lives to shape this project." 
  },
  { 
    title: "5. Seek Wonder", 
    desc: "Curiosity, beauty, and discovery are crucial for us. The game actively invites the player to pursue wonder." 
  },
  { 
    title: "6. Scripture is our seatbelt", 
    desc: "The journey is going to be wild and chaotic at times but also wonder-filled and fun. In the midst of all the creative things, we want Scripture to be our grounding, and anything that doesn’t line up, we will not pursue." 
  }
];

export const Pillars: React.FC = () => {
  return (
    <div className="space-y-16">
      <h2 className="text-3xl md:text-4xl serif font-light text-center">Design Pillars</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 px-4">
        {pillars.map((p, i) => (
          <div key={i} className="space-y-3 relative">
            <span className="absolute -top-8 left-0 text-4xl serif italic text-zinc-100 select-none -z-10">{i + 1}</span>
            <h3 className="serif text-2xl font-light text-zinc-800 leading-snug">{p.title}</h3>
            <p className="text-zinc-500 font-light leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
