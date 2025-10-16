import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf } from 'lucide-react';

interface CandidateCardProps {
  species: string;
  commonName: string;
  confidence: number;
  thumbnailUrl?: string;
}

export function CandidateCard({
  species,
  commonName,
  confidence,
  thumbnailUrl,
}: CandidateCardProps) {
  const confidencePercent = Math.round(confidence * 100);

  return (
    <Link href={`/plant/${encodeURIComponent(species)}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-16 h-16 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt={commonName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Leaf className="w-8 h-8 text-green-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {commonName}
              </h3>
              <p className="text-sm text-gray-500 italic truncate">{species}</p>
              <div className="mt-2">
                <Badge
                  variant={confidencePercent >= 80 ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {confidencePercent}% match
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
