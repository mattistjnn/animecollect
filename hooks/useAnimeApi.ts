import { useState, useEffect, useCallback } from 'react';
import * as apiService from '@/services/apiService';
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

  const fetchAnime = useCallback(async () => {
    if (!animeId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.getAnimeById(animeId);
      setAnime({
        id: response.data.id,
        type: response.data.type,
        ...response.data.attributes
      });
    } catch (err) {
      setError('Erreur lors de la récupération des détails');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [animeId]);

  const fetchEpisodes = useCallback(async () => {
    if (!animeId) return;
    
    setIsLoadingEpisodes(true);

    try {
      const response = await apiService.getAnimeEpisodes(animeId);
      const episodesList = response.data.map(episode => ({
        id: episode.id,
        type: episode.type,
        ...episode.attributes
      }));
      setEpisodes(episodesList);
    } catch (err) {
      console.error(err);
      // Ne pas définir d'erreur globale pour les épisodes
    } finally {
      setIsLoadingEpisodes(false);
    }
  }, [animeId]);

  useEffect(() => {
    if (animeId) {
      fetchAnime();
      fetchEpisodes();
    }
  }, [animeId, fetchAnime, fetchEpisodes]);

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
      const response = await apiService.getEpisodeById(episodeId);
      setEpisode({
        id: response.data.id,
        type: response.data.type,
        ...response.data.attributes
      });
    } catch (err) {
      setError('Erreur lors de la récupération des détails de l\'épisode');
      console.error(err);
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