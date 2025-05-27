import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { router } from 'expo-router';
import tw from 'twrnc';

interface CollectionAnimeCardProps {
  item: {
    collection: {
      id: string;
      status: string;
      progress: number;
    };
    anime: {
      id: string;
      kitsuId?: string;
      title: string;
      posterImage?: string;
      episodeCount?: number;
      status?: string;
    };
  };
}

const { width } = Dimensions.get('window');
const cardWidth = (width / 2) - 24;

export default function CollectionAnimeCard({ item }: CollectionAnimeCardProps) {
  const handlePress = () => {
    console.log('🎯 Navigation vers anime collection:', {
      animeId: item.anime.id,
      kitsuId: item.anime.kitsuId,
      title: item.anime.title
    });
    
    // Essayer d'abord avec l'ID Kitsu, puis avec l'ID local
    const navigationId = item.anime.kitsuId || item.anime.id;
    
    if (!navigationId) {
      Alert.alert('Erreur', 'Impossible d\'ouvrir cet anime');
      return;
    }
    
    router.push(`/anime/${navigationId}`);
  };

  const getImage = () => {
    console.log('🖼️ Getting image for collection item:', {
      title: item.anime.title,
      posterImage: item.anime.posterImage
    });
    
    if (!item.anime.posterImage) {
      console.log('🖼️ No poster image, using placeholder');
      return { uri: "https://via.placeholder.com/300x450/CCCCCC/888888?text=No+Image" };
    }
    
    console.log('🖼️ Using poster image:', item.anime.posterImage);
    return { uri: item.anime.posterImage };
  };

  const getProgress = () => {
    if (!item.anime.episodeCount || !item.collection.progress) return 0;
    return (item.collection.progress / item.anime.episodeCount) * 100;
  };

  const getStatusColor = () => {
    switch (item.collection.status) {
      case 'watching':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'planned':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'dropped':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusText = () => {
    switch (item.collection.status) {
      case 'watching': return 'En cours';
      case 'completed': return 'Terminé';
      case 'planned': return 'Planifié';
      case 'dropped': return 'Abandonné';
      default: return item.collection.status;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, tw`bg-white dark:bg-gray-800 shadow-md rounded-lg mb-4`]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Image 
        source={getImage()} 
        style={styles.image}
        onError={(e) => console.log('❌ Image load error:', e.nativeEvent.error)}
        onLoad={() => console.log('✅ Image loaded successfully for:', item.anime.title)}
      />
      
      <View style={tw`p-3`}>
        <Text 
          style={tw`text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2`}
          numberOfLines={2}
        >
          {item.anime.title}
        </Text>
        
        <View style={tw`flex-row items-center justify-between mb-2`}>
          <Text 
            style={[
              tw`text-xs px-2 py-1 rounded-full`,
              tw`${getStatusColor()}`
            ]}
          >
            {getStatusText()}
          </Text>
          
          {item.anime.episodeCount && (
            <Text style={tw`text-xs text-gray-500 dark:text-gray-400`}>
              {item.anime.episodeCount} ép.
            </Text>
          )}
        </View>
        
        {/* Barre de progression */}
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
            {item.collection.progress || 0}/{item.anime.episodeCount || '?'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: '#f3f4f6',
  }
});