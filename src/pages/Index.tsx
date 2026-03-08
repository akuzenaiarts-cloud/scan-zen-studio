import { Link } from 'react-router-dom';
import { TrendingUp, Pin, Clock, ArrowRight } from 'lucide-react';
import HeroCarousel from '@/components/HeroCarousel';
import MangaCard from '@/components/MangaCard';
import { getTrendingManga, getPinnedManga, mockManga } from '@/data/mockManga';

export default function Index() {
  const trending = getTrendingManga();
  const pinned = getPinnedManga();
  const latest = mockManga.slice().sort((a, b) => b.chapters.length - a.chapters.length);

  return (
    <div className="container py-6 space-y-10">
      <HeroCarousel />

      {/* Trending */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Trending Now</h2>
          </div>
          <Link to="/series" className="flex items-center gap-1 text-sm text-primary hover:underline">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {trending.map((m, i) => (
            <MangaCard key={m.id} manga={m} rank={i + 1} />
          ))}
        </div>
      </section>

      {/* Pinned Series */}
      {pinned.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Pin className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Pinned Series</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {pinned.map(m => (
              <MangaCard key={m.id} manga={m} />
            ))}
          </div>
        </section>
      )}

      {/* Latest Updates */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Latest Updates</h2>
          </div>
          <Link to="/latest" className="flex items-center gap-1 text-sm text-primary hover:underline">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {latest.slice(0, 6).map(m => (
            <MangaCard key={m.id} manga={m} showChapters />
          ))}
        </div>
      </section>
    </div>
  );
}
