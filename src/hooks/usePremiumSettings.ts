import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PremiumGeneralSettings {
  enable_coins: boolean;
  enable_subscriptions: boolean;
  payment_stripe_public_key: string;
  payment_stripe_secret_key: string;
  payment_paypal_client_id: string;
  payment_paypal_secret: string;
  payment_usdt_address: string;
  payment_usdt_network: 'TRC20' | 'ERC20';
}

export interface CoinSystemSettings {
  currency_name: string;
  currency_icon_url: string;
  base_amount: number;
  base_price: number;
}

export interface TokenSystemSettings {
  checkin_reward: number;
  checkin_cycle_days: number;
  comment_streak_enabled: boolean;
  comment_streak_reward: number;
  comment_streak_days: number;
}

export interface AllPremiumSettings {
  premium_general: PremiumGeneralSettings;
  coin_system: CoinSystemSettings;
  token_settings: TokenSystemSettings;
}

const DEFAULTS: AllPremiumSettings = {
  premium_general: {
    enable_coins: true,
    enable_subscriptions: false,
    payment_stripe_public_key: '',
    payment_stripe_secret_key: '',
    payment_paypal_client_id: '',
    payment_paypal_secret: '',
    payment_usdt_address: '',
    payment_usdt_network: 'TRC20',
  },
  coin_system: {
    currency_name: 'Coins',
    currency_icon_url: '',
    base_amount: 50,
    base_price: 0.99,
  },
  token_settings: {
    checkin_reward: 1,
    checkin_cycle_days: 4,
    comment_streak_enabled: true,
    comment_streak_reward: 1,
    comment_streak_days: 3,
  },
};

export function usePremiumSettings() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['premium-settings'],
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['premium_general', 'coin_system', 'token_settings']);

      if (error) throw error;

      const result = { ...DEFAULTS };
      for (const row of rows || []) {
        const key = row.key as keyof AllPremiumSettings;
        if (key in result) {
          result[key] = { ...result[key], ...(row.value as any) };
        }
      }
      return result;
    },
    staleTime: 1000 * 30,
  });

  const updatePremiumSettings = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['premium-settings'] });
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
    },
  });

  return {
    settings: data || DEFAULTS,
    isLoading,
    updatePremiumSettings,
    DEFAULTS,
  };
}
