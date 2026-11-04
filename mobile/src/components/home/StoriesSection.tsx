import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { MOCK_STORIES, Story } from '@/data/mockData';
import { StoryService } from '@/services/story.service';
import { useAuthStore } from '@/store/useAuthStore';

interface StoriesSectionProps {
  onSeeAllPress?: () => void;
  onAddStoryPress?: () => void;
  onStoryPress?: (story: Story) => void;
}

export const StoriesSection: React.FC<StoriesSectionProps> = ({
  onSeeAllPress,
  onAddStoryPress,
  onStoryPress,
}) => {
  const router = useRouter();
  const authUser = useAuthStore((state) => state.user);
  const [stories, setStories] = useState<Story[]>(MOCK_STORIES);

  useEffect(() => {
    let isMounted = true;
    StoryService.getStories().then((backendStories) => {
      if (isMounted && backendStories && backendStories.length > 0) {
        setStories(backendStories);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleStoryTap = (story: Story) => {
    if (onStoryPress) {
      onStoryPress(story);
      return;
    }
    if (story.isUserStory && onAddStoryPress) {
      onAddStoryPress();
      return;
    }
    router.push(`/story/${story.id}` as any);
  };

  return (
    <View style={styles.container}>
      {/* Horizontal Story Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {stories.map((story: Story) => {
          const isUser = Boolean(story.isUserStory);
          const imageUri = isUser && authUser?.avatar ? authUser.avatar : story.image;
          const storyLabel = isUser ? 'Your Story' : story.title;

          return (
            <TouchableOpacity
              key={story.id}
              style={styles.storyItem}
              activeOpacity={0.8}
              onPress={() => handleStoryTap(story)}
            >
              {isUser ? (
                <View style={styles.userStoryCircleWrapper}>
                  <Image source={{ uri: imageUri }} style={styles.storyAvatar} />
                  <View style={styles.plusBadge}>
                    <Ionicons name="add" size={12} color="#FFFFFF" />
                  </View>
                </View>
              ) : (
                <LinearGradient
                  colors={['#FF6B00', '#FF8533', '#FF4500']}
                  style={styles.gradientRing}
                >
                  <View style={styles.innerCircle}>
                    <Image source={{ uri: imageUri }} style={styles.storyAvatar} />
                  </View>
                </LinearGradient>
              )}

              <Text style={styles.storyLabel} numberOfLines={1}>
                {storyLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 2,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  seeAllText: {
    color: '#FF6B00',
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 18,
    gap: 16,
  },
  storyItem: {
    alignItems: 'center',
    width: 68,
  },
  userStoryCircleWrapper: {
    position: 'relative',
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 2,
    backgroundColor: '#12141A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0A0B0E',
  },
  gradientRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#0A0B0E',
    overflow: 'hidden',
  },
  storyAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    backgroundColor: '#1E212A',
  },
  storyLabel: {
    color: '#D1D5DB',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 6,
    textAlign: 'center',
  },
});
