// Fonction pour formater une date
export function formatDate(dateString?: string): string {
    if (!dateString) return 'Date inconnue';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return 'Date invalide';
    }
  }
  
  // Fonction pour formater une durée en minutes
  export function formatDuration(minutes?: number): string {
    if (!minutes) return 'Durée inconnue';
    
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} h`;
    }
    
    return `${hours} h ${remainingMinutes} min`;
  }
  
  // Fonction pour tronquer un texte avec des points de suspension
  export function truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength) + '...';
  }
  
  // Fonction pour capitaliser la première lettre d'une chaîne
  export function capitalize(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
  
  // Fonction pour formater le statut d'un anime
  export function formatStatus(status?: string): string {
    if (!status) return 'Statut inconnu';
    
    switch (status) {
      case 'finished':
        return 'Terminé';
      case 'current':
        return 'En cours';
      case 'tba':
        return 'À venir';
      case 'unreleased':
        return 'Non diffusé';
      case 'upcoming':
        return 'À venir';
      default:
        return capitalize(status);
    }
  }
  
  // Fonction pour formater le statut de collection
  export function formatCollectionStatus(status?: string): string {
    if (!status) return 'Statut inconnu';
    
    switch (status) {
      case 'watching':
        return 'En cours de visionnage';
      case 'completed':
        return 'Terminé';
      case 'planned':
        return 'Planifié';
      case 'dropped':
        return 'Abandonné';
      case 'on_hold':
        return 'En pause';
      default:
        return capitalize(status);
    }
  }
  
  // Fonction pour formater le nombre d'épisodes
  export function formatEpisodeCount(count?: number): string {
    if (!count) return 'Nombre d\'épisodes inconnu';
    return `${count} épisode${count > 1 ? 's' : ''}`;
  }
  
  // Fonction pour formater une note sur 10
  export function formatRating(rating?: number): string {
    if (!rating) return 'Non noté';
    return `${rating.toFixed(1)}/10`;
  }
  
  // Fonction pour obtenir l'année à partir d'une date
  export function getYearFromDate(dateString?: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.getFullYear().toString();
    } catch (error) {
      console.error('Erreur lors de l\'extraction de l\'année:', error);
      return '';
    }
  }
  
  // Fonction pour formater la période d'un anime (Date début - Date fin)
  export function formatAnimePeriod(startDate?: string, endDate?: string): string {
    const start = getYearFromDate(startDate);
    const end = getYearFromDate(endDate);
    
    if (!start && !end) return '';
    if (start && !end) return start;
    if (!start && end) return `? - ${end}`;
    if (start === end) return start;
    
    return `${start} - ${end}`;
  }