import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useReadingHistory = () => {
  const { user } = useAuth();

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['reading-history', user?.id],
    queryFn: async () => {
      if (!user) return [];
      // Get most recent read per manga
      const { data, error } = await supabase
        .from('reading_history' as any)
        .select('*, manga:manga_id(id, title, slug, cover_url, type, status)')
        .eq('user_id', user.id)
        .order('read_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      // Deduplicate by manga_id, keep most recent
      const seen = new Set<string>();
      return ((data || []) as any[]).filter(h => {
        if (seen.has(h.manga_id)) return false;
        seen.add(h.manga_id);
        return true;
      });
    },
    enabled: !!user,
  });

  return { history, isLoading };
};

export const useRecordReading = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mangaId, chapterId, chapterNumber }: { mangaId: string; chapterId: string; chapterNumber: number }) => {
      if (!user) return;
      await supabase.from('reading_history' as any).upsert(
        {
          user_id: user.id,
          manga_id: mangaId,
          chapter_id: chapterId,
          chapter_number: chapterNumber,
          read_at: new Date().toISOString(),
        } as any,
        { onConflict: 'user_id,manga_id,chapter_id' }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading-history'] });
    },
  });
};
