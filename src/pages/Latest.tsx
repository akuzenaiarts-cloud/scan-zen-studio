import { Clock } from 'lucide-react';
import MangaCard from '@/components/MangaCard';
import { mockManga } from '@/data/mockManga';

export default function Latest() {
  const sorted = [...mockManga].sort((a, b) => b.chapters.length - a.chapters.length);

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center gap-2">
        <Clock className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Latest Updates</h1>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {sorted.map(m => (
          <MangaCard key={m.id} manga={m} showChapters />
        ))}
      </div>
    </div>
  );
}
