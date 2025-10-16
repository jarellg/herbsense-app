'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSupabaseBrowser } from '@/lib/supabase/client';
import { Monograph } from '@/lib/types/database';
import { Search, Plus, Edit, Leaf, Loader2 } from 'lucide-react';

export default function AdminMonographsPage() {
  const supabase = useSupabaseBrowser();
  const [monographs, setMonographs] = useState<Monograph[]>([]);
  const [filteredMonographs, setFilteredMonographs] = useState<Monograph[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchMonographs() {
      try {
        const { data, error } = await supabase
          .from('monographs')
          .select('*')
          .order('common_name', { ascending: true });

        if (error) {
          console.error('Error fetching monographs:', error);
          setLoading(false);
          return;
        }

        setMonographs(data || []);
        setFilteredMonographs(data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    }

    fetchMonographs();
  }, [supabase]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMonographs(monographs);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredMonographs(
        monographs.filter(
          (m) =>
            m.common_name.toLowerCase().includes(query) ||
            m.species.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, monographs]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Leaf className="w-6 h-6 text-green-600" />
              <h1 className="text-2xl font-bold">Admin - Monographs</h1>
            </div>
            <Link href="/admin/monographs/new">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Monograph
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search monographs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : filteredMonographs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">No monographs found</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredMonographs.map((monograph) => (
                <Card key={monograph.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {monograph.common_name}
                          </h3>
                          {monograph.evidence_level && (
                            <Badge variant="outline">Grade {monograph.evidence_level}</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 italic mt-1">{monograph.species}</p>
                        {monograph.overview && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {monograph.overview}
                          </p>
                        )}
                        <div className="flex gap-2 mt-3 text-sm text-gray-500">
                          <span>
                            {monograph.medicinal_properties?.length || 0} properties
                          </span>
                          <span>•</span>
                          <span>{monograph.preparations?.length || 0} preparations</span>
                        </div>
                      </div>
                      <Link href={`/admin/monographs/${monograph.id}`}>
                        <Button variant="outline" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
