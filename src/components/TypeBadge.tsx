import { MangaType } from '@/data/mockManga';
import { cn } from '@/lib/utils';

const typeStyles: Record<MangaType, string> = {
  Manhwa: 'bg-manga-manhwa/20 text-manga-manhwa border-manga-manhwa/30',
  Manga: 'bg-manga-manga/20 text-manga-manga border-manga-manga/30',
  Manhua: 'bg-manga-manhua/20 text-manga-manhua border-manga-manhua/30',
};

export default function TypeBadge({ type, className }: { type: MangaType; className?: string }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border', typeStyles[type], className)}>
      {type}
    </span>
  );
}
