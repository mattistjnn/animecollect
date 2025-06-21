# AnimeCollect 📱

Une application mobile React Native moderne pour gérer votre collection d'animes, suivre votre progression et découvrir de nouveaux contenus.

## 🎯 Vue d'ensemble

AnimeCollect est une application mobile complète qui permet aux fans d'anime de :

- Découvrir les dernières tendances et nouveautés
- Gérer leur collection personnelle avec différents statuts (en cours, terminé, planifié, abandonné)
- Suivre leur progression épisode par épisode
- Maintenir une liste de visionnage hors ligne
- Rechercher dans une vaste base de données d'animes

## ✨ Fonctionnalités principales

### 🔍 Découverte et recherche

- **Tendances** : Affichage des animes populaires du moment
- **Recherche avancée** : Recherche par titre avec suggestions en temps réel
- **Détails complets** : Informations détaillées sur chaque anime (synopsis, nombre d'épisodes, dates de diffusion)

### 📚 Gestion de collection

- **Statuts multiples** : En cours, terminé, planifié, abandonné
- **Progression automatique** : Suivi du nombre d'épisodes visionnés
- **Statistiques** : Barres de progression et pourcentages d'avancement

### 🎬 Suivi d'épisodes

- **Marquage individuel** : Marquer chaque épisode comme visionné
- **Liste de visionnage** : Garder une liste des épisodes à regarder
- **Détails d'épisodes** : Informations complètes sur chaque épisode

### 📱 Expérience utilisateur

- **Mode sombre/clair** : Interface adaptative selon les préférences système
- **Navigation intuitive** : Architecture d'onglets claire et responsive
- **Performance optimisée** : Chargement rapide et navigation fluide
- **Mode hors ligne** : Accès aux données même sans connexion internet

## 🛠️ Architecture technique

### Technologies utilisées

#### Frontend

- **React Native** `0.76.9` - Framework mobile multiplateforme
- **Expo** `~52.0.46` - Plateforme de développement et déploiement
- **Expo Router** `~4.0.20` - Navigation basée sur le système de fichiers
- **TypeScript** `^5.3.3` - Typage statique pour une meilleure robustesse

#### Style et UI

- **TailwindCSS** via **TWRNC** `^4.5.1` - Framework CSS utilitaire
- **Expo Vector Icons** `^14.0.2` - Icônes vectorielles
- **React Navigation** `^7.0.14` - Navigation native

#### Base de données et état

- **SQLite** via **Expo SQLite** `~15.1.4` - Base de données locale
- **Hooks personnalisés** - Gestion d'état réactive

#### API et réseau

- **Kitsu API** - Base de données d'animes
- **Fetch API** - Requêtes HTTP sécurisées

### Architecture des composants

```
app/
├── (tabs)/                 # Navigation par onglets
│   ├── index.tsx          # Écran des tendances
│   ├── collection.tsx     # Gestion de collection
│   └── search.tsx         # Recherche d'animes
├── anime/[id].tsx         # Détails d'un anime
├── anime/[id]/[episode].tsx # Détails d'un épisode
└── _layout.tsx            # Layout principal

components/
├── AnimeCard.tsx          # Carte d'affichage anime
├── EpisodeCard.tsx        # Carte d'épisode
├── ProgressBar.tsx        # Barre de progression
└── ui/
    └── LoadingIndicator.tsx # Indicateur de chargement

services/
├── apiService.ts          # Interface API Kitsu
├── databaseService.ts     # Gestion SQLite
└── securityService.ts     # Sécurisation des requêtes

hooks/
├── useAnimeApi.ts         # Hooks pour l'API
├── useDataBase.ts         # Hooks pour la base de données
└── useEpisodeDetails.ts   # Gestion des détails d'épisodes
```

## 🚀 Installation et configuration

### Prérequis

- **Node.js** (version 18 ou supérieure)
- **npm** ou **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **Android Studio** (pour l'émulation Android) ou **Xcode** (pour l'émulation iOS)

### Étapes d'installation

1. **Cloner le projet**

   ```bash
   git clone <repository-url>
   cd animecollect
   ```

2. **Installer les dépendances**

   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Lancer l'application**

   ```bash
   npx expo start
   ```

4. **Ouvrir sur un appareil**
   - Scanner le QR code avec l'app Expo Go (mobile)
   - Appuyer sur `a` pour Android ou `i` pour iOS (émulateur)
   - Appuyer sur `w` pour ouvrir dans le navigateur

## 📋 Scripts disponibles

```bash
# Développement
npm start                  # Démarre le serveur de développement
npm run android           # Lance sur émulateur Android
npm run ios              # Lance sur simulateur iOS
npm run web              # Lance dans le navigateur

# Tests
npm test                 # Lance les tests en mode watch
npm run lint            # Vérifie la qualité du code

# Maintenance
npm run reset-project   # Remet le projet à zéro (développement)
```

## 🗄️ Structure de base de données

### Tables principales

#### `animes`

- Stockage des informations d'animes (titre, synopsis, image, nombre d'épisodes)
- Référence vers l'ID Kitsu pour synchronisation

#### `episodes`

- Détails des épisodes (numéro, titre, date de diffusion, miniature)
- Relation avec la table `animes`

#### `user_collection`

- Collection personnelle de l'utilisateur
- Statuts : `watching`, `completed`, `planned`, `dropped`
- Progression et notes personnelles

#### `watched_episodes`

- Historique des épisodes visionnés
- Timestamps de visionnage

#### `watchlist`

- Liste des épisodes à regarder
- Système de file d'attente personnelle

## 🔧 Configuration et personnalisation

### Variables d'environnement

L'application utilise l'API publique Kitsu qui ne nécessite pas de clé d'API.

### Thèmes et styles

Le style utilise TailwindCSS avec support automatique du mode sombre :

```javascript
// Exemple d'utilisation
style={tw`bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
```

## 🧪 Tests

L'application inclut une suite de tests utilisant Jest et React Native Testing Library :

```bash
# Lancer tous les tests
npm test

# Tests spécifiques
npm test -- --testNamePattern="ProgressBar"
```

### Couverture de test

- Tests unitaires des composants UI
- Tests des hooks personnalisés
- Tests d'intégration des services

## 📊 Performance et optimisations

### Stratégies mises en place

- **Chargement différé** : Images et données chargées à la demande
- **Cache local** : SQLite pour un accès hors ligne rapide
- **Optimisation réseau** : Requêtes sécurisées avec gestion d'erreurs
- **Mémoire** : Gestion efficace des états avec hooks optimisés

## 🔒 Sécurité

### Mesures implémentées

- **Validation d'entrées** : Sanitisation de toutes les données utilisateur
- **Requêtes sécurisées** : Validation des URLs et headers sécurisés
- **Protection CSRF** : Headers appropriés pour les requêtes API
- **Stockage local** : Chiffrement potentiel des données sensibles

## 🛣️ Roadmap et améliorations futures

### Fonctionnalités prévues

- [ ] **Synchronisation cloud** : Sauvegarde de la collection sur serveur distant
- [ ] **Système de recommandations** : Suggestions basées sur les préférences
- [ ] **Mode social** : Partage de collections et recommandations entre utilisateurs
- [ ] **Notifications push** : Alertes pour les nouveaux épisodes
- [ ] **Export/Import** : Sauvegarde et restauration de données
- [ ] **Statistiques avancées** : Graphiques et analyses de visionnage
- [ ] **Support multi-langues** : Interface en plusieurs langues
- [ ] **Thèmes personnalisés** : Couleurs et styles configurables

### Améliorations techniques

- [ ] **Migration Expo 53** : Mise à jour vers la dernière version
- [ ] **Performance** : Optimisation du rendu et de la mémoire
- [ ] **Tests E2E** : Tests d'intégration complets
- [ ] **CI/CD** : Pipeline d'intégration continue
- [ ] **Monitoring** : Suivi des erreurs et analytics

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Poussez vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

### Standards de code

- Utilisez TypeScript pour tout nouveau code
- Suivez les conventions ESLint configurées
- Ajoutez des tests pour les nouvelles fonctionnalités
- Documentez les nouvelles API

## 📞 Support

Pour toute question ou problème :

- Ouvrez une issue sur GitHub
- Consultez la documentation Expo : [expo.dev](https://expo.dev)
- Documentation React Native : [reactnative.dev](https://reactnative.dev)

## 🙏 Remerciements

- **[Kitsu API](https://kitsu.docs.apiary.io/)** - Fournisseur de données d'animes
- **[Expo](https://expo.dev/)** - Plateforme de développement
- **[TailwindCSS](https://tailwindcss.com/)** - Framework CSS
- **Communauté React Native** - Support et ressources

---

Développé avec ❤️ pour la communauté anime
