import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import EpisodeCard from '@/components/EpisodeCard';

interface Episode {
  id: string;
  animeId: string;
  number: number;
  title?: string;
  airdate?: string;
}

interface EpisodeListScreenProps {
  episodes: Episode[];
  animeTitle: string;
  watchedEpisodeIds?: string[];
  onToggleWatched?: (episodeId: string, watched: boolean) => void;
}

export default function EpisodeListScreen({ 
  episodes, 
  animeTitle,
  watchedEpisodeIds = [],
  onToggleWatched 
}: EpisodeListScreenProps) {
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set(watchedEpisodeIds));
  const [showWatchedOnly, setShowWatchedOnly] = useState(false);

  const handleToggleWatched = useCallback((episodeId: string, watched: boolean) => {
    setWatchedIds(prev => {
      const newSet = new Set(prev);
      if (watched) {
        newSet.add(episodeId);
      } else {
        newSet.delete(episodeId);
      }
      return newSet;
    });
    
    if (onToggleWatched) {
      onToggleWatched(episodeId, watched);
    }
  }, [onToggleWatched]);

  const filteredEpisodes = showWatchedOnly 
    ? episodes.filter(ep => watchedIds.has(ep.id))
    : episodes;

  const watchedCount = watchedIds.size;
  const totalCount = episodes.length;
  const progressPercentage = totalCount > 0 ? (watchedCount / totalCount) * 100 : 0;

  const renderHeader = () => (
    <View style={tw`px-4 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700`}>
      <Text style={tw`text-xl font-bold text-gray-800 dark:text-white mb-2`}>
        {animeTitle}
      </Text>
      
      {/* Barre de progression */}
      <View style={tw`mb-4`}>
        <View style={tw`flex-row justify-between items-center mb-2`}>
          <Text style={tw`text-sm text-gray-600 dark:text-gray-400`}>
            Progression
          </Text>
          <Text style={tw`text-sm font-medium text-gray-800 dark:text-white`}>
            {watchedCount}/{totalCount} épisodes
          </Text>
        </View>
        
        <View style={tw`w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full`}>
          <View 
            style={[
              tw`h-2 bg-green-500 rounded-full`,
              { width: `${progressPercentage}%` }
            ]} 
          />
        </View>
      </View>

      {/* Filtres */}
      <View style={tw`flex-row`}>
        <TouchableOpacity
          style={[
            tw`px-3 py-2 rounded-full flex-row items-center mr-2`,
            !showWatchedOnly
              ? tw`bg-blue-500`
              : tw`bg-gray-200 dark:bg-gray-700`
          ]}
          onPress={() => setShowWatchedOnly(false)}
        >
          <Ionicons
            name="list-outline"
            size={16}
            color={!showWatchedOnly ? '#ffffff' : '#6b7280'}
            style={tw`mr-1`}
          />
          <Text
            style={[
              tw`text-sm font-medium`,
              !showWatchedOnly
                ? tw`text-white`
                : tw`text-gray-700 dark:text-gray-300`
            ]}
          >
            Tous ({totalCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            tw`px-3 py-2 rounded-full flex-row items-center`,
            showWatchedOnly
              ? tw`bg-green-500`
              : tw`bg-gray-200 dark:bg-gray-700`
          ]}
          onPress={() => setShowWatchedOnly(true)}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={16}
            color={showWatchedOnly ? '#ffffff' : '#6b7280'}
            style={tw`mr-1`}
          />
          <Text
            style={[
              tw`text-sm font-medium`,
              showWatchedOnly
                ? tw`text-white`
                : tw`text-gray-700 dark:text-gray-300`
            ]}
          >
            Vus ({watchedCount})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEpisode = ({ item }: { item: Episode }) => (
    <EpisodeCard
      episode={item}
      isWatched={watchedIds.has(item.id)}
      onToggleWatched={handleToggleWatched}
    />
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100 dark:bg-gray-900`}>
      <FlatList
        data={filteredEpisodes}
        renderItem={renderEpisode}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={tw`pb-4`}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={tw`flex-1 items-center justify-center p-8`}>
            <Ionicons
              name="tv-outline"
              size={64}
              color="#9ca3af"
              style={tw`mb-4`}
            />
            <Text style={tw`text-gray-700 dark:text-gray-300 text-center text-lg font-medium`}>
              {showWatchedOnly ? 'Aucun épisode visionné' : 'Aucun épisode disponible'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}