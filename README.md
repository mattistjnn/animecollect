# AnimeCollect

Une application mobile pour gérer votre collection d'animés, suivre vos séries et découvrir les nouveautés.

## 📱 Fonctionnalités

- **Découverte** : Explorez les dernières sorties d'animés
- **Collection personnelle** : Gérez votre collection d'animés (en cours, terminés, planifiés...)
- **Suivi** : Marquez les épisodes que vous avez visionnés
- **Recherche** : Trouvez facilement n'importe quel anime
- **Liste à regarder** : Gardez une liste des épisodes que vous souhaitez voir
- **Mode hors ligne** : Consultez votre collection même sans connexion internet

## 🛠️ Technologies utilisées

- **React Native** avec **Expo**
- **Expo Router** pour la navigation
- **SQLite** avec **Drizzle ORM** pour la base de données locale
- **TWRNC** (Tailwind CSS pour React Native) pour le stylisme
- **Kitsu API** pour les données d'animés

## 🚀 Installation

### Prérequis

- Node.js (version 16 ou supérieure)
- npm ou yarn
- Expo CLI
- Android Studio (pour l'émulateur Android) ou Xcode (pour le simulateur iOS)

### Étapes d'installation

1. Clonez le dépôt :

   ```bash
   git clone https://github.com/votre-username/animecollect.git
   cd animecollect
   ```

2. Installez les dépendances :

   ```bash
   npm install
   # ou
   yarn install
   ```

3. Lancez l'application en mode développement :

   ```bash
   npx expo start
   ```

4. Suivez les instructions dans la console pour ouvrir l'application sur un appareil ou un émulateur.

## 📂 Structure du projet

```
app/
├── (tabs)/                   # Écrans principaux
├── anime/                    # Détails des animés
├── collection/               # Vue de la collection
├── components/               # Composants réutilisables
├── hooks/                    # Hooks personnalisés
├── services/                 # Services (API, base de données)
├── utils/                    # Utilitaires
└── db/                       # Configuration de la base de données
```

## 📝 Notes importantes

- L'application utilise Expo SDK 52 (la version 53 est encore en bêta)
- Le mode hors ligne permet uniquement de consulter les données déjà enregistrées
- Les APIs d'animés ne proposent généralement pas les titres en français. L'application affiche les titres originaux.

## 🧪 Tests

Exécutez les tests avec la commande suivante :

```bash
npm test
# ou
yarn test
```

## 🛣️ Améliorations futures

- Ajout de filtres et de tris avancés pour la collection
- Support pour les saisons et catégorisation des épisodes spéciaux/OVAs
- Personnalisation des titres et des informations
- Système de rappels pour les nouvelles sorties
- Synchronisation avec des services externes

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- [Kitsu API](https://kitsu.docs.apiary.io/) pour les données d'animés
- [Expo](https://expo.dev/) pour le framework
- [TailwindCSS](https://tailwindcss.com/) et [TWRNC](https://github.com/jaredh159/tailwind-react-native-classnames) pour le stylisme
- [Drizzle ORM](https://orm.drizzle.team/) pour l'ORM SQLite
