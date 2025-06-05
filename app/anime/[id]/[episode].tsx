import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import { useEpisodeDetails } from '@/hooks/useEpisodeDetails';
import { formatDate, formatDuration } from '@/utils/formatters';

export default function EpisodeDetailScreen() {
  const { id, episode: episodeParam } = useGlobalSearchParams();
  const animeId = Array.isArray(id) ? id[0] : id || '';
  const episodeId = Array.isArray(episodeParam) ? episodeParam[0] : episodeParam || '';
  
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Utiliser le hook personnalisé pour gérer les détails de l'épisode
  const { data, isLoading, error, refresh, toggleWatched, toggleWatchlist } = useEpisodeDetails(animeId, episodeId);

  // Rafraîchir les données
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  }, [refresh]);

  // Gérer le marquage comme vu
  const handleToggleWatched = async () => {
    if (isUpdating || !data) return;
    
    try {
      setIsUpdating(true);
      const newWatchedState = await toggleWatched();
      
      Alert.alert(
        'Succès', 
        newWatchedState ? 'Épisode marqué comme visionné !' : 'Épisode marqué comme non visionné'
      );
      
    } catch (error) {
      console.error('Erreur lors du toggle watched:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut de l\'épisode');
    } finally {
      setIsUpdating(false);
    }
  };

  // Gérer l'ajout/suppression de la watchlist
  const handleToggleWatchlist = async () => {
    if (isUpdating || !data) return;
    
    try {
      setIsUpdating(true);
      const newWatchlistState = await toggleWatchlist();
      
      Alert.alert(
        'Succès', 
        newWatchlistState 
          ? 'Épisode ajouté à votre liste à regarder' 
          : 'Épisode retiré de votre liste à regarder'
      );
      
    } catch (error) {
      console.error('Erreur lors du toggle watchlist:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour la liste à regarder');
    } finally {
      setIsUpdating(false);
    }
  };

  // Affichage du chargement
  if (isLoading) {
    return <LoadingIndicator fullScreen text="Chargement des détails de l'épisode..." />;
  }

  // Affichage de l'erreur
  if (error || !data) {
    return (
      <SafeAreaView style={tw`flex-1 bg-gray-100 dark:bg-gray-900`}>
        <View style={tw`flex-1 items-center justify-center p-4`}>
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" style={tw`mb-4`} />
          <Text style={tw`text-red-500 dark:text-red-400 text-center text-lg mb-4`}>
            {error || 'Épisode non trouvé'}
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

  const { episode, anime, isWatched, inWatchlist } = data;

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100 dark:bg-gray-900`}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        style={tw`flex-1`}
      >
        {/* Header avec bouton retour */}
        <View style={tw`bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700`}>
          <TouchableOpacity
            style={tw`flex-row items-center mb-4`}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={tw.color('gray-700 dark:gray-300')} style={tw`mr-2`} />
            <Text style={tw`text-gray-700 dark:text-gray-300 text-base`}>Retour</Text>
          </TouchableOpacity>
          
          <Text style={tw`text-xl font-bold text-gray-800 dark:text-white`}>
            {anime.title}
          </Text>
          <Text style={tw`text-lg text-gray-600 dark:text-gray-400 mt-1`}>
            Épisode {episode.number}
            {episode.title && ` - ${episode.title}`}
          </Text>
        </View>

        {/* Image de l'épisode */}
        {episode.thumbnail && (
          <View style={tw`px-4 pt-4`}>
            <Image
              source={{ uri: episode.thumbnail }}
              style={tw`w-full h-48 rounded-lg bg-gray-200 dark:bg-gray-700`}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Informations de l'épisode */}
        <View style={tw`p-4`}>
          {/* Titre de l'épisode */}
          <View style={tw`mb-4`}>
            <Text style={tw`text-2xl font-bold text-gray-800 dark:text-white mb-2`}>
              Épisode {episode.number}
            </Text>
            {episode.title && (
              <Text style={tw`text-lg text-gray-700 dark:text-gray-300`}>
                {episode.title}
              </Text>
            )}
          </View>

          {/* Métadonnées */}
          <View style={tw`bg-white dark:bg-gray-800 rounded-lg p-4 mb-4`}>
            <Text style={tw`text-lg font-semibold text-gray-800 dark:text-white mb-3`}>
              Informations
            </Text>
            
            {episode.air_date && (
              <View style={tw`flex-row justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700`}>
                <Text style={tw`text-gray-600 dark:text-gray-400`}>Date de diffusion</Text>
                <Text style={tw`text-gray-800 dark:text-white font-medium`}>
                  {formatDate(episode.air_date)}
                </Text>
              </View>
            )}
            
            {episode.length && (
              <View style={tw`flex-row justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700`}>
                <Text style={tw`text-gray-600 dark:text-gray-400`}>Durée</Text>
                <Text style={tw`text-gray-800 dark:text-white font-medium`}>
                  {formatDuration(episode.length)}
                </Text>
              </View>
            )}
            
            <View style={tw`flex-row justify-between items-center py-2`}>
              <Text style={tw`text-gray-600 dark:text-gray-400`}>Statut</Text>
              <View style={tw`flex-row items-center`}>
                <View style={[
                  tw`w-3 h-3 rounded-full mr-2`,
                  isWatched ? tw`bg-green-500` : tw`bg-gray-400`
                ]} />
                <Text style={tw`text-gray-800 dark:text-white font-medium`}>
                  {isWatched ? 'Visionné' : 'Non visionné'}
                </Text>
              </View>
            </View>

            {inWatchlist && !isWatched && (
              <View style={tw`flex-row justify-between items-center py-2 border-t border-gray-200 dark:border-gray-700`}>
                <Text style={tw`text-gray-600 dark:text-gray-400`}>Dans ma liste</Text>
                <View style={tw`flex-row items-center`}>
                  <Ionicons name="bookmark" size={16} color={tw.color('orange-500')} style={tw`mr-2`} />
                  <Text style={tw`text-orange-500 font-medium`}>
                    À regarder
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Synopsis */}
          {episode.synopsis && (
            <View style={tw`bg-white dark:bg-gray-800 rounded-lg p-4 mb-4`}>
              <Text style={tw`text-lg font-semibold text-gray-800 dark:text-white mb-3`}>
                Synopsis
              </Text>
              <Text style={tw`text-gray-700 dark:text-gray-300 leading-6`}>
                {episode.synopsis}
              </Text>
            </View>
          )}

          {/* Boutons d'action */}
          <View style={tw`gap-3 mt-4`}>
            {/* Bouton marquer comme vu */}
            <TouchableOpacity
              style={[
                tw`flex-row items-center justify-center py-4 px-4 rounded-lg`,
                isWatched 
                  ? tw`bg-green-500` 
                  : tw`bg-blue-500`,
                isUpdating && tw`opacity-70`
              ]}
              onPress={handleToggleWatched}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <View style={tw`w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2`} />
              ) : (
                <Ionicons 
                  name={isWatched ? "checkmark-circle" : "eye-outline"} 
                  size={24} 
                  color="#ffffff" 
                  style={tw`mr-2`} 
                />
              )}
              <Text style={tw`text-white font-semibold text-base`}>
                {isWatched ? 'Marquer comme non vu' : 'Marquer comme vu'}
              </Text>
            </TouchableOpacity>

            {/* Bouton watchlist (seulement si pas encore vu) */}
            {!isWatched && (
              <TouchableOpacity
                style={[
                  tw`flex-row items-center justify-center py-4 px-4 rounded-lg border-2`,
                  inWatchlist 
                    ? tw`bg-orange-500 border-orange-500` 
                    : tw`border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800`,
                  isUpdating && tw`opacity-70`
                ]}
                onPress={handleToggleWatchlist}
                disabled={isUpdating}
              >
                <Ionicons 
                  name={inWatchlist ? "bookmark" : "bookmark-outline"} 
                  size={24} 
                  color={inWatchlist ? "#ffffff" : tw.color('gray-600 dark:gray-400')} 
                  style={tw`mr-2`} 
                />
                <Text style={[
                  tw`font-semibold text-base`,
                  inWatchlist 
                    ? tw`text-white` 
                    : tw`text-gray-600 dark:text-gray-400`
                ]}>
                  {inWatchlist ? 'Retirer de ma liste' : 'Ajouter à ma liste'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Navigation vers l'anime */}
            <TouchableOpacity
              style={tw`bg-gray-200 dark:bg-gray-700 py-4 px-4 rounded-lg flex-row items-center justify-center`}
              onPress={() => router.push(`/anime/${animeId}`)}
            >
              <Ionicons name="information-circle-outline" size={24} color={tw.color('gray-600 dark:gray-400')} style={tw`mr-2`} />
              <Text style={tw`text-gray-600 dark:text-gray-400 font-semibold text-base`}>
                Voir les détails de l'anime
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}