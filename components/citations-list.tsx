import { Citation } from '@/lib/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

interface CitationsListProps {
  citations: Citation[];
}

export function CitationsList({ citations }: CitationsListProps) {
  if (citations.length === 0) {
    return (
      <p className="text-gray-500 text-sm italic">
        No citations available for this monograph.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {citations.map((citation, index) => (
        <Card key={citation.id} className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {index + 1}. {citation.source_name}
                </p>
                {citation.authors && (
                  <p className="text-sm text-gray-600 mt-1">
                    {citation.authors}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-500">
                  {citation.year && <span>{citation.year}</span>}
                  {citation.publisher && (
                    <>
                      <span>•</span>
                      <span>{citation.publisher}</span>
                    </>
                  )}
                  {citation.pages && (
                    <>
                      <span>•</span>
                      <span>pp. {citation.pages}</span>
                    </>
                  )}
                </div>
                {citation.note && (
                  <p className="text-sm text-gray-600 mt-2 italic">
                    {citation.note}
                  </p>
                )}
              </div>
              {citation.url && (
                <a
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 flex-shrink-0"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
