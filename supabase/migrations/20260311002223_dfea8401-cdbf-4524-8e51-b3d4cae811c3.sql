
-- Drop the overly permissive policy and replace with a scoped one
DROP POLICY "Authenticated users can insert notifications" ON public.notifications;

CREATE POLICY "Users can insert notifications for others" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (user_id != auth.uid());
