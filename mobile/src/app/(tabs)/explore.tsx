import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

import {
  MOCK_ALL_EXPLORE_ROUTES,
  MOCK_ALL_EXPLORE_SPOTS,
  MOCK_PEOPLE,
  Route,
  Spot,
  ExploreUser,
} from '@/data/mockData';

import { ExploreHeader } from '@/components/explore/ExploreHeader';
import { ExploreSearchBar } from '@/components/explore/ExploreSearchBar';
import { ExploreCategoryList } from '@/components/explore/ExploreCategoryList';
import { ExploreRouteCard } from '@/components/explore/ExploreRouteCard';
import { ExploreUserCard } from '@/components/explore/ExploreUserCard';
import { ProfileEmptyState } from '@/components/profile/ProfileEmptyState';

export type ExploreTabType = 'routes' | 'spots' | 'people';
export type ExploreFilterType = 'popular' | 'nearby' | 'latest' | 'mostExplored';

export default function ExploreScreen() {
  const router = useRouter();

  // State management for search, category, tab switcher, filter chip, sort option
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState<ExploreTabType>('routes');
  const [activeFilter, setActiveFilter] = useState<ExploreFilterType>('popular');
  const [sortOption, setSortOption] = useState<'popular' | 'latest' | 'mostExplored' | 'nearby'>('popular');

  // Filtered & Sorted Routes
  const filteredRoutes = useMemo(() => {
    return MOCK_ALL_EXPLORE_ROUTES.filter((r) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.location && r.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        r.creator.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' ||
        (r.category && r.category.toLowerCase() === selectedCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      if (sortOption === 'popular' || activeFilter === 'popular') {
        return b.likesCount - a.likesCount;
      }
      if (sortOption === 'mostExplored' || activeFilter === 'mostExplored') {
        return b.completedCount - a.completedCount;
      }
      return 0;
    });
  }, [searchQuery, selectedCategory, sortOption, activeFilter]);

  // Filtered Spots
  const filteredSpots = useMemo(() => {
    return MOCK_ALL_EXPLORE_SPOTS.filter((s) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.creator?.name || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' ||
        (s.category || '').toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Filtered People
  const filteredPeople = useMemo(() => {
    return MOCK_PEOPLE.filter((p) => {
      return (
        searchQuery.trim() === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.bio.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [searchQuery]);

  const handleRoutePress = (route: Route) => {
    router.push(`/route/${route.id}` as any);
  };

  const handleSpotPress = (spot: Spot) => {
    router.push(`/spot/${spot.id}` as any);
  };

  const handleCreatorPress = (creatorId: string) => {
    router.push(`/user/${creatorId}` as any);
  };

  const handleSortMenuTap = () => {
    Alert.alert(
      'Sort Results By',
      'Choose sorting criteria',
      [
        { text: 'Popular (Most Liked)', onPress: () => setSortOption('popular') },
        { text: 'Latest Published', onPress: () => setSortOption('latest') },
        { text: 'Most Explored', onPress: () => setSortOption('mostExplored') },
        { text: 'Nearby', onPress: () => setSortOption('nearby') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0B0E" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header with Location Selector */}
        <ExploreHeader />

        {/* 2. Page Title Block */}
        <View style={styles.titleBlock}>
          <Text style={styles.pageTitle}>Explore</Text>
          <Text style={styles.pageSubtitle}>
            Find routes, spots and people for your next adventure.
          </Text>
        </View>

        {/* 3. Prominent Search Bar */}
        <ExploreSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFilterPress={() => {
            Alert.alert('Filter Options', 'Select category, distance and difficulty.');
          }}
        />

        {/* 4. Category Chips Bar */}
        <ExploreCategoryList
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* 5. Main Content Tabs (Routes | Spots | People) */}
        <View style={styles.mainTabsContainer}>
          <TouchableOpacity
            style={[styles.mainTab, activeTab === 'routes' && styles.mainTabActive]}
            activeOpacity={0.75}
            onPress={() => setActiveTab('routes')}
          >
            <Text style={[styles.mainTabText, activeTab === 'routes' && styles.mainTabTextActive]}>
              Routes
            </Text>
            {activeTab === 'routes' && <View style={styles.activeTabLine} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mainTab, activeTab === 'spots' && styles.mainTabActive]}
            activeOpacity={0.75}
            onPress={() => setActiveTab('spots')}
          >
            <Text style={[styles.mainTabText, activeTab === 'spots' && styles.mainTabTextActive]}>
              Spots
            </Text>
            {activeTab === 'spots' && <View style={styles.activeTabLine} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mainTab, activeTab === 'people' && styles.mainTabActive]}
            activeOpacity={0.75}
            onPress={() => setActiveTab('people')}
          >
            <Text style={[styles.mainTabText, activeTab === 'people' && styles.mainTabTextActive]}>
              People
            </Text>
            {activeTab === 'people' && <View style={styles.activeTabLine} />}
          </TouchableOpacity>
        </View>

        {/* 6. DISCOVERY FILTERS & SORTING ROW (When Routes tab active) */}
        {activeTab === 'routes' && (
          <View style={styles.filtersSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterChipsScroll}
            >
              <TouchableOpacity
                style={[styles.filterChip, activeFilter === 'popular' && styles.filterChipActive]}
                onPress={() => {
                  setActiveFilter('popular');
                  setSortOption('popular');
                }}
              >
                <Text style={[styles.filterChipText, activeFilter === 'popular' && styles.filterChipTextActive]}>
                  Popular
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterChip, activeFilter === 'nearby' && styles.filterChipActive]}
                onPress={() => {
                  setActiveFilter('nearby');
                  setSortOption('nearby');
                }}
              >
                <Text style={[styles.filterChipText, activeFilter === 'nearby' && styles.filterChipTextActive]}>
                  Nearby
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterChip, activeFilter === 'latest' && styles.filterChipActive]}
                onPress={() => {
                  setActiveFilter('latest');
                  setSortOption('latest');
                }}
              >
                <Text style={[styles.filterChipText, activeFilter === 'latest' && styles.filterChipTextActive]}>
                  Latest
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterChip, activeFilter === 'mostExplored' && styles.filterChipActive]}
                onPress={() => {
                  setActiveFilter('mostExplored');
                  setSortOption('mostExplored');
                }}
              >
                <Text style={[styles.filterChipText, activeFilter === 'mostExplored' && styles.filterChipTextActive]}>
                  Most Explored
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Results Count & Sort Dropdown Selector */}
            <View style={styles.resultsCountRow}>
              <Text style={styles.resultsCountText}>
                {filteredRoutes.length} Routes
              </Text>
              <TouchableOpacity style={styles.sortDropdown} onPress={handleSortMenuTap}>
                <Text style={styles.sortDropdownText}>
                  Sort: {sortOption === 'popular' ? 'Popular' : sortOption === 'latest' ? 'Latest' : sortOption === 'mostExplored' ? 'Most Explored' : 'Nearby'}
                </Text>
                <Ionicons name="chevron-down" size={12} color="#FF6B00" style={{ marginLeft: 3 }} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 7. ROUTES TAB CONTENT (Vertical Result List) */}
        {activeTab === 'routes' && (
          <View style={styles.tabContentSection}>
            {filteredRoutes.length > 0 ? (
              filteredRoutes.map((route) => (
                <ExploreRouteCard
                  key={route.id}
                  route={route}
                  onPress={() => handleRoutePress(route)}
                />
              ))
            ) : (
              <ProfileEmptyState
                iconName="map-outline"
                title="No routes found"
                description="Try changing your search keywords or active category."
              />
            )}
          </View>
        )}

        {/* 8. SPOTS TAB CONTENT (2-Column Grid - NO RATINGS!) */}
        {activeTab === 'spots' && (
          <View style={styles.tabContentSection}>
            <View style={styles.resultsCountRow}>
              <Text style={styles.resultsCountText}>
                {filteredSpots.length} Spots
              </Text>
            </View>

            {filteredSpots.length > 0 ? (
              <View style={styles.spotsGridContainer}>
                {filteredSpots.map((spot) => (
                  <TouchableOpacity
                    key={spot.id}
                    style={styles.spotGridCard}
                    activeOpacity={0.88}
                    onPress={() => handleSpotPress(spot)}
                  >
                    {/* Spot Image */}
                    <View style={styles.spotImageContainer}>
                      <Image source={{ uri: spot.image }} style={styles.spotImage} resizeMode="cover" />
                      <View style={styles.spotCategoryBadge}>
                        <Text style={styles.spotCategoryText}>{spot.category}</Text>
                      </View>
                    </View>

                    {/* Spot Details */}
                    <View style={styles.spotDetails}>
                      <Text style={styles.spotName} numberOfLines={1}>
                        {spot.name}
                      </Text>

                      <View style={styles.spotLocationRow}>
                        <Ionicons name="location-outline" size={12} color="#FF6B00" style={{ marginRight: 2 }} />
                        <Text style={styles.spotLocationText} numberOfLines={1}>
                          {spot.location}
                        </Text>
                      </View>

                      {/* Route Count Badge */}
                      <View style={styles.spotRouteBadge}>
                        <Ionicons name="compass-outline" size={11} color="#FF6B00" />
                        <Text style={styles.spotRouteBadgeText}>{spot.routeCount} routes</Text>
                      </View>

                      {spot.creator && (
                        <TouchableOpacity
                          style={styles.spotCreatorRow}
                          activeOpacity={0.75}
                          onPress={() => handleCreatorPress(spot.creator!.id)}
                        >
                          <Image source={{ uri: spot.creator.avatar }} style={styles.spotCreatorAvatar} />
                          <Text style={styles.spotCreatorText} numberOfLines={1}>
                            {spot.creator.name}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <ProfileEmptyState
                iconName="location-outline"
                title="No spots found"
                description="Try searching for another spot name or location."
              />
            )}
          </View>
        )}

        {/* 9. PEOPLE TAB CONTENT (Travelers List) */}
        {activeTab === 'people' && (
          <View style={styles.tabContentSection}>
            <View style={styles.resultsCountRow}>
              <Text style={styles.resultsCountText}>Travelers</Text>
            </View>

            {filteredPeople.length > 0 ? (
              filteredPeople.map((user) => (
                <ExploreUserCard key={user.id} user={user} />
              ))
            ) : (
              <ProfileEmptyState
                iconName="person-outline"
                title="No travelers found"
                description="Try searching for another traveler name or username."
              />
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0B0E',
  },
  scrollContent: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
    paddingBottom: 24,
  },

  /* Title Block */
  titleBlock: {
    paddingHorizontal: 18,
    marginTop: 4,
    marginBottom: 6,
  },
  pageTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    color: '#9CA3AF',
    fontSize: 12.5,
    marginTop: 2,
  },

  /* Main Tabs Switcher */
  mainTabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 18,
    marginTop: 6,
    marginBottom: 12,
  },
  mainTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    position: 'relative',
  },
  mainTabActive: {},
  mainTabText: {
    color: '#8A8F9B',
    fontSize: 14,
    fontWeight: '600',
  },
  mainTabTextActive: {
    color: '#FF6B00',
    fontWeight: '700',
  },
  activeTabLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#FF6B00',
    borderRadius: 2,
  },

  /* Filters Section */
  filtersSection: {
    marginBottom: 8,
  },
  filterChipsScroll: {
    paddingHorizontal: 18,
    gap: 8,
    marginBottom: 10,
  },
  filterChip: {
    backgroundColor: 'rgba(18, 20, 26, 0.84)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
    borderColor: '#FF6B00',
  },
  filterChipText: {
    color: '#8A8F9B',
    fontSize: 11.5,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FF6B00',
    fontWeight: '700',
  },
  resultsCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  resultsCountText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  sortDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortDropdownText: {
    color: '#FF6B00',
    fontSize: 12,
    fontWeight: '600',
  },

  /* Tab Content Area */
  tabContentSection: {
    paddingHorizontal: 18,
  },

  /* Spot Grid Styling */
  spotsGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  spotGridCard: {
    width: '48%',
    backgroundColor: 'rgba(18, 20, 26, 0.84)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    marginBottom: 14,
  },
  spotImageContainer: {
    height: 115,
    position: 'relative',
  },
  spotImage: {
    width: '100%',
    height: '100%',
  },
  spotCategoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(10, 11, 15, 0.75)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  spotCategoryText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '600',
  },
  spotDetails: {
    padding: 10,
  },
  spotName: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 3,
  },
  spotLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  spotLocationText: {
    color: '#9CA3AF',
    fontSize: 10.5,
  },
  spotRouteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 3,
    marginBottom: 8,
  },
  spotRouteBadgeText: {
    color: '#FF6B00',
    fontSize: 10,
    fontWeight: '700',
  },
  spotCreatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  spotCreatorAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 4,
  },
  spotCreatorText: {
    color: '#8A8F9B',
    fontSize: 10,
    fontWeight: '500',
  },
});
