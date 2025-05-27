import { useCallback } from 'react';
import { saveAnime, saveEpisode, getAnimeById, getEpisodesByAnimeId, generateId } from '../services/databaseService';

// Hook pour gérer le stockage local des animes et des épisodes
export function useLocalAnimeData() {
  const saveAnimeAndEpisodes = useCallback(async (animeData: any, episodesData: any[]) => {
    try {
      console.log('Début de la sauvegarde locale des données...');
      
      // Convertir l'anime pour la base de données locale
      const anime = {
        id: generateId(),
        kitsu_id: animeData.id,
        title: animeData.canonicalTitle || animeData.title,
        original_title: animeData.titles?.ja_jp || animeData.titles?.en_jp,
        synopsis: animeData.synopsis,
        poster_image: animeData.posterImage?.medium,
        cover_image: animeData.coverImage?.large,
        episode_count: animeData.episodeCount,
        status: animeData.status,
        start_date: animeData.startDate,
        end_date: animeData.endDate,
        age_rating: animeData.ageRating
      };
      
      console.log('Anime à sauvegarder:', anime);
      
      const animeId = await saveAnime(anime);
      console.log('Anime sauvegardé avec ID:', animeId);
      
      // Convertir et sauvegarder les épisodes
      for (let i = 0; i < episodesData.length; i++) {
        const episodeData = episodesData[i];
        const episode = {
          id: generateId(),
          anime_id: animeId,
          kitsu_id: episodeData.id,
          number: episodeData.number || (i + 1),
          title: episodeData.canonicalTitle || episodeData.title,
          synopsis: episodeData.synopsis,
          air_date: episodeData.airdate,
          thumbnail: episodeData.thumbnail?.original,
          length: episodeData.length
        };
        
        await saveEpisode(episode);
        console.log(`Épisode ${episode.number} sauvegardé`);
      }
      
      console.log('Sauvegarde locale terminée avec succès');
      return animeId;
    } catch (err) {
      console.error('Erreur lors de la sauvegarde locale des données:', err);
      throw err;
    }
  }, []);

  const getLocalAnime = useCallback(async (animeId: string) => {
    try {
      return await getAnimeById(animeId);
    } catch (err) {
      console.error(`Erreur lors de la récupération locale de l'anime ${animeId}:`, err);
      return null;
    }
  }, []);

  const getLocalEpisodes = useCallback(async (animeId: string) => {
    try {
      return await getEpisodesByAnimeId(animeId);
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