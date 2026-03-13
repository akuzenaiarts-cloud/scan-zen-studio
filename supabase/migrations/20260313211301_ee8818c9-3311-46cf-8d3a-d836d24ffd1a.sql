
-- Admin function to update user balances (bypasses RLS)
CREATE OR REPLACE FUNCTION public.admin_set_user_balance(
  p_target_user_id uuid,
  p_coin_balance integer,
  p_token_balance integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check caller is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: admin role required';
  END IF;

  UPDATE public.profiles
  SET coin_balance = p_coin_balance,
      token_balance = p_token_balance
  WHERE id = p_target_user_id;
END;
$$;

-- Token unlock function (deducts 1 token, grants 3-day access)
CREATE OR REPLACE FUNCTION public.unlock_chapter_with_token(
  p_user_id uuid,
  p_chapter_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token_balance integer;
  v_is_premium boolean;
  v_already_unlocked boolean;
BEGIN
  SELECT premium INTO v_is_premium
  FROM public.chapters
  WHERE id = p_chapter_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Chapter not found');
  END IF;

  IF NOT v_is_premium THEN
    RETURN jsonb_build_object('success', false, 'error', 'Chapter is not premium');
  END IF;

  -- Check existing valid unlock
  SELECT EXISTS (
    SELECT 1 FROM public.chapter_unlocks
    WHERE chapter_id = p_chapter_id
      AND user_id = p_user_id
      AND (expires_at IS NULL OR expires_at > now())
  ) INTO v_already_unlocked;

  IF v_already_unlocked THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already unlocked');
  END IF;

  SELECT COALESCE(token_balance, 0) INTO v_token_balance
  FROM public.profiles
  WHERE id = p_user_id;

  IF v_token_balance < 1 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient tickets');
  END IF;

  UPDATE public.profiles
  SET token_balance = COALESCE(token_balance, 0) - 1
  WHERE id = p_user_id;

  INSERT INTO public.chapter_unlocks (user_id, chapter_id, unlock_type, expires_at)
  VALUES (p_user_id, p_chapter_id, 'ticket', now() + interval '3 days');

  RETURN jsonb_build_object('success', true, 'tickets_spent', 1, 'expires_in_days', 3);
END;
$$;
