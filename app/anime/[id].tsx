import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, ScrollView, RefreshControl, Modal, Pressable, Alert } from 'react-native';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { useWatchedEpisodes, useUserCollection, useWatchlist } from '@/hooks/useDataBase';
import EpisodeCard from '@/components/EpisodeCard';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import ProgressBar from '@/components/ProgressBar';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as databaseService from '@/services/databaseService';
import * as apiService from '@/services/apiService';

export default function AnimeDetailScreen() {
  const { id } = useGlobalSearchParams();
  const animeId = Array.isArray(id) ? id[0] : id || '';
  const router = useRouter();
  const colorScheme = useColorScheme();
  
  // États pour gérer les données
  const [anime, setAnime] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLocalData, setIsLocalData] = useState(false);
  const [localAnimeId, setLocalAnimeId] = useState<string | null>(null);
  
  const { watchedEpisodes, isLoading: isLoadingWatched, markAsWatched, isWatched } = useWatchedEpisodes();
  const { collection, addToCollection, updateInCollection, removeFromCollection } = useUserCollection();
  const { addToWatchlist, removeFromWatchlist } = useWatchlist();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [episodesWithStatus, setEpisodesWithStatus] = useState<any[]>([]);
  
  // Trouver l'anime dans la collection de l'utilisateur
  const collectionItem = collection.find(item => 
    item.anime.kitsuId === animeId || item.anime.id === animeId
  );

  // Fonction pour charger les données de l'anime
  const loadAnimeData = useCallback(async () => {
    if (!animeId) return;
    
    setIsLoading(true);
    setError(null);
    setIsLocalData(false);

    try {
      console.log('🔍 Chargement anime ID:', animeId);
      
      // D'abord, vérifier si on a déjà cet anime en local (priorité aux données locales)
      const existingLocalAnime = await databaseService.getAnimeById(animeId);
      
      if (existingLocalAnime) {
        console.log('✅ Anime trouvé localement:', existingLocalAnime.title);
        
        // Utiliser les données locales
        const animeData = {
          canonicalTitle: existingLocalAnime.title,
          titles: {
            ja_jp: existingLocalAnime.original_title
          },
          synopsis: existingLocalAnime.synopsis,
          posterImage: existingLocalAnime.poster_image ? { medium: existingLocalAnime.poster_image } : null,
          coverImage: existingLocalAnime.cover_image ? { large: existingLocalAnime.cover_image } : null,
          episodeCount: existingLocalAnime.episode_count,
          status: existingLocalAnime.status,
          startDate: existingLocalAnime.start_date,
          endDate: existingLocalAnime.end_date,
          ageRating: existingLocalAnime.age_rating
        };
        
        setAnime(animeData);
        setIsLocalData(true);
        setLocalAnimeId(existingLocalAnime.id);
        return; // Sortir de la fonction, on a trouvé l'anime
      }
      
      // Si pas en local, essayer l'API
      try {
        console.log('🌐 Tentative API pour:', animeId);
        const response = await apiService.getAnimeById(animeId);
        const animeData = {
          id: response.data.id,
          type: response.data.type,
          ...response.data.attributes
        };
        
        setAnime(animeData);
        setIsLocalData(false);
        console.log('✅ Anime récupéré via API');
        
      } catch (apiError) {
        // Log silencieux - pas d'erreur dans la console
        throw new Error('Anime non trouvé');
      }
      
    } catch (err) {
      console.error('❌ Erreur lors du chargement de l\'anime:', err);
      setError('Erreur lors du chargement des détails');
    } finally {
      setIsLoading(false);
    }
  }, [animeId]);

  // Fonction pour charger les épisodes - VERSION SILENCIEUSE
  const loadEpisodesData = useCallback(async () => {
    if (!animeId || !anime) return;
    
    setIsLoadingEpisodes(true);

    try {
      console.log('🔍 Chargement des épisodes pour:', animeId);
      console.log('🔍 isLocalData:', isLocalData);
      console.log('🔍 localAnimeId:', localAnimeId);
      
      let episodesData = [];
      
      if (isLocalData && localAnimeId) {
        // Si on utilise des données locales, récupérer les épisodes localement
        console.log('📁 Récupération des épisodes depuis la base locale...');
        
        const localEpisodes = await databaseService.getEpisodesByAnimeId(localAnimeId);
        episodesData = localEpisodes.map(ep => ({
          id: ep.id,
          number: ep.number,
          canonicalTitle: ep.title,
          title: ep.title,
          synopsis: ep.synopsis,
          airdate: ep.air_date,
          air_date: ep.air_date,
          thumbnail: ep.thumbnail ? { original: ep.thumbnail } : null,
          length: ep.length
        }));
        
        console.log(`✅ ${episodesData.length} épisodes récupérés localement`);
        
      } else {
        // Sinon, essayer l'API puis fallback local SILENCIEUX
        try {
          console.log('🌐 Récupération des épisodes via API...');
          const response = await apiService.getAnimeEpisodes(animeId);
          episodesData = response.data.map(episode => ({
            id: episode.id,
            type: episode.type,
            number: episode.attributes.number,
            canonicalTitle: episode.attributes.canonicalTitle,
            title: episode.attributes.canonicalTitle,
            synopsis: episode.attributes.synopsis,
            airdate: episode.attributes.airdate,
            air_date: episode.attributes.airdate,
            thumbnail: episode.attributes.thumbnail,
            length: episode.attributes.length
          }));
          console.log(`✅ ${episodesData.length} épisodes récupérés via API`);
          
        } catch (apiError) {
          // *** FALLBACK SILENCIEUX - PAS DE LOG D'ERREUR ***
          try {
            const localEpisodes = await databaseService.getEpisodesByAnimeId(animeId);
            episodesData = localEpisodes.map(ep => ({
              id: ep.id,
              number: ep.number,
              canonicalTitle: ep.title,
              title: ep.title,
              synopsis: ep.synopsis,
              airdate: ep.air_date,
              air_date: ep.air_date,
              thumbnail: ep.thumbnail ? { original: ep.thumbnail } : null,
              length: ep.length
            }));
            console.log(`✅ ${episodesData.length} épisodes récupérés localement (fallback silencieux)`);
          } catch (localError) {
            // Pas de log, même en cas d'échec total
            episodesData = [];
          }
        }
      }
      
      setEpisodes(episodesData);
      
    } catch (err) {
      // Pas de log d'erreur pour éviter le spam
      setEpisodes([]);
    } finally {
      setIsLoadingEpisodes(false);
    }
  }, [animeId, isLocalData, localAnimeId, anime]);

  // Charger les données au montage
  useEffect(() => {
    loadAnimeData();
  }, [loadAnimeData]);

  // Charger les épisodes après avoir déterminé le type de données
  useEffect(() => {
    if (anime) {
      loadEpisodesData();
    }
  }, [anime, loadEpisodesData]);

  // Sauvegarder localement si les données viennent de l'API
  useEffect(() => {
    const saveDataLocally = async () => {
      if (!isLocalData && anime && episodes.length > 0 && !localAnimeId) {
        try {
          console.log('💾 Sauvegarde locale des données API...');
          
          // Convertir l'anime pour la base de données locale
          const animeToSave = {
            id: databaseService.generateId(),
            kitsu_id: animeId,
            title: anime.canonicalTitle,
            original_title: anime.titles?.ja_jp || anime.titles?.en_jp,
            synopsis: anime.synopsis,
            poster_image: anime.posterImage?.medium,
            cover_image: anime.coverImage?.large,
            episode_count: anime.episodeCount,
            status: anime.status,
            start_date: anime.startDate,
            end_date: anime.endDate,
            age_rating: anime.ageRating
          };
          
          const savedAnimeId = await databaseService.saveAnime(animeToSave);
          setLocalAnimeId(savedAnimeId);
          
          // Sauvegarder les épisodes avec de nouveaux IDs
          const savedEpisodes = [];
          for (let i = 0; i < episodes.length; i++) {
            const episode = episodes[i];
            const newEpisodeId = databaseService.generateId();
            
            const episodeToSave = {
              id: newEpisodeId,
              anime_id: savedAnimeId,
              kitsu_id: episode.id,
              number: episode.number,
              title: episode.canonicalTitle || episode.title,
              synopsis: episode.synopsis,
              air_date: episode.airdate || episode.air_date,
              thumbnail: episode.thumbnail?.original,
              length: episode.length
            };
            
            await databaseService.saveEpisode(episodeToSave);
            
            // Mettre à jour l'épisode avec le nouvel ID pour l'affichage
            savedEpisodes.push({
              ...episode,
              id: newEpisodeId
            });
          }
          
          setEpisodes(savedEpisodes);
          console.log('✅ Sauvegarde locale terminée avec nouveaux IDs');
        } catch (err) {
          // Log silencieux
        }
      }
    };
    
    saveDataLocally();
  }, [anime, episodes, animeId, isLocalData, localAnimeId]);

  // Mettre à jour le statut des épisodes
  useEffect(() => {
    const updateEpisodeStatus = async () => {
      if (episodes.length > 0) {
        const episodesWithStatusData = [];
        
        for (const episode of episodes) {
          try {
            const watched = await databaseService.isEpisodeWatched(episode.id);
            const inWatchlist = await databaseService.isEpisodeInWatchlist(episode.id);
            
            episodesWithStatusData.push({
              ...episode,
              isWatched: watched,
              inWatchlist: inWatchlist
            });
          } catch (error) {
            // Log silencieux
            episodesWithStatusData.push({
              ...episode,
              isWatched: false,
              inWatchlist: false
            });
          }
        }
        
        setEpisodesWithStatus(episodesWithStatusData);
      }
    };
    
    updateEpisodeStatus();
  }, [episodes]);

  // Rafraîchir les données
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadAnimeData();
    setIsRefreshing(false);
  }, [loadAnimeData]);

  // Calculer la progression
  const watchedCount = watchedEpisodes.length;
  const totalEpisodes = anime?.episodeCount || episodes.length;
  const progress = totalEpisodes > 0 ? (watchedCount / totalEpisodes) * 100 : 0;

  const handleAddToCollection = async (status: string) => {
    if (anime) {
      if (collectionItem) {
        await updateInCollection(collectionItem.collection.id, { status });
      } else {
        await addToCollection({ id: animeId, attributes: anime }, status);
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
      console.log('🎬 Marquage épisode comme vu:', episodeId);
      await databaseService.markEpisodeAsWatched(episodeId);
      
      setEpisodesWithStatus(prev => 
        prev.map(ep => 
          ep.id === episodeId 
            ? { ...ep, isWatched: true, inWatchlist: false }
            : ep
        )
      );
      
      await databaseService.removeEpisodeFromWatchlist(episodeId);
      Alert.alert('Succès', 'Épisode marqué comme visionné !');
    } catch (error) {
      console.error('❌ Erreur marquage:', error);
      Alert.alert('Erreur', 'Impossible de marquer l\'épisode comme vu.');
    }
  };

  const handleAddToWatchlist = async (episodeId: string) => {
    try {
      console.log('📋 Ajout épisode à la watchlist:', episodeId);
      await databaseService.addEpisodeToWatchlist(episodeId);
      
      setEpisodesWithStatus(prev => 
        prev.map(ep => 
          ep.id === episodeId 
            ? { ...ep, inWatchlist: true }
            : ep
        )
      );
      
      Alert.alert('Succès', 'Épisode ajouté à votre liste à regarder !');
    } catch (error) {
      console.error('❌ Erreur watchlist:', error);
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

  if (isLoading) {
    return <LoadingIndicator fullScreen text="Chargement des détails de l'anime..." />;
  }

  if (error || !anime) {
    return (
      <SafeAreaView style={tw`flex-1 bg-gray-100 dark:bg-gray-900`}>
        <View style={tw`flex-1 items-center justify-center p-4`}>
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" style={tw`mb-4`} />
          <Text style={tw`text-red-500 dark:text-red-400 text-center text-lg mb-4`}>
            {error || 'Anime non trouvé'}
          </Text>
          <TouchableOpacity
            style={tw`bg-blue-500 px-6 py-3 rounded-lg`}
            onPress={() => router.back()}
          >
            <Text style={tw`text-white font-medium`}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100 dark:bg-gray-900`} edges={['bottom']}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header avec image de couverture */}
        <View style={tw`relative w-full h-56`}>
          <Image
            source={
              anime.coverImage?.large
                ? { uri: anime.coverImage.large }
                : anime.posterImage?.medium
                ? { uri: anime.posterImage.medium }
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
              {anime.canonicalTitle}
            </Text>
            {anime.titles?.ja_jp && (
              <Text style={tw`text-white text-sm opacity-80`}>
                {anime.titles.ja_jp}
              </Text>
            )}
          </View>
        </View>
        
        {/* Détails de l'anime */}
        <View style={tw`p-4`}>
          <View style={tw`flex-row`}>
            <Image
              source={
                anime.posterImage?.medium
                  ? { uri: anime.posterImage.medium }
                  : { uri: "https://via.placeholder.com/300x450/CCCCCC/888888?text=Anime" }
              }
              style={tw`w-32 h-48 rounded-lg`}
            />
            
            <View style={tw`flex-1 ml-4`}>
              <View style={tw`flex-row flex-wrap`}>
                {anime.status && (
                  <View style={tw`bg-blue-100 dark:bg-blue-900 rounded-full px-3 py-1 mr-2 mb-2`}>
                    <Text style={tw`text-blue-800 dark:text-blue-200 text-xs`}>
                      {anime.status === 'finished' ? 'Terminé' : 
                       anime.status === 'current' ? 'En cours' : 
                       anime.status === 'tba' ? 'À venir' : anime.status}
                    </Text>
                  </View>
                )}
                
                {anime.ageRating && (
                  <View style={tw`bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1 mr-2 mb-2`}>
                    <Text style={tw`text-gray-800 dark:text-gray-200 text-xs`}>
                      {anime.ageRating}
                    </Text>
                  </View>
                )}
                
                {anime.episodeCount && (
                  <View style={tw`bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1 mb-2`}>
                    <Text style={tw`text-gray-800 dark:text-gray-200 text-xs`}>
                      {anime.episodeCount} épisodes
                    </Text>
                  </View>
                )}
              </View>
              
              {/* Dates */}
              {(anime.startDate || anime.endDate) && (
                <Text style={tw`text-gray-600 dark:text-gray-400 text-sm mt-1`}>
                  {anime.startDate && new Date(anime.startDate).getFullYear()}
                  {anime.startDate && anime.endDate && ' - '}
                  {anime.endDate && new Date(anime.endDate).getFullYear()}
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
              {anime.synopsis || "Aucun synopsis disponible."}
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
                    title: episode.canonicalTitle || episode.title,
                    thumbnail: episode.thumbnail?.original || episode.thumbnail,
                    airdate: episode.airdate || episode.air_date,
                    synopsis: episode.synopsis,
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