import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Home, List, ZoomIn, ZoomOut, RotateCcw,
  BookOpen, Share2, Flag, MessageSquare, Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getMangaBySlug } from '@/data/mockManga';
import CommentSection from '@/components/CommentSection';
import ChapterListModal from '@/components/ChapterListModal';

export default function ChapterReader() {
  const { slug, chapterId } = useParams<{ slug: string; chapterId: string }>();
  const navigate = useNavigate();
  const manga = getMangaBySlug(slug || '');
  const chapterNum = parseInt(chapterId || '1');
  const [zoom, setZoom] = useState(100);
  const [showChapterList, setShowChapterList] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({
    like: 0, funny: 0, love: 0, surprised: 0, angry: 0, sad: 0,
  });

  if (!manga) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Chapter Not Found</h1>
          <p className="text-muted-foreground mb-6">The chapter you're looking for doesn't exist.</p>
          <Button asChild><Link to="/">Return Home</Link></Button>
        </div>
      </div>
    );
  }

  const maxChapter = manga.chapters.length > 0 ? Math.max(...manga.chapters.map(c => c.number)) : 0;
  const hasPrev = chapterNum > 1;
  const hasNext = chapterNum < maxChapter;

  const adjustZoom = (delta: number) => {
    setZoom(prev => Math.max(50, Math.min(200, prev + delta)));
  };

  const pages = Array.from({ length: 8 }, (_, i) => i);

  const reactions = [
    { key: 'like', emoji: '👍', label: 'Like' },
    { key: 'funny', emoji: '🤣', label: 'Funny' },
    { key: 'love', emoji: '😍', label: 'Love' },
    { key: 'surprised', emoji: '😮', label: 'Surprised' },
    { key: 'angry', emoji: '😠', label: 'Angry' },
    { key: 'sad', emoji: '😢', label: 'Sad' },
  ];

  const handleReaction = (key: string) => {
    if (selectedReaction === key) {
      setSelectedReaction(null);
      setReactionCounts(prev => ({ ...prev, [key]: prev[key] - 1 }));
    } else {
      if (selectedReaction) {
        setReactionCounts(prev => ({ ...prev, [selectedReaction]: prev[selectedReaction] - 1 }));
      }
      setSelectedReaction(key);
      setReactionCounts(prev => ({ ...prev, [key]: prev[key] + 1 }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="w-full px-2 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Left - Navigation */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button variant="ghost" size="sm" asChild className="text-xs sm:text-sm px-2 sm:px-3">
                <Link to="/">
                  <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Home</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChapterList(true)}
                className="text-xs sm:text-sm px-2 sm:px-3"
              >
                <List className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Chapters</span>
              </Button>
            </div>

            {/* Center - Title */}
            <div className="text-center flex-1 px-2 max-w-xs sm:max-w-md">
              <h1 className="font-semibold text-foreground text-xs sm:text-base truncate">{manga.title}</h1>
              <p className="text-xs text-muted-foreground truncate">
                Ch {chapterNum}
              </p>
            </div>

            {/* Right - Zoom Controls (desktop) */}
            <div className="hidden sm:flex items-center space-x-1">
              <Button variant="ghost" size="sm" onClick={() => adjustZoom(-10)} className="p-1 sm:p-2">
                <ZoomOut className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <span className="text-xs text-muted-foreground min-w-[3rem] text-center">{zoom}%</span>
              <Button variant="ghost" size="sm" onClick={() => adjustZoom(10)} className="p-1 sm:p-2">
                <ZoomIn className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setZoom(100)} className="p-1 sm:p-2">
                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="lg:flex">
        {/* Main Reader Area */}
        <div className="flex-1 min-w-0">
          <div className="w-full px-2 sm:px-4 py-4 sm:py-8">
            {/* Pages */}
            <div className="space-y-2 sm:space-y-4 mb-6 sm:mb-8">
              {pages.map(i => (
                <div key={i} className="flex justify-center">
                  <div
                    className="bg-secondary flex items-center justify-center rounded-lg shadow-lg"
                    style={{ width: `${Math.min(zoom, 100)}%`, aspectRatio: '2/3', maxWidth: '100%' }}
                  >
                    <div className="text-center text-muted-foreground">
                      <p className="text-lg font-medium">Page {i + 1}</p>
                      <p className="text-xs">Chapter {chapterNum}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chapter Navigation Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between bg-card rounded-lg p-3 sm:p-4 border border-border shadow-sm gap-3 sm:gap-0">
              <Button
                variant="outline"
                disabled={!hasPrev}
                onClick={() => navigate(`/manga/${slug}/chapter/${chapterNum - 1}`)}
                className="w-full sm:w-auto text-xs sm:text-sm"
              >
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Previous
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowChapterList(true)}
                className="w-full sm:w-auto text-xs sm:text-sm"
              >
                <List className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Chapters
              </Button>

              {hasNext ? (
                <Button
                  onClick={() => navigate(`/manga/${slug}/chapter/${chapterNum + 1}`)}
                  className="w-full sm:w-auto text-xs sm:text-sm"
                >
                  Next
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                </Button>
              ) : (
                <Button variant="outline" asChild className="w-full sm:w-auto text-xs sm:text-sm">
                  <Link to={`/manga/${manga.slug}`}>
                    <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Manga Info
                  </Link>
                </Button>
              )}
            </div>

            {/* After-reader section */}
            <div className="max-w-5xl mx-auto mt-8 space-y-6">
              {/* Next Chapter / Series card */}
              <div className="text-center space-y-3 pt-4">
                <h3 className="text-lg font-bold">{hasNext ? 'Next Chapter' : 'Series'}</h3>
                {hasNext ? (
                  <button
                    onClick={() => navigate(`/manga/${slug}/chapter/${chapterNum + 1}`)}
                    className="inline-flex items-center gap-3 p-3 pr-6 rounded-xl bg-secondary/60 border border-border/30 hover:bg-secondary transition-colors mx-auto"
                  >
                    <img src={manga.cover} alt="" className="w-16 h-[80px] object-cover rounded-lg" />
                    <div className="text-left">
                      <p className="text-sm font-semibold">Chapter {chapterNum + 1}</p>
                      <p className="text-xs text-muted-foreground">
                        {manga.chapters.find(c => c.number === chapterNum + 1)?.date || ''}
                      </p>
                    </div>
                  </button>
                ) : (
                  <Link
                    to={`/manga/${manga.slug}`}
                    className="inline-flex items-center gap-3 p-3 pr-6 rounded-xl bg-secondary/60 border border-border/30 hover:bg-secondary transition-colors mx-auto"
                  >
                    <img src={manga.cover} alt="" className="w-16 h-[80px] object-cover rounded-lg" />
                    <div className="text-left">
                      <p className="text-sm font-semibold">{manga.title}</p>
                      <p className="text-xs text-muted-foreground">View Series Page</p>
                    </div>
                  </Link>
                )}
                <div>
                  <Button variant="outline" size="sm" className="rounded-full gap-1.5 mt-2">
                    <Settings className="w-3.5 h-3.5" /> Options
                  </Button>
                </div>
              </div>

              {/* Share */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/40 border-l-2 border-primary">
                <div>
                  <p className="text-sm font-semibold">Share MangaRead</p>
                  <p className="text-xs text-muted-foreground">to your friends</p>
                </div>
                <Button variant="default" size="icon" className="rounded-full h-9 w-9">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Report & Discord */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/40 border-l-2 border-destructive">
                  <div>
                    <p className="text-sm font-semibold">Facing an Issue?</p>
                    <p className="text-xs text-muted-foreground">Let us know, and we'll help ASAP</p>
                  </div>
                  <Button variant="destructive" size="sm" className="rounded-full gap-1.5 shrink-0">
                    <Flag className="w-3.5 h-3.5" /> Report
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/40 border-l-2 border-[hsl(235,86%,65%)]">
                  <div>
                    <p className="text-sm font-semibold">Join Our Socials</p>
                    <p className="text-xs text-muted-foreground">to explore more</p>
                  </div>
                  <Button size="sm" className="rounded-full gap-1.5 shrink-0 bg-[hsl(235,86%,65%)] hover:bg-[hsl(235,86%,55%)]">
                    <MessageSquare className="w-3.5 h-3.5" /> Discord
                  </Button>
                </div>
              </div>

              {/* Reactions */}
              <div className="text-center space-y-4 py-4">
                <div>
                  <h3 className="text-lg font-bold">What do you think?</h3>
                  <p className="text-sm text-muted-foreground">
                    {Object.values(reactionCounts).reduce((a, b) => a + b, 0)} Reactions
                  </p>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 max-w-lg sm:max-w-2xl mx-auto">
                  {reactions.map(r => (
                    <button
                      key={r.key}
                      onClick={() => handleReaction(r.key)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl w-full transition-colors ${
                        selectedReaction === r.key
                          ? 'bg-primary/20 border border-primary/50'
                          : 'bg-secondary/50 hover:bg-secondary/80'
                      }`}
                    >
                      <span className="text-2xl">{r.emoji}</span>
                      <span className="text-xs font-medium">{reactionCounts[r.key]}</span>
                      <span className="text-[10px] text-muted-foreground">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Sidebar - Desktop */}
        <div className="hidden lg:block w-80 border-l border-border bg-secondary/30 shrink-0">
          <div className="p-6 sticky top-16">
            <CommentSection comments={manga.comments} title="Chapter Comments" />
          </div>
        </div>
      </div>

      {/* Mobile Comments */}
      <div className="lg:hidden px-2 sm:px-4 pb-8">
        <CommentSection comments={manga.comments} title="Chapter Comments" />
      </div>

      {/* Chapter List Modal */}
      {showChapterList && (
        <ChapterListModal
          isOpen={showChapterList}
          onClose={() => setShowChapterList(false)}
          chapters={manga.chapters}
          mangaSlug={manga.slug}
          mangaCover={manga.cover}
          currentChapterNumber={chapterNum}
        />
      )}
    </div>
  );
}
