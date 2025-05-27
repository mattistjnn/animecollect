import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, ScrollView, RefreshControl, Modal, Pressable, Alert } from 'react-native';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { useAnimeDetails } from '@/hooks/useAnimeApi';
import { useWatchedEpisodes, useUserCollection, useWatchlist } from '@/hooks/useDataBase';
import EpisodeCard from '@/components/EpisodeCard';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import ProgressBar from '@/components/ProgressBar';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  saveAnime, 
  saveEpisode, 
  markEpisodeAsWatched, 
  addEpisodeToWatchlist, 
  removeEpisodeFromWatchlist,
  isEpisodeWatched,
  isEpisodeInWatchlist,
  getAnimeById,
  getEpisodesByAnimeId,
  generateId
} from '@/services/databaseService';

export default function AnimeDetailScreen() {
  const { id } = useGlobalSearchParams();
  const animeId = Array.isArray(id) ? id[0] : id || '';
  const router = useRouter();
  const colorScheme = useColorScheme();
  
  // État pour gérer les données locales vs API
  const [isLocalAnime, setIsLocalAnime] = useState(false);
  const [localAnimeData, setLocalAnimeData] = useState<any>(null);
  
  // Essayer d'abord de récupérer depuis l'API (pour les nouveaux animes)
  const { anime: apiAnime, episodes: apiEpisodes, isLoading, isLoadingEpisodes, error, refresh, refreshEpisodes } = useAnimeDetails(animeId);
  
  // Variables pour les données finales à utiliser
  const [finalAnime, setFinalAnime] = useState<any>(null);
  const [finalEpisodes, setFinalEpisodes] = useState<any[]>([]);
  
  const { watchedEpisodes, isLoading: isLoadingWatched, markAsWatched, isWatched } = useWatchedEpisodes();
  const { collection, addToCollection, updateInCollection, removeFromCollection } = useUserCollection();
  const { addToWatchlist, removeFromWatchlist } = useWatchlist();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [localAnimeId, setLocalAnimeId] = useState<string | null>(null);
  const [localEpisodes, setLocalEpisodes] = useState<any[]>([]);
  
  // Essayer de récupérer les données locales si l'API échoue
  useEffect(() => {
    const loadAnimeData = async () => {
      if (error && error.message && error.message.includes('400')) {
        console.log('API failed, trying to load from local database...');
        try {
          // Chercher dans la base locale en utilisant soit l'ID direct soit l'ID Kitsu
          const localAnime = await getAnimeById(animeId);
          if (localAnime) {
            console.log('Found local anime:', localAnime);
            setIsLocalAnime(true);
            setLocalAnimeData(localAnime);
            
            // Convertir les données locales au format API
            const convertedAnime = {
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
            };
            
            setFinalAnime(convertedAnime);
            setLocalAnimeId(localAnime.id);
            
            // Récupérer les épisodes locaux
            const episodes = await getEpisodesByAnimeId(localAnime.id);
            const convertedEpisodes = episodes.map(ep => ({
              id: ep.id,
              number: ep.number,
              canonicalTitle: ep.title,
              synopsis: ep.synopsis,
              airdate: ep.air_date,
              thumbnail: ep.thumbnail ? { original: ep.thumbnail } : null,
              length: ep.length
            }));
            
            setFinalEpisodes(convertedEpisodes);
            setLocalEpisodes(episodes);
          }
        } catch (localError) {
          console.error('Error loading local anime data:', localError);
        }
      } else if (apiAnime) {
        // Utiliser les données de l'API
        setFinalAnime(apiAnime);
        setFinalEpisodes(apiEpisodes);
        setIsLocalAnime(false);
      }
    };
    
    loadAnimeData();
  }, [animeId, error, apiAnime, apiEpisodes]);
  
  // Trouver l'anime dans la collection de l'utilisateur
  const collectionItem = collection.find(item => 
    item.anime.kitsuId === animeId || item.anime.id === animeId
  );
  
  // État local pour les épisodes avec leur statut
  const [episodesWithStatus, setEpisodesWithStatus] = useState<any[]>([]);
  
  // Calculer la progression
  const watchedCount = watchedEpisodes.length;
  const totalEpisodes = finalAnime?.episodeCount || finalEpisodes.length;
  const progress = totalEpisodes > 0 ? (watchedCount / totalEpisodes) * 100 : 0;
  
  // Sauvegarder l'anime et les épisodes localement (seulement pour les données API)
  useEffect(() => {
    const saveDataLocally = async () => {
      if (!isLocalAnime && finalAnime && finalEpisodes.length > 0) {
        try {
          console.log('Starting local save for API data...');
          
          // Convertir l'anime pour la base de données locale
          const animeToSave = {
            id: generateId(),
            kitsu_id: animeId,
            title: finalAnime.canonicalTitle,
            original_title: finalAnime.titles?.ja_jp || finalAnime.titles?.en_jp,
            synopsis: finalAnime.synopsis,
            poster_image: finalAnime.posterImage?.medium,
            cover_image: finalAnime.coverImage?.large,
            episode_count: finalAnime.episodeCount,
            status: finalAnime.status,
            start_date: finalAnime.startDate,
            end_date: finalAnime.endDate,
            age_rating: finalAnime.ageRating
          };
          
          console.log('Saving anime:', animeToSave);
          const savedAnimeId = await saveAnime(animeToSave);
          console.log('Anime saved with ID:', savedAnimeId);
          setLocalAnimeId(savedAnimeId);
          
          // Sauvegarder les épisodes
          const savedEpisodes = [];
          for (let i = 0; i < finalEpisodes.length; i++) {
            const episode = finalEpisodes[i];
            const episodeToSave = {
              id: generateId(),
              anime_id: savedAnimeId,
              kitsu_id: episode.id,
              number: episode.number,
              title: episode.canonicalTitle,
              synopsis: episode.synopsis,
              air_date: episode.airdate,
              thumbnail: episode.thumbnail?.original,
              length: episode.length
            };
            
            console.log(`Saving episode ${i + 1}:`, episodeToSave);
            const savedEpisodeId = await saveEpisode(episodeToSave);
            savedEpisodes.push({
              ...episodeToSave,
              id: savedEpisodeId
            });
          }
          
          console.log('All episodes saved');
          setLocalEpisodes(savedEpisodes);
        } catch (err) {
          console.error('Erreur lors de la sauvegarde locale:', err);
        }
      }
    };
    
    saveDataLocally();
  }, [finalAnime, finalEpisodes, animeId, isLocalAnime]);
  
  // Mettre à jour le statut des épisodes
  useEffect(() => {
    const updateEpisodeStatus = async () => {
      if (localEpisodes.length > 0) {
        console.log('Updating episode status...');
        const episodesWithStatusData = [];
        
        for (const episode of localEpisodes) {
          try {
            const watched = await isEpisodeWatched(episode.id);
            const inWatchlist = await isEpisodeInWatchlist(episode.id);
            
            episodesWithStatusData.push({
              ...episode,
              isWatched: watched,
              inWatchlist: inWatchlist
            });
          } catch (error) {
            console.error('Error checking episode status:', error);
            episodesWithStatusData.push({
              ...episode,
              isWatched: false,
              inWatchlist: false
            });
          }
        }
        
        console.log('Episode status updated');
        setEpisodesWithStatus(episodesWithStatusData);
      }
    };
    
    updateEpisodeStatus();
  }, [localEpisodes]);
  
  const onRefresh = useCallback(() => {
    refresh();
    refreshEpisodes();
  }, [refresh, refreshEpisodes]);
  
  const handleAddToCollection = async (status: string) => {
    if (finalAnime) {
      if (collectionItem) {
        await updateInCollection(collectionItem.collection.id, { status });
      } else {
        await addToCollection({ id: animeId, attributes: finalAnime }, status);
      }
    }
    setModalVisible(false);
  };
  
  const handleRemoveFromCollection = async () => {
    if (collectionItem) {
      await removeFromCollection(collectionItem.collection.id);
    }
    setModalVisible(false);
  };
  
  const handleMarkWatched = async (episodeId: string) => {
    try {
      console.log('Marking episode as watched:', episodeId);
      await markEpisodeAsWatched(episodeId);
      
      // Mettre à jour l'état local
      setEpisodesWithStatus(prev => 
        prev.map(ep => 
          ep.id === episodeId 
            ? { ...ep, isWatched: true, inWatchlist: false }
            : ep
        )
      );
      
      // Retirer de la watchlist si nécessaire
      await removeEpisodeFromWatchlist(episodeId);
      
      Alert.alert('Succès', 'Épisode marqué comme visionné !');
    } catch (error) {
      console.error('Error marking episode as watched:', error);
      Alert.alert('Erreur', 'Impossible de marquer l\'épisode comme vu.');
    }
  };
  
  const handleAddToWatchlist = async (episodeId: string) => {
    try {
      console.log('Adding episode to watchlist:', episodeId);
      await addEpisodeToWatchlist(episodeId);
      
      // Mettre à jour l'état local
      setEpisodesWithStatus(prev => 
        prev.map(ep => 
          ep.id === episodeId 
            ? { ...ep, inWatchlist: true }
            : ep
        )
      );
      
      Alert.alert('Succès', 'Épisode ajouté à votre liste à regarder !');
    } catch (error) {
      console.error('Error adding episode to watchlist:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter l\'épisode à la liste.');
    }
  };
  
  const renderStatusOption = (status: string, label: string, icon: string) => (
    <TouchableOpacity
      key={status}
      style={tw`flex-row items-center p-4 border-b border-gray-200 dark:border-gray-700`}
      onPress={() => handleAddToCollection(status)}
    >
      <Ionicons name={icon as any} size={24} color={tw.color('blue-500')} style={tw`mr-3`} />
      <Text style={tw`text-gray-800 dark:text-gray-200 text-base`}>{label}</Text>
    </TouchableOpacity>
  );
  
  if (isLoading && !finalAnime) {
    return <LoadingIndicator fullScreen text="Chargement des détails de l'anime..." />;
  }
  
  if (error && !finalAnime) {
    return (
      <View style={tw`flex-1 items-center justify-center p-4 bg-gray-100 dark:bg-gray-900`}>
        <Text style={tw`text-red-500 dark:text-red-400 text-center mb-4`}>
          Erreur lors du chargement des détails.
        </Text>
        <TouchableOpacity
          style={tw`bg-blue-500 px-4 py-2 rounded-lg`}
          onPress={() => router.back()}
        >
          <Text style={tw`text-white`}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (!finalAnime) {
    return <LoadingIndicator fullScreen text="Anime non trouvé" />;
  }
  
  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100 dark:bg-gray-900`} edges={['bottom']}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
        {/* Header avec image de couverture */}
        <View style={tw`relative w-full h-56`}>
          <Image
            source={
              finalAnime.coverImage?.large
                ? { uri: finalAnime.coverImage.large }
                : finalAnime.posterImage?.medium
                ? { uri: finalAnime.posterImage.medium }
                : { uri: "https://via.placeholder.com/800x450/CCCCCC/888888?text=Cover" }
            }
            style={tw`w-full h-full`}
          />
          <View style={[StyleSheet.absoluteFill, tw`bg-black opacity-40`]} />
          
          {/* Bouton retour */}
          <TouchableOpacity
            style={tw`absolute top-4 left-4 bg-black bg-opacity-50 rounded-full p-2`}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          
          {/* Informations sur l'anime */}
          <View style={tw`absolute bottom-0 left-0 right-0 p-4`}>
            <Text style={tw`text-white text-xl font-bold`}>
              {finalAnime.canonicalTitle}
            </Text>
            {finalAnime.titles?.ja_jp && (
              <Text style={tw`text-white text-sm opacity-80`}>
                {finalAnime.titles.ja_jp}
              </Text>
            )}
          </View>
        </View>
        
        {/* Détails de l'anime */}
        <View style={tw`p-4`}>
          <View style={tw`flex-row`}>
            <Image
              source={
                finalAnime.posterImage?.medium
                  ? { uri: finalAnime.posterImage.medium }
                  : { uri: "https://via.placeholder.com/300x450/CCCCCC/888888?text=Anime" }
              }
              style={tw`w-32 h-48 rounded-lg`}
            />
            
            <View style={tw`flex-1 ml-4`}>
              <View style={tw`flex-row flex-wrap`}>
                {finalAnime.status && (
                  <View style={tw`bg-blue-100 dark:bg-blue-900 rounded-full px-3 py-1 mr-2 mb-2`}>
                    <Text style={tw`text-blue-800 dark:text-blue-200 text-xs`}>
                      {finalAnime.status === 'finished' ? 'Terminé' : 
                       finalAnime.status === 'current' ? 'En cours' : 
                       finalAnime.status === 'tba' ? 'À venir' : finalAnime.status}
                    </Text>
                  </View>
                )}
                
                {finalAnime.ageRating && (
                  <View style={tw`bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1 mr-2 mb-2`}>
                    <Text style={tw`text-gray-800 dark:text-gray-200 text-xs`}>
                      {finalAnime.ageRating}
                    </Text>
                  </View>
                )}
                
                {finalAnime.episodeCount && (
                  <View style={tw`bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1 mb-2`}>
                    <Text style={tw`text-gray-800 dark:text-gray-200 text-xs`}>
                      {finalAnime.episodeCount} épisodes
                    </Text>
                  </View>
                )}
              </View>
              
              {/* Dates */}
              {(finalAnime.startDate || finalAnime.endDate) && (
                <Text style={tw`text-gray-600 dark:text-gray-400 text-sm mt-1`}>
                  {finalAnime.startDate && new Date(finalAnime.startDate).getFullYear()}
                  {finalAnime.startDate && finalAnime.endDate && ' - '}
                  {finalAnime.endDate && new Date(finalAnime.endDate).getFullYear()}
                </Text>
              )}
              
              {/* Bouton d'ajout à la collection */}
              <View style={tw`mt-auto`}>
                <TouchableOpacity
                  style={tw`bg-blue-500 py-2 px-4 rounded-lg flex-row items-center justify-center mt-2`}
                  onPress={() => setModalVisible(true)}
                >
                  <Ionicons
                    name={collectionItem ? 'bookmark' : 'bookmark-outline'}
                    size={18}
                    color="#ffffff"
                    style={tw`mr-2`}
                  />
                  <Text style={tw`text-white font-medium`}>
                    {collectionItem ? 'Modifier' : 'Ajouter'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          {/* Barre de progression */}
          {collectionItem && (
            <View style={tw`mt-4`}>
              <ProgressBar
                progress={progress}
                showPercentage
                label={`Progression: ${watchedCount}/${totalEpisodes} épisodes`}
              />
            </View>
          )}
          
          {/* Synopsis */}
          <View style={tw`mt-4`}>
            <Text style={tw`text-lg font-bold text-gray-800 dark:text-white mb-2`}>
              Synopsis
            </Text>
            <Text style={tw`text-gray-700 dark:text-gray-300`}>
              {finalAnime.synopsis || "Aucun synopsis disponible."}
            </Text>
          </View>
          
          {/* Liste des épisodes */}
          <View style={tw`mt-6`}>
            <Text style={tw`text-lg font-bold text-gray-800 dark:text-white mb-2`}>
              Épisodes ({episodesWithStatus.length})
            </Text>
            
            {isLoadingEpisodes ? (
              <LoadingIndicator size="small" text="Chargement des épisodes..." />
            ) : episodesWithStatus.length === 0 ? (
              <Text style={tw`text-gray-500 dark:text-gray-400 text-center py-4`}>
                Aucun épisode disponible pour le moment.
              </Text>
            ) : (
              episodesWithStatus.map(episode => (
                <EpisodeCard
                  key={episode.id}
                  episode={{
                    id: episode.id,
                    animeId: localAnimeId || animeId,
                    number: episode.number,
                    title: episode.title,
                    thumbnail: episode.thumbnail,
                    airdate: episode.air_date,
                  }}
                  isWatched={episode.isWatched}
                  inWatchlist={episode.inWatchlist}
                  onMarkWatched={handleMarkWatched}
                  onAddToWatchlist={handleAddToWatchlist}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
      
      {/* Modal pour ajouter/modifier dans la collection */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={tw`flex-1 justify-end`}>
          <Pressable
            style={[StyleSheet.absoluteFill, tw`bg-black opacity-50`]}
            onPress={() => setModalVisible(false)}
          />
          
          <View style={tw`bg-white dark:bg-gray-800 rounded-t-xl overflow-hidden`}>
            <View style={tw`p-4 border-b border-gray-200 dark:border-gray-700`}>
              <Text style={tw`text-lg font-bold text-gray-800 dark:text-white text-center`}>
                {collectionItem ? 'Modifier dans ma collection' : 'Ajouter à ma collection'}
              </Text>
            </View>
            
            {renderStatusOption('watching', 'En cours de visionnage', 'eye-outline')}
            {renderStatusOption('completed', 'Terminé', 'checkmark-circle-outline')}
            {renderStatusOption('planned', 'Planifié', 'time-outline')}
            {renderStatusOption('dropped', 'Abandonné', 'close-circle-outline')}
            
            {collectionItem && (
              <TouchableOpacity
                style={tw`flex-row items-center p-4 border-b border-gray-200 dark:border-gray-700`}
                onPress={handleRemoveFromCollection}
              >
                <Ionicons name="trash-outline" size={24} color={tw.color('red-500')} style={tw`mr-3`} />
                <Text style={tw`text-red-500 text-base`}>Supprimer de ma collection</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={tw`p-4`}
              onPress={() => setModalVisible(false)}
            >
              <Text style={tw`text-blue-500 text-center text-base font-medium`}>Annuler</Text>
            </TouchableOpacity>
            
            <SafeAreaView edges={['bottom']} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}