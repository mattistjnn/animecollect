import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import tw from 'twrnc';

interface AnimeCardProps {
  anime: {
    id: string;
    canonicalTitle: string;
    posterImage?: {
      tiny?: string;
      small?: string;
      medium?: string;
      large?: string;
      original?: string;
    };
    episodeCount?: number;
    status?: string;
  };
  watched?: number; // Nombre d'épisodes regardés
  showProgress?: boolean;
}

const { width } = Dimensions.get('window');
const cardWidth = (width / 2) - 24; // 2 cartes par ligne avec un padding total de 32px

export default function AnimeCard({ anime, watched, showProgress = false }: AnimeCardProps) {
  const handlePress = () => {
    console.log('🎯 Navigating to anime:', anime.id);
    console.log('🎯 Anime data:', anime);
    router.push(`/anime/${anime.id}`);
  };

  const getImage = () => {
    console.log('🖼️ Getting image for:', anime.canonicalTitle);
    console.log('🖼️ Poster image data:', anime.posterImage);
    
    if (!anime.posterImage) {
      console.log('🖼️ No poster image, using placeholder');
      return { uri: "https://via.placeholder.com/300x450/CCCCCC/888888?text=Anime+Placeholder" };
    }
    
    const imageUrl = anime.posterImage.medium || anime.posterImage.small || anime.posterImage.tiny || anime.posterImage.large;
    console.log('🖼️ Using image URL:', imageUrl);
    
    return { uri: imageUrl };
  };

  const getProgress = () => {
    if (!anime.episodeCount || !watched) return 0;
    return (watched / anime.episodeCount) * 100;
  };

  return (
    <TouchableOpacity
      style={[styles.card, tw`bg-white dark:bg-gray-800 shadow-md rounded-lg`]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Image source={getImage()} style={styles.image} />
      
      <View style={tw`p-2`}>
        <Text 
          style={tw`text-sm font-semibold text-gray-800 dark:text-gray-200`}
          numberOfLines={2}
        >
          {anime.canonicalTitle}
        </Text>
        
        {anime.episodeCount && (
          <Text style={tw`text-xs text-gray-500 dark:text-gray-400 mt-1`}>
            {anime.episodeCount} épisodes
          </Text>
        )}
        
        {anime.status && (
          <Text 
            style={[
              tw`text-xs mt-1 px-2 py-1 rounded-full text-center`,
              anime.status === 'finished' 
                ? tw`bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`
                : anime.status === 'current' 
                  ? tw`bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`
                  : tw`bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`
            ]}
          >
            {anime.status === 'finished' ? 'Terminé' : 
             anime.status === 'current' ? 'En cours' : 
             anime.status === 'tba' ? 'À venir' : anime.status}
          </Text>
        )}
        
        {showProgress && watched !== undefined && anime.episodeCount && (
          <View style={tw`mt-2`}>
            <View style={tw`w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full`}>
              <View 
                style={[
                  tw`h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full`,
                  { width: `${getProgress()}%` }
                ]} 
              />
            </View>
            <Text style={tw`text-xs text-gray-500 dark:text-gray-400 mt-1 text-right`}>
              {watched}/{anime.episodeCount}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    marginBottom: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  }
});