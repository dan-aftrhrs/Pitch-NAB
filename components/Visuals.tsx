import React from 'react';

const artworks = [
  {
    url: "https://64.media.tumblr.com/bdeadd922fb48938c0d97e11b84a4768/tumblr_p7u5byVuAy1qaywrho5_540.gif",
    title: "Eastward"
  },
  {
    url: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1608230/extras/PoL_Gif_06-v2.gif?t=1738259564",
    title: "Planet of Lana"
  },
  {
    url: "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/2533960/extras/summerhouse_new_store_page.gif?t=1744991120",
    title: "Summerhouse"
  },
  {
    url: "https://gamersolace.wordpress.com/wp-content/uploads/2016/07/journey-gif.gif",
    title: "Journey"
  }
];

export const Visuals: React.FC = () => {
  return (
    <div className="space-y-16 py-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl serif font-light">Visual and Art</h2>
        <p className="text-zinc-500 font-light max-w-lg mx-auto italic leading-relaxed text-sm md:text-base px-6">
          We're going for wonder and beauty. Hand drawn art (pixel art or otherwise) and procedurally generated effects. Here are some inspirations:
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-6 max-w-6xl mx-auto">
        {artworks.map((art, i) => (
          <div key={i} className="flex flex-col items-center space-y-6 group">
            <div 
              className="relative w-full aspect-square overflow-hidden bg-zinc-100 rounded-sm shadow-sm transition-all duration-1000 group-hover:shadow-2xl group-hover:shadow-amber-900/10 group-hover:-translate-y-2"
            >
              <img 
                src={art.url} 
                alt={art.title} 
                className="w-full h-full object-cover opacity-90 transition-transform duration-[2000ms] ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            </div>
            <div className="text-center">
               <h3 className="serif text-xl md:text-2xl italic font-light text-zinc-800 tracking-wide transition-colors duration-500 group-hover:text-amber-800">
                 {art.title}
               </h3>
               <div className="w-4 h-px bg-zinc-200 mx-auto mt-2 transition-all duration-500 group-hover:w-8 group-hover:bg-amber-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};