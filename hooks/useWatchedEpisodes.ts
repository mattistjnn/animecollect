// hooks/useWatchedEpisodes.ts
import { useState, useCallback, useEffect } from 'react';
import * as databaseService from '@/services/databaseService';

export const useWatchedEpisodes = (animeId?: string) => {
  const [watchedEpisodes, setWatchedEpisodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Charger les épisodes visionnés depuis la base de données
  const refreshWatchedEpisodes = useCallback(async () => {
    if (!animeId) return;
    
    try {
      setIsLoading(true);
      console.log('📊 Chargement des épisodes visionnés pour anime:', animeId);
      
      const watchedIds = await databaseService.getWatchedEpisodes(animeId);
      setWatchedEpisodes(watchedIds);
      
      console.log('✅ Épisodes visionnés chargés:', watchedIds);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des épisodes visionnés:', error);
    } finally {
      setIsLoading(false);
    }
  }, [animeId]);

  // Assurer qu'un épisode existe en base avant de le marquer
  const ensureEpisodeExists = useCallback(async (episodeData: {
    id: string;
    animeId: string;
    number: number;
    title?: string;
  }): Promise<boolean> => {
    try {
      // Vérifier si l'épisode existe déjà
      const existing = await databaseService.getEpisodeById(episodeData.id);
      
      if (!existing) {
        console.log('🔧 Création de l\'épisode en base:', episodeData);
        
        // Créer l'épisode s'il n'existe pas
        await databaseService.saveEpisode({
          id: episodeData.id,
          anime_id: episodeData.animeId,
          number: episodeData.number,
          title: episodeData.title || `Épisode ${episodeData.number}`,
          synopsis: null,
          air_date: null,
          thumbnail: null,
          length: null,
          kitsu_id: null
        });
        
        console.log('✅ Épisode créé avec succès');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'épisode:', error);
      return false;
    }
  }, []);

  // Marquer un épisode comme visionné
  const markAsWatched = useCallback(async (
    episodeId: string, 
    episodeData?: {
      animeId: string;
      number: number;
      title?: string;
    }
  ): Promise<void> => {
    try {
      console.log('🎬 Marquage épisode comme vu:', episodeId);
      
      // S'assurer que l'épisode existe en base
      if (episodeData) {
        const exists = await ensureEpisodeExists({
          id: episodeId,
          ...episodeData
        });
        
        if (!exists) {
          throw new Error('Impossible de créer l\'épisode en base');
        }
      }
      
      // Marquer comme visionné dans la base de données
      await databaseService.markEpisodeAsWatched(episodeId);
      
      // Mettre à jour l'état local
      setWatchedEpisodes(prev => {
        if (!prev.includes(episodeId)) {
          const newList = [...prev, episodeId];
          console.log('📊 Liste mise à jour:', newList);
          return newList;
        }
        return prev;
      });
      
      console.log('✅ Épisode marqué comme vu avec succès');
    } catch (error) {
      console.error('❌ Erreur lors du marquage:', error);
      throw error;
    }
  }, [ensureEpisodeExists]);

  // Démarquer un épisode comme visionné
  const unmarkAsWatched = useCallback(async (episodeId: string): Promise<void> => {
    try {
      console.log('🎬 Démarquage épisode:', episodeId);
      
      // Supprimer de la base de données
      await databaseService.unmarkEpisodeAsWatched(episodeId);
      
      // Mettre à jour l'état local
      setWatchedEpisodes(prev => {
        const newList = prev.filter(id => id !== episodeId);
        console.log('📊 Liste après suppression:', newList);
        return newList;
      });
      
      console.log('✅ Épisode démarqué avec succès');
    } catch (error) {
      console.error('❌ Erreur lors du démarquage:', error);
      throw error;
    }
  }, []);

  // Vérifier si un épisode est visionné (version synchrone)
  const isWatchedSync = useCallback((episodeId: string): boolean => {
    return watchedEpisodes.includes(episodeId);
  }, [watchedEpisodes]);

  // Vérifier si un épisode est visionné (version asynchrone)
  const isWatched = useCallback(async (episodeId: string): Promise<boolean> => {
    try {
      return await databaseService.isEpisodeWatched(episodeId);
    } catch (error) {
      console.error('❌ Erreur lors de la vérification:', error);
      return false;
    }
  }, []);

  // Toggle l'état d'un épisode
  const toggleWatched = useCallback(async (
    episodeId: string, 
    episodeData?: {
      animeId: string;
      number: number;
      title?: string;
    }
  ): Promise<boolean> => {
    const currentlyWatched = isWatchedSync(episodeId);
    
    console.log('🔄 Toggle épisode:', episodeId, 'Actuellement:', currentlyWatched);
    
    if (currentlyWatched) {
      await unmarkAsWatched(episodeId);
      return false;
    } else {
      await markAsWatched(episodeId, episodeData);
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
    refreshWatchedEpisodes,
    ensureEpisodeExists
  };
};