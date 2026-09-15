import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { MOCK_STORIES, Story } from '@/data/mockData';

interface StoriesSectionProps {
  onSeeAllPress?: () => void;
  onAddStoryPress?: () => void;
}

export const StoriesSection: React.FC<StoriesSectionProps> = ({
  onSeeAllPress,
  onAddStoryPress,
}) => {
  const handleStoryTap = (story: Story) => {
    if (story.isUserStory) {
      if (onAddStoryPress) {
        onAddStoryPress();
      } else {
        Alert.alert('Add Story', 'Capture a new travel moment or route experience to add to your story.');
      }
    } else {
      Alert.alert(`Travel Story`, `Viewing ${story.title} travel story.`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Stories</Text>
        <TouchableOpacity onPress={onSeeAllPress} activeOpacity={0.7}>
          <Text style={styles.seeAllText}>See All →</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Story Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {MOCK_STORIES.map((story: Story) => (
          <TouchableOpacity
            key={story.id}
            style={styles.storyItem}
            activeOpacity={0.8}
            onPress={() => handleStoryTap(story)}
          >
            {story.isUserStory ? (
              <View style={styles.userStoryCircleWrapper}>
                <Image source={{ uri: story.image }} style={styles.storyAvatar} />
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
                  <Image source={{ uri: story.image }} style={styles.storyAvatar} />
                </View>
              </LinearGradient>
            )}

            <Text style={styles.storyLabel} numberOfLines={1}>
              {story.title}
            </Text>
          </TouchableOpacity>
        ))}
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
