import * as SQLite from 'expo-sqlite';

// Variable pour stocker la base de données
let db: SQLite.SQLiteDatabase | null = null;

// Initialiser la connexion à la base de données
const initDB = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!db) {
    try {
      db = await SQLite.openDatabaseAsync('anime_collect.db');
      console.log('Base de données ouverte avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'ouverture de la base de données:', error);
      throw error;
    }
  }
  return db;
};

// Fonction principale pour initialiser la base de données et créer les tables
export const initDatabase = async (): Promise<boolean> => {
  try {
    console.log('Début de l\'initialisation de la base de données...');
    const database = await initDB();
    
    // Créer les tables
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS animes (
        id TEXT PRIMARY KEY,
        kitsu_id TEXT,
        title TEXT NOT NULL,
        original_title TEXT,
        synopsis TEXT,
        poster_image TEXT,
        cover_image TEXT,
        episode_count INTEGER,
        status TEXT,
        start_date TEXT,
        end_date TEXT,
        age_rating TEXT
      );
    `);
    
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS episodes (
        id TEXT PRIMARY KEY,
        anime_id TEXT NOT NULL,
        kitsu_id TEXT,
        number INTEGER NOT NULL,
        title TEXT,
        synopsis TEXT,
        air_date TEXT,
        thumbnail TEXT,
        length INTEGER,
        FOREIGN KEY (anime_id) REFERENCES animes (id) ON DELETE CASCADE
      );
    `);
    
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS user_collection (
        id TEXT PRIMARY KEY,
        anime_id TEXT UNIQUE,
        status TEXT DEFAULT 'planned',
        progress INTEGER DEFAULT 0,
        start_date TEXT,
        finish_date TEXT,
        rating INTEGER,
        notes TEXT,
        FOREIGN KEY (anime_id) REFERENCES animes (id) ON DELETE CASCADE
      );
    `);
    
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS watched_episodes (
        id TEXT PRIMARY KEY,
        episode_id TEXT UNIQUE,
        watched_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (episode_id) REFERENCES episodes (id) ON DELETE CASCADE
      );
    `);
    
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS watchlist (
        id TEXT PRIMARY KEY,
        episode_id TEXT UNIQUE,
        added_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (episode_id) REFERENCES episodes (id) ON DELETE CASCADE
      );
    `);
    
    console.log('Base de données initialisée avec succès');
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  }
};

// Fonction pour générer des IDs uniques
export const generateId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  const randomNum = Math.floor(Math.random() * 1000).toString();
  return `${timestamp}-${randomPart}-${randomNum}`;
};

// Fonctions pour les animes
export const saveAnime = async (anime: any): Promise<string> => {
  try {
    const database = await initDB();
    
    // Vérifier si l'anime existe déjà
    const existing = await database.getFirstAsync(
      'SELECT * FROM animes WHERE kitsu_id = ?',
      [anime.kitsu_id]
    ) as any;
    
    if (existing) {
      // Mise à jour
      await database.runAsync(
        `UPDATE animes SET 
          title = ?, 
          original_title = ?, 
          synopsis = ?, 
          poster_image = ?, 
          cover_image = ?, 
          episode_count = ?, 
          status = ?, 
          start_date = ?, 
          end_date = ?, 
          age_rating = ? 
         WHERE id = ?`,
        [
          anime.title, 
          anime.original_title, 
          anime.synopsis, 
          anime.poster_image, 
          anime.cover_image, 
          anime.episode_count, 
          anime.status, 
          anime.start_date, 
          anime.end_date, 
          anime.age_rating, 
          existing.id
        ]
      );
      return existing.id;
    } else {
      // Insertion
      const animeId = anime.id || generateId();
      await database.runAsync(
        `INSERT INTO animes (
          id, kitsu_id, title, original_title, synopsis, 
          poster_image, cover_image, episode_count, status, 
          start_date, end_date, age_rating
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          animeId, 
          anime.kitsu_id, 
          anime.title, 
          anime.original_title, 
          anime.synopsis, 
          anime.poster_image, 
          anime.cover_image, 
          anime.episode_count, 
          anime.status, 
          anime.start_date, 
          anime.end_date, 
          anime.age_rating
        ]
      );
      return animeId;
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'anime:', error);
    throw error;
  }
};

export const getAnimeById = async (id: string): Promise<any> => {
  try {
    const database = await initDB();
    const result = await database.getFirstAsync(
      'SELECT * FROM animes WHERE id = ?',
      [id]
    );
    return result || null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'anime:', error);
    throw error;
  }
};

// Fonctions pour les épisodes
export const saveEpisode = async (episode: any): Promise<string> => {
  try {
    const database = await initDB();
    
    // Vérifier si l'épisode existe déjà
    const existing = await database.getFirstAsync(
      'SELECT * FROM episodes WHERE anime_id = ? AND number = ?',
      [episode.anime_id, episode.number]
    ) as any;
    
    if (existing) {
      // Mise à jour
      await database.runAsync(
        `UPDATE episodes SET 
          title = ?, 
          synopsis = ?, 
          air_date = ?, 
          thumbnail = ?, 
          length = ? 
         WHERE id = ?`,
        [
          episode.title, 
          episode.synopsis, 
          episode.air_date, 
          episode.thumbnail, 
          episode.length, 
          existing.id
        ]
      );
      return existing.id;
    } else {
      // Insertion
      const episodeId = episode.id || generateId();
      await database.runAsync(
        `INSERT INTO episodes (
          id, anime_id, kitsu_id, number, title, 
          synopsis, air_date, thumbnail, length
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          episodeId, 
          episode.anime_id, 
          episode.kitsu_id, 
          episode.number, 
          episode.title, 
          episode.synopsis, 
          episode.air_date, 
          episode.thumbnail, 
          episode.length
        ]
      );
      return episodeId;
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'épisode:', error);
    throw error;
  }
};

export const getEpisodesByAnimeId = async (animeId: string): Promise<any[]> => {
  try {
    const database = await initDB();
    const results = await database.getAllAsync(
      'SELECT * FROM episodes WHERE anime_id = ? ORDER BY number',
      [animeId]
    );
    return results || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des épisodes:', error);
    throw error;
  }
};

export const getEpisodeById = async (id: string): Promise<any> => {
  try {
    const database = await initDB();
    const result = await database.getFirstAsync(
      'SELECT * FROM episodes WHERE id = ?',
      [id]
    );
    return result || null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'épisode:', error);
    throw error;
  }
};

// Fonctions pour les épisodes visionnés
export const markEpisodeAsWatched = async (episodeId: string): Promise<void> => {
  try {
    const database = await initDB();
    
    // Vérifier si déjà marqué comme visionné
    const existing = await database.getFirstAsync(
      'SELECT * FROM watched_episodes WHERE episode_id = ?',
      [episodeId]
    );
    
    if (!existing) {
      const id = generateId();
      await database.runAsync(
        'INSERT INTO watched_episodes (id, episode_id) VALUES (?, ?)',
        [id, episodeId]
      );
      
      // Mettre à jour la progression dans la collection
      await updateCollectionProgress(episodeId);
    }
  } catch (error) {
    console.error('Erreur lors du marquage de l\'épisode comme visionné:', error);
    throw error;
  }
};

export const unmarkEpisodeAsWatched = async (episodeId: string): Promise<void> => {
  try {
    const database = await initDB();
    await database.runAsync(
      'DELETE FROM watched_episodes WHERE episode_id = ?',
      [episodeId]
    );
  } catch (error) {
    console.error('Erreur lors du démarquage de l\'épisode:', error);
    throw error;
  }
};

export const isEpisodeWatched = async (episodeId: string): Promise<boolean> => {
  try {
    const database = await initDB();
    const result = await database.getFirstAsync(
      'SELECT * FROM watched_episodes WHERE episode_id = ?',
      [episodeId]
    );
    return !!result;
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'épisode visionné:', error);
    return false;
  }
};

export const getWatchedEpisodes = async (animeId: string): Promise<string[]> => {
  try {
    const database = await initDB();
    const results = await database.getAllAsync(
      `SELECT we.episode_id 
       FROM watched_episodes we
       JOIN episodes e ON we.episode_id = e.id
       WHERE e.anime_id = ?`,
      [animeId]
    ) as any[];
    return results.map((row: any) => row.episode_id) || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des épisodes visionnés:', error);
    return [];
  }
};

// Fonctions pour la liste à regarder (watchlist)
export const addEpisodeToWatchlist = async (episodeId: string): Promise<void> => {
  try {
    const database = await initDB();
    
    // Vérifier si déjà dans la liste
    const existing = await database.getFirstAsync(
      'SELECT * FROM watchlist WHERE episode_id = ?',
      [episodeId]
    );
    
    if (!existing) {
      const id = generateId();
      await database.runAsync(
        'INSERT INTO watchlist (id, episode_id) VALUES (?, ?)',
        [id, episodeId]
      );
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout à la liste à regarder:', error);
    throw error;
  }
};

export const removeEpisodeFromWatchlist = async (episodeId: string): Promise<void> => {
  try {
    const database = await initDB();
    await database.runAsync(
      'DELETE FROM watchlist WHERE episode_id = ?',
      [episodeId]
    );
  } catch (error) {
    console.error('Erreur lors de la suppression de la liste à regarder:', error);
    throw error;
  }
};

export const isEpisodeInWatchlist = async (episodeId: string): Promise<boolean> => {
  try {
    const database = await initDB();
    const result = await database.getFirstAsync(
      'SELECT * FROM watchlist WHERE episode_id = ?',
      [episodeId]
    );
    return !!result;
  } catch (error) {
    console.error('Erreur lors de la vérification de la liste à regarder:', error);
    return false;
  }
};

export const getWatchlist = async (): Promise<any[]> => {
  try {
    const database = await initDB();
    const results = await database.getAllAsync(
      `SELECT w.id as watchlist_id, w.episode_id, w.added_at,
              e.id as episode_id, e.number, e.title as episode_title, e.thumbnail, e.air_date,
              a.id as anime_id, a.title as anime_title, a.poster_image
       FROM watchlist w
       JOIN episodes e ON w.episode_id = e.id
       JOIN animes a ON e.anime_id = a.id
       ORDER BY w.added_at DESC`
    ) as any[];
    
    return results.map((item: any) => ({
      watchlist: {
        id: item.watchlist_id,
        added_at: item.added_at
      },
      episode: {
        id: item.episode_id,
        number: item.number,
        title: item.episode_title,
        thumbnail: item.thumbnail,
        airDate: item.air_date
      },
      anime: {
        id: item.anime_id,
        title: item.anime_title,
        posterImage: item.poster_image
      }
    })) || [];
  } catch (error) {
    console.error('Erreur lors de la récupération de la liste à regarder:', error);
    return [];
  }
};

// Fonctions pour la collection
export const addAnimeToCollection = async (animeId: string, status: string = 'planned'): Promise<string> => {
  try {
    const database = await initDB();
    
    // Vérifier si déjà dans la collection
    const existing = await database.getFirstAsync(
      'SELECT * FROM user_collection WHERE anime_id = ?',
      [animeId]
    ) as any;
    
    if (existing) {
      // Mise à jour
      await database.runAsync(
        'UPDATE user_collection SET status = ? WHERE id = ?',
        [status, existing.id]
      );
      return existing.id;
    } else {
      // Insertion
      const id = generateId();
      const startDate = status === 'watching' ? new Date().toISOString() : null;
      await database.runAsync(
        'INSERT INTO user_collection (id, anime_id, status, start_date) VALUES (?, ?, ?, ?)',
        [id, animeId, status, startDate]
      );
      return id;
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout à la collection:', error);
    throw error;
  }
};

export const updateAnimeInCollection = async (collectionId: string, updates: any): Promise<void> => {
  try {
    const database = await initDB();
    
    if (updates.status) {
      await database.runAsync(
        'UPDATE user_collection SET status = ? WHERE id = ?',
        [updates.status, collectionId]
      );
    }
    
    if (updates.progress !== undefined) {
      await database.runAsync(
        'UPDATE user_collection SET progress = ? WHERE id = ?',
        [updates.progress, collectionId]
      );
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la collection:', error);
    throw error;
  }
};

export const getUserCollection = async (): Promise<any[]> => {
  try {
    const database = await initDB();
    const results = await database.getAllAsync(
      `SELECT c.id as collection_id, c.status, c.progress, c.start_date, c.finish_date, c.rating, c.notes,
              a.id as anime_id, a.kitsu_id, a.title, a.poster_image, a.episode_count, a.status as anime_status
       FROM user_collection c
       JOIN animes a ON c.anime_id = a.id
       ORDER BY c.id DESC`
    ) as any[];
    
    return results.map((item: any) => ({
      collection: {
        id: item.collection_id,
        status: item.status,
        progress: item.progress,
        startDate: item.start_date,
        finishDate: item.finish_date,
        rating: item.rating,
        notes: item.notes
      },
      anime: {
        id: item.anime_id,
        kitsuId: item.kitsu_id,
        title: item.title,
        posterImage: item.poster_image,
        episodeCount: item.episode_count,
        status: item.anime_status
      }
    })) || [];
  } catch (error) {
    console.error('Erreur lors de la récupération de la collection:', error);
    return [];
  }
};

export const getUserCollectionItem = async (animeId: string): Promise<any> => {
  try {
    const database = await initDB();
    const result = await database.getFirstAsync(
      'SELECT * FROM user_collection WHERE anime_id = ?',
      [animeId]
    );
    return result || null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'item de collection:', error);
    return null;
  }
};

export const removeFromCollection = async (collectionId: string): Promise<void> => {
  try {
    const database = await initDB();
    await database.runAsync(
      'DELETE FROM user_collection WHERE id = ?',
      [collectionId]
    );
  } catch (error) {
    console.error('Erreur lors de la suppression de la collection:', error);
    throw error;
  }
};

const updateCollectionProgress = async (episodeId: string): Promise<void> => {
  try {
    const database = await initDB();
    
    // Obtenir l'anime_id de l'épisode
    const episode = await database.getFirstAsync(
      'SELECT anime_id FROM episodes WHERE id = ?',
      [episodeId]
    ) as any;
    
    if (episode) {
      // Compter les épisodes visionnés pour cet anime
      const watchedCount = await database.getFirstAsync(
        `SELECT COUNT(*) as count 
         FROM watched_episodes we
         JOIN episodes e ON we.episode_id = e.id
         WHERE e.anime_id = ?`,
        [episode.anime_id]
      ) as any;
      
      // Mettre à jour ou créer l'entrée de collection
      const existing = await database.getFirstAsync(
        'SELECT * FROM user_collection WHERE anime_id = ?',
        [episode.anime_id]
      ) as any;
      
      if (existing) {
        await database.runAsync(
          'UPDATE user_collection SET progress = ? WHERE id = ?',
          [watchedCount.count, existing.id]
        );
      } else {
        // Ajouter automatiquement à la collection
        await addAnimeToCollection(episode.anime_id, 'watching');
        await database.runAsync(
          'UPDATE user_collection SET progress = ? WHERE anime_id = ?',
          [watchedCount.count, episode.anime_id]
        );
      }
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la progression:', error);
  }
};