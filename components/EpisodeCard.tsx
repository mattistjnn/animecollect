import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import tw from 'twrnc';

interface EpisodeCardProps {
  episode: {
    id: string;
    animeId: string;
    number: number;
    title?: string;
    thumbnail?: string;
    airdate?: string;
  };
  isWatched?: boolean;
  inWatchlist?: boolean;
  onMarkWatched?: (id: string) => void;
  onAddToWatchlist?: (id: string) => void;
}

export default function EpisodeCard({ 
  episode, 
  isWatched = false, 
  inWatchlist = false,
  onMarkWatched,
  onAddToWatchlist
}: EpisodeCardProps) {
  const [watched, setWatched] = useState(isWatched);
  const [inList, setInList] = useState(inWatchlist);

  useEffect(() => {
    setWatched(isWatched);
    setInList(inWatchlist);
  }, [isWatched, inWatchlist]);

  const handlePress = () => {
    router.push(`/anime/${episode.animeId}/${episode.id}`);
  };

  const handleMarkWatched = async () => {
    if (onMarkWatched) {
      onMarkWatched(episode.id);
    }
    setWatched(true);
    // Si l'épisode était dans la watchlist, le retirer
    if (inList) {
      setInList(false);
    }
  };

  const handleAddToWatchlist = async () => {
    if (onAddToWatchlist) {
      onAddToWatchlist(episode.id);
    }
    setInList(true);
  };

  const getImage = () => {
    if (!episode.thumbnail) {
      return { uri: "https://via.placeholder.com/300x200/CCCCCC/888888?text=Episode" };
    }
    return { uri: episode.thumbnail };
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date inconnue';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <TouchableOpacity
      style={[styles.card, tw`bg-white dark:bg-gray-800 shadow-sm rounded-lg flex-row mb-3`]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image source={getImage()} style={styles.image} />
        {watched && (
          <View style={[tw`absolute top-0 right-0 bg-green-500 rounded-bl-lg p-1`, styles.badge]}>
            <Text style={tw`text-white text-xs font-bold`}>✓</Text>
          </View>
        )}
        {inList && !watched && (
          <View style={[tw`absolute top-0 right-0 bg-blue-500 rounded-bl-lg p-1`, styles.badge]}>
            <Text style={tw`text-white text-xs font-bold`}>→</Text>
          </View>
        )}
      </View>
      
      <View style={tw`flex-1 p-3`}>
        <Text style={tw`text-sm font-bold text-gray-800 dark:text-gray-200`}>
          Épisode {episode.number}
        </Text>
        
        {episode.title && (
          <Text 
            style={tw`text-sm text-gray-700 dark:text-gray-300 mt-1`}
            numberOfLines={2}
          >
            {episode.title}
          </Text>
        )}
        
        {episode.airdate && (
          <Text style={tw`text-xs text-gray-500 dark:text-gray-400 mt-1`}>
            {formatDate(episode.airdate)}
          </Text>
        )}
        
        <View style={tw`flex-row mt-2`}>
          {!watched && (
            <TouchableOpacity 
              style={tw`bg-green-500 py-1 px-2 rounded-md mr-2`}
              onPress={handleMarkWatched}
            >
              <Text style={tw`text-white text-xs font-medium`}>Marquer comme vu</Text>
            </TouchableOpacity>
          )}
          
          {!inList && !watched && (
            <TouchableOpacity 
              style={tw`bg-blue-500 py-1 px-2 rounded-md`}
              onPress={handleAddToWatchlist}
            >
              <Text style={tw`text-white text-xs font-medium`}>À regarder</Text>
            </TouchableOpacity>
          )}
          
          {inList && (
            <View style={tw`bg-blue-100 dark:bg-blue-900 py-1 px-2 rounded-md`}>
              <Text style={tw`text-blue-800 dark:text-blue-200 text-xs font-medium`}>Dans ma liste</Text>
            </View>
          )}
          
          {watched && (
            <View style={tw`bg-green-100 dark:bg-green-900 py-1 px-2 rounded-md`}>
              <Text style={tw`text-green-800 dark:text-green-200 text-xs font-medium`}>Visionné</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: 100,
  },
  image: {
    width: 100,
    height: '100%',
    resizeMode: 'cover',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  badge: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  }
});


const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: 100,
  },
  image: {
    width: 100,
    height: '100%',
    resizeMode: 'cover',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  badge: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  }
});