import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { MOCK_ROUTES, Route } from '@/data/mockData';

interface RouteSectionProps {
  onSeeAllPress?: () => void;
  onRoutePress?: (route: Route) => void;
}

export const RouteSection: React.FC<RouteSectionProps> = ({
  onSeeAllPress,
  onRoutePress,
}) => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Latest Routes</Text>
        <TouchableOpacity onPress={onSeeAllPress} activeOpacity={0.7}>
          <Text style={styles.seeAllText}>See All →</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontally Scrollable Route Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {MOCK_ROUTES.map((route: Route) => (
          <TouchableOpacity
            key={route.id}
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => onRoutePress && onRoutePress(route)}
          >
            {/* Route Image Container */}
            <View style={styles.imageContainer}>
              <Image source={{ uri: route.image }} style={styles.cardImage} resizeMode="cover" />
              <View style={styles.imageCountBadge}>
                <Ionicons name="images-outline" size={12} color="#FFFFFF" />
                <Text style={styles.imageCountText}>+{route.imageCount}</Text>
              </View>

              <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
                <Ionicons name="ellipsis-horizontal" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Route Details */}
            <View style={styles.detailsContainer}>
              {/* Creator Info (Tapping avatar/name opens creator's Public Profile) */}
              <TouchableOpacity
                style={styles.creatorRow}
                activeOpacity={0.75}
                onPress={() => router.push(`/user/${route.creator.id}` as any)}
              >
                <Image source={{ uri: route.creator.avatar }} style={styles.creatorAvatar} />
                <Text style={styles.creatorName} numberOfLines={1}>
                  {route.creator.name}
                </Text>
                {route.creator.isVerified && (
                  <Ionicons name="checkmark-circle" size={14} color="#FF6B00" style={{ marginLeft: 3 }} />
                )}
                <Text style={styles.timeAgo}> • {route.timeAgo}</Text>
              </TouchableOpacity>

              {/* Title & Description */}
              <Text style={styles.routeTitle} numberOfLines={1}>
                {route.title}
              </Text>
              <Text style={styles.routeDesc} numberOfLines={2}>
                {route.description}
              </Text>

              {/* Stats Footer */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="heart-outline" size={15} color="#FF6B00" />
                  <Text style={styles.statText}>{route.likesCount}</Text>
                </View>

                <View style={styles.statItem}>
                  <Ionicons name="chatbubble-outline" size={15} color="#8A8F9B" />
                  <Text style={styles.statText}>{route.commentsCount}</Text>
                </View>

                <View style={styles.statItem}>
                  <Ionicons name="compass-outline" size={15} color="#8A8F9B" />
                  <Text style={styles.statText}>{route.completedCount} done</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
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
    width: 270,
    backgroundColor: 'rgba(18, 20, 26, 0.84)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  imageContainer: {
    height: 145,
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
    backgroundColor: 'rgba(10, 11, 15, 0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  imageCountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  menuButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(10, 11, 15, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    padding: 14,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  creatorAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginRight: 6,
  },
  creatorName: {
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '600',
  },
  timeAgo: {
    color: '#6F7482',
    fontSize: 11,
  },
  routeTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  routeDesc: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '500',
  },
});
