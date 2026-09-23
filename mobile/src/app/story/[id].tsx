import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StoryView } from '@/components/story/StoryView';
import { getStoryById, MOCK_STORIES } from '@/data/mockData';

export default function StoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const storyId = Array.isArray(id) ? id[0] : id;
  const currentStoryIndex = MOCK_STORIES.findIndex((s) => s.id === storyId);
  const story = getStoryById(storyId || '') || MOCK_STORIES[0];

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleSelectRoute = (routeId: string) => {
    router.push(`/route/${routeId}` as any);
  };

  const handleNextStory = () => {
    if (currentStoryIndex !== -1 && currentStoryIndex < MOCK_STORIES.length - 1) {
      const nextStory = MOCK_STORIES[currentStoryIndex + 1];
      router.replace(`/story/${nextStory.id}` as any);
    } else {
      handleClose();
    }
  };

  const handlePrevStory = () => {
    if (currentStoryIndex > 0) {
      const prevStory = MOCK_STORIES[currentStoryIndex - 1];
      router.replace(`/story/${prevStory.id}` as any);
    }
  };

  if (!story) {
    return (
      <View style={styles.fallbackContainer}>
        <Text style={styles.fallbackText}>Story not found.</Text>
        <TouchableOpacity style={styles.fallbackButton} onPress={handleClose}>
          <Text style={styles.fallbackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <StoryView
      story={story}
      onClose={handleClose}
      onSelectRoute={handleSelectRoute}
      onNextStory={handleNextStory}
      onPrevStory={handlePrevStory}
    />
  );
}

const styles = StyleSheet.create({
  fallbackContainer: {
    flex: 1,
    backgroundColor: '#0A0B0E',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  fallbackText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  fallbackButton: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  fallbackButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
