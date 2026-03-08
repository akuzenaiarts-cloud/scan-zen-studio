import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, BookOpen, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFeaturedManga, formatViews } from '@/data/mockManga';
import TypeBadge from './TypeBadge';

export default function HeroCarousel() {
  const featured = getFeaturedManga();
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent(i => (i + 1) % featured.length), [featured.length]);
  const prev = useCallback(() => setCurrent(i => (i - 1 + featured.length) % featured.length), [featured.length]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  if (!featured.length) return null;
  const manga = featured[current];

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-xl">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={manga.banner || manga.cover} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
      </div>

      {/* Content */}
      <div className="relative h-full container flex items-center">
        <div className="flex items-end gap-8 max-w-3xl">
          <Link to={`/manga/${manga.slug}`} className="hidden md:block shrink-0">
            <img
              src={manga.cover}
              alt={manga.title}
              className="w-44 h-64 object-cover rounded-lg shadow-2xl border border-border/30 hover:scale-105 transition-transform"
            />
          </Link>
          <div className="flex-1 space-y-3">
            <TypeBadge type={manga.type} />
            <Link to={`/manga/${manga.slug}`}>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground hover:text-primary transition-colors">{manga.title}</h2>
            </Link>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> {manga.rating}</span>
              <span>{formatViews(manga.views)} views</span>
              <span>{manga.status}</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3 max-w-lg">{manga.description}</p>
            <div className="flex gap-2 flex-wrap">
              {manga.genres.map(g => (
                <span key={g} className="px-2.5 py-1 rounded-md bg-secondary text-xs text-secondary-foreground">{g}</span>
              ))}
            </div>
            <Link to={`/manga/${manga.slug}`}>
              <Button className="gap-2 mt-2">
                <BookOpen className="w-4 h-4" />
                Read Now
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/60 hover:bg-card flex items-center justify-center transition-colors">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/60 hover:bg-card flex items-center justify-center transition-colors">
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {featured.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-primary w-6' : 'bg-muted-foreground/30'}`}
          />
        ))}
      </div>
    </div>
  );
}
