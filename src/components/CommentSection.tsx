import { useState, useMemo } from 'react';
import { ThumbsUp, MessageCircle, LogIn, Pin, Shield, Send, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useComments, CommentRow } from '@/hooks/useComments';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { formatDistanceToNow } from 'date-fns';

type SortMode = 'popular' | 'recent';

interface Props {
  mangaId: string;
}

function CommentItem({
  comment,
  isAdmin,
  isAuthenticated,
  onReply,
  onLike,
  onPin,
}: {
  comment: CommentRow;
  isAdmin: boolean;
  isAuthenticated: boolean;
  onReply: (id: string) => void;
  onLike: (id: string, hasLiked: boolean) => void;
  onPin: (id: string, isPinned: boolean) => void;
}) {
  const displayName = comment.profile?.display_name || 'User';
  const initial = displayName[0]?.toUpperCase() || 'U';

  return (
    <div className={`p-3 rounded-xl space-y-2 ${comment.is_pinned ? 'bg-primary/5 border border-primary/20' : 'bg-secondary/50'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
            {comment.profile?.avatar_url ? (
              <img src={comment.profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-primary">{initial}</span>
            )}
          </div>
          <span className="text-sm font-medium">{displayName}</span>
          {comment.is_admin && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/20">
              <Shield className="w-2.5 h-2.5" /> Admin
            </span>
          )}
          {comment.is_pinned && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600">
              <Pin className="w-2.5 h-2.5" /> Pinned
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
        </div>
        {isAdmin && (
          <button
            onClick={() => onPin(comment.id, comment.is_pinned)}
            className={`p-1 rounded hover:bg-muted transition-colors ${comment.is_pinned ? 'text-amber-500' : 'text-muted-foreground'}`}
            title={comment.is_pinned ? 'Unpin' : 'Pin'}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <p className="text-sm text-foreground/90">{comment.text}</p>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onLike(comment.id, !!comment.user_has_liked)}
          className={`flex items-center gap-1.5 text-xs transition-colors ${
            comment.user_has_liked ? 'text-primary font-medium' : 'text-muted-foreground hover:text-primary'
          }`}
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${comment.user_has_liked ? 'fill-primary' : ''}`} />
          {comment.likes_count}
        </button>
        {isAuthenticated && (
          <button
            onClick={() => onReply(comment.id)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" /> Reply
          </button>
        )}
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-6 space-y-2 pt-1 border-l-2 border-border/50 pl-3">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              isAdmin={isAdmin}
              isAuthenticated={isAuthenticated}
              onReply={onReply}
              onLike={onLike}
              onPin={onPin}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentSection({ mangaId }: Props) {
  const { isAuthenticated, user, setShowLoginModal } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { comments, isLoading, addComment, toggleLike, togglePin } = useComments(mangaId);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('recent');

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    addComment.mutate({ text: newComment });
    setNewComment('');
  };

  const handleReply = (parentId: string) => {
    setReplyTo(replyTo === parentId ? null : parentId);
    setReplyText('');
  };

  const submitReply = (parentId: string) => {
    if (!replyText.trim()) return;
    addComment.mutate({ text: replyText, parentId });
    setReplyTo(null);
    setReplyText('');
  };

  const sortedComments = useMemo(() => {
    // Pinned always first
    const pinned = comments.filter(c => c.is_pinned);
    const unpinned = comments.filter(c => !c.is_pinned);
    
    const sorted = sortMode === 'popular'
      ? unpinned.sort((a, b) => b.likes_count - a.likes_count)
      : unpinned.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    return [...pinned, ...sorted];
  }, [comments, sortMode]);

  const totalCount = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Comments</h3>
          <span className="text-sm text-muted-foreground">({totalCount})</span>
        </div>
        <div className="flex items-center bg-muted rounded-full p-0.5">
          {(['popular', 'recent'] as SortMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setSortMode(mode)}
              className={`px-3 py-1 text-xs font-medium rounded-full capitalize transition-colors ${
                sortMode === mode
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      {isAuthenticated ? (
        <div className="space-y-2">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            className="bg-secondary border-border min-h-[80px] resize-none"
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={handleSubmit} disabled={!newComment.trim() || addComment.isPending} className="gap-1.5">
              <Send className="w-3.5 h-3.5" /> Post
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowLoginModal(true)}
          className="w-full p-4 rounded-lg border border-dashed border-border bg-secondary/50 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
        >
          <LogIn className="w-4 h-4" />
          <span className="text-sm">Sign in to leave a comment</span>
        </button>
      )}

      {/* Comments */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">Loading comments...</div>
      ) : (
        <div className="space-y-3">
          {sortedComments.map(c => (
            <div key={c.id} className="space-y-2">
              <CommentItem
                comment={c}
                isAdmin={isAdmin}
                isAuthenticated={isAuthenticated}
                onReply={handleReply}
                onLike={(id, hasLiked) => toggleLike.mutate({ commentId: id, hasLiked })}
                onPin={(id, isPinned) => togglePin.mutate({ commentId: id, isPinned })}
              />
              {replyTo === c.id && (
                <div className="ml-10 flex gap-2">
                  <Textarea
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    className="bg-secondary border-border min-h-[60px] resize-none flex-1"
                    autoFocus
                  />
                  <Button size="sm" onClick={() => submitReply(c.id)} disabled={!replyText.trim()} className="self-end">
                    Reply
                  </Button>
                </div>
              )}
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-6">No comments yet. Be the first to comment!</p>
          )}
        </div>
      )}
    </div>
  );
}
