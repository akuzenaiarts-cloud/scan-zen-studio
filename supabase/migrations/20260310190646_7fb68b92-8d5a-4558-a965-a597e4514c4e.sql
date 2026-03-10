
-- Storage bucket for manga assets
INSERT INTO storage.buckets (id, name, public) VALUES ('manga-assets', 'manga-assets', true);

-- Storage RLS: public read
CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id = 'manga-assets');

-- Storage RLS: admin upload
CREATE POLICY "Admin upload access" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'manga-assets' AND public.has_role(auth.uid(), 'admin'));

-- Storage RLS: admin update
CREATE POLICY "Admin update access" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'manga-assets' AND public.has_role(auth.uid(), 'admin'));

-- Storage RLS: admin delete
CREATE POLICY "Admin delete access" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'manga-assets' AND public.has_role(auth.uid(), 'admin'));

-- Notification type enum
CREATE TYPE public.notification_type AS ENUM ('chapter_update', 'comment_reply');

-- Manga subscriptions
CREATE TABLE public.manga_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  manga_id uuid REFERENCES public.manga(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id, manga_id)
);
ALTER TABLE public.manga_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own subscriptions" ON public.manga_subscriptions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  manga_id uuid REFERENCES public.manga(id) ON DELETE CASCADE,
  chapter_id uuid REFERENCES public.chapters(id) ON DELETE CASCADE,
  comment_id uuid,
  title text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  is_read boolean DEFAULT false,
  is_premium boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Comments
CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manga_id uuid REFERENCES public.manga(id) ON DELETE CASCADE NOT NULL,
  chapter_id uuid REFERENCES public.chapters(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  text text NOT NULL,
  likes_count integer DEFAULT 0,
  is_pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON public.comments FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Comment likes
CREATE TABLE public.comment_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid REFERENCES public.comments(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (comment_id, user_id)
);
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read likes" ON public.comment_likes FOR SELECT USING (true);
CREATE POLICY "Users manage own likes" ON public.comment_likes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Function to create notifications for all subscribers when a chapter is created
CREATE OR REPLACE FUNCTION public.notify_chapter_subscribers()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  manga_title text;
  sub record;
BEGIN
  SELECT title INTO manga_title FROM public.manga WHERE id = NEW.manga_id;
  
  FOR sub IN SELECT user_id FROM public.manga_subscriptions WHERE manga_id = NEW.manga_id
  LOOP
    INSERT INTO public.notifications (user_id, type, manga_id, chapter_id, title, message, is_premium)
    VALUES (
      sub.user_id,
      'chapter_update',
      NEW.manga_id,
      NEW.id,
      COALESCE(manga_title, 'Unknown'),
      'Chapter ' || NEW.number || ' is now available!',
      COALESCE(NEW.premium, false)
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_chapter_created
  AFTER INSERT ON public.chapters
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_chapter_subscribers();

-- Function to update likes_count on comment when likes change
CREATE OR REPLACE FUNCTION public.update_comment_likes_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.comments SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER on_comment_like_change
  AFTER INSERT OR DELETE ON public.comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_comment_likes_count();
