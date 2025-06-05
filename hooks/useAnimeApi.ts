import { useState, useEffect, useCallback } from 'react';
import * as apiService from '@/services/apiService';
import * as databaseService from '@/services/databaseService';
import { validateSearchQuery } from '@/services/securityService';

export function useAnimeSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const searchAnime = useCallback(async (searchQuery: string, pageNum = 1) => {
    if (!validateSearchQuery(searchQuery)) {
      setError('Requête de recherche invalide');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.searchAnime(searchQuery, pageNum);
      
      const animes = response.data.map(anime => ({
        id: anime.id,
        type: anime.type,
        ...anime.attributes
      }));
      
      if (pageNum === 1) {
        setResults(animes);
      } else {
        setResults(prevResults => [...prevResults, ...animes]);
      }
      
      setHasNextPage(!!response.links?.next);
      setPage(pageNum);
    } catch (err) {
      setError('Erreur lors de la recherche');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isLoading) {
      searchAnime(query, page + 1);
    }
  }, [hasNextPage, isLoading, query, page, searchAnime]);

  // Effectue la recherche lorsque la requête change
  useEffect(() => {
    if (query) {
      searchAnime(query);
    } else {
      setResults([]);
    }
  }, [query, searchAnime]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    hasNextPage,
    loadMore
  };
}

export function useTrendingAnime() {
  const [trending, setTrending] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrending = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.getTrendingAnime();
      const animes = response.data.map(anime => ({
        id: anime.id,
        type: anime.type,
        ...anime.attributes
      }));
      setTrending(animes);
    } catch (err) {
      setError('Erreur lors de la récupération des tendances');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  return {
    trending,
    isLoading,
    error,
    refresh: fetchTrending
  };
}

export function useAnimeDetails(animeId: string) {
  const [anime, setAnime] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocalData, setIsLocalData] = useState(false);

  const fetchAnime = useCallback(async () => {
    if (!animeId) return;
    
    setIsLoading(true);
    setError(null);
    setIsLocalData(false);

    try {
      console.log('🔍 Tentative de récupération via API pour:', animeId);
      
      // Essayer d'abord l'API
      const response = await apiService.getAnimeById(animeId);
      setAnime({
        id: response.data.id,
        type: response.data.type,
        ...response.data.attributes
      });
      
      console.log('✅ Anime récupéré via API');
      
    } catch (apiError) {
      console.log('❌ Erreur API, tentative de récupération locale...');
      
      try {
        // Si l'API échoue, essayer de récupérer depuis la base locale
        const localAnime = await databaseService.getAnimeById(animeId);
        
        if (localAnime) {
          console.log('✅ Anime trouvé localement:', localAnime.title);
          
          // Convertir les données locales au format API
          setAnime({
            canonicalTitle: localAnime.title,
            titles: {
              ja_jp: localAnime.original_title
            },
            synopsis: localAnime.synopsis,
            posterImage: localAnime.poster_image ? { medium: localAnime.poster_image } : null,
            coverImage: localAnime.cover_image ? { large: localAnime.cover_image } : null,
            episodeCount: localAnime.episode_count,
            status: localAnime.status,
            startDate: localAnime.start_date,
            endDate: localAnime.end_date,
            ageRating: localAnime.age_rating
          });
          
          setIsLocalData(true);
        } else {
          throw new Error('Anime non trouvé');
        }
        
      } catch (localError) {
        console.error('❌ Erreur lors de la récupération locale:', localError);
        setError('Anime non trouvé');
      }
    } finally {
      setIsLoading(false);
    }
  }, [animeId]);

  const fetchEpisodes = useCallback(async () => {
    if (!animeId) return;
    
    setIsLoadingEpisodes(true);

    try {
      console.log('🔍 Tentative de récupération des épisodes...');
      
      // Si on utilise des données locales, récupérer les épisodes localement
      if (isLocalData) {
        console.log('📁 Récupération des épisodes depuis la base locale...');
        
        const localEpisodes = await databaseService.getEpisodesByAnimeId(animeId);
        const convertedEpisodes = localEpisodes.map(ep => ({
          id: ep.id,
          number: ep.number,
          canonicalTitle: ep.title,
          synopsis: ep.synopsis,
          airdate: ep.air_date,
          thumbnail: ep.thumbnail ? { original: ep.thumbnail } : null,
          length: ep.length
        }));
        
        setEpisodes(convertedEpisodes);
        console.log(`✅ ${convertedEpisodes.length} épisodes récupérés localement`);
        
      } else {
        // Sinon, essayer l'API
        console.log('🌐 Récupération des épisodes via API...');
        
        try {
          const response = await apiService.getAnimeEpisodes(animeId);
          const episodesList = response.data.map(episode => ({
            id: episode.id,
            type: episode.type,
            ...episode.attributes
          }));
          setEpisodes(episodesList);
          console.log(`✅ ${episodesList.length} épisodes récupérés via API`);
          
        } catch (apiError) {
          console.log('❌ Erreur API pour les épisodes, tentative locale...');
          
          // Fallback vers les données locales
          const localEpisodes = await databaseService.getEpisodesByAnimeId(animeId);
          const convertedEpisodes = localEpisodes.map(ep => ({
            id: ep.id,
            number: ep.number,
            canonicalTitle: ep.title,
            synopsis: ep.synopsis,
            airdate: ep.air_date,
            thumbnail: ep.thumbnail ? { original: ep.thumbnail } : null,
            length: ep.length
          }));
          
          setEpisodes(convertedEpisodes);
          console.log(`✅ ${convertedEpisodes.length} épisodes récupérés localement (fallback)`);
        }
      }
      
    } catch (err) {
      console.error('❌ Erreur lors de la récupération des épisodes:', err);
      // Ne pas définir d'erreur globale pour les épisodes, juste les laisser vides
      setEpisodes([]);
    } finally {
      setIsLoadingEpisodes(false);
    }
  }, [animeId, isLocalData]);

  useEffect(() => {
    if (animeId) {
      fetchAnime();
    }
  }, [animeId, fetchAnime]);

  // Récupérer les épisodes après avoir déterminé si on utilise des données locales
  useEffect(() => {
    if (animeId && (anime || isLocalData !== undefined)) {
      fetchEpisodes();
    }
  }, [animeId, anime, isLocalData, fetchEpisodes]);

  return {
    anime,
    episodes,
    isLoading,
    isLoadingEpisodes,
    error,
    refresh: fetchAnime,
    refreshEpisodes: fetchEpisodes
  };
}

export function useEpisodeDetails(episodeId: string) {
  const [episode, setEpisode] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEpisode = useCallback(async () => {
    if (!episodeId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Essayer d'abord l'API
      const response = await apiService.getEpisodeById(episodeId);
      setEpisode({
        id: response.data.id,
        type: response.data.type,
        ...response.data.attributes
      });
    } catch (apiError) {
      // Si l'API échoue, essayer la base locale
      try {
        const localEpisode = await databaseService.getEpisodeById(episodeId);
        if (localEpisode) {
          setEpisode({
            id: localEpisode.id,
            number: localEpisode.number,
            canonicalTitle: localEpisode.title,
            synopsis: localEpisode.synopsis,
            airdate: localEpisode.air_date,
            thumbnail: localEpisode.thumbnail ? { original: localEpisode.thumbnail } : null,
            length: localEpisode.length
          });
        } else {
          throw new Error('Épisode non trouvé');
        }
      } catch (localError) {
        setError('Erreur lors de la récupération des détails de l\'épisode');
        console.error(localError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [episodeId]);

  useEffect(() => {
    if (episodeId) {
      fetchEpisode();
    }
  }, [episodeId, fetchEpisode]);

  return {
    episode,
    isLoading,
    error,
    refresh: fetchEpisode
  };
}