// Valider une URL
export function isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  // Valider si une chaîne est vide ou contient uniquement des espaces
  export function isEmptyString(text: string): boolean {
    return !text || text.trim() === '';
  }
  
  // Valider un numéro d'épisode (doit être un nombre positif)
  export function isValidEpisodeNumber(number: any): boolean {
    const parsedNumber = parseInt(number, 10);
    return !isNaN(parsedNumber) && parsedNumber > 0;
  }
  
  // Valider un identifiant (ne doit pas être vide)
  export function isValidId(id: string): boolean {
    return !isEmptyString(id);
  }
  
  // Valider une requête de recherche (longueur minimale)
  export function isValidSearchQuery(query: string, minLength = 2): boolean {
    return query && query.trim().length >= minLength;
  }
  
  // Valider une note (doit être entre 1 et 10)
  export function isValidRating(rating: number): boolean {
    return !isNaN(rating) && rating >= 1 && rating <= 10;
  }
  
  // Valider un statut de collection
  export function isValidCollectionStatus(status: string): boolean {
    const validStatuses = ['watching', 'completed', 'planned', 'dropped', 'on_hold'];
    return validStatuses.includes(status);
  }
  
  // Valider le format d'une date (ISO 8601)
  export function isValidISODate(dateString: string): boolean {
    try {
      const date = new Date(dateString);
      return !isNaN(date.getTime());
    } catch (e) {
      return false;
    }
  }
  
  // Valider si deux dates sont cohérentes (début avant fin)
  export function areValidDateRange(startDate: string, endDate: string): boolean {
    if (!isValidISODate(startDate) || !isValidISODate(endDate)) {
      return false;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return start <= end;
  }
  
  // Valider la progression d'une série (ne doit pas dépasser le nombre total d'épisodes)
  export function isValidProgress(progress: number, totalEpisodes: number): boolean {
    return progress >= 0 && progress <= totalEpisodes;
  }
  
  // Valider que les données d'un anime sont complètes pour l'affichage
  export function isValidAnimeData(anime: any): boolean {
    return (
      anime &&
      anime.id &&
      anime.title
    );
  }
  
  // Valider que les données d'un épisode sont complètes pour l'affichage
  export function isValidEpisodeData(episode: any): boolean {
    return (
      episode &&
      episode.id &&
      episode.animeId &&
      isValidEpisodeNumber(episode.number)
    );
  }