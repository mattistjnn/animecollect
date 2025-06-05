import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Image } from 'react-native';
import { router } from 'expo-router';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '@/utils/formatters';

interface EpisodeCardProps {
  episode: {
    id: string;
    animeId: string;
    number: number;
    title?: string;
    thumbnail?: string;
    airdate?: string;
    synopsis?: string;
  };
  isWatched?: boolean;
  inWatchlist?: boolean;
  onMarkWatched?: (episodeId: string) => void;
  onAddToWatchlist?: (episodeId: string) => void;
  onToggleWatched?: (id: string, watched: boolean) => void;
  showActions?: boolean; // Pour afficher ou masquer les boutons d'action
}

export default function EpisodeCard({ 
  episode, 
  isWatched = false,
  inWatchlist = false,
  onMarkWatched,
  onAddToWatchlist,
  onToggleWatched,
  showActions = true
}: EpisodeCardProps) {
  const [watched, setWatched] = useState(isWatched);
  const [watchlisted, setWatchlisted] = useState(inWatchlist);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setWatched(isWatched);
    setWatchlisted(inWatchlist);
  }, [isWatched, inWatchlist]);

  // Navigation vers les détails de l'épisode
  const handlePress = () => {
    console.log('🎯 Navigation vers détails épisode:', {
      animeId: episode.animeId,
      episodeId: episode.id,
      number: episode.number
    });
    router.push(`/anime/${episode.animeId}/${episode.id}`);
  };

  // Marquer comme vu
  const handleMarkWatched = async (e: any) => {
    e.stopPropagation(); // Empêcher la navigation
    
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      
      if (onMarkWatched) {
        onMarkWatched(episode.id);
        setWatched(true);
        setWatchlisted(false); // Retirer de la watchlist si marqué comme vu
      } else if (onToggleWatched) {
        const newState = !watched;
        onToggleWatched(episode.id, newState);
        setWatched(newState);
        if (newState) setWatchlisted(false);
      }
      
    } catch (error) {
      console.error('❌ Erreur mark watched:', error);
      Alert.alert('Erreur', 'Impossible de marquer l\'épisode comme vu');
    } finally {
      setIsUpdating(false);
    }
  };

  // Ajouter à la watchlist
  const handleAddToWatchlist = async (e: any) => {
    e.stopPropagation(); // Empêcher la navigation
    
    if (isUpdating || watched) return; // Pas besoin si déjà vu
    
    try {
      setIsUpdating(true);
      
      if (onAddToWatchlist) {
        onAddToWatchlist(episode.id);
        setWatchlisted(true);
      }
      
    } catch (error) {
      console.error('❌ Erreur add to watchlist:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter l\'épisode à la liste');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <TouchableOpacity
      style={tw`bg-white dark:bg-gray-800 mx-4 mb-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700`}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={tw`p-4`}>
        {/* Header avec numéro et date */}
        <View style={tw`flex-row items-center justify-between mb-2`}>
          <View style={tw`flex-row items-center`}>
            <Text style={[
              tw`font-bold text-lg`,
              watched 
                ? tw`text-green-600 dark:text-green-400` 
                : tw`text-gray-800 dark:text-white`
            ]}>
              Épisode {episode.number}
            </Text>
            
            {/* Indicateurs de statut */}
            <View style={tw`flex-row ml-2`}>
              {watched && (
                <View style={tw`bg-green-500 rounded-full p-1 mr-1`}>
                  <Ionicons name="checkmark" size={12} color="#ffffff" />
                </View>
              )}
              {watchlisted && !watched && (
                <View style={tw`bg-orange-500 rounded-full p-1`}>
                  <Ionicons name="bookmark" size={12} color="#ffffff" />
                </View>
              )}
            </View>
          </View>
          
          {episode.airdate && (
            <Text style={tw`text-xs text-gray-500 dark:text-gray-400`}>
              {formatDate(episode.airdate)}
            </Text>
          )}
        </View>

        {/* Contenu principal */}
        <View style={tw`flex-row`}>
          {/* Thumbnail si disponible */}
          {episode.thumbnail && (
            <Image 
              source={{ uri: episode.thumbnail }}
              style={tw`w-16 h-12 rounded mr-3 bg-gray-200 dark:bg-gray-700`}
              resizeMode="cover"
            />
          )}
          
          <View style={tw`flex-1`}>
            {/* Titre de l'épisode */}
            {episode.title && (
              <Text 
                style={[
                  tw`text-sm font-medium mb-1`,
                  watched 
                    ? tw`text-gray-600 dark:text-gray-400 line-through` 
                    : tw`text-gray-700 dark:text-gray-300`
                ]}
                numberOfLines={1}
              >
                {episode.title}
              </Text>
            )}
            
            {/* Synopsis court */}
            {episode.synopsis && (
              <Text 
                style={tw`text-xs text-gray-500 dark:text-gray-400`}
                numberOfLines={2}
              >
                {episode.synopsis}
              </Text>
            )}
          </View>
        </View>

        {/* Boutons d'action */}
        {showActions && (
          <View style={tw`flex-row items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700`}>
            <View style={tw`flex-row items-center`}>
              {/* Bouton marquer comme vu */}
              <TouchableOpacity
                style={[
                  tw`flex-row items-center px-3 py-2 rounded-lg mr-2`,
                  watched 
                    ? tw`bg-green-100 dark:bg-green-900` 
                    : tw`bg-blue-100 dark:bg-blue-900`,
                  isUpdating && tw`opacity-50`
                ]}
                onPress={handleMarkWatched}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <View style={tw`w-4 h-4 border border-gray-400 rounded-full border-t-transparent animate-spin mr-1`} />
                ) : (
                  <Ionicons 
                    name={watched ? "checkmark-circle" : "eye-outline"} 
                    size={16} 
                    color={watched ? tw.color('green-600') : tw.color('blue-600')} 
                    style={tw`mr-1`}
                  />
                )}
                <Text style={[
                  tw`text-xs font-medium`,
                  watched 
                    ? tw`text-green-600 dark:text-green-400` 
                    : tw`text-blue-600 dark:text-blue-400`
                ]}>
                  {watched ? 'Vu' : 'Marquer'}
                </Text>
              </TouchableOpacity>

              {/* Bouton watchlist (seulement si pas vu) */}
              {!watched && (
                <TouchableOpacity
                  style={[
                    tw`flex-row items-center px-3 py-2 rounded-lg`,
                    watchlisted 
                      ? tw`bg-orange-100 dark:bg-orange-900` 
                      : tw`bg-gray-100 dark:bg-gray-700`,
                    isUpdating && tw`opacity-50`
                  ]}
                  onPress={handleAddToWatchlist}
                  disabled={isUpdating}
                >
                  <Ionicons 
                    name={watchlisted ? "bookmark" : "bookmark-outline"} 
                    size={16} 
                    color={watchlisted ? tw.color('orange-600') : tw.color('gray-600')} 
                    style={tw`mr-1`}
                  />
                  <Text style={[
                    tw`text-xs font-medium`,
                    watchlisted 
                      ? tw`text-orange-600 dark:text-orange-400` 
                      : tw`text-gray-600 dark:text-gray-400`
                  ]}>
                    {watchlisted ? 'Listée' : 'À voir'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Icône pour indiquer qu'on peut cliquer pour plus de détails */}
            <TouchableOpacity 
              style={tw`p-1`}
              onPress={handlePress}
            >
              <Ionicons 
                name="chevron-forward" 
                size={16} 
                color={tw.color('gray-400')} 
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}