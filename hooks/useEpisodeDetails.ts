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

      // D'abord, essayer de récupérer l'épisode directement
      let episodeData = await databaseService.getEpisodeById(episodeId);
      let animeData = null;

      if (episodeData) {
        console.log('✅ Épisode trouvé directement:', episodeData.title || `Épisode ${episodeData.number}`);
        
        // Récupérer l'anime correspondant
        animeData = await databaseService.getAnimeById(episodeData.anime_id);
        
        if (!animeData) {
          throw new Error('Anime non trouvé pour cet épisode');
        }
      } else {
        console.log('❌ Épisode non trouvé, tentative de récupération de l\'anime...');
        
        // Si l'épisode n'est pas trouvé directement, essayer de récupérer l'anime d'abord
        animeData = await databaseService.getAnimeById(animeId);
        
        if (!animeData) {
          throw new Error('Anime non trouvé');
        }
        
        // Puis chercher l'épisode par anime_id et en espérant que episodeId soit en fait un numéro
        const allEpisodes = await databaseService.getEpisodesByAnimeId(animeData.id);
        console.log(`📊 ${allEpisodes.length} épisodes trouvés pour l'anime`);
        
        // Essayer de trouver l'épisode par son ID ou par son numéro
        episodeData = allEpisodes.find(ep => 
          ep.id === episodeId || 
          ep.number.toString() === episodeId ||
          ep.kitsu_id === episodeId
        );
        
        if (!episodeData) {
          // Dernier recours : prendre le premier épisode s'il y en a
          if (allEpisodes.length > 0) {
            console.log('⚠️ Épisode spécifique non trouvé, utilisation du premier épisode');
            episodeData = allEpisodes[0];
          } else {
            throw new Error('Aucun épisode trouvé pour cet anime');
          }
        } else {
          console.log('✅ Épisode trouvé par correspondance:', episodeData.title || `Épisode ${episodeData.number}`);
        }
      }

      // Vérifier les statuts
      const [isWatched, inWatchlist] = await Promise.all([
        databaseService.isEpisodeWatched(episodeData.id),
        databaseService.isEpisodeInWatchlist(episodeData.id)
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
        episodeId: data.episode.id,
        currentState: data.isWatched,
        newState: newWatchedState
      });
      
      if (newWatchedState) {
        await databaseService.markEpisodeAsWatched(data.episode.id);
      } else {
        await databaseService.unmarkEpisodeAsWatched(data.episode.id);
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
        await databaseService.removeEpisodeFromWatchlist(data.episode.id);
      }

      console.log('✅ Toggle watched réussi:', newWatchedState);
      return newWatchedState;
    } catch (error) {
      console.error('❌ Erreur lors du toggle watched:', error);
      throw error;
    }
  }, [data]);

  // Ajouter/retirer de la watchlist
  const toggleWatchlist = useCallback(async (): Promise<boolean> => {
    if (!data) {
      throw new Error('Aucune donnée disponible');
    }

    try {
      const newWatchlistState = !data.inWatchlist;
      
      console.log('🔄 Toggle watchlist:', {
        episodeId: data.episode.id,
        currentState: data.inWatchlist,
        newState: newWatchlistState
      });
      
      if (newWatchlistState) {
        await databaseService.addEpisodeToWatchlist(data.episode.id);
      } else {
        await databaseService.removeEpisodeFromWatchlist(data.episode.id);
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
  }, [data]);

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