import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { MOCK_SPOTS, Spot } from '@/data/mockData';

interface SpotSectionProps {
  onSeeAllPress?: () => void;
  onSpotPress?: (spot: Spot) => void;
}

export const SpotSection: React.FC<SpotSectionProps> = ({
  onSeeAllPress,
  onSpotPress,
}) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Discover Spots</Text>
        <TouchableOpacity onPress={onSeeAllPress} activeOpacity={0.7}>
          <Text style={styles.seeAllText}>See All →</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontally Scrollable Spot Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {MOCK_SPOTS.map((spot: Spot) => (
          <TouchableOpacity
            key={spot.id}
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => onSpotPress && onSpotPress(spot)}
          >
            {/* Spot Image */}
            <View style={styles.imageContainer}>
              <Image source={{ uri: spot.image }} style={styles.cardImage} resizeMode="cover" />
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{spot.category}</Text>
              </View>

              <View style={styles.routeCountBadge}>
                <Ionicons name="compass-outline" size={12} color="#FF6B00" />
                <Text style={styles.routeCountText}>{spot.routeCount} routes</Text>
              </View>
            </View>

            {/* Spot Details */}
            <View style={styles.detailsContainer}>
              <Text style={styles.spotName} numberOfLines={1}>
                {spot.name}
              </Text>

              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={13} color="#FF6B00" style={{ marginRight: 3 }} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {spot.location}
                </Text>
              </View>

              {spot.creator && (
                <TouchableOpacity
                  style={styles.creatorRow}
                  activeOpacity={0.75}
                  onPress={() => router.push(`/user/${spot.creator!.id}` as any)}
                >
                  <Image source={{ uri: spot.creator.avatar }} style={styles.creatorAvatar} />
                  <Text style={styles.creatorText} numberOfLines={1}>
                    Added by <Text style={{ color: '#E0E4EB', fontWeight: '600' }}>{spot.creator.name}</Text>
                  </Text>
                </TouchableOpacity>
              )}
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
    marginBottom: 24,
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
    width: 220,
    backgroundColor: 'rgba(18, 20, 26, 0.84)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  imageContainer: {
    height: 130,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(10, 11, 15, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  routeCountBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(18, 20, 26, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.4)',
    gap: 4,
  },
  routeCountText: {
    color: '#FF6B00',
    fontSize: 11,
    fontWeight: '700',
  },
  detailsContainer: {
    padding: 12,
  },
  spotName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    color: '#9CA3AF',
    fontSize: 11,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  creatorAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 6,
  },
  creatorText: {
    color: '#8A8F9B',
    fontSize: 10,
  },
});
