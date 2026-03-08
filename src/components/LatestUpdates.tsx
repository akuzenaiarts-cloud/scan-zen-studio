import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Grid3X3, Check } from 'lucide-react';
import { mockManga } from '@/data/mockManga';
import LatestCard from './LatestCard';

const FILTER_TABS = ['All Series', 'Manga', 'Manhwa', 'Manhua'] as const;

const TAB_ICONS: Record<string, React.ReactNode> = {
  'All Series': <Grid3X3 className="w-3.5 h-3.5" />,
  'Manga': <span className="w-5 h-5 rounded-full bg-muted/50 flex items-center justify-center text-[10px] shrink-0">🇯🇵</span>,
  'Manhwa': <span className="w-5 h-5 rounded-full bg-muted/50 flex items-center justify-center text-[10px] shrink-0">🇰🇷</span>,
  'Manhua': <span className="w-5 h-5 rounded-full bg-muted/50 flex items-center justify-center text-[10px] shrink-0">🇨🇳</span>,
};

export default function LatestUpdates() {
  const [activeTab, setActiveTab] = useState<string>('All Series');

  const filtered = mockManga
    .filter(m => {
      if (activeTab === 'All Series') return true;
      return m.type === activeTab;
    })
    .sort((a, b) => b.chapters.length - a.chapters.length);

  return (
    <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <h2 className="text-2xl font-extrabold whitespace-nowrap">Latest Updates</h2>
          <div className="flex items-center justify-between gap-2">
            <div className="bg-secondary/60 rounded-full px-1 py-1 flex items-center gap-1 overflow-x-auto scrollbar-hide">
              {FILTER_TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0 ${
                    activeTab === tab
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {TAB_ICONS[tab]}
                  <span>{tab}</span>
                  {activeTab === tab && <Check className="w-3.5 h-3.5 ml-0.5" />}
                </button>
              ))}
            </div>
            <Link to="/latest" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground shrink-0">
              View all &gt;
            </Link>
          </div>
        </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map(manga => (
          <LatestCard key={manga.id} manga={manga} />
        ))}
      </div>
    </section>
  );
}
