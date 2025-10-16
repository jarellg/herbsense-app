'use client';

import { useEffect, useState } from 'react';
import { useSupabaseBrowser } from '@/lib/supabase/client';
import { useEntitlement } from './use-entitlement';

const FREE_SCANS_PER_DAY = parseInt(process.env.NEXT_PUBLIC_FREE_SCANS_PER_DAY || '5', 10);

export function useLimits() {
  const supabase = useSupabaseBrowser();
  const { isPro } = useEntitlement();
  const [scansUsedToday, setScansUsedToday] = useState(0);
  const [scansRemaining, setScansRemaining] = useState(FREE_SCANS_PER_DAY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScanCount() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const { count, error } = await supabase
          .from('scans')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', oneDayAgo);

        if (error) {
          console.error('Error fetching scan count:', error);
          setLoading(false);
          return;
        }

        setScansUsedToday(count || 0);

        if (isPro) {
          setScansRemaining(999999);
        } else {
          setScansRemaining(Math.max(0, FREE_SCANS_PER_DAY - (count || 0)));
        }

        setLoading(false);
      } catch (error) {
        console.error('Error in useLimits:', error);
        setLoading(false);
      }
    }

    fetchScanCount();

    const channel = supabase
      .channel('scan-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'scans',
        },
        () => {
          fetchScanCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, isPro]);

  return {
    scansUsedToday,
    scansRemaining,
    canScan: isPro || scansRemaining > 0,
    loading,
  };
}
