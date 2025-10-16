'use client';

import { Header } from '@/components/header';
import { CandidateCard } from '@/components/candidate-card';
import { useFavorites } from '@/hooks/use-favorites';
import { Loader2, Heart } from 'lucide-react';

export default function FavoritesPage() {
  const { favorites, loading } = useFavorites();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Heart className="w-8 h-8 text-red-500" />
              Favorites
            </h1>
            <p className="text-gray-600 mt-2">
              Your saved plants for quick access
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-gray-500">No favorites yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Favorite plants from monograph pages to see them here
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {favorites.map((favorite) => (
                <CandidateCard
                  key={favorite.id}
                  species={favorite.species}
                  commonName={favorite.common_name || favorite.species}
                  confidence={1}
                  thumbnailUrl={favorite.thumbnail_url || undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
