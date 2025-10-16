'use client';

import { useEffect, useState } from 'react';
import { useSupabaseBrowser } from '@/lib/supabase/client';
import { Entitlement } from '@/lib/types/database';

export function useEntitlement() {
  const supabase = useSupabaseBrowser();
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  useEffect(() => {
    async function fetchEntitlement() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('entitlements')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching entitlement:', error);
          setLoading(false);
          return;
        }

        setEntitlement(data);

        if (data?.is_pro && data.period_end) {
          const periodEnd = new Date(data.period_end);
          const now = new Date();
          const isActive = periodEnd > now;
          setIsPro(isActive);

          if (isActive) {
            const days = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            setDaysRemaining(days);
          }
        } else {
          setIsPro(false);
          setDaysRemaining(null);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error in useEntitlement:', error);
        setLoading(false);
      }
    }

    fetchEntitlement();

    const channel = supabase
      .channel('entitlement-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'entitlements',
        },
        () => {
          fetchEntitlement();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return { entitlement, isPro, daysRemaining, loading };
}
