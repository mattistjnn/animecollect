import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useAnimeSearch } from '@/hooks/useAnimeApi';
import AnimeCard from '@/components/AnimeCard';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SearchScreen() {
  const [searchText, setSearchText] = useState('');
  const { query, setQuery, results, isLoading, error, hasNextPage, loadMore } = useAnimeSearch();

  const handleSearch = () => {
    if (searchText.trim().length > 0) {
      setQuery(searchText.trim());
    }
  };

  const clearSearch = () => {
    setSearchText('');
    setQuery('');
  };

  const renderFooter = () => {
    if (!isLoading) return null;
    
    return (
      <View style={tw`py-4`}>
        <LoadingIndicator size="small" text="Chargement..." />
      </View>
    );
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100 dark:bg-gray-900`} edges={['bottom']}>
      <View style={tw`px-4 pt-2 pb-4`}>
        <View style={tw`flex-row items-center mb-4`}>
          <View style={tw`flex-1 flex-row items-center bg-white dark:bg-gray-800 rounded-lg px-3 py-2`}>
            <Ionicons 
              name="search" 
              size={20} 
              color="#9ca3af" 
              style={tw`mr-2`} 
            />
            <TextInput
              style={tw`flex-1 text-gray-800 dark:text-white`}
              placeholder="Rechercher un anime..."
              placeholderTextColor="#9ca3af"
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoCapitalize="none"
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons name="close-circle" size={20} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity 
            style={tw`ml-2 bg-blue-500 rounded-lg px-4 py-2`}
            onPress={handleSearch}
          >
            <Text style={tw`text-white font-medium`}>Rechercher</Text>
          </TouchableOpacity>
        </View>
        
        {!query && (
          <View style={tw`items-center justify-center py-8`}>
            <Ionicons 
              name="search-outline" 
              size={64} 
              color="#d1d5db" 
              style={tw`mb-4`} 
            />
            <Text style={tw`text-gray-500 dark:text-gray-400 text-center`}>
              Recherchez vos animes préférés par titre
            </Text>
          </View>
        )}
        
        {error && (
          <View style={tw`bg-red-100 dark:bg-red-900 p-4 rounded-lg mb-4`}>
            <Text style={tw`text-red-600 dark:text-red-300 text-center`}>
              Une erreur est survenue. Veuillez réessayer.
            </Text>
          </View>
        )}
        
        {query && results.length === 0 && !isLoading && (
          <View style={tw`items-center justify-center py-8`}>
            <Ionicons 
              name="alert-circle-outline" 
              size={64} 
              color="#d1d5db" 
              style={tw`mb-4`} 
            />
            <Text style={tw`text-gray-500 dark:text-gray-400 text-center`}>
              Aucun résultat pour "{query}"
            </Text>
          </View>
        )}
      </View>
      
      {query && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AnimeCard
              anime={{
                id: item.id,
                canonicalTitle: item.canonicalTitle,
                posterImage: item.posterImage,
                episodeCount: item.episodeCount,
                status: item.status
              }}
            />
          )}
          numColumns={2}
          contentContainerStyle={styles.grid}
          onEndReached={() => {
            if (hasNextPage && !isLoading) {
              loadMore();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
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