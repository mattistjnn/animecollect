import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import tw from 'twrnc';

interface LoadingIndicatorProps {
  text?: string;
  fullScreen?: boolean;
  size?: 'small' | 'large';
  color?: string;
}

export default function LoadingIndicator({
  text = 'Chargement...',
  fullScreen = false,
  size = 'large',
  color
}: LoadingIndicatorProps) {
  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, tw`bg-white dark:bg-gray-900`]}>
        <ActivityIndicator 
          size={size} 
          color={color || tw.color('blue-500')} 
        />
        {text && (
          <Text style={tw`text-gray-600 dark:text-gray-300 mt-4`}>{text}</Text>
        )}
      </View>
    );
  }

  return (
    <View style={tw`py-6 items-center justify-center`}>
      <ActivityIndicator 
        size={size} 
        color={color || tw.color('blue-500')} 
      />
      {text && (
        <Text style={tw`text-gray-600 dark:text-gray-300 mt-2`}>{text}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
});