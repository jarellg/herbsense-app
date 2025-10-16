'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/header';
import { CandidateCard } from '@/components/candidate-card';
import { useSupabaseBrowser } from '@/lib/supabase/client';
import { Scan } from '@/lib/types/database';
import { Loader2, History as HistoryIcon } from 'lucide-react';

export default function HistoryPage() {
  const supabase = useSupabaseBrowser();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('scans')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error fetching history:', error);
          setLoading(false);
          return;
        }

        setScans(data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    }

    fetchHistory();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <HistoryIcon className="w-8 h-8" />
              Scan History
            </h1>
            <p className="text-gray-600 mt-2">
              View your recent plant identifications
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : scans.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HistoryIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No scan history yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Start scanning plants to see your history here
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {scans.map((scan) => (
                <div key={scan.id} className="space-y-1">
                  <p className="text-xs text-gray-500">
                    {new Date(scan.created_at).toLocaleString()}
                  </p>
                  <CandidateCard
                    species={scan.top_species || 'Unknown'}
                    commonName={scan.top_common_name || 'Unknown Plant'}
                    confidence={scan.confidence || 0}
                    thumbnailUrl={scan.thumbnail_url || undefined}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
