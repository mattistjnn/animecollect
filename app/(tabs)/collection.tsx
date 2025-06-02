import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { useUserCollection } from '@/hooks/useDataBase';
import AnimeCard from '@/components/AnimeCard';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as databaseService from '@/services/databaseService';

type FilterStatus = 'all' | 'watching' | 'completed' | 'planned' | 'dropped';

export default function CollectionScreen() {
  const { collection, isLoading, error, refresh } = useUserCollection();
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredCollection = collection.filter(item => {
    if (filter === 'all') return true;
    return item.collection.status === filter;
  });

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      console.log('🔄 Rafraîchissement de la collection...');
      await refresh();
      
      // Optionnel : rafraîchir aussi depuis le service de base de données
      const userCollection = await databaseService.getUserCollection();
      console.log('✅ Collection rafraîchie:', userCollection.length, 'éléments');
      
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh]);

  const onRefresh = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  const fetchCollection = useCallback(async () => {
    try {
      const userCollection = await databaseService.getUserCollection();
      console.log('📊 Collection récupérée:', userCollection);
      console.log('📊 Premier item:', userCollection[0]);
      if (userCollection[0]) {
        console.log('📊 Anime data:', userCollection[0].anime);
        console.log('📊 Poster image:', userCollection[0].anime.posterImage);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération de la collection:', err);
    }
  }, []);

  const renderFilterButton = (status: FilterStatus, label: string, icon: string) => (
    <TouchableOpacity
      key={status}
      style={[
        tw`px-3 py-2 rounded-full flex-row items-center mr-2`,
        filter === status
          ? tw`bg-blue-500 dark:bg-blue-600`
          : tw`bg-gray-200 dark:bg-gray-700`
      ]}
      onPress={() => setFilter(status)}
      activeOpacity={0.7}
    >
      <Ionicons
        name={icon as any}
        size={16}
        color={filter === status ? '#ffffff' : '#6b7280'}
        style={tw`mr-1`}
      />
      <Text
        style={[
          tw`text-sm font-medium`,
          filter === status
            ? tw`text-white`
            : tw`text-gray-700 dark:text-gray-300`
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={tw`px-4 pt-2`}>
      <View style={tw`flex-row items-center justify-between mb-2`}>
        <Text style={tw`text-xl font-bold text-gray-800 dark:text-white`}>
          Ma Collection
        </Text>
        
        {/* Bouton de rafraîchissement */}
        <TouchableOpacity
          style={[
            tw`bg-blue-500 px-3 py-2 rounded-lg flex-row items-center`,
            isRefreshing && tw`opacity-70`
          ]}
          onPress={handleRefresh}
          disabled={isRefreshing}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={isRefreshing ? "hourglass-outline" : "refresh-outline"} 
            size={16} 
            color="#ffffff" 
            style={[tw`mr-1`, isRefreshing && tw`animate-spin`]} 
          />
          <Text style={tw`text-white text-xs font-medium`}>
            {isRefreshing ? 'Actualisation...' : 'Actualiser'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[
          { status: 'all', label: 'Tous', icon: 'list-outline' },
          { status: 'watching', label: 'En cours', icon: 'eye-outline' },
          { status: 'completed', label: 'Terminés', icon: 'checkmark-circle-outline' },
          { status: 'planned', label: 'Planifiés', icon: 'time-outline' },
          { status: 'dropped', label: 'Abandonnés', icon: 'close-circle-outline' }
        ]}
        keyExtractor={(item) => item.status}
        renderItem={({ item }) => renderFilterButton(item.status as FilterStatus, item.label, item.icon)}
        style={tw`mb-4`}
      />
    </View>
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100 dark:bg-gray-900`} edges={['bottom']}>
      {renderHeader()}

      {isLoading ? (
        <LoadingIndicator size="large" text="Chargement de votre collection..." />
      ) : error ? (
        <View style={tw`p-4`}>
          <Text style={tw`text-red-500 dark:text-red-400 text-center mb-2`}>
            Erreur de chargement. Veuillez réessayer.
          </Text>
          <TouchableOpacity
            style={tw`bg-blue-500 px-4 py-2 rounded-lg self-center`}
            onPress={handleRefresh}
            disabled={isRefreshing}
          >
            <Text style={tw`text-white font-medium`}>
              {isRefreshing ? 'Actualisation...' : 'Réessayer'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : filteredCollection.length === 0 ? (
        <View style={tw`flex-1 items-center justify-center p-4`}>
          <Ionicons
            name="folder-open-outline"
            size={64}
            color="#9ca3af"
            style={tw`mb-4`}
          />
          <Text style={tw`text-gray-700 dark:text-gray-300 text-center text-lg font-medium`}>
            {filter === 'all'
              ? 'Votre collection est vide'
              : `Aucun anime ${
                  filter === 'watching'
                    ? 'en cours'
                    : filter === 'completed'
                    ? 'terminé'
                    : filter === 'planned'
                    ? 'planifié'
                    : 'abandonné'
                }`}
          </Text>
          <Text style={tw`text-gray-500 dark:text-gray-400 text-center mt-2 mb-4`}>
            {filter === 'all'
              ? 'Ajoutez des animes depuis l\'écran de recherche'
              : 'Ajoutez des animes dans cette catégorie depuis l\'écran de détails'}
          </Text>
          
          {/* Bouton de rafraîchissement dans l'état vide */}
          <TouchableOpacity
            style={[
              tw`bg-blue-500 px-4 py-2 rounded-lg flex-row items-center`,
              isRefreshing && tw`opacity-70`
            ]}
            onPress={handleRefresh}
            disabled={isRefreshing}
          >
            <Ionicons 
              name="refresh-outline" 
              size={16} 
              color="#ffffff" 
              style={tw`mr-2`} 
            />
            <Text style={tw`text-white font-medium`}>
              {isRefreshing ? 'Actualisation...' : 'Actualiser la collection'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredCollection}
          keyExtractor={(item) => item.collection.id}
          renderItem={({ item }) => {
            console.log('🎴 Rendering collection item:', {
              animeId: item.anime.id,
              kitsuId: item.anime.kitsuId,
              title: item.anime.title,
              posterImage: item.anime.posterImage
            });
            
            return (
              <AnimeCard
                anime={{
                  id: item.anime.kitsuId || item.anime.id,
                  canonicalTitle: item.anime.title,
                  posterImage: item.anime.posterImage ? {
                    tiny: item.anime.posterImage,
                    small: item.anime.posterImage,
                    medium: item.anime.posterImage,
                    large: item.anime.posterImage,
                    original: item.anime.posterImage
                  } : undefined,
                  episodeCount: item.anime.episodeCount,
                  status: item.anime.status,
                }}
                watched={item.collection.progress}
                showProgress={true}
              />
            );
          }}
          numColumns={2}
          contentContainerStyle={styles.grid}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});