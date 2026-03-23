import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Home, Lock, Coins, ShoppingCart,
  Ticket, Timer, AlertCircle, BookOpen, Globe, Search, Bookmark, BookmarkCheck,
  Info, AlertTriangle, SlidersHorizontal, ChevronUp, X, RefreshCw,
  Rows3, FileText, ArrowUpDown, ArrowLeftRight, Minus, Settings,
  Columns2, MonitorSmartphone, MoveHorizontal, MoveVertical, Maximize,
  Facebook, MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMangaBySlug, useMangaChapters } from '@/hooks/useMangaBySlug';
import { useMangaBookmark } from '@/hooks/useBookmarks';
import CommentSection from '@/components/CommentSection';
import { useToast } from '@/hooks/use-toast';
import { useRecordReading } from '@/hooks/useReadingHistory';
import { useAuth } from '@/contexts/AuthContext';
import { useChapterUnlock, useUserCoinBalance, useUserTokenBalance } from '@/hooks/useChapterUnlock';
import { usePremiumSettings } from '@/hooks/usePremiumSettings';
import { toast as sonnerToast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useTrackView } from '@/hooks/useTrackView';
import { optimizedImageUrl } from '@/lib/utils';

/* ─── Default reader settings ─── */
interface ReaderSettings {
  stickyHeader: boolean;
  displayStyle: 'strip' | 'single' | 'double';
  fitMode: 'width' | 'height' | 'none';
  direction: 'ltr' | 'rtl';
  progressBar: 'bottom' | 'left' | 'none';
  stripMargin: number;
  showTips: boolean;
  containWidth: boolean;
  containHeight: boolean;
  stretchSmall: boolean;
  limitMaxWidth: boolean;
  limitMaxHeight: boolean;
  greyscale: boolean;
  dimPages: boolean;
}

const DEFAULT_SETTINGS: ReaderSettings = {
  stickyHeader: true,
  displayStyle: 'strip',
  fitMode: 'width',
  direction: 'ltr',
  progressBar: 'bottom',
  stripMargin: 5,
  showTips: true,
  containWidth: true,
  containHeight: false,
  stretchSmall: false,
  limitMaxWidth: false,
  limitMaxHeight: false,
  greyscale: false,
  dimPages: false,
};

function loadSettings(): ReaderSettings {
  try {
    const raw = localStorage.getItem('reader-settings');
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_SETTINGS };
}

function saveSettings(s: ReaderSettings) {
  localStorage.setItem('reader-settings', JSON.stringify(s));
}

/* ─── CountdownTimer ─── */
function CountdownTimer({ targetDate, onExpired }: { targetDate: string; onExpired?: () => void }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [expired, setExpired] = useState(false);
  useEffect(() => {
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Available now!'); if (!expired) { setExpired(true); onExpired?.(); } return; }
      const d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000),
        m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(d > 0
        ? `${d}d ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
        : `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [targetDate]);
  return <span>{timeLeft}</span>;
}

/* ─── 2×2 Grid Icon ─── */
const GridIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
    <rect x="1" y="1" width="6" height="6" rx="1" />
    <rect x="9" y="1" width="6" height="6" rx="1" />
    <rect x="1" y="9" width="6" height="6" rx="1" />
    <rect x="9" y="9" width="6" height="6" rx="1" />
  </svg>
);

export default function ChapterReader() {
  const { slug, chapterId } = useParams<{ slug: string; chapterId: string }>();
  const navigate = useNavigate();
  const { data: manga, isLoading } = useMangaBySlug(slug || '');
  const { data: chapters = [] } = useMangaChapters(manga?.id);
  const chapterNum = parseInt(chapterId || '1');
  const { toast } = useToast();
  const recordReading = useRecordReading();
  const { user } = useAuth();
  useTrackView(manga?.id);
  const { settings: premiumSettings } = usePremiumSettings();
  const currencyName = premiumSettings.coin_system.currency_name;
  const currencyIconUrl = premiumSettings.coin_system.currency_icon_url;
  const coinBalance = useUserCoinBalance();
  const tokenBalance = useUserTokenBalance();
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const currentChapter = chapters.find(c => c.number === chapterNum);
  const { isUnlocked, unlock, unlockWithToken } = useChapterUnlock(currentChapter?.id);
  const { isBookmarked, toggleBookmark } = useMangaBookmark(manga?.id);

  // Chapter unlock statuses for the chapter list
  const chapterIds = useMemo(() => chapters.filter(c => c.premium).map(c => c.id), [chapters]);
  const { data: chapterUnlocks = [] } = useQuery({
    queryKey: ['chapter-unlocks-list', user?.id, manga?.id],
    queryFn: async () => {
      if (!user || chapterIds.length === 0) return [];
      const { data } = await supabase
        .from('chapter_unlocks')
        .select('chapter_id, unlock_type, expires_at')
        .eq('user_id', user.id)
        .in('chapter_id', chapterIds);
      return (data || []) as { chapter_id: string; unlock_type: string | null; expires_at: string | null }[];
    },
    enabled: !!user && chapterIds.length > 0,
  });

  const { data: securePages = [] } = useQuery({
    queryKey: ['chapter-pages', currentChapter?.id, isUnlocked],
    queryFn: async () => {
      if (!currentChapter?.id) return [];
      const { data, error } = await supabase.rpc('get_chapter_pages', { p_chapter_id: currentChapter.id });
      if (error) return [];
      return (data as string[]) || [];
    },
    enabled: !!currentChapter?.id,
  });

  // Settings
  const [settings, setSettings] = useState<ReaderSettings>(loadSettings);
  const updateSetting = <K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]) => {
    setSettings(prev => { const next = { ...prev, [key]: value }; saveSettings(next); return next; });
  };

  // UI state
  const [menuOpen, setMenuOpen] = useState(false);
  const [subPanel, setSubPanel] = useState<'none' | 'chapters' | 'pages'>('none');
  const [chapterSearch, setChapterSearch] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedTab, setAdvancedTab] = useState<'layout' | 'image' | 'shortcuts'>('layout');
  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({
    like: 0, funny: 0, love: 0, surprised: 0, angry: 0, sad: 0,
  });

  useEffect(() => { supabase.rpc('handle_auto_free_chapters').then(() => {}); }, []);
  useEffect(() => { window.scrollTo(0, 0); setCurrentPage(0); }, [chapterNum]);

  useEffect(() => {
    if (manga && user) {
      const ch = chapters.find(c => c.number === chapterNum);
      if (ch) recordReading.mutate({ mangaId: manga.id, chapterId: ch.id, chapterNumber: chapterNum });
    }
  }, [manga?.id, chapterNum, user?.id, chapters]);

  // Scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isPremiumChapter = !!currentChapter?.premium;
  const coinPrice = currentChapter?.coin_price ?? 100;
  const maxChapter = chapters.length > 0 ? Math.max(...chapters.map(c => c.number)) : 0;
  const hasPrev = chapterNum > 1;
  const hasNext = chapterNum < maxChapter;
  const freeReleaseAt = currentChapter?.free_release_at;
  const pageUrls = securePages.filter(Boolean);
  const isLocked = isPremiumChapter && pageUrls.length === 0 && !isUnlocked;
  const totalPages = pageUrls.length;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      switch (e.key.toLowerCase()) {
        case 'h': updateSetting('stickyHeader', !settings.stickyHeader); break;
        case 'm': setMenuOpen(p => !p); break;
        case 'n': if (hasNext) navigate(`/manga/${slug}/chapter/${chapterNum + 1}`); break;
        case 'b': if (hasPrev) navigate(`/manga/${slug}/chapter/${chapterNum - 1}`); break;
        case 'escape': setMenuOpen(false); break;
        case 'arrowleft':
          if (settings.displayStyle !== 'strip') {
            settings.direction === 'ltr'
              ? setCurrentPage(p => Math.max(0, p - 1))
              : setCurrentPage(p => Math.min(totalPages - 1, p + 1));
          }
          break;
        case 'arrowright':
          if (settings.displayStyle !== 'strip') {
            settings.direction === 'ltr'
              ? setCurrentPage(p => Math.min(totalPages - 1, p + 1))
              : setCurrentPage(p => Math.max(0, p - 1));
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chapterNum, slug, hasNext, hasPrev, settings, totalPages]);

  const CurrencyIcon = ({ className }: { className?: string }) =>
    currencyIconUrl
      ? <img src={currencyIconUrl} alt={currencyName} className={`${className} object-contain`} />
      : <Coins className={className} />;

  const handleCoinUnlock = async () => {
    if (!user) { sonnerToast.error('Please sign in to unlock chapters'); return; }
    if (coinBalance < coinPrice) { sonnerToast.error(`Not enough ${currencyName}.`); return; }
    try {
      await unlock.mutateAsync({ chapterId: currentChapter!.id });
      sonnerToast.success(`Chapter unlocked! ${coinPrice} ${currencyName} deducted.`);
      window.location.reload();
    } catch (err: any) { sonnerToast.error(err.message || 'Failed to unlock chapter'); }
  };

  const handleTokenUnlock = async () => {
    if (!user) { sonnerToast.error('Please sign in to unlock chapters'); return; }
    if (tokenBalance < 1) { sonnerToast.error('Not enough tickets.'); return; }
    try {
      await unlockWithToken.mutateAsync({ chapterId: currentChapter!.id });
      sonnerToast.success('Chapter unlocked with ticket! (3-day access)');
      window.location.reload();
    } catch (err: any) { sonnerToast.error(err.message || 'Failed to unlock chapter'); }
  };

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(`${manga?.title} - Chapter ${chapterNum}`);
    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      discord: `https://discord.com/channels/@me`,
      reddit: `https://www.reddit.com/submit?url=${url}&title=${title}`,
    };
    window.open(urls[platform], '_blank', 'noopener,noreferrer');
  };

  const handleReport = () => {
    if (reportText.trim()) {
      toast({ title: 'Report submitted', description: 'Thanks for letting us know.' });
      setReportText('');
    }
    setReportOpen(false);
  };

  const handleReaction = (key: string) => {
    if (selectedReaction === key) {
      setSelectedReaction(null);
      setReactionCounts(prev => ({ ...prev, [key]: prev[key] - 1 }));
    } else {
      if (selectedReaction) setReactionCounts(prev => ({ ...prev, [selectedReaction]: prev[selectedReaction] - 1 }));
      setSelectedReaction(key);
      setReactionCounts(prev => ({ ...prev, [key]: prev[key] + 1 }));
    }
  };

  // Sorted chapters
  const sortedChapters = useMemo(() => [...chapters].sort((a, b) => b.number - a.number), [chapters]);
  const filteredChapters = useMemo(() => {
    if (!chapterSearch.trim()) return sortedChapters;
    return sortedChapters.filter(c => String(c.number).includes(chapterSearch.trim()));
  }, [sortedChapters, chapterSearch]);

  // Get unlock info for a chapter
  const getChapterUnlockInfo = (ch: { id: string; premium?: boolean | null; coin_price?: number | null }) => {
    if (!ch.premium) return null;
    const unlockRecord = chapterUnlocks.find(u => u.chapter_id === ch.id);
    if (!unlockRecord) return { status: 'locked' as const, coinPrice: ch.coin_price ?? 100 };
    if (unlockRecord.unlock_type === 'token' && unlockRecord.expires_at) {
      const remaining = new Date(unlockRecord.expires_at).getTime() - Date.now();
      if (remaining <= 0) return { status: 'locked' as const, coinPrice: ch.coin_price ?? 100 };
      return { status: 'ticket' as const, expiresAt: unlockRecord.expires_at };
    }
    return { status: 'unlocked' as const };
  };

  // Scroll to page in long strip
  const scrollToPage = (pageIdx: number) => {
    if (settings.displayStyle === 'strip') {
      pageRefs.current[pageIdx]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      setCurrentPage(pageIdx);
    }
  };

  // Image style
  const getImageStyle = () => {
    const style: React.CSSProperties = {};
    if (settings.fitMode === 'width') { style.width = '100%'; style.maxWidth = '900px'; }
    else if (settings.fitMode === 'height') { style.maxHeight = '100vh'; style.width = 'auto'; }
    else { style.width = `${zoom}%`; }
    if (settings.greyscale) style.filter = (style.filter || '') + ' grayscale(1)';
    if (settings.dimPages) style.filter = (style.filter || '') + ' brightness(0.7)';
    return style;
  };

  // Display style label cycling
  const cycleDisplayStyle = () => {
    const modes: ReaderSettings['displayStyle'][] = ['strip', 'single', 'double'];
    const idx = modes.indexOf(settings.displayStyle);
    updateSetting('displayStyle', modes[(idx + 1) % modes.length]);
  };

  const cycleFitMode = () => {
    const modes: ReaderSettings['fitMode'][] = ['height', 'width', 'none'];
    const idx = modes.indexOf(settings.fitMode);
    updateSetting('fitMode', modes[(idx + 1) % modes.length]);
  };

  const cycleDirection = () => updateSetting('direction', settings.direction === 'ltr' ? 'rtl' : 'ltr');

  const cycleProgress = () => {
    const modes: ReaderSettings['progressBar'][] = ['bottom', 'left', 'none'];
    const idx = modes.indexOf(settings.progressBar);
    updateSetting('progressBar', modes[(idx + 1) % modes.length]);
  };

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
  if (!manga) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold">Chapter Not Found</h1><p className="text-muted-foreground mb-6">The chapter you're looking for doesn't exist.</p><Button asChild><Link to="/">Return Home</Link></Button></div></div>;
  if (!currentChapter) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-center space-y-4"><h1 className="text-2xl font-bold">Chapter Not Available</h1><p className="text-muted-foreground">This chapter doesn't exist or hasn't been uploaded yet.</p><Button asChild><Link to={`/manga/${manga.slug}`}>Back to Manga</Link></Button></div></div>;

  const canAffordCoins = coinBalance >= coinPrice;
  const canAffordTickets = tokenBalance >= 1;
  const isUnlocking = unlock.isPending || unlockWithToken.isPending;

  const reactions = [
    { key: 'like', emoji: '👍', label: 'Like' }, { key: 'funny', emoji: '🤣', label: 'Funny' },
    { key: 'love', emoji: '😍', label: 'Love' }, { key: 'surprised', emoji: '😮', label: 'Surprised' },
    { key: 'angry', emoji: '😠', label: 'Angry' }, { key: 'sad', emoji: '😢', label: 'Sad' },
  ];

  const displayStyleLabel = settings.displayStyle === 'strip' ? 'Long Strip' : settings.displayStyle === 'single' ? 'Single Page' : 'Double Page';
  const displayStyleIcon = settings.displayStyle === 'strip' ? <Rows3 className="w-4 h-4" /> : settings.displayStyle === 'single' ? <FileText className="w-4 h-4" /> : <Columns2 className="w-4 h-4" />;
  const fitModeLabel = settings.fitMode === 'width' ? 'Fit Width' : settings.fitMode === 'height' ? 'Fit Height' : 'No Limit';
  const fitModeIcon = settings.fitMode === 'width' ? <MoveHorizontal className="w-4 h-4" /> : settings.fitMode === 'height' ? <MoveVertical className="w-4 h-4" /> : <Maximize className="w-4 h-4" />;
  const dirLabel = settings.direction === 'ltr' ? 'Left to Right' : 'Right to Left';
  const dirIcon = settings.direction === 'ltr' ? <ArrowLeftRight className="w-4 h-4" /> : <ArrowLeftRight className="w-4 h-4 scale-x-[-1]" />;
  const progressLabel = settings.progressBar === 'bottom' ? 'Bottom Progress' : settings.progressBar === 'left' ? 'Left Progress' : 'No Progress';
  const progressIcon = settings.progressBar === 'bottom' ? <ChevronUp className="w-4 h-4" /> : settings.progressBar === 'left' ? <ArrowLeftRight className="w-4 h-4 rotate-90" /> : <Minus className="w-4 h-4" />;

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Header ─── */}
      <header className={`${settings.stickyHeader ? 'sticky top-0' : ''} z-50 bg-background/95 backdrop-blur-sm border-b border-border`}>
        <div className="w-full px-2 sm:px-4 flex items-center justify-between h-14 md:h-16">
          {/* Left */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button onClick={() => navigate('/')} className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-secondary/80 flex items-center justify-center hover:bg-secondary transition-colors">
              <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <img
              src={optimizedImageUrl(manga.cover_url)}
              alt={manga.title}
              className="shrink-0 w-[36px] h-[46px] md:w-[40px] md:h-[52px] rounded-md object-cover"
            />
            <div className="min-w-0">
              <p className="text-sm md:text-base font-medium text-foreground truncate leading-tight">{manga.title}</p>
              <p className="text-xs md:text-sm text-muted-foreground truncate leading-tight">
                Chapter {chapterNum}{currentChapter.title ? ` — ${currentChapter.title}` : ''}
              </p>
            </div>
          </div>
          {/* Right: MENU button only */}
          <button
            onClick={() => { setMenuOpen(true); setSubPanel('none'); }}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <GridIcon className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-bold tracking-wide">MENU</span>
          </button>
        </div>
      </header>

      {/* ─── Floating MENU button when header is hidden ─── */}
      {!settings.stickyHeader && (
        <button
          onClick={() => { setMenuOpen(true); setSubPanel('none'); }}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      )}

      {/* ─── Progress bar ─── */}
      {settings.progressBar === 'bottom' && (
        <div className="fixed bottom-0 left-0 right-0 z-40 h-1">
          <div className="h-full bg-primary/80 transition-all duration-150" style={{ width: `${scrollProgress}%` }} />
        </div>
      )}
      {settings.progressBar === 'left' && (
        <div className="fixed top-0 left-0 bottom-0 z-40 w-1">
          <div className="w-full bg-primary/80 transition-all duration-150" style={{ height: `${scrollProgress}%` }} />
        </div>
      )}

      {/* ─── Reading area ─── */}
      <div className="flex-1 min-w-0">
        <div className="w-full px-2 sm:px-4 py-4 sm:py-8">
          <div className={`${settings.displayStyle === 'strip' ? 'space-y-0' : ''} mb-6 sm:mb-8`} style={settings.displayStyle === 'strip' ? { gap: `${settings.stripMargin}px`, display: 'flex', flexDirection: 'column', alignItems: 'center' } : undefined}>
            {isLocked ? (
              /* Lock screen - unchanged */
              <div className="max-w-2xl mx-auto">
                <div className="h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 rounded-t-xl" />
                <div className="bg-card border border-border border-t-0 rounded-b-xl p-6 sm:p-10 text-center space-y-6">
                  <div className="w-20 h-20 rounded-2xl bg-amber-500/15 flex items-center justify-center mx-auto">
                    <Lock className="w-10 h-10 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold">Chapter {chapterNum} is Locked</h2>
                    <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">This effort-filled chapter is currently premium.<br/>Support the team to read it now!</p>
                  </div>
                  {freeReleaseAt && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Free for everyone in</p>
                      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-muted/50 border border-border/50">
                        <Timer className="w-4 h-4 text-muted-foreground" />
                        <span className="text-lg font-mono font-bold text-foreground tracking-wider"><CountdownTimer targetDate={freeReleaseAt} onExpired={() => window.location.reload()} /></span>
                      </div>
                    </div>
                  )}
                  {user ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                      <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                        <div className="flex items-center gap-2 justify-center">
                          <CurrencyIcon className="w-6 h-6 text-amber-500" />
                          <div className="text-left"><p className="text-xl font-bold leading-none">{coinPrice}</p><p className="text-[10px] text-muted-foreground uppercase font-semibold">{currencyName}</p></div>
                        </div>
                        {canAffordCoins ? (
                          <Button onClick={handleCoinUnlock} disabled={isUnlocking} className="w-full rounded-xl gap-2 bg-amber-500 hover:bg-amber-600 text-white">{unlock.isPending ? 'Unlocking...' : `Buy now for ${coinPrice}`}</Button>
                        ) : (
                          <Button variant="outline" asChild className="w-full rounded-xl gap-2 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"><Link to="/coin-shop">Not Enough {currencyName}</Link></Button>
                        )}
                      </div>
                      <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                        <div className="flex items-center gap-2 justify-center">
                          <Ticket className="w-6 h-6 text-primary" />
                          <div className="text-left"><p className="text-xl font-bold leading-none">1</p><p className="text-[10px] text-muted-foreground uppercase font-semibold">Chapter Ticket</p></div>
                        </div>
                        {canAffordTickets ? (
                          <Button onClick={handleTokenUnlock} disabled={isUnlocking} variant="outline" className="w-full rounded-xl gap-2">{unlockWithToken.isPending ? 'Unlocking...' : 'Use 1 Ticket'}</Button>
                        ) : (
                          <Button variant="outline" asChild className="w-full rounded-xl gap-2"><Link to="/earn">Not Enough Tickets</Link></Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <Button onClick={() => navigate('/login')} className="rounded-xl gap-2 h-12 px-8"><Lock className="w-4 h-4" /> Please login to unlock</Button>
                  )}
                  {user && !canAffordCoins && !canAffordTickets && (
                    <div className="flex items-center justify-center gap-2 text-sm text-destructive"><AlertCircle className="w-4 h-4" /><span>Insufficient balance to unlock</span></div>
                  )}
                  {user && (
                    <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                      <Button asChild className="flex-1 rounded-xl gap-2 h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"><Link to="/coin-shop"><ShoppingCart className="w-4 h-4" /> Buy {currencyName}</Link></Button>
                      <Button variant="outline" asChild className="flex-1 rounded-xl gap-2 h-12"><Link to="/earn"><Ticket className="w-4 h-4" /> Earn Tickets</Link></Button>
                    </div>
                  )}
                  <Link to={`/manga/${manga.slug}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block">Back to Chapter List</Link>
                </div>
              </div>
            ) : settings.displayStyle !== 'strip' && pageUrls.length > 0 ? (
              /* Page mode */
              <div className="flex flex-col items-center gap-4">
                <div className="flex justify-center w-full">
                  {settings.displayStyle === 'double' && currentPage + 1 < totalPages ? (
                    <div className={`flex ${settings.direction === 'rtl' ? 'flex-row-reverse' : 'flex-row'} gap-1`}>
                      <img src={pageUrls[currentPage]} alt={`Page ${currentPage + 1}`} className="shadow-lg" style={{ ...getImageStyle(), maxWidth: '450px' }} />
                      <img src={pageUrls[currentPage + 1]} alt={`Page ${currentPage + 2}`} className="shadow-lg" style={{ ...getImageStyle(), maxWidth: '450px' }} />
                    </div>
                  ) : (
                    <img src={pageUrls[currentPage]} alt={`Page ${currentPage + 1}`} className="shadow-lg" style={getImageStyle()} />
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - (settings.displayStyle === 'double' ? 2 : 1))}><ChevronLeft className="w-4 h-4" /></Button>
                  <span className="text-sm text-muted-foreground font-medium min-w-[80px] text-center">Page {currentPage + 1} / {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + (settings.displayStyle === 'double' ? 2 : 1)))}><ChevronRight className="w-4 h-4" /></Button>
                </div>
              </div>
            ) : pageUrls.length > 0 ? (
              /* Long strip */
              pageUrls.map((page, i) => (
                <div key={i} className="flex justify-center" ref={el => { pageRefs.current[i] = el; }} style={{ marginBottom: i < pageUrls.length - 1 ? `${settings.stripMargin}px` : 0 }}>
                  <img src={page} alt={`Page ${i + 1}`} className="shadow-lg" style={getImageStyle()} />
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-20"><div className="text-center space-y-3"><BookOpen className="w-12 h-12 mx-auto text-muted-foreground/40" /><p className="text-lg font-medium text-muted-foreground">No pages available</p><p className="text-sm text-muted-foreground/60">This chapter hasn't been uploaded yet.</p></div></div>
            )}
          </div>

          {/* Chapter Navigation Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between bg-card rounded-lg p-3 sm:p-4 border border-border shadow-sm gap-3 sm:gap-0">
            <Button variant="outline" disabled={!hasPrev} onClick={() => navigate(`/manga/${slug}/chapter/${chapterNum - 1}`)} className="w-full sm:w-auto text-xs sm:text-sm"><ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Previous</Button>
            <Button variant="outline" onClick={() => { setMenuOpen(true); setSubPanel('chapters'); }} className="w-full sm:w-auto text-xs sm:text-sm"><Rows3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Chapters</Button>
            {hasNext ? (
              <Button onClick={() => navigate(`/manga/${slug}/chapter/${chapterNum + 1}`)} className="w-full sm:w-auto text-xs sm:text-sm">Next <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" /></Button>
            ) : (
              <Button variant="outline" asChild className="w-full sm:w-auto text-xs sm:text-sm"><Link to={`/manga/${manga.slug}`}><BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Manga Info</Link></Button>
            )}
          </div>

          {/* After-reader section */}
          {!isLocked && (
            <div className="max-w-5xl mx-auto mt-8 space-y-6">
              <div className="text-center space-y-4 py-4">
                <div><h3 className="text-lg font-bold">What do you think?</h3><p className="text-sm text-muted-foreground">{Object.values(reactionCounts).reduce((a, b) => a + b, 0)} Reactions</p></div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 max-w-lg sm:max-w-2xl mx-auto">
                  {reactions.map(r => (
                    <button key={r.key} onClick={() => handleReaction(r.key)} className={`flex flex-col items-center gap-1 p-3 rounded-xl w-full transition-colors border ${selectedReaction === r.key ? 'bg-primary/20 border-primary/50' : 'bg-secondary/50 hover:bg-secondary/80 border-transparent'}`}>
                      <span className="text-2xl">{r.emoji}</span><span className="text-xs font-medium">{reactionCounts[r.key]}</span><span className="text-[10px] text-muted-foreground">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="py-6"><CommentSection mangaId={manga?.id || ''} contextType="chapter" contextId={currentChapter?.id} /></div>
            </div>
          )}
        </div>
      </div>

      {/* ─── MENU Panel Backdrop ─── */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50" onClick={() => setMenuOpen(false)} />
      )}

      {/* ─── MENU Sliding Panel ─── */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-[70] w-[280px] sm:w-[300px] bg-background border-l border-border overflow-y-auto transition-transform duration-200 ease-in-out ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {subPanel === 'none' && (
          <div className="p-4 space-y-3">
            {/* A) Manga title + close */}
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-base font-semibold text-foreground leading-tight line-clamp-2">{manga.title}</h2>
              <button onClick={() => setMenuOpen(false)} className="shrink-0 w-8 h-8 rounded-lg bg-secondary/60 flex items-center justify-center hover:bg-secondary transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* B) You are reading */}
            <div className="rounded-lg bg-secondary/40 p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">you are reading</p>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-sm font-medium text-primary">by chapter</span>
                <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </div>

            {/* C) Language */}
            <div className="rounded-lg bg-secondary/40 p-3 flex items-center justify-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Language:</span>
              <span className="text-sm font-medium">English</span>
            </div>

            {/* D) Chapter selector */}
            <div className="flex items-center gap-1">
              <button disabled={!hasPrev} onClick={() => navigate(`/manga/${slug}/chapter/${chapterNum - 1}`)} className="shrink-0 w-9 h-9 rounded-lg bg-secondary/40 flex items-center justify-center hover:bg-secondary disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setSubPanel('chapters')} className="flex-1 h-9 rounded-lg bg-secondary/40 flex items-center justify-between px-3 hover:bg-secondary transition-colors">
                <span className="text-sm font-medium">Chapter {chapterNum}</span>
                <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <button disabled={!hasNext} onClick={() => navigate(`/manga/${slug}/chapter/${chapterNum + 1}`)} className="shrink-0 w-9 h-9 rounded-lg bg-secondary/40 flex items-center justify-center hover:bg-secondary disabled:opacity-40 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* E) Page selector */}
            <div className="flex items-center gap-1">
              <button disabled={currentPage <= 0} onClick={() => setCurrentPage(p => Math.max(0, p - 1))} className="shrink-0 w-9 h-9 rounded-lg bg-secondary/40 flex items-center justify-center hover:bg-secondary disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setSubPanel('pages')} className="flex-1 h-9 rounded-lg bg-secondary/40 flex items-center justify-between px-3 hover:bg-secondary transition-colors">
                <span className="text-sm font-medium">Page {totalPages > 0 ? currentPage + 1 : 0}</span>
                <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <button disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} className="shrink-0 w-9 h-9 rounded-lg bg-secondary/40 flex items-center justify-center hover:bg-secondary disabled:opacity-40 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* F) Action rows */}
            <div className="space-y-0.5">
              <button onClick={() => toggleBookmark.mutate()} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-secondary/60 transition-colors">
                {isBookmarked ? <BookmarkCheck className="w-4 h-4 text-primary" /> : <Bookmark className="w-4 h-4 text-muted-foreground" />}
                <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </button>
              <button onClick={() => { navigate(`/manga/${manga.slug}`); setMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-secondary/60 transition-colors">
                <Info className="w-4 h-4 text-muted-foreground" />
                <span>Manga Detail</span>
              </button>
              <button onClick={() => setReportOpen(true)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-secondary/60 transition-colors">
                <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                <span>Report Error</span>
              </button>
            </div>

            <div className="border-t border-border" />

            {/* G) Settings rows */}
            <div className="space-y-0.5">
              <button onClick={() => updateSetting('stickyHeader', !settings.stickyHeader)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm hover:bg-secondary/60 transition-colors">
                <span>{settings.stickyHeader ? 'Header Sticky' : 'Header Hidden'}</span>
                <MonitorSmartphone className="w-4 h-4 text-muted-foreground" />
              </button>
              <button onClick={cycleDisplayStyle} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm hover:bg-secondary/60 transition-colors">
                <span>{displayStyleLabel}</span>
                {displayStyleIcon}
              </button>
              <button onClick={cycleFitMode} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm hover:bg-secondary/60 transition-colors">
                <span>{fitModeLabel}</span>
                {fitModeIcon}
              </button>
              <button onClick={cycleDirection} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm hover:bg-secondary/60 transition-colors">
                <span>{dirLabel}</span>
                {dirIcon}
              </button>
              <button onClick={cycleProgress} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm hover:bg-secondary/60 transition-colors">
                <span>{progressLabel}</span>
                {progressIcon}
              </button>
              <button onClick={() => { setShowAdvanced(true); setAdvancedTab('layout'); }} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm hover:bg-secondary/60 transition-colors">
                <span>Advanced Settings</span>
                <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="border-t border-border" />

            {/* H) Share */}
            <div className="space-y-2 pb-4">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-center">Share to your friends</p>
              <div className="flex items-center justify-center gap-2">
                <button onClick={() => handleShare('facebook')} className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: '#1877F2' }}>
                  <Facebook className="w-4 h-4" />
                </button>
                <button onClick={() => handleShare('twitter')} className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white">
                  <X className="w-4 h-4" />
                </button>
                <button onClick={() => handleShare('discord')} className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: '#5865F2' }}>
                  <MessageCircle className="w-4 h-4" />
                </button>
                <button onClick={() => handleShare('reddit')} className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: '#FF4500' }}>
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Chapter Sub-Panel ─── */}
        {subPanel === 'chapters' && (
          <div className="h-full flex flex-col">
            <div className="p-3 flex items-center gap-2 border-b border-border">
              <button onClick={() => setSubPanel('none')} className="shrink-0 w-8 h-8 rounded-lg bg-secondary/60 flex items-center justify-center hover:bg-secondary">
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold">Chapters</span>
            </div>
            <div className="p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text" placeholder="Find number..."
                  value={chapterSearch} onChange={e => setChapterSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-lg bg-secondary/40 text-sm border-none outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-3">
              {filteredChapters.map(ch => {
                const isActive = ch.number === chapterNum;
                const unlockInfo = getChapterUnlockInfo(ch);
                return (
                  <button
                    key={ch.id}
                    onClick={() => { navigate(`/manga/${slug}/chapter/${ch.number}`); setSubPanel('none'); setMenuOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors mb-0.5 ${isActive ? 'bg-primary/20 text-primary' : 'hover:bg-secondary/60'}`}
                  >
                    <div className="flex items-center gap-1.5">
                      {isActive && <span className="text-primary text-xs">▶</span>}
                      <span className={isActive ? 'font-semibold' : ''}>Chapter {ch.number}{ch.title ? ` — ${ch.title}` : ''}</span>
                    </div>
                    {unlockInfo && (
                      <div className="flex items-center gap-1.5 mt-0.5 ml-4 text-xs text-muted-foreground">
                        {unlockInfo.status === 'locked' && (
                          <>
                            <Lock className="w-3 h-3" />
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-medium">Premium</span>
                            <CurrencyIcon className="w-3 h-3" />
                            <span>{unlockInfo.coinPrice} {currencyName}</span>
                          </>
                        )}
                        {unlockInfo.status === 'unlocked' && <Lock className="w-3 h-3 text-green-500" />}
                        {unlockInfo.status === 'ticket' && (
                          <>
                            <Lock className="w-3 h-3 text-green-500" />
                            <Timer className="w-3 h-3" />
                            <CountdownTimer targetDate={unlockInfo.expiresAt!} />
                            <span>remaining</span>
                          </>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Page Sub-Panel ─── */}
        {subPanel === 'pages' && (
          <div className="h-full flex flex-col">
            <div className="p-3 flex items-center gap-2 border-b border-border">
              <button onClick={() => setSubPanel('none')} className="shrink-0 w-8 h-8 rounded-lg bg-secondary/60 flex items-center justify-center hover:bg-secondary">
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold">Pages</span>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => { scrollToPage(i); setSubPanel('none'); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors mb-0.5 ${i === currentPage ? 'bg-primary/20 text-primary' : 'hover:bg-secondary/60'}`}
                >
                  <div className="flex items-center gap-1.5">
                    {i === currentPage && <span className="text-primary text-xs">▶</span>}
                    <span className={i === currentPage ? 'font-semibold' : ''}>Page {i + 1}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── Report Error Dialog ─── */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Report Error</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <textarea
              value={reportText} onChange={e => setReportText(e.target.value)}
              placeholder="Describe the error..."
              className="w-full h-24 rounded-lg bg-secondary/40 p-3 text-sm border-none outline-none placeholder:text-muted-foreground resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setReportOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={handleReport}>Submit</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Advanced Settings Modal ─── */}
      <Dialog open={showAdvanced} onOpenChange={setShowAdvanced}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Advanced Settings</DialogTitle></DialogHeader>
          {/* Tabs */}
          <div className="flex gap-1 mb-4">
            {(['layout', 'image', 'shortcuts'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setAdvancedTab(tab)}
                className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors ${advancedTab === tab ? 'bg-primary text-primary-foreground' : 'bg-secondary/60 text-muted-foreground hover:bg-secondary'}`}
              >
                {tab === 'layout' ? 'PAGE LAYOUT' : tab === 'image' ? 'IMAGE' : 'SHORTCUTS'}
              </button>
            ))}
          </div>

          {advancedTab === 'layout' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Page Display Style</p>
                <div className="grid grid-cols-3 gap-2">
                  {([['single', 'Single Page', <FileText className="w-3.5 h-3.5" key="s" />], ['double', 'Double Page', <Columns2 className="w-3.5 h-3.5" key="d" />], ['strip', 'Long Strip', <Rows3 className="w-3.5 h-3.5" key="l" />]] as const).map(([val, label, icon]) => (
                    <button key={val} onClick={() => updateSetting('displayStyle', val as any)} className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${settings.displayStyle === val ? 'bg-primary text-primary-foreground' : 'bg-secondary/60 hover:bg-secondary'}`}>
                      {icon} {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Strip Margin</p>
                <div className="flex items-center gap-2">
                  <input type="number" value={settings.stripMargin} onChange={e => updateSetting('stripMargin', parseInt(e.target.value) || 0)} className="w-20 h-9 rounded-lg bg-secondary/40 px-3 text-sm border-none outline-none text-center" />
                  <Button variant="outline" size="sm" onClick={() => updateSetting('stripMargin', 5)}>Reset</Button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Reading Direction</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['ltr', 'rtl'] as const).map(d => (
                    <button key={d} onClick={() => updateSetting('direction', d)} className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${settings.direction === d ? 'bg-primary text-primary-foreground' : 'bg-secondary/60 hover:bg-secondary'}`}>
                      <ArrowLeftRight className={`w-3.5 h-3.5 ${d === 'rtl' ? 'scale-x-[-1]' : ''}`} /> {d === 'ltr' ? 'Left To Right' : 'Right To Left'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Progress Bar Position</p>
                <div className="grid grid-cols-3 gap-2">
                  {([['bottom', 'Bottom'], ['left', 'Left'], ['none', 'None']] as const).map(([val, label]) => (
                    <button key={val} onClick={() => updateSetting('progressBar', val as any)} className={`py-2 rounded-lg text-xs font-medium transition-colors ${settings.progressBar === val ? 'bg-primary text-primary-foreground' : 'bg-secondary/60 hover:bg-secondary'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Show tips when header and sidebar are hidden</span>
                <Switch checked={settings.showTips} onCheckedChange={v => updateSetting('showTips', v)} />
              </div>
            </div>
          )}

          {advancedTab === 'image' && (
            <div className="space-y-5">
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Image Sizing</p>
                {([['containWidth', 'Contain to width'], ['containHeight', 'Contain to height'], ['stretchSmall', 'Stretch small pages'], ['limitMaxWidth', 'Limit max width'], ['limitMaxHeight', 'Limit max height']] as const).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm">{label}</span>
                    <Switch checked={(settings as any)[key]} onCheckedChange={v => updateSetting(key as any, v)} />
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Image Coloring</p>
                {([['greyscale', 'Greyscale pages'], ['dimPages', 'Dim pages']] as const).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm">{label}</span>
                    <Switch checked={(settings as any)[key]} onCheckedChange={v => updateSetting(key as any, v)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {advancedTab === 'shortcuts' && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Keyboard Shortcuts</p>
              <ul className="space-y-2 text-sm">
                {[
                  ['H', 'Toggle show/hide header.'],
                  ['M', 'Toggle show/hide menu.'],
                  ['N', 'Skip forward a chapter.'],
                  ['B', 'Skip backward a chapter.'],
                  ['→', 'Skip a page forward in LTR or backward in RTL.'],
                  ['←', 'Skip a page backward in LTR or forward in RTL.'],
                ].map(([key, desc]) => (
                  <li key={key} className="flex items-start gap-2">
                    <kbd className="shrink-0 px-2 py-0.5 rounded bg-secondary border border-border text-xs font-mono">{key}</kbd>
                    <span className="text-muted-foreground">{desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
