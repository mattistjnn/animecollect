import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useLocalRouter, useGlobalSearchParams } from 'expo-router';
import { useUserCollection, useWatchedEpisodes } from '@/hooks/useDataBase';
import EpisodeCard from '@/components/EpisodeCard';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import ProgressBar from '@/components/ProgressBar';
import * as databaseService from '@/services/databaseService';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CollectionDetailScreen() {
  const { id } = useGlobalSearchParams();
  const animeId = Array.isArray(id) ? id[0] : id || '';
  const router = useLocalRouter();
  
  const { collection, refresh: refreshCollection } = useUserCollection();
  const { watchedEpisodes, isLoading: isLoadingWatched, markAsWatched, isWatched } = useWatchedEpisodes(animeId);
  
  const [anime, setAnime] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [collectionItem, setCollectionItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Charger les données de l'anime et des épisodes
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Obtenir l'anime et les épisodes de la base de données locale
        const animeData = await databaseService.getAnimeById(animeId);
        if (!animeData) throw new Error('Anime non trouvé');
        
        const episodesData = await databaseService.getEpisodesByAnimeId(animeId);
        
        // Obtenir l'élément de collection correspondant
        const item = collection.find(item => item.anime.id === animeId);
        
        setAnime(animeData);
        setEpisodes(episodesData);
        setCollectionItem(item);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [animeId, collection]);
  
  // Calculer la progression
  const watchedCount = watchedEpisodes.length;
  const totalEpisodes = anime?.episodeCount || episodes.length;
  const progress = totalEpisodes > 0 ? (watchedCount / totalEpisodes) * 100 : 0;
  
  const updateProgress = async () => {
    if (collectionItem) {
      try {
        await databaseService.updateAnimeInCollection(collectionItem.collection.id, {
          progress: watchedCount
        });
        refreshCollection();
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la progression:', error);
      }
    }
  };
  
  // Mettre à jour la progression lorsque le nombre d'épisodes visionnés change
  useEffect(() => {
    updateProgress();
  }, [watchedCount, collectionItem]);
  
  const handleMarkWatched = async (episodeId: string) => {
    try {
      await markAsWatched(episodeId);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de marquer l\'épisode comme vu');
    }
  };
  
  if (isLoading && !anime) {
    return <LoadingIndicator fullScreen text="Chargement des détails..." />;
  }
  
  if (error || !anime) {
    return (
      <View style={tw`flex-1 items-center justify-center p-4 bg-gray-100 dark:bg-gray-900`}>
        <Text style={tw`text-red-500 dark:text-red-400 text-center mb-4`}>
          {error || 'Anime non trouvé dans votre collection'}
        </Text>
        <TouchableOpacity
          style={tw`bg-blue-500 px-4 py-2 rounded-lg`}
          onPress={() => router.push('/collection')}
        >
          <Text style={tw`text-white`}>Retour à ma collection</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const statusText = () => {
    switch (collectionItem?.collection.status) {
      case 'watching': return 'En cours de visionnage';
      case 'completed': return 'Terminé';
      case 'planned': return 'Planifié';
      case 'dropped': return 'Abandonné';
      default: return 'Inconnu';
    }
  };
  
  const statusColor = () => {
    switch (collectionItem?.collection.status) {
      case 'watching': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'completed': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'planned': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'dropped': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    }
  };
  
  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100 dark:bg-gray-900`} edges={['bottom']}>
      <View style={tw`flex-1`}>
        {/* Header */}
        <View style={tw`bg-white dark:bg-gray-800 p-4 shadow-sm`}>
          <TouchableOpacity
            style={tw`flex-row items-center mb-4`}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={tw.color('gray-700 dark:gray-300')} style={tw`mr-2`} />
            <Text style={tw`text-gray-700 dark:text-gray-300 text-base`}>Retour</Text>
          </TouchableOpacity>
          
          <View style={tw`flex-row`}>
            <Image
              source={
                anime.posterImage
                  ? { uri: anime.posterImage }
                  : { uri: "https://via.placeholder.com/300x450/CCCCCC/888888?text=Anime+Placeholder" }
              }
              style={tw`w-24 h-36 rounded-lg`}
            />
            
            <View style={tw`ml-4 flex-1`}>
              <Text style={tw`text-lg font-bold text-gray-800 dark:text-white`}>
                {anime.title}
              </Text>
              
              {collectionItem && (
                <View style={tw`flex-row flex-wrap mt-2`}>
                  <View style={tw`${statusColor()} rounded-full px-3 py-1 mr-2 mb-2`}>
                    <Text style={tw`${statusColor().split(' ').slice(2).join(' ')} text-xs`}>
                      {statusText()}
                    </Text>
                  </View>
                </View>
              )}
              
              <View style={tw`mt-2`}>
                <ProgressBar
                  progress={progress}
                  showPercentage
                  label={`${watchedCount}/${totalEpisodes} épisodes`}
                />
              </View>
              
              <TouchableOpacity
                style={tw`bg-blue-500 py-2 px-4 rounded-lg flex-row items-center justify-center mt-2`}
                onPress={() => router.push(`/anime/${animeId}`)}
              >
                <Ionicons name="information-circle-outline" size={18} color="#ffffff" style={tw`mr-2`} />
                <Text style={tw`text-white font-medium`}>Détails de l'anime</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Liste des épisodes */}
        <View style={tw`flex-1 p-4`}>
          <Text style={tw`text-lg font-bold text-gray-800 dark:text-white mb-4`}>
            Épisodes
          </Text>
          
          {isLoadingWatched ? (
            <LoadingIndicator size="small" text="Chargement des épisodes..." />
          ) : episodes.length === 0 ? (
            <Text style={tw`text-gray-500 dark:text-gray-400 text-center py-4`}>
              Aucun épisode disponible pour le moment.
            </Text>
          ) : (
            <FlatList
              data={episodes}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <EpisodeCard
                  episode={{
                    id: item.id,
                    animeId,
                    number: item.number,
                    title: item.title,
                    thumbnail: item.thumbnail,
                    airdate: item.airDate,
                  }}
                  isWatched={isWatched(item.id)}
                  onMarkWatched={handleMarkWatched}
                />
              )}
              contentContainerStyle={tw`pb-4`}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}