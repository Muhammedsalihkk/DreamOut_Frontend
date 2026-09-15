import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { MOCK_JOURNEY_UPDATES, JourneyUpdate } from '@/data/mockData';

interface JourneyUpdatesProps {
  onSeeAllPress?: () => void;
}

export const JourneyUpdates: React.FC<JourneyUpdatesProps> = ({ onSeeAllPress }) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Journey Updates</Text>
        <TouchableOpacity onPress={onSeeAllPress} activeOpacity={0.7}>
          <Text style={styles.seeAllText}>See All →</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontally Scrollable Journey Feed */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {MOCK_JOURNEY_UPDATES.map((item: JourneyUpdate) => (
          <View key={item.id} style={styles.card}>
            {/* User Info Header (Tapping avatar/name opens Public Profile) */}
            <TouchableOpacity
              style={styles.userHeader}
              activeOpacity={0.75}
              onPress={() => router.push(`/user/${item.user.id}` as any)}
            >
              <Image source={{ uri: item.user.avatar }} style={styles.userAvatar} />
              <View style={styles.userInfoText}>
                <View style={styles.userNameRow}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {item.user.name}
                  </Text>
                  {item.user.isVerified && (
                    <Ionicons name="checkmark-circle" size={14} color="#FF6B00" style={{ marginLeft: 4 }} />
                  )}
                </View>
                <Text style={styles.actionSubtext} numberOfLines={1}>
                  {item.actionText} <Text style={styles.targetTitle}>{item.targetTitle}</Text>
                </Text>
              </View>
              <Text style={styles.timeAgo}>{item.timeAgo}</Text>
            </TouchableOpacity>

            {/* Travel Photo */}
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
              {item.isCompleted && (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-done-circle" size={14} color="#FFFFFF" />
                  <Text style={styles.completedBadgeText}>Completed</Text>
                </View>
              )}
            </View>

            {/* Social Action Bar */}
            <View style={styles.actionBar}>
              <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                <Ionicons name="heart-outline" size={16} color="#FF6B00" />
                <Text style={styles.actionCount}>{item.likesCount}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                <Ionicons name="chatbubble-outline" size={16} color="#8A8F9B" />
                <Text style={styles.actionCount}>{item.commentsCount}</Text>
              </TouchableOpacity>

              <View style={{ flex: 1 }} />

              <TouchableOpacity activeOpacity={0.7}>
                <Ionicons name="bookmark-outline" size={16} color="#8A8F9B" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
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
    gap: 14,
  },
  card: {
    width: 280,
    backgroundColor: 'rgba(18, 20, 26, 0.84)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 8,
  },
  userInfoText: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  actionSubtext: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 1,
  },
  targetTitle: {
    color: '#E0E4EB',
    fontWeight: '600',
  },
  timeAgo: {
    color: '#6F7482',
    fontSize: 10,
  },
  imageContainer: {
    height: 150,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  completedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 107, 0, 0.88)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  completedBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionCount: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
  },
});
