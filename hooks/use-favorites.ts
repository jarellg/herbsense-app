'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSupabaseBrowser } from '@/lib/supabase/client';
import { Favorite } from '@/lib/types/database';

export function useFavorites() {
  const supabase = useSupabaseBrowser();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching favorites:', error);
        setLoading(false);
        return;
      }

      setFavorites(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchFavorites:', error);
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchFavorites();

    const channel = supabase
      .channel('favorite-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favorites',
        },
        () => {
          fetchFavorites();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchFavorites]);

  const addFavorite = async (species: string, commonName: string, thumbnailUrl?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      setFavorites((prev) => [
        {
          id: crypto.randomUUID(),
          user_id: user.id,
          species,
          common_name: commonName,
          thumbnail_url: thumbnailUrl || null,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);

      const { error } = await supabase.from('favorites').insert({
        user_id: user.id,
        species,
        common_name: commonName,
        thumbnail_url: thumbnailUrl,
      });

      if (error) {
        await fetchFavorites();
        throw error;
      }
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  };

  const removeFavorite = async (species: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      setFavorites((prev) => prev.filter((fav) => fav.species !== species));

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('species', species);

      if (error) {
        await fetchFavorites();
        throw error;
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  };

  const isFavorite = (species: string) => {
    return favorites.some((fav) => fav.species === species);
  };

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
    refetch: fetchFavorites,
  };
}
