// Fonctions pour sécuriser les communications avec l'API

// Fonction pour valider une URL
export function validateUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      // Vérifie que l'URL est bien pour l'API Kitsu
      return parsedUrl.hostname === 'kitsu.io';
    } catch (e) {
      return false;
    }
  }
  
  // Fonction pour sanitiser les entrées de l'utilisateur
  export function sanitizeInput(input: string): string {
    if (!input) return '';
    // Supprime les caractères HTML dangereux
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  
  // Fonction pour effectuer une requête HTTP sécurisée
  export async function secureRequest(url: string, options: RequestInit = {}): Promise<Response> {
    // Valide l'URL avant d'effectuer la requête
    if (!validateUrl(url)) {
      throw new Error('URL invalide');
    }
  
    // Ajoute des headers pour protéger contre les attaques CSRF
    const secureOptions: RequestInit = {
      ...options,
      headers: {
        ...options.headers,
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      },
    };
  
    try {
      const response = await fetch(url, secureOptions);
      // Vérifie le Content-Type pour éviter les attaques MIME
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/vnd.api+json')) {
        throw new Error('Type de contenu non sécurisé');
      }
      return response;
    } catch (error) {
      console.error('Erreur de requête sécurisée:', error);
      throw error;
    }
  }
  
  // Fonction pour valider les entrées utilisateur pour la recherche
  export function validateSearchQuery(query: string): boolean {
    // Vérifie que la requête n'est pas vide et n'est pas trop longue
    return query && query.trim().length > 0 && query.length < 100;
  }
  
  // Fonction pour sécuriser les données stockées localement
  export function secureLocalData(data: any): string {
    try {
      // On pourrait implémenter du chiffrement ici pour des données sensibles
      // Pour simplifier, on fait juste une conversion en JSON
      return JSON.stringify(data);
    } catch (error) {
      console.error('Erreur lors de la sécurisation des données:', error);
      throw error;
    }
  }
  
  // Fonction pour analyser les données sécurisées
  export function parseSecureData(data: string): any {
    try {
      // Analyse les données JSON
      return JSON.parse(data);
    } catch (error) {
      console.error('Erreur lors de l\'analyse des données sécurisées:', error);
      throw error;
    }
  }
  
  // Gestion des erreurs
  export function handleSecurityError(error: Error): void {
    // Log l'erreur mais n'expose pas les détails techniques à l'utilisateur
    console.error('Erreur de sécurité:', error);
    // Ici on pourrait implémenter une notification à un service de monitoring
  }