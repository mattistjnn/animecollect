// hooks/useEpisodeDetails.ts
import { useState, useCallback, useEffect } from 'react';
import * as databaseService from '@/services/databaseService';

interface EpisodeDetails {
  episode: any;
  anime: any;
  isWatched: boolean;
  inWatchlist: boolean;
}

export const useEpisodeDetails = (animeId: string, episodeId: string) => {
  const [data, setData] = useState<EpisodeDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les détails de l'épisode
  const loadEpisodeDetails = useCallback(async () => {
    if (!animeId || !episodeId) {
      setError('Paramètres manquants');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('🔄 Chargement des détails:', { animeId, episodeId });

      // Charger l'anime
      const animeData = await databaseService.getAnimeById(animeId);
      if (!animeData) {
        throw new Error('Anime non trouvé');
      }

      // Charger l'épisode
      const episodeData = await databaseService.getEpisodeById(episodeId);
      if (!episodeData) {
        throw new Error('Épisode non trouvé');
      }

      // Vérifier les statuts
      const [isWatched, inWatchlist] = await Promise.all([
        databaseService.isEpisodeWatched(episodeId),
        databaseService.isEpisodeInWatchlist(episodeId)
      ]);

      console.log('✅ Détails chargés:', {
        anime: animeData.title,
        episode: `${episodeData.number} - ${episodeData.title}`,
        isWatched,
        inWatchlist
      });

      setData({
        episode: episodeData,
        anime: animeData,
        isWatched,
        inWatchlist
      });

    } catch (err) {
      console.error('❌ Erreur lors du chargement des détails de l\'épisode:', err);
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  }, [animeId, episodeId]);

  // Marquer comme vu/non vu
  const toggleWatched = useCallback(async (): Promise<boolean> => {
    if (!data) {
      throw new Error('Aucune donnée disponible');
    }

    try {
      const newWatchedState = !data.isWatched;
      
      console.log('🔄 Toggle watched:', {
        episodeId,
        currentState: data.isWatched,
        newState: newWatchedState
      });
      
      if (newWatchedState) {
        await databaseService.markEpisodeAsWatched(episodeId);
      } else {
        await databaseService.unmarkEpisodeAsWatched(episodeId);
      }

      // Mettre à jour l'état local
      setData(prev => prev ? {
        ...prev,
        isWatched: newWatchedState,
        // Si marqué comme vu, retirer de la watchlist
        inWatchlist: newWatchedState ? false : prev.inWatchlist
      } : null);

      // Si marqué comme vu, retirer de la watchlist
      if (newWatchedState && data.inWatchlist) {
        await databaseService.removeEpisodeFromWatchlist(episodeId);
      }

      console.log('✅ Toggle watched réussi:', newWatchedState);
      return newWatchedState;
    } catch (error) {
      console.error('❌ Erreur lors du toggle watched:', error);
      throw error;
    }
  }, [data, episodeId]);

  // Ajouter/retirer de la watchlist
  const toggleWatchlist = useCallback(async (): Promise<boolean> => {
    if (!data) {
      throw new Error('Aucune donnée disponible');
    }

    try {
      const newWatchlistState = !data.inWatchlist;
      
      console.log('🔄 Toggle watchlist:', {
        episodeId,
        currentState: data.inWatchlist,
        newState: newWatchlistState
      });
      
      if (newWatchlistState) {
        await databaseService.addEpisodeToWatchlist(episodeId);
      } else {
        await databaseService.removeEpisodeFromWatchlist(episodeId);
      }

      // Mettre à jour l'état local
      setData(prev => prev ? {
        ...prev,
        inWatchlist: newWatchlistState
      } : null);

      console.log('✅ Toggle watchlist réussi:', newWatchlistState);
      return newWatchlistState;
    } catch (error) {
      console.error('❌ Erreur lors du toggle watchlist:', error);
      throw error;
    }
  }, [data, episodeId]);

  // Charger les données au montage
  useEffect(() => {
    loadEpisodeDetails();
  }, [loadEpisodeDetails]);

  return {
    data,
    isLoading,
    error,
    refresh: loadEpisodeDetails,
    toggleWatched,
    toggleWatchlist
  };
};