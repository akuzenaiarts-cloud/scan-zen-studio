import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, List, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getMangaBySlug } from '@/data/mockManga';
import CommentSection from '@/components/CommentSection';

export default function ChapterReader() {
  const { slug, chapterId } = useParams<{ slug: string; chapterId: string }>();
  const navigate = useNavigate();
  const manga = getMangaBySlug(slug || '');
  const chapterNum = parseInt(chapterId || '1');

  if (!manga) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold">Manga not found</h1>
        <Link to="/" className="text-primary hover:underline mt-2 inline-block">Go Home</Link>
      </div>
    );
  }

  const maxChapter = manga.chapters.length > 0 ? Math.max(...manga.chapters.map(c => c.number)) : 0;
  const hasPrev = chapterNum > 1;
  const hasNext = chapterNum < maxChapter;

  const navBar = (
    <div className="sticky top-16 z-40 glass border-b border-border/50">
      <div className="container flex items-center justify-between py-2 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Link to={`/manga/${manga.slug}`}>
            <Button variant="ghost" size="icon" className="shrink-0"><Home className="w-4 h-4" /></Button>
          </Link>
          <div className="hidden sm:block text-sm font-medium truncate">{manga.title}</div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" disabled={!hasPrev}
            onClick={() => navigate(`/manga/${slug}/chapter/${chapterNum - 1}`)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Select value={String(chapterNum)} onValueChange={v => navigate(`/manga/${slug}/chapter/${v}`)}>
            <SelectTrigger className="w-36 bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {manga.chapters.map(ch => (
                <SelectItem key={ch.id} value={String(ch.number)}>Chapter {ch.number}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" disabled={!hasNext}
            onClick={() => navigate(`/manga/${slug}/chapter/${chapterNum + 1}`)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <Link to={`/manga/${manga.slug}`} className="hidden sm:block">
          <Button variant="ghost" size="sm" className="gap-1"><List className="w-4 h-4" /> Chapters</Button>
        </Link>
      </div>
    </div>
  );

  // Placeholder reader pages
  const pages = Array.from({ length: 6 }, (_, i) => i);

  return (
    <div>
      {navBar}

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-1">
        {pages.map(i => (
          <div key={i} className="w-full aspect-[2/3] bg-secondary rounded-lg flex items-center justify-center border border-border/30">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium">Chapter {chapterNum} — Page {i + 1}</p>
              <p className="text-sm">Manga page placeholder</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom nav */}
      <div className="container max-w-3xl py-6 flex justify-between">
        <Button variant="outline" disabled={!hasPrev}
          onClick={() => navigate(`/manga/${slug}/chapter/${chapterNum - 1}`)}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Prev
        </Button>
        <Button variant="outline" disabled={!hasNext}
          onClick={() => navigate(`/manga/${slug}/chapter/${chapterNum + 1}`)}>
          Next <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Comments */}
      <div className="container max-w-3xl pb-10">
        <CommentSection comments={manga.comments} title="Chapter Comments" />
      </div>
    </div>
  );
}
