import React, { useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet, ScrollView } from 'react-native';
import { useTrendingAnime } from '@/hooks/useAnimeApi';
import AnimeCard from '@/components/AnimeCard';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import tw from 'twrnc';
import { useWatchlist } from '@/hooks/useDataBase';
import EpisodeCard from '@/components/EpisodeCard';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { trending, isLoading, error, refresh } = useTrendingAnime();
  const { watchlist, isLoading: isLoadingWatchlist, refresh: refreshWatchlist } = useWatchlist();

  const onRefresh = useCallback(() => {
    refresh();
    refreshWatchlist();
  }, [refresh, refreshWatchlist]);

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100 dark:bg-gray-900`} edges={['bottom']}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
        style={tw`flex-1`}
      >
        {/* Section Tendances */}
        <View style={[tw`px-4 pt-2 pb-6`]}>
          <Text style={tw`text-xl font-bold text-gray-800 dark:text-white mb-2`}>
            Tendances
          </Text>
          
          {isLoading && trending.length === 0 ? (
            <LoadingIndicator size="large" text="Chargement des tendances..." />
          ) : error ? (
            <View style={tw`bg-white dark:bg-gray-800 p-4 rounded-lg`}>
              <Text style={tw`text-red-500 dark:text-red-400 text-center`}>
                Erreur de chargement. Veuillez réessayer.
              </Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {trending.map((anime) => (
                <AnimeCard
                  key={anime.id}
                  anime={{
                    id: anime.id,
                    canonicalTitle: anime.canonicalTitle,
                    posterImage: anime.posterImage,
                    episodeCount: anime.episodeCount,
                    status: anime.status,
                  }}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
});