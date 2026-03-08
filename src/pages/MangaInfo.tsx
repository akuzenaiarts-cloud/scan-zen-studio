import { useParams, Link } from 'react-router-dom';
import { Star, Eye, Bookmark, Clock, User, Palette, Calendar, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getMangaBySlug, formatViews } from '@/data/mockManga';
import TypeBadge from '@/components/TypeBadge';
import CommentSection from '@/components/CommentSection';

export default function MangaInfo() {
  const { slug } = useParams<{ slug: string }>();
  const manga = getMangaBySlug(slug || '');

  if (!manga) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold">Manga not found</h1>
        <Link to="/" className="text-primary hover:underline mt-2 inline-block">Go Home</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Banner */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src={manga.banner || manga.cover} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
      </div>

      <div className="container -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Cover */}
          <div className="shrink-0">
            <img
              src={manga.cover}
              alt={manga.title}
              className="w-48 h-72 object-cover rounded-xl shadow-2xl border-2 border-border mx-auto md:mx-0"
            />
          </div>

          {/* Info */}
          <div className="flex-1 space-y-3 pt-4 md:pt-16">
            <div className="flex items-center gap-2 flex-wrap">
              <TypeBadge type={manga.type} />
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${manga.status === 'Ongoing' ? 'bg-manga-manhua/20 text-manga-manhua border-manga-manhua/30' : 'bg-muted text-muted-foreground border-border'}`}>
                {manga.status}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold">{manga.title}</h1>

            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> {manga.rating}</span>
              <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {formatViews(manga.views)}</span>
              <span className="flex items-center gap-1"><Bookmark className="w-4 h-4" /> {formatViews(manga.bookmarks)}</span>
            </div>

            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">{manga.description}</p>

            <div className="flex flex-wrap gap-2">
              {manga.genres.map(g => (
                <span key={g} className="px-2.5 py-1 rounded-md bg-secondary text-xs">{g}</span>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm pt-2">
              <div className="flex items-center gap-2 text-muted-foreground"><User className="w-4 h-4 text-primary" /> <span>{manga.author}</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><Palette className="w-4 h-4 text-primary" /> <span>{manga.artist}</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-4 h-4 text-primary" /> <span>{manga.released}</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><Clock className="w-4 h-4 text-primary" /> <span>{manga.chapters.length} chapters</span></div>
            </div>

            <div className="flex gap-3 pt-2">
              {manga.chapters.length > 0 && (
                <>
                  <Link to={`/manga/${manga.slug}/chapter/1`}>
                    <Button className="gap-2">
                      <BookOpen className="w-4 h-4" />
                      Read First
                    </Button>
                  </Link>
                  <Link to={`/manga/${manga.slug}/chapter/${manga.chapters[0].number}`}>
                    <Button variant="secondary" className="gap-2">
                      Latest Ch. {manga.chapters[0].number}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Chapter List */}
        <div className="mt-10 space-y-4">
          <h2 className="text-xl font-bold">Chapters</h2>
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              {manga.chapters.map(ch => (
                <Link
                  key={ch.id}
                  to={`/manga/${manga.slug}/chapter/${ch.number}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors border-b border-border last:border-0"
                >
                  <span className="text-sm font-medium">Chapter {ch.number}</span>
                  <span className="text-xs text-muted-foreground">{ch.date}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="mt-10 pb-10">
          <CommentSection comments={manga.comments} />
        </div>
      </div>
    </div>
  );
}
