import { generateId } from "./databaseService";
import { secureRequest } from "./securityService";

// URL de base de l'API Kitsu
const BASE_URL = "https://kitsu.io/api/edge";

// Types pour les réponses de l'API
export interface AnimeResponse {
  data: Array<{
    id: string;
    type: string;
    attributes: {
      canonicalTitle: string;
      titles: {
        en?: string;
        en_jp?: string;
        ja_jp?: string;
      };
      synopsis: string;
      posterImage: {
        tiny: string;
        small: string;
        medium: string;
        large: string;
        original: string;
      };
      coverImage: {
        tiny: string;
        small: string;
        large: string;
        original: string;
      } | null;
      episodeCount: number | null;
      status: string;
      startDate: string | null;
      endDate: string | null;
      ageRating: string | null;
      ageRatingGuide: string | null;
    };
  }>;
  meta: {
    count: number;
  };
  links?: {
    next?: string;
    last?: string;
  };
}

export interface EpisodeResponse {
  data: Array<{
    id: string;
    type: string;
    attributes: {
      seasonNumber: number;
      number: number;
      titles: {
        en_jp?: string;
        en_us?: string;
        ja_jp?: string;
      };
      canonicalTitle: string;
      synopsis: string;
      airdate: string | null;
      length: number | null;
      thumbnail: {
        original: string;
        meta: {
          dimensions: {
            small: { width: number; height: number };
            medium: { width: number; height: number };
            large: { width: number; height: number };
          };
        };
      } | null;
    };
  }>;
  meta: {
    count: number;
  };
  links?: {
    next?: string;
    last?: string;
  };
}

// Fonctions d'API
export async function searchAnime(query: string, page = 1, limit = 20): Promise<AnimeResponse> {
  try {
    const url = `${BASE_URL}/anime?filter[text]=${encodeURIComponent(query)}&page[limit]=${limit}&page[offset]=${(page - 1) * limit}&include=categories`;
    const response = await secureRequest(url);
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la recherche d'anime:", error);
    throw error;
  }
}

export async function getAnimeById(id: string): Promise<any> {
  try {
    const url = `${BASE_URL}/anime/${id}`;
    const response = await secureRequest(url);
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'anime ${id}:`, error);
    throw error;
  }
}

export async function getAnimeEpisodes(animeId: string, page = 1, limit = 20): Promise<EpisodeResponse> {
  try {
    const url = `${BASE_URL}/anime/${animeId}/episodes?page[limit]=${limit}&page[offset]=${(page - 1) * limit}&sort=number`;
    const response = await secureRequest(url);
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erreur lors de la récupération des épisodes pour l'anime ${animeId}:`, error);
    throw error;
  }
}

export async function getEpisodeById(id: string): Promise<any> {
  try {
    const url = `${BASE_URL}/episodes/${id}`;
    const response = await secureRequest(url);
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'épisode ${id}:`, error);
    throw error;
  }
}

export async function getTrendingAnime(limit = 10): Promise<AnimeResponse> {
  try {
    const url = `${BASE_URL}/trending/anime?limit=${limit}`;
    const response = await secureRequest(url);
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des animes tendance:", error);
    throw error;
  }
}

// Fonctions pour convertir les données de l'API en format pour notre base de données
export function convertKitsuAnimeToDbAnime(kitsuAnime: any) {
  const { id, attributes } = kitsuAnime;
  
  return {
    id: generateId(),
    kitsuId: id,
    title: attributes.canonicalTitle,
    originalTitle: attributes.titles.ja_jp || attributes.titles.en_jp,
    synopsis: attributes.synopsis,
    posterImage: attributes.posterImage?.medium,
    coverImage: attributes.coverImage?.large,
    episodeCount: attributes.episodeCount,
    status: attributes.status,
    startDate: attributes.startDate,
    endDate: attributes.endDate,
    ageRating: attributes.ageRating
  };
}

export function convertKitsuEpisodeToDbEpisode(kitsuEpisode: any, animeId: string) {
  const { id, attributes } = kitsuEpisode;
  
  return {
    id: generateId(),
    animeId,
    kitsuId: id,
    number: attributes.number,
    title: attributes.canonicalTitle,
    synopsis: attributes.synopsis,
    airDate: attributes.airdate,
    thumbnail: attributes.thumbnail?.original,
    length: attributes.length
  };
}