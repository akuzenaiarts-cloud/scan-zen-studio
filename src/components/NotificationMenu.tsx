import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, CheckCheck, Crown, Unlock, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationMenu() {
  const { isAuthenticated } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <Button variant="ghost" size="icon" className="rounded-full h-11 w-11 bg-muted/60 hover:bg-muted relative">
        <Bell className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full h-11 w-11 bg-muted/60 hover:bg-muted relative transition-all duration-200 hover:scale-[1.05]">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0 rounded-2xl border-border bg-card shadow-xl" align="end" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead.mutate()}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No notifications yet
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors border-b border-border/30 last:border-0 ${!n.is_read ? 'bg-primary/5' : ''}`}
              >
                {n.type === 'chapter_update' && n.manga ? (
                  <>
                    <Link
                      to={`/manga/${n.manga.slug}`}
                      onClick={() => { markAsRead.mutate(n.id); setOpen(false); }}
                      className="shrink-0"
                    >
                      <img src={n.manga.cover_url} alt="" className="w-11 h-[60px] rounded-lg object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {n.is_premium ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/20">
                            <Crown className="w-2.5 h-2.5" /> Premium
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                            <Unlock className="w-2.5 h-2.5" /> Free
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium truncate">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {!n.is_read && (
                      <button onClick={() => markAsRead.mutate(n.id)} className="shrink-0 mt-1">
                        <Check className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors" />
                      </button>
                    )}
                  </>
                ) : n.type === 'comment_reply' ? (
                  <>
                    <Link
                      to={n.manga ? `/manga/${n.manga.slug}` : '#'}
                      onClick={() => { markAsRead.mutate(n.id); setOpen(false); }}
                      className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0"
                    >
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </Link>
                    <Link
                      to={n.manga ? `/manga/${n.manga.slug}` : '#'}
                      onClick={() => { markAsRead.mutate(n.id); setOpen(false); }}
                      className="flex-1 min-w-0"
                    >
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </p>
                    </Link>
                    {!n.is_read && (
                      <button onClick={() => markAsRead.mutate(n.id)} className="shrink-0 mt-1">
                        <Check className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors" />
                      </button>
                    )}
                  </>
                ) : null}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
