'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/header';
import { SectionCard } from '@/components/section-card';
import { EvidenceBadge } from '@/components/evidence-badge';
import { CitationsList } from '@/components/citations-list';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSupabaseBrowser } from '@/lib/supabase/client';
import { useFavorites } from '@/hooks/use-favorites';
import { Monograph, Citation } from '@/lib/types/database';
import {
  Heart,
  BookOpen,
  Pill,
  FlaskConical,
  AlertTriangle,
  Shield,
  FileText,
  MapPin,
  Loader2,
} from 'lucide-react';

export default function PlantDetailPage() {
  const params = useParams();
  const species = decodeURIComponent(params.species as string);
  const supabase = useSupabaseBrowser();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const [monograph, setMonograph] = useState<Monograph | null>(null);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMonograph() {
      try {
        const { data: monographData, error: monographError } = await supabase
          .from('monographs')
          .select('*')
          .eq('species', species)
          .maybeSingle();

        if (monographError) {
          console.error('Error fetching monograph:', monographError);
          setLoading(false);
          return;
        }

        setMonograph(monographData);

        if (monographData) {
          const { data: citationsData } = await supabase
            .from('citations')
            .select('*')
            .eq('monograph_id', monographData.id)
            .order('created_at', { ascending: true });

          setCitations(citationsData || []);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    }

    fetchMonograph();
  }, [species, supabase]);

  const handleToggleFavorite = async () => {
    if (!monograph) return;

    try {
      if (isFavorite(species)) {
        await removeFavorite(species);
      } else {
        await addFavorite(species, monograph.common_name);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      </div>
    );
  }

  if (!monograph) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No monograph available for this plant. Check back later as we
              continue to expand our database.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="bg-amber-50 border-b border-amber-200 py-3">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-900">
              <strong>Educational use only</strong> — Not medical advice. Consult healthcare professionals.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              {monograph.common_name}
            </h1>
            <p className="text-xl text-gray-600 italic mt-2">{monograph.species}</p>
            {monograph.evidence_level && (
              <div className="mt-3">
                <EvidenceBadge level={monograph.evidence_level} />
              </div>
            )}
          </div>
          <Button
            variant={isFavorite(species) ? 'default' : 'outline'}
            size="icon"
            onClick={handleToggleFavorite}
            className={isFavorite(species) ? 'bg-red-500 hover:bg-red-600' : ''}
          >
            <Heart
              className={`w-5 h-5 ${isFavorite(species) ? 'fill-current' : ''}`}
            />
          </Button>
        </div>

        {monograph.overview && (
          <SectionCard title="Overview" icon={BookOpen}>
            <p className="text-gray-700 leading-relaxed">{monograph.overview}</p>
          </SectionCard>
        )}

        {monograph.medicinal_properties && monograph.medicinal_properties.length > 0 && (
          <SectionCard title="Medicinal Properties" icon={Pill}>
            <div className="space-y-4">
              {monograph.medicinal_properties.map((prop, index) => (
                <div key={index} className="border-l-4 border-l-green-500 pl-4">
                  <h3 className="font-semibold text-lg text-gray-900">{prop.name}</h3>
                  <p className="text-gray-700 mt-1">{prop.summary}</p>
                  {prop.evidence && (
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Evidence:</strong> {prop.evidence}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {monograph.preparations && monograph.preparations.length > 0 && (
          <SectionCard title="Preparations & Usage" icon={FlaskConical}>
            <Tabs defaultValue="0" className="w-full">
              <TabsList className="grid w-full grid-cols-auto">
                {monograph.preparations.map((prep, index) => (
                  <TabsTrigger key={index} value={index.toString()}>
                    {prep.form}
                  </TabsTrigger>
                ))}
              </TabsList>
              {monograph.preparations.map((prep, index) => (
                <TabsContent key={index} value={index.toString()} className="mt-4">
                  <p className="text-gray-700 whitespace-pre-line">
                    {prep.instructions}
                  </p>
                </TabsContent>
              ))}
            </Tabs>
          </SectionCard>
        )}

        {monograph.dosage_guidance && (
          <SectionCard title="Dosage Guidance">
            <p className="text-gray-700 whitespace-pre-line">
              {monograph.dosage_guidance}
            </p>
          </SectionCard>
        )}

        {monograph.contraindications && monograph.contraindications.length > 0 && (
          <SectionCard title="Contraindications" icon={AlertTriangle}>
            <ul className="space-y-2">
              {monograph.contraindications.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        )}

        {monograph.interactions && monograph.interactions.length > 0 && (
          <SectionCard title="Drug & Herb Interactions">
            <ul className="space-y-2">
              {monograph.interactions.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0 mt-2" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        )}

        {monograph.toxicity && (
          <SectionCard title="Toxicity Information" icon={Shield}>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-gray-900">{monograph.toxicity}</p>
            </div>
          </SectionCard>
        )}

        {monograph.safety_notes && monograph.safety_notes.length > 0 && (
          <SectionCard title="Safety Notes" icon={Shield}>
            <ul className="space-y-2">
              {monograph.safety_notes.map((note, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{note}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        )}

        {citations.length > 0 && (
          <SectionCard title="References & Citations" icon={FileText}>
            <CitationsList citations={citations} />
          </SectionCard>
        )}

        {monograph.region_notes && monograph.region_notes.length > 0 && (
          <SectionCard title="Regional Information" icon={MapPin}>
            <ul className="space-y-2">
              {monograph.region_notes.map((note, index) => (
                <li key={index} className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{note}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        )}
      </div>
    </div>
  );
}
