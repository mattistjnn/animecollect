import { useState, useEffect, useCallback } from 'react';
import * as databaseService from '../services/databaseService';
import * as apiService from '../services/apiService';

// Fonction pour générer des IDs uniques (copie locale)
const generateId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  const randomNum = Math.floor(Math.random() * 1000).toString();
  return `${timestamp}-${randomPart}-${randomNum}`;
};

// Hook pour initialiser la base de données
export function useInitDatabase() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('Démarrage de l\'initialisation de la base de données...');
        
        // Vérifier que databaseService existe
        if (!databaseService || !databaseService.initDatabase) {
          throw new Error('Service de base de données non disponible');
        }
        
        await databaseService.initDatabase();
        console.log('Base de données initialisée avec succès dans le hook');
        setIsInitialized(true);
      } catch (err) {
        console.error('Erreur lors de l\'initialisation de la base de données:', err);
        setError(`Erreur lors de l'initialisation de la base de données: ${err.message || err}`);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  return { isInitialized, isLoading, error };
}

// Hook pour gérer la collection de l'utilisateur
export function useUserCollection() {
  const [collection, setCollection] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCollection = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const userCollection = await databaseService.getUserCollection();
      setCollection(userCollection);
    } catch (err) {
      console.error('Erreur lors de la récupération de la collection:', err);
      setError('Erreur lors de la récupération de la collection');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  const addToCollection = useCallback(async (animeData: any, status = 'planned') => {
    try {
      console.log('🎯 Adding to collection - Original data:', animeData);
      
      let animeToSave;
      
      // Vérifier si les données viennent de l'API (avec attributes) ou sont déjà converties
      if (animeData.attributes) {
        // Données de l'API Kitsu
        animeToSave = {
          id: generateId(),
          kitsu_id: animeData.id,
          title: animeData.attributes.canonicalTitle,
          original_title: animeData.attributes.titles?.ja_jp || animeData.attributes.titles?.en_jp,
          synopsis: animeData.attributes.synopsis,
          poster_image: animeData.attributes.posterImage?.medium || animeData.attributes.posterImage?.small || animeData.attributes.posterImage?.large,
          cover_image: animeData.attributes.coverImage?.large || animeData.attributes.coverImage?.medium,
          episode_count: animeData.attributes.episodeCount,
          status: animeData.attributes.status,
          start_date: animeData.attributes.startDate,
          end_date: animeData.attributes.endDate,
          age_rating: animeData.attributes.ageRating
        };
      } else {
        // Données déjà dans le format direct (depuis les tendances par exemple)
        animeToSave = {
          id: generateId(),
          kitsu_id: animeData.id,
          title: animeData.canonicalTitle,
          original_title: animeData.titles?.ja_jp || animeData.titles?.en_jp,
          synopsis: animeData.synopsis,
          poster_image: animeData.posterImage?.medium || animeData.posterImage?.small || animeData.posterImage?.large,
          cover_image: animeData.coverImage?.large || animeData.coverImage?.medium,
          episode_count: animeData.episodeCount,
          status: animeData.status,
          start_date: animeData.startDate,
          end_date: animeData.endDate,
          age_rating: animeData.ageRating
        };
      }
      
      console.log('🎯 Anime to save:', animeToSave);
      
      const animeId = await databaseService.saveAnime(animeToSave);
      console.log('🎯 Saved anime with ID:', animeId);
      
      // Puis l'ajouter à la collection
      await databaseService.addAnimeToCollection(animeId, status);
      
      // Rafraîchir la collection
      fetchCollection();
      
      return true;
    } catch (err) {
      console.error('Erreur lors de l\'ajout à la collection:', err);
      return false;
    }
  }, [fetchCollection]);

  const updateInCollection = useCallback(async (collectionId: string, updates: any) => {
    try {
      await databaseService.updateAnimeInCollection(collectionId, updates);
      fetchCollection();
      return true;
    } catch (err) {
      console.error('Erreur lors de la mise à jour dans la collection:', err);
      return false;
    }
  }, [fetchCollection]);

  const removeFromCollection = useCallback(async (collectionId: string) => {
    try {
      await databaseService.removeFromCollection(collectionId);
      fetchCollection();
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression de la collection:', err);
      return false;
    }
  }, [fetchCollection]);

  return {
    collection,
    isLoading,
    error,
    refresh: fetchCollection,
    addToCollection,
    updateInCollection,
    removeFromCollection
  };
}

// Hook pour gérer les épisodes visionnés
export function useWatchedEpisodes(animeId?: string) {
  const [watchedEpisodes, setWatchedEpisodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWatchedEpisodes = useCallback(async () => {
    if (!animeId) return;
    
    setIsLoading(true);

    try {
      const episodes = await databaseService.getWatchedEpisodes(animeId);
      setWatchedEpisodes(episodes);
    } catch (err) {
      console.error('Erreur lors de la récupération des épisodes visionnés:', err);
    } finally {
      setIsLoading(false);
    }
  }, [animeId]);

  useEffect(() => {
    if (animeId) {
      fetchWatchedEpisodes();
    }
  }, [animeId, fetchWatchedEpisodes]);

  const markAsWatched = useCallback(async (episodeId: string) => {
    try {
      await databaseService.markEpisodeAsWatched(episodeId);
      setWatchedEpisodes(prev => [...prev, episodeId]);
      return true;
    } catch (err) {
      console.error('Erreur lors du marquage de l\'épisode comme visionné:', err);
      return false;
    }
  }, []);

  const unmarkAsWatched = useCallback(async (episodeId: string) => {
    try {
      await databaseService.unmarkEpisodeAsWatched(episodeId);
      setWatchedEpisodes(prev => prev.filter(id => id !== episodeId));
      return true;
    } catch (err) {
      console.error('Erreur lors du démarquage de l\'épisode:', err);
      return false;
    }
  }, []);

  const isWatched = useCallback((episodeId: string) => {
    return watchedEpisodes.includes(episodeId);
  }, [watchedEpisodes]);

  return {
    watchedEpisodes,
    isLoading,
    refresh: fetchWatchedEpisodes,
    markAsWatched,
    unmarkAsWatched,
    isWatched
  };
}

// Hook pour gérer la liste à regarder
export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWatchlist = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const list = await databaseService.getWatchlist();
      setWatchlist(list);
    } catch (err) {
      console.error('Erreur lors de la récupération de la liste à regarder:', err);
      setError('Erreur lors de la récupération de la liste à regarder');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const addToWatchlist = useCallback(async (episodeId: string) => {
    try {
      await databaseService.addEpisodeToWatchlist(episodeId);
      fetchWatchlist();
      return true;
    } catch (err) {
      console.error('Erreur lors de l\'ajout à la liste à regarder:', err);
      return false;
    }
  }, [fetchWatchlist]);

  const removeFromWatchlist = useCallback(async (episodeId: string) => {
    try {
      await databaseService.removeEpisodeFromWatchlist(episodeId);
      fetchWatchlist();
      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression de la liste à regarder:', err);
      return false;
    }
  }, [fetchWatchlist]);

  const isInWatchlist = useCallback(async (episodeId: string) => {
    try {
      return await databaseService.isEpisodeInWatchlist(episodeId);
    } catch (err) {
      console.error('Erreur lors de la vérification de l\'épisode dans la liste à regarder:', err);
      return false;
    }
  }, []);

  return {
    watchlist,
    isLoading,
    error,
    refresh: fetchWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist
  };
}

// Hook pour gérer le stockage local des animes et des épisodes
export function useLocalAnimeData() {
  const saveAnimeAndEpisodes = useCallback(async (animeData: any, episodesData: any[]) => {
    try {
      console.log('Début de la sauvegarde locale des données...');
      console.log('databaseService disponible:', !!databaseService);
      console.log('saveAnime disponible:', !!databaseService.saveAnime);
      
      // Vérifier que les services sont disponibles
      if (!databaseService || !databaseService.saveAnime) {
        throw new Error('Service de base de données non disponible pour saveAnime');
      }
      
      if (!apiService || !apiService.convertKitsuAnimeToDbAnime) {
        throw new Error('Service API non disponible pour convertKitsuAnimeToDbAnime');
      }
      
      // Convertir et sauvegarder l'anime
      const anime = apiService.convertKitsuAnimeToDbAnime(animeData);
      console.log('Anime converti:', anime);
      
      const animeId = await databaseService.saveAnime(anime);
      console.log('Anime sauvegardé avec ID:', animeId);
      
      // Convertir et sauvegarder les épisodes
      for (const episodeData of episodesData) {
        const episode = apiService.convertKitsuEpisodeToDbEpisode(episodeData, animeId);
        await databaseService.saveEpisode(episode);
      }
      
      console.log('Sauvegarde locale terminée avec succès');
      return animeId;
    } catch (err) {
      console.error('Erreur lors de la sauvegarde locale des données:', err);
      console.error('databaseService:', databaseService);
      console.error('apiService:', apiService);
      throw err;
    }
  }, []);

  const getLocalAnime = useCallback(async (animeId: string) => {
    try {
      if (!databaseService || !databaseService.getAnimeById) {
        console.error('getAnimeById non disponible');
        return null;
      }
      return await databaseService.getAnimeById(animeId);
    } catch (err) {
      console.error(`Erreur lors de la récupération locale de l'anime ${animeId}:`, err);
      return null;
    }
  }, []);

  const getLocalEpisodes = useCallback(async (animeId: string) => {
    try {
      if (!databaseService || !databaseService.getEpisodesByAnimeId) {
        console.error('getEpisodesByAnimeId non disponible');
        return [];
      }
      return await databaseService.getEpisodesByAnimeId(animeId);
    } catch (err) {
      console.error(`Erreur lors de la récupération locale des épisodes pour l'anime ${animeId}:`, err);
      return [];
    }
  }, []);

  return {
    saveAnimeAndEpisodes,
    getLocalAnime,
    getLocalEpisodes
  };
}