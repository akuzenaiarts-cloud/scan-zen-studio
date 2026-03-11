import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useBookmarks = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: bookmarks = [], isLoading } = useQuery({
    queryKey: ['bookmarks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('bookmarks' as any)
        .select('*, manga:manga_id(id, title, slug, cover_url, type, status, genres)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!user,
  });

  return { bookmarks, isLoading };
};

export const useMangaBookmark = (mangaId: string | undefined) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: isBookmarked = false } = useQuery({
    queryKey: ['bookmark', mangaId, user?.id],
    queryFn: async () => {
      if (!user || !mangaId) return false;
      const { data } = await supabase
        .from('bookmarks' as any)
        .select('id')
        .eq('user_id', user.id)
        .eq('manga_id', mangaId)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user && !!mangaId,
  });

  const toggleBookmark = useMutation({
    mutationFn: async () => {
      if (!user || !mangaId) return;
      if (isBookmarked) {
        await supabase.from('bookmarks' as any).delete().eq('user_id', user.id).eq('manga_id', mangaId);
      } else {
        await supabase.from('bookmarks' as any).insert({ user_id: user.id, manga_id: mangaId } as any);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmark', mangaId] });
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });

  return { isBookmarked, toggleBookmark };
};
