import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Route } from '@/data/mockData';
import { useRouter } from 'expo-router';

interface ExploreRouteCardProps {
  route: Route;
  onPress?: () => void;
}

export const ExploreRouteCard: React.FC<ExploreRouteCardProps> = ({
  route,
  onPress,
}) => {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const handleCreatorPress = () => {
    router.push(`/user/${route.creator.id}` as any);
  };

  const handleSaveToggle = () => {
    setIsSaved(!isSaved);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={onPress}
    >
      {/* LEFT: Route Image (45% width balance) */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: route.image }} style={styles.cardImage} resizeMode="cover" />

        {/* Image Count Badge */}
        {route.imageCount ? (
          <View style={styles.imageCountBadge}>
            <Ionicons name="images-outline" size={11} color="#FFFFFF" style={{ marginRight: 3 }} />
            <Text style={styles.imageCountText}>+{route.imageCount}</Text>
          </View>
        ) : null}
      </View>

      {/* RIGHT: Route Details (55% width balance) */}
      <View style={styles.detailsContainer}>
        {/* Header: Title & Option Menu */}
        <View style={styles.titleRow}>
          <Text style={styles.routeTitle} numberOfLines={1}>
            {route.title}
          </Text>
          <TouchableOpacity onPress={handleSaveToggle} style={{ padding: 2 }}>
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={16}
              color={isSaved ? '#FF6B00' : '#8A8F9B'}
            />
          </TouchableOpacity>
        </View>

        {/* Location */}
        {route.location ? (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color="#FF6B00" style={{ marginRight: 3 }} />
            <Text style={styles.locationText} numberOfLines={1}>
              {route.location}
            </Text>
          </View>
        ) : null}

        {/* Short Description */}
        <Text style={styles.routeDesc} numberOfLines={2}>
          {route.description}
        </Text>

        {/* Creator Info Row with Follow Button */}
        <View style={styles.creatorRow}>
          <TouchableOpacity
            style={styles.creatorInfo}
            activeOpacity={0.75}
            onPress={handleCreatorPress}
          >
            <Image source={{ uri: route.creator.avatar }} style={styles.creatorAvatar} />
            <Text style={styles.creatorName} numberOfLines={1}>
              {route.creator.name}
            </Text>
            {route.creator.isVerified && (
              <Ionicons name="checkmark-circle" size={12} color="#FF6B00" style={{ marginLeft: 2 }} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.followBtn, isFollowing && styles.followingBtn]}
            activeOpacity={0.8}
            onPress={() => setIsFollowing(!isFollowing)}
          >
            <Text style={[styles.followBtnText, isFollowing && styles.followingBtnText]}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Footer (Likes, Comments, Completed) */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="heart-outline" size={13} color="#FF6B00" />
            <Text style={styles.statText}>{route.likesCount}</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="chatbubble-outline" size={13} color="#8A8F9B" />
            <Text style={styles.statText}>{route.commentsCount}</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="walk-outline" size={14} color="#8A8F9B" />
            <Text style={styles.statText}>{route.completedCount}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    height: 155,
    backgroundColor: 'rgba(18, 20, 26, 0.84)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    marginBottom: 14,
  },
  imageContainer: {
    width: '44%',
    height: '100%',
    backgroundColor: '#1E212A',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imageCountBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(10, 11, 15, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  imageCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  detailsContainer: {
    width: '56%',
    height: '100%',
    padding: 10,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    marginRight: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  locationText: {
    color: '#9CA3AF',
    fontSize: 10.5,
  },
  routeDesc: {
    color: '#D1D5DB',
    fontSize: 11,
    lineHeight: 14.5,
    marginVertical: 3,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  creatorAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 5,
  },
  creatorName: {
    color: '#E0E4EB',
    fontSize: 11,
    fontWeight: '600',
  },
  followBtn: {
    backgroundColor: 'rgba(255, 107, 0, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.4)',
  },
  followingBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  followBtnText: {
    color: '#FF6B00',
    fontSize: 9.5,
    fontWeight: '700',
  },
  followingBtnText: {
    color: '#9CA3AF',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statText: {
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '500',
  },
});
