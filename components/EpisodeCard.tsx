import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';

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
  const [watched, setWatched] = useState(isWatched);

  useEffect(() => {
    setWatched(isWatched);
  }, [isWatched]);

  const handleToggleWatched = () => {
    const newWatchedState = !watched;
    setWatched(newWatchedState);
    if (onToggleWatched) {
      onToggleWatched(episode.id, newWatchedState);
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
        {/* Checkbox */}
        <TouchableOpacity
          style={[
            tw`w-6 h-6 rounded border-2 mr-4 items-center justify-center`,
            watched 
              ? tw`bg-green-500 border-green-500` 
              : tw`border-gray-300 dark:border-gray-600`
          ]}
          onPress={handleToggleWatched}
        >
          {watched && (
            <Ionicons name="checkmark" size={16} color="#ffffff" />
          )}
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