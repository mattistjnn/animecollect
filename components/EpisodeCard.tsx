import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import { useWatchedEpisodes } from '@/hooks/useWatchedEpisodes';

interface EpisodeCardProps {
  episode: {
    id: string;
    animeId: string;
    number: number;
    title?: string;
    airdate?: string;
  };
  isWatched?: boolean;
  onToggleWatched?: (id: string, watched: boolean) => void;
}

export default function EpisodeCard({ 
  episode, 
  isWatched = false,
  onToggleWatched
}: EpisodeCardProps) {
  const { toggleWatched, isWatchedSync } = useWatchedEpisodes(episode.animeId);
  const [watched, setWatched] = useState(isWatched);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Vérifier l'état depuis le hook
    const hookWatched = isWatchedSync(episode.id);
    setWatched(hookWatched || isWatched);
  }, [episode.id, isWatched, isWatchedSync]);

  const handleToggleWatched = async () => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      
      const newWatchedState = await toggleWatched(episode.id);
      setWatched(newWatchedState);
      
      if (onToggleWatched) {
        onToggleWatched(episode.id, newWatchedState);
      }
      
      console.log('✅ État mis à jour:', {
        episodeId: episode.id,
        newState: newWatchedState
      });
      
    } catch (error) {
      console.error('❌ Erreur toggle:', error);
      Alert.alert(
        'Erreur', 
        'Impossible de mettre à jour l\'état de l\'épisode'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePress = () => {
    router.push(`/anime/${episode.animeId}/${episode.id}`);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <TouchableOpacity
      style={tw`bg-white dark:bg-gray-800 mx-4 mb-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700`}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={tw`flex-row items-center p-4`}>
        {/* Checkbox avec indicateur de chargement */}
        <TouchableOpacity
          style={[
            tw`w-6 h-6 rounded border-2 mr-4 items-center justify-center`,
            watched 
              ? tw`bg-green-500 border-green-500` 
              : tw`border-gray-300 dark:border-gray-600`,
            isUpdating && tw`opacity-50`
          ]}
          onPress={handleToggleWatched}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <View style={tw`w-3 h-3 border border-white rounded-full border-t-transparent animate-spin`} />
          ) : watched ? (
            <Ionicons name="checkmark" size={16} color="#ffffff" />
          ) : null}
        </TouchableOpacity>

        {/* Contenu de l'épisode */}
        <View style={tw`flex-1`}>
          <View style={tw`flex-row items-center justify-between`}>
            <Text style={[
              tw`font-semibold`,
              watched 
                ? tw`text-green-600 dark:text-green-400` 
                : tw`text-gray-800 dark:text-white`
            ]}>
              Épisode {episode.number}
            </Text>
            
            {episode.airdate && (
              <Text style={tw`text-xs text-gray-500 dark:text-gray-400`}>
                {formatDate(episode.airdate)}
              </Text>
            )}
          </View>
          
          {episode.title && (
            <Text 
              style={[
                tw`text-sm mt-1`,
                watched 
                  ? tw`text-gray-600 dark:text-gray-400 line-through` 
                  : tw`text-gray-700 dark:text-gray-300`
              ]}
              numberOfLines={1}
            >
              {episode.title}
            </Text>
          )}
        </View>

        {/* Icône pour indiquer qu'on peut cliquer */}
        <Ionicons 
          name="chevron-forward" 
          size={16} 
          color={tw.color('gray-400')} 
          style={tw`ml-2`}
        />
      </View>
    </TouchableOpacity>
  );
}