import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import tw from 'twrnc';

interface ProgressBarProps {
  progress: number; // 0 à 100
  showPercentage?: boolean;
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  label?: string;
}

export default function ProgressBar({
  progress,
  showPercentage = false,
  height = 8,
  backgroundColor,
  progressColor,
  label
}: ProgressBarProps) {
  // Assurer que la progression est entre 0 et 100
  const safeProgress = Math.max(0, Math.min(100, progress));
  
  return (
    <View>
      {label && (
        <Text style={tw`text-sm text-gray-700 dark:text-gray-300 mb-1`}>{label}</Text>
      )}
      
      <View style={[
        tw`w-full rounded-full ${backgroundColor || 'bg-gray-200 dark:bg-gray-700'}`,
        { height }
      ]}>
        <View
          style={[
            tw`rounded-full ${progressColor || 'bg-blue-500 dark:bg-blue-400'}`,
            { width: `${safeProgress}%`, height }
          ]}
        />
      </View>
      
      {showPercentage && (
        <Text style={tw`text-xs text-gray-500 dark:text-gray-400 mt-1 text-right`}>
          {Math.round(safeProgress)}%
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});