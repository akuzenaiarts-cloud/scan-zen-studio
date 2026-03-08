import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Award, ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { getFeaturedManga, MangaStatus } from '@/data/mockManga';
import TypeBadge from './TypeBadge';

const statusPillColors: Record<MangaStatus, string> = {
  Ongoing: 'bg-green-500/90 text-white',
  Hiatus: 'bg-yellow-600/90 text-white',
  'Season End': 'bg-sky-500/90 text-white',
  Completed: 'bg-green-700/90 text-white',
  Cancelled: 'bg-red-500/90 text-white',
};

export default function EditorChoice() {
  const featured = getFeaturedManga();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    slidesToScroll: 1,
    dragFree: false,
  });

  const [paused, setPaused] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const t = setInterval(() => {
      if (!paused) emblaApi.scrollNext();
    }, 7000);
    return () => clearInterval(t);
  }, [emblaApi, paused]);

  if (!featured.length) return null;

  return (
    <section>
      <div className="container flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">Editor's Choice</h2>
      </div>

      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {featured.map(manga => (
              <div
                key={manga.id}
                className="flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_33.333%] min-w-0 px-2"
              >
                <Link
                  to={`/manga/${manga.slug}`}
                  className="relative block rounded-xl overflow-hidden group"
                >
                  <div className="relative h-[450px] md:h-[500px]">
                    <img
                      src={manga.cover}
                      alt={manga.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    <div className="absolute top-3 left-3 z-10">
                      <TypeBadge type={manga.type} />
                    </div>

                    <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                    <div className="absolute inset-x-0 bottom-0 p-4 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusPillColors[manga.status]}`}>
                          {manga.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white line-clamp-1">{manga.title}</h3>
                      <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">{manga.description}</p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Edge fading */}
        <div className="absolute inset-y-0 left-0 w-16 sm:w-20 lg:w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 sm:w-20 lg:w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        {/* Arrows */}
        <button
          onClick={scrollPrev}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/60 hover:bg-card backdrop-blur-sm flex items-center justify-center transition-colors z-20"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={scrollNext}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/60 hover:bg-card backdrop-blur-sm flex items-center justify-center transition-colors z-20"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}
