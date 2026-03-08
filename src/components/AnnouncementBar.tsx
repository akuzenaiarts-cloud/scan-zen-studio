import { Share2, AlertTriangle, MessageCircle, Heart } from 'lucide-react';

export default function AnnouncementBar() {
  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-3">
      {/* Share */}
      <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-lg bg-card border border-border/40">
        <Share2 className="w-4 h-4 text-primary shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">Share Kayn Scan</p>
          <p className="text-xs text-muted-foreground">to your friends</p>
        </div>
      </div>

      {/* Report */}
      <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-lg bg-card border border-border/40">
        <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">Facing an Issue?</p>
          <p className="text-xs text-muted-foreground">Let us know, and we'll help ASAP</p>
        </div>
      </div>

      {/* Discord */}
      <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-lg bg-card border border-border/40">
        <MessageCircle className="w-4 h-4 text-[hsl(235,86%,65%)] shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">Join Our Socials</p>
          <p className="text-xs text-muted-foreground">to explore more</p>
        </div>
      </div>

      {/* Donate */}
      <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-lg bg-card border border-border/40">
        <Heart className="w-4 h-4 text-pink-500 shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">Donate Us</p>
          <p className="text-xs text-muted-foreground">to support us</p>
        </div>
      </div>
    </div>
  );
}
