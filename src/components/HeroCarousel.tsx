import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { mockManga, MangaStatus } from '@/data/mockManga';
import TypeBadge from './TypeBadge';

const statusColors: Record<MangaStatus, string> = {
  Ongoing: 'bg-green-400',
  Hiatus: 'bg-yellow-600',
  'Season End': 'bg-sky-400',
  Completed: 'bg-green-700',
  Cancelled: 'bg-red-400',
};

const statusTextColors: Record<MangaStatus, string> = {
  Ongoing: 'text-green-400',
  Hiatus: 'text-yellow-600',
  'Season End': 'text-sky-400',
  Completed: 'text-green-700',
  Cancelled: 'text-red-400',
};

export default function HeroCarousel() {
  const items = mockManga.filter(m => m.featured || m.pinned || m.trending).slice(0, 8);
  const [current, setCurrent] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const pauseRef = useRef(false);

  const maxIndex = Math.max(0, items.length - 3);

  const next = useCallback(() => setCurrent(i => Math.min(i + 1, maxIndex)), [maxIndex]);
  const prev = useCallback(() => setCurrent(i => Math.max(i - 1, 0)), []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!pauseRef.current) {
        setCurrent(i => (i >= maxIndex ? 0 : i + 1));
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [maxIndex]);

  if (!items.length) return null;

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => (pauseRef.current = true)}
      onMouseLeave={() => (pauseRef.current = false)}
    >
      {/* Track */}
      <div
        ref={trackRef}
        className="flex gap-4 transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${current * (100 / 3 + 1.33)}%)` }}
      >
        {items.map(manga => (
          <Link
            key={manga.id}
            to={`/manga/${manga.slug}`}
            className="relative shrink-0 w-[85vw] sm:w-[45vw] lg:w-[calc(33.333%-11px)] rounded-xl overflow-hidden group"
          >
            {/* Cover */}
            <div className="relative h-[400px] md:h-[450px]">
              <img
                src={manga.cover}
                alt={manga.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Type Badge - Top Left */}
              <div className="absolute top-3 left-3 z-10">
                <TypeBadge type={manga.type} />
              </div>

              {/* Bottom Gradient Overlay */}
              <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

              {/* Bottom Content */}
              <div className="absolute inset-x-0 bottom-0 p-4 space-y-1.5">
                {manga.altTitles?.[0] && (
                  <p className="text-[11px] text-white/50 truncate">{manga.altTitles[0]}</p>
                )}
                <h3 className="text-lg font-bold text-white line-clamp-1">{manga.title}</h3>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full animate-[blink_1.5s_ease-in-out_infinite] ${statusColors[manga.status]}`} />
                  <span className={`text-xs font-semibold ${statusTextColors[manga.status]}`}>
                    {manga.status}
                  </span>
                </div>
                <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">{manga.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Navigation Arrows */}
      {current > 0 && (
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/60 hover:bg-card backdrop-blur-sm flex items-center justify-center transition-colors z-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      {current < maxIndex && (
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/60 hover:bg-card backdrop-blur-sm flex items-center justify-center transition-colors z-10"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
