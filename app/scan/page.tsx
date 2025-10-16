'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Uploader } from '@/components/uploader';
import { CandidateCard } from '@/components/candidate-card';
import { PaywallDialog } from '@/components/paywall-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSupabaseBrowser } from '@/lib/supabase/client';
import { IdentificationCandidate } from '@/lib/types/database';
import { AlertCircle } from 'lucide-react';

export default function ScanPage() {
  const router = useRouter();
  const supabase = useSupabaseBrowser();
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<IdentificationCandidate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  const handleUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    setCandidates([]);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string;
          const imageBase64 = base64.split(',')[1];

          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          const response = await fetch(`${supabaseUrl}/functions/v1/identify`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageBase64 }),
          });

          const data = await response.json();

          if (response.status === 402 && data.needsUpgrade) {
            setShowPaywall(true);
            setLoading(false);
            return;
          }

          if (!response.ok) {
            throw new Error(data.error || 'Failed to identify plant');
          }

          setCandidates(data.candidates || []);
          setLoading(false);
        } catch (err) {
          console.error('Identification error:', err);
          setError(err instanceof Error ? err.message : 'An error occurred');
          setLoading(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to process image');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Identify Plant</h1>
            <p className="text-gray-600 mt-2">
              Upload or take a photo of a plant to identify it
            </p>
          </div>

          <Uploader onUpload={handleUpload} loading={loading} />

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {candidates.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Identification Results
              </h2>
              <div className="grid gap-3">
                {candidates.map((candidate, index) => (
                  <CandidateCard
                    key={index}
                    species={candidate.species}
                    commonName={candidate.commonName}
                    confidence={candidate.confidence}
                    thumbnailUrl={candidate.thumbnailUrl}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <PaywallDialog open={showPaywall} onOpenChange={setShowPaywall} />
    </div>
  );
}
