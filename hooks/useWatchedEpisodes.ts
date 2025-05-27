import { useState, useCallback, useEffect } from 'react';
import { 
  markEpisodeAsWatched, 
  unmarkEpisodeAsWatched, 
  isEpisodeWatched,
  getWatchedEpisodes 
} from '@/lib/database';

export const useWatchedEpisodes = (animeId?: string) => {
  const [watchedEpisodes, setWatchedEpisodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Charger les épisodes visionnés pour un anime
  const refreshWatchedEpisodes = useCallback(async () => {
    if (!animeId) return;
    
    try {
      setIsLoading(true);
      const watchedIds = await getWatchedEpisodes(animeId);
      setWatchedEpisodes(watchedIds);
    } catch (error) {
      console.error('Erreur lors du chargement des épisodes visionnés:', error);
    } finally {
      setIsLoading(false);
    }
  }, [animeId]);

  // Marquer un épisode comme visionné
  const markAsWatched = useCallback(async (episodeId: string): Promise<void> => {
    try {
      console.log('🎬 Marquage épisode comme vu:', episodeId);
      await markEpisodeAsWatched(episodeId);
      
      // Mettre à jour l'état local
      setWatchedEpisodes(prev => {
        if (!prev.includes(episodeId)) {
          return [...prev, episodeId];
        }
        return prev;
      });
      
      console.log('✅ Épisode marqué comme vu avec succès');
    } catch (error) {
      console.error('❌ Erreur lors du marquage:', error);
      throw error;
    }
  }, []);

  // Démarquer un épisode comme visionné
  const unmarkAsWatched = useCallback(async (episodeId: string): Promise<void> => {
    try {
      console.log('🎬 Démarquage épisode:', episodeId);
      await unmarkEpisodeAsWatched(episodeId);
      
      // Mettre à jour l'état local
      setWatchedEpisodes(prev => prev.filter(id => id !== episodeId));
      
      console.log('✅ Épisode démarqué avec succès');
    } catch (error) {
      console.error('❌ Erreur lors du démarquage:', error);
      throw error;
    }
  }, []);

  // Vérifier si un épisode est visionné
  const isWatched = useCallback(async (episodeId: string): Promise<boolean> => {
    try {
      return await isEpisodeWatched(episodeId);
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      return false;
    }
  }, []);

  // Vérifier si un épisode est visionné (version synchrone basée sur l'état local)
  const isWatchedSync = useCallback((episodeId: string): boolean => {
    return watchedEpisodes.includes(episodeId);
  }, [watchedEpisodes]);

  // Toggle l'état d'un épisode
  const toggleWatched = useCallback(async (episodeId: string): Promise<boolean> => {
    const currentlyWatched = isWatchedSync(episodeId);
    
    if (currentlyWatched) {
      await unmarkAsWatched(episodeId);
      return false;
    } else {
      await markAsWatched(episodeId);
      return true;
    }
  }, [isWatchedSync, markAsWatched, unmarkAsWatched]);

  // Charger les données au montage du composant
  useEffect(() => {
    refreshWatchedEpisodes();
  }, [refreshWatchedEpisodes]);

  return {
    watchedEpisodes,
    isLoading,
    markAsWatched,
    unmarkAsWatched,
    isWatched,
    isWatchedSync,
    toggleWatched,
    refreshWatchedEpisodes
  };
};