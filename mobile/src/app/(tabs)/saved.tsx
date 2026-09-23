import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useRouteStore } from '@/store/useRouteStore';
import { useMomentStore } from '@/store/useMomentStore';
import { Route, Spot } from '@/data/mockData';

type FilterTab = 'all' | 'routes' | 'spots' | 'moments';

export default function SavedScreen() {
  const router = useRouter();
  const { routes: allRoutes, spots: allSpots } = useRouteStore();
  const { moments: allMoments } = useMomentStore();

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Initial saved IDs (pre-seeded with popular Munnar items)
  const [savedRouteIds, setSavedRouteIds] = useState<string[]>(['r1', 'r2', 'r3']);
  const [savedSpotIds, setSavedSpotIds] = useState<string[]>(['spot-1', 'spot-2', 'spot-3']);
  const [savedMomentIds, setSavedMomentIds] = useState<string[]>(['m-1', 'm-2']);

  // Filtered Saved Lists
  const savedRoutes = useMemo(() => {
    return allRoutes.filter((r) => savedRouteIds.includes(r.id));
  }, [allRoutes, savedRouteIds]);

  const savedSpots = useMemo(() => {
    return allSpots.filter((s) => savedSpotIds.includes(s.id));
  }, [allSpots, savedSpotIds]);

  const savedMoments = useMemo(() => {
    return allMoments.filter((m) => savedMomentIds.includes(m.id));
  }, [allMoments, savedMomentIds]);

  // Unbookmark handlers
  const handleToggleSaveRoute = (routeId: string) => {
    setSavedRouteIds((prev) =>
      prev.includes(routeId) ? prev.filter((id) => id !== routeId) : [...prev, routeId]
    );
  };

  const handleToggleSaveSpot = (spotId: string) => {
    setSavedSpotIds((prev) =>
      prev.includes(spotId) ? prev.filter((id) => id !== spotId) : [...prev, spotId]
    );
  };

  const handleToggleSaveMoment = (momentId: string) => {
    setSavedMomentIds((prev) =>
      prev.includes(momentId) ? prev.filter((id) => id !== momentId) : [...prev, momentId]
    );
  };

  // Filtered items by search query
  const filteredRoutes = useMemo(() => {
    if (!searchQuery.trim()) return savedRoutes;
    const q = searchQuery.toLowerCase();
    return savedRoutes.filter(
      (r) => r.title.toLowerCase().includes(q) || r.location.toLowerCase().includes(q)
    );
  }, [savedRoutes, searchQuery]);

  const filteredSpots = useMemo(() => {
    if (!searchQuery.trim()) return savedSpots;
    const q = searchQuery.toLowerCase();
    return savedSpots.filter(
      (s) => s.name.toLowerCase().includes(q) || s.location.toLowerCase().includes(q)
    );
  }, [savedSpots, searchQuery]);

  const filteredMoments = useMemo(() => {
    if (!searchQuery.trim()) return savedMoments;
    const q = searchQuery.toLowerCase();
    return savedMoments.filter(
      (m) =>
        m.caption.toLowerCase().includes(q) ||
        (m.spot && m.spot.name.toLowerCase().includes(q))
    );
  }, [savedMoments, searchQuery]);

  const totalSavedCount = savedRoutes.length + savedSpots.length + savedMoments.length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0B0E" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Screen Header */}
        <View style={styles.headerBlock}>
          <Text style={styles.title}>Saved Items</Text>
          <Text style={styles.subtitle}>Your bookmarked routes, spots, and memories</Text>
        </View>

        {/* Stats Summary Bar */}
        <View style={styles.statsBanner}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{savedRoutes.length}</Text>
            <Text style={styles.statLabel}>Routes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{savedSpots.length}</Text>
            <Text style={styles.statLabel}>Spots</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{savedMoments.length}</Text>
            <Text style={styles.statLabel}>Moments</Text>
          </View>
        </View>

        {/* Search Input */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#8A8F9B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search in saved items..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#8A8F9B" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Tabs */}
        <View style={styles.tabsRow}>
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'routes', label: `Routes (${savedRoutes.length})` },
              { id: 'spots', label: `Spots (${savedSpots.length})` },
              { id: 'moments', label: `Moments (${savedMoments.length})` },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabChip, isActive && styles.tabChipActive]}
                activeOpacity={0.8}
                onPress={() => setActiveTab(tab.id as FilterTab)}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {totalSavedCount === 0 ? (
          /* Empty State */
          <View style={styles.emptyContainer}>
            <Ionicons name="bookmark-outline" size={48} color="#FF6B00" />
            <Text style={styles.emptyTitle}>No Saved Items Yet</Text>
            <Text style={styles.emptySub}>
              Explore routes and spots, then tap the bookmark icon to save them for your next trip.
            </Text>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => router.push('/explore')}
            >
              <Text style={styles.exploreBtnText}>Explore DreamOut</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.itemsSection}>
            {/* 1. SAVED ROUTES SECTION */}
            {(activeTab === 'all' || activeTab === 'routes') && filteredRoutes.length > 0 && (
              <View style={styles.categoryBlock}>
                <View style={styles.blockHeader}>
                  <Ionicons name="map-outline" size={20} color="#FF6B00" />
                  <Text style={styles.blockTitle}>Saved Routes</Text>
                  <Text style={styles.blockCount}>({filteredRoutes.length})</Text>
                </View>

                {filteredRoutes.map((route) => (
                  <TouchableOpacity
                    key={route.id}
                    style={styles.routeCard}
                    activeOpacity={0.85}
                    onPress={() => router.push(`/route/${route.id}` as any)}
                  >
                    <Image source={{ uri: route.coverImage }} style={styles.routeCover} />
                    <View style={styles.routeOverlayGradient} />

                    {/* Bookmark Button */}
                    <TouchableOpacity
                      style={styles.bookmarkBadge}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleToggleSaveRoute(route.id);
                      }}
                    >
                      <Ionicons name="bookmark" size={18} color="#FF6B00" />
                    </TouchableOpacity>

                    <View style={styles.routeCardContent}>
                      <View style={styles.routeCategoryBadge}>
                        <Text style={styles.routeCategoryText}>{route.category || 'Mountains'}</Text>
                      </View>
                      <Text style={styles.routeTitle}>{route.title}</Text>
                      <Text style={styles.routeSub}>{route.location}</Text>

                      <View style={styles.routeMetricsRow}>
                        <Text style={styles.routeMetricText}>{route.placeCount} Places</Text>
                        <Text style={styles.metricDot}>•</Text>
                        <Text style={styles.routeMetricText}>{route.distance}</Text>
                        <Text style={styles.metricDot}>•</Text>
                        <Text style={styles.routeMetricText}>{route.duration}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* 2. SAVED SPOTS SECTION */}
            {(activeTab === 'all' || activeTab === 'spots') && filteredSpots.length > 0 && (
              <View style={styles.categoryBlock}>
                <View style={styles.blockHeader}>
                  <Ionicons name="location-outline" size={20} color="#FF6B00" />
                  <Text style={styles.blockTitle}>Saved Spots</Text>
                  <Text style={styles.blockCount}>({filteredSpots.length})</Text>
                </View>

                {filteredSpots.map((spot) => (
                  <TouchableOpacity
                    key={spot.id}
                    style={styles.spotCard}
                    activeOpacity={0.85}
                    onPress={() => router.push(`/spot/${spot.id}` as any)}
                  >
                    <Image source={{ uri: spot.image }} style={styles.spotThumb} />
                    <View style={styles.spotInfo}>
                      <Text style={styles.spotName}>{spot.name}</Text>
                      <View style={styles.spotLocationRow}>
                        <Ionicons name="location-sharp" size={13} color="#FF6B00" />
                        <Text style={styles.spotLocationText}>{spot.location}</Text>
                      </View>
                      <View style={styles.spotTagBadge}>
                        <Text style={styles.spotTagText}>{spot.category}</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.iconBookmarkBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleToggleSaveSpot(spot.id);
                      }}
                    >
                      <Ionicons name="bookmark" size={18} color="#FF6B00" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* 3. SAVED MOMENTS SECTION */}
            {(activeTab === 'all' || activeTab === 'moments') && filteredMoments.length > 0 && (
              <View style={styles.categoryBlock}>
                <View style={styles.blockHeader}>
                  <Ionicons name="camera-outline" size={20} color="#FF6B00" />
                  <Text style={styles.blockTitle}>Saved Moments</Text>
                  <Text style={styles.blockCount}>({filteredMoments.length})</Text>
                </View>

                {filteredMoments.map((moment) => (
                  <View key={moment.id} style={styles.momentCard}>
                    <View style={styles.momentCardHeader}>
                      <Image source={{ uri: moment.user.avatar }} style={styles.userAvatar} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.userName}>{moment.user.name}</Text>
                        <Text style={styles.momentTime}>{moment.timeAgo}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleToggleSaveMoment(moment.id)}
                      >
                        <Ionicons name="bookmark" size={18} color="#FF6B00" />
                      </TouchableOpacity>
                    </View>

                    {moment.mediaUri && (
                      <Image source={{ uri: moment.mediaUri }} style={styles.momentImage} />
                    )}

                    <Text style={styles.momentCaption}>{moment.caption}</Text>

                    {moment.spot && (
                      <View style={styles.momentTag}>
                        <Ionicons name="location-sharp" size={12} color="#FF6B00" />
                        <Text style={styles.momentTagText}>{moment.spot.name}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0B0E' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  headerBlock: { marginTop: 10, marginBottom: 16 },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#8A8F9B', fontSize: 13, marginTop: 4 },

  statsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12141A',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statNumber: { color: '#FF6B00', fontSize: 20, fontWeight: '800' },
  statLabel: { color: '#8A8F9B', fontSize: 12, fontWeight: '600', marginTop: 2 },
  statDivider: { width: 1, height: 24, backgroundColor: 'rgba(255, 255, 255, 0.1)' },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12141A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 16,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: '#FFFFFF', fontSize: 14 },

  tabsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  tabChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabChipActive: { backgroundColor: '#FF6B00', borderColor: '#FF6B00' },
  tabText: { color: '#8A8F9B', fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: '#FFFFFF', fontWeight: '700' },

  itemsSection: { gap: 20 },
  categoryBlock: { marginBottom: 10 },
  blockHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  blockTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  blockCount: { color: '#8A8F9B', fontSize: 14, fontWeight: '600' },

  routeCard: {
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  routeCover: { width: '100%', height: '100%' },
  routeOverlayGradient: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(10,11,14,0.55)' },
  bookmarkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(18, 20, 26, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  routeCardContent: { position: 'absolute', bottom: 14, left: 14, right: 14 },
  routeCategoryBadge: {
    backgroundColor: 'rgba(255, 107, 0, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  routeCategoryText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  routeTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  routeSub: { color: '#D1D5DB', fontSize: 12, marginTop: 2 },
  routeMetricsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  routeMetricText: { color: '#FF6B00', fontSize: 12, fontWeight: '700' },
  metricDot: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },

  spotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 20, 26, 0.85)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    marginBottom: 10,
  },
  spotThumb: { width: 60, height: 60, borderRadius: 12, marginRight: 12 },
  spotInfo: { flex: 1, marginRight: 8 },
  spotName: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  spotLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  spotLocationText: { color: '#8A8F9B', fontSize: 12 },
  spotTagBadge: {
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  spotTagText: { color: '#FF6B00', fontSize: 10, fontWeight: '700' },
  iconBookmarkBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  momentCard: {
    backgroundColor: '#12141A',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 14,
    marginBottom: 12,
  },
  momentCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  userAvatar: { width: 36, height: 36, borderRadius: 18 },
  userName: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  momentTime: { color: '#8A8F9B', fontSize: 11 },
  momentImage: { width: '100%', height: 160, borderRadius: 12, marginBottom: 10 },
  momentCaption: { color: '#FFFFFF', fontSize: 13, lineHeight: 18, marginBottom: 8 },
  momentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,107,0,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  momentTagText: { color: '#FF6B00', fontSize: 11, fontWeight: '700' },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    backgroundColor: 'rgba(18, 20, 26, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 20,
  },
  emptyTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginTop: 14 },
  emptySub: { color: '#8A8F9B', fontSize: 13, textAlign: 'center', marginTop: 6, marginBottom: 18 },
  exploreBtn: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  exploreBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
