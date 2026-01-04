import React, { useState, useRef, useEffect } from 'react';

const SAMPLES = [
  'https://reverbmachine.com/wp-content/uploads/2022/09/eno-mfa-piano-01.mp3',
  'https://reverbmachine.com/wp-content/uploads/2022/09/eno-mfa-piano-02.mp3',
  'https://reverbmachine.com/wp-content/uploads/2022/09/eno-mfa-piano-03.mp3',
  'https://reverbmachine.com/wp-content/uploads/2022/09/eno-mfa-piano-04.mp3',
  'https://reverbmachine.com/wp-content/uploads/2022/09/eno-mfa-piano-05.mp3',
  'https://reverbmachine.com/wp-content/uploads/2022/09/eno-mfa-piano-06.mp3',
  'https://reverbmachine.com/wp-content/uploads/2022/09/eno-mfa-piano-07.mp3',
  'https://reverbmachine.com/wp-content/uploads/2022/09/eno-mfa-piano-01.mp3' // Repeat for 8th slot
];

export const GenerativeMusic: React.FC = () => {
  const [active, setActive] = useState<boolean[]>(new Array(SAMPLES.length).fill(false));
  const audioRefs = useRef<(HTMLAudioElement | null)[]>(new Array(SAMPLES.length).fill(null));
  const timeoutRefs = useRef<(number | null)[]>(new Array(SAMPLES.length).fill(null));

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAll();
    };
  }, []);

  const toggleFragment = (i: number) => {
    // Clear any pending delayed starts for this slot
    if (timeoutRefs.current[i]) {
      window.clearTimeout(timeoutRefs.current[i]!);
      timeoutRefs.current[i] = null;
    }

    let audio = audioRefs.current[i];

    if (active[i] && audio) {
      audio.pause();
      audio.currentTime = 0;
      
      const nextActive = [...active];
      nextActive[i] = false;
      setActive(nextActive);
    } else {
      if (!audio) {
        audio = new Audio(SAMPLES[i]);
        audio.loop = true;
        audioRefs.current[i] = audio;
      }
      
      audio.play().catch(err => {
        console.error("Audio playback blocked or failed:", err);
      });

      const nextActive = [...active];
      nextActive[i] = true;
      setActive(nextActive);
    }
  };

  const playAll = () => {
    // Stop everything first to reset the state
    stopAll();

    const nextActive = new Array(SAMPLES.length).fill(true);
    setActive(nextActive);

    // Select one random track to start immediately
    const immediateIndex = Math.floor(Math.random() * SAMPLES.length);

    SAMPLES.forEach((url, i) => {
      let audio = audioRefs.current[i];
      if (!audio) {
        audio = new Audio(url);
        audio.loop = true;
        audioRefs.current[i] = audio;
      }

      if (i === immediateIndex) {
        // Start immediately
        audio.play().catch(err => console.error(`Playback failed for ${i}:`, err));
      } else {
        // Start after a random interval (up to 10 seconds)
        const delay = Math.random() * 10000;
        const timeoutId = window.setTimeout(() => {
          if (audioRefs.current[i]) {
            audioRefs.current[i]!.play().catch(err => console.error(`Delayed playback failed for ${i}:`, err));
          }
          timeoutRefs.current[i] = null;
        }, delay);
        timeoutRefs.current[i] = timeoutId;
      }
    });
  };

  const stopAll = () => {
    // Clear all pending timeouts
    timeoutRefs.current.forEach((id, i) => {
      if (id) window.clearTimeout(id);
      timeoutRefs.current[i] = null;
    });

    // Pause all audio
    audioRefs.current.forEach(audio => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    
    setActive(new Array(SAMPLES.length).fill(false));
  };

  return (
    <div className="space-y-16">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {SAMPLES.map((_, i) => (
          <button
            key={i}
            onClick={() => toggleFragment(i)}
            className={`relative h-44 border rounded-sm flex flex-col items-center justify-center transition-all duration-500
              ${active[i] 
                ? 'bg-zinc-900 border-zinc-800 text-white shadow-2xl scale-[1.02] z-10' 
                : 'bg-white border-zinc-100 text-zinc-300 hover:border-zinc-300 hover:text-zinc-600'}`}
          >
            <span className="text-[9px] uppercase tracking-[0.4em] mb-3 font-light opacity-40">
              {active[i] ? 'Streaming' : 'Standby'}
            </span>
            <span className={`serif italic text-4xl transition-colors duration-700 ${active[i] ? 'text-white' : 'text-zinc-800'}`}>
              0{i + 1}
            </span>
            
            {active[i] && (
              <div className="absolute bottom-8 flex gap-1">
                <div className="w-1 h-1 bg-amber-400 rounded-full animate-ping" />
                <div className="w-1 h-1 bg-amber-400 rounded-full animate-pulse delay-75" />
                <div className="w-1 h-1 bg-amber-400 rounded-full animate-ping delay-150" />
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-10">
        <div className="flex flex-wrap justify-center gap-6">
          <button 
            onClick={playAll}
            className="px-10 py-4 bg-zinc-900 text-white text-[10px] uppercase tracking-[0.4em] hover:bg-black transition-all shadow-lg rounded-sm"
          >
            Engage All
          </button>
          <button 
            onClick={stopAll}
            className="px-10 py-4 bg-white border border-zinc-200 text-zinc-500 text-[10px] uppercase tracking-[0.4em] hover:text-zinc-900 hover:border-zinc-900 transition-all rounded-sm"
          >
            Silence All
          </button>
        </div>
      </div>
    </div>
  );
};