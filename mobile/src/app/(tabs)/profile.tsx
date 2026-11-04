import React, { useState, useEffect, useMemo } from 'react';
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
  RefreshControl,
  Modal,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

import {
  MOCK_USER_PROFILE,
  MOCK_USER_EXPERIENCES,
  Route,
  Spot,
  Experience,
} from '@/data/mockData';
import { useRouteStore } from '@/store/useRouteStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useJourneyStore } from '@/store/useJourneyStore';

import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { ProfileTabs, ProfileTabType } from '@/components/profile/ProfileTabs';
import { ExperienceCard } from '@/components/profile/ExperienceCard';
import { ProfileEmptyState } from '@/components/profile/ProfileEmptyState';
import { EditRouteModal } from '@/components/route/EditRouteModal';

export default function ProfileScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTabType>('routes');

  const storeSpots = useRouteStore((state) => state.spots);
  const storeRoutes = useRouteStore((state) => state.routes);
  const deleteRoute = useRouteStore((state) => state.deleteRoute);
  const fetchFromBackend = useRouteStore((state) => state.fetchFromBackend);
  const isLoading = useRouteStore((state) => state.isLoading);
  const authUser = useAuthStore((state) => state.user);

  const [selectedRouteForOptions, setSelectedRouteForOptions] = useState<Route | null>(null);
  const [isRouteOptionsVisible, setIsRouteOptionsVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const userJourneys = useJourneyStore((state) => state.userJourneys);
  const loadUserJourneys = useJourneyStore((state) => state.loadUserJourneys);

  useEffect(() => {
    loadUserJourneys();
  }, []);

  const createdSpots: Spot[] = useMemo(() => {
    const currentUserId = authUser?.id ? String(authUser.id) : undefined;
    const currentUserName = authUser?.name;

    return storeSpots.filter((s) => {
      if (currentUserId) {
        if (s.creator?.id && String(s.creator.id) === currentUserId) return true;
        if ((s as any).userId && String((s as any).userId) === currentUserId) return true;
      }
      if (currentUserName && s.creator?.name) {
        if (s.creator.name.trim().toLowerCase() === currentUserName.trim().toLowerCase()) return true;
      }
      if (!currentUserId && !currentUserName) {
        return (
          s.creator?.id === MOCK_USER_PROFILE.id ||
          s.creator?.id === 'u1' ||
          s.creator?.name === MOCK_USER_PROFILE.name
        );
      }
      return false;
    });
  }, [storeSpots, authUser]);

  const createdRoutes: Route[] = useMemo(() => {
    const currentUserId = authUser?.id ? String(authUser.id) : undefined;
    const currentUserName = authUser?.name;

    const filtered = storeRoutes.filter((r) => {
      if (currentUserId) {
        if (r.creator?.id && String(r.creator.id) === currentUserId) return true;
        if ((r as any).userId && String((r as any).userId) === currentUserId) return true;
      }
      if (currentUserName && r.creator?.name) {
        if (r.creator.name.trim().toLowerCase() === currentUserName.trim().toLowerCase()) return true;
      }
      if (!currentUserId && !currentUserName) {
        return (
          r.creator?.id === MOCK_USER_PROFILE.id ||
          r.creator?.id === 'u1' ||
          r.creator?.name === MOCK_USER_PROFILE.name
        );
      }
      return false;
    });

    return filtered.map((r) => ({
      id: String(r.id),
      title: r.title,
      image:
        r.coverImage ||
        (r.photos && r.photos[0]) ||
        'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80',
      creator: r.creator || {
        id: 'u1',
        name: 'Explorer',
        username: 'explorer',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      },
      description: r.description || r.shortDescription || '',
      location: r.location,
      category: r.category,
      likesCount: r.likesCount || 0,
      commentsCount: r.commentsCount || 0,
      completedCount: r.exploredCount || 0,
      timeAgo: r.postedTimeAgo || 'Recently',
      imageCount: r.imageCount || (r.photos ? r.photos.length : 1),
    }));
  }, [storeRoutes, authUser]);

  const userExperiences: any[] = useMemo(() => {
    if (userJourneys && userJourneys.length > 0) {
      return userJourneys.map((j) => ({
        id: String(j.id),
        title: j.route?.title || `Journey #${j.id}`,
        location: j.route?.location || 'Munnar, Kerala',
        image:
          j.route?.coverImage ||
          (j.moments?.[0]?.mediaUrl) ||
          'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80',
        date: new Date(j.completedAt || j.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        placesCount: Array.isArray(j.exploredSpots) ? j.exploredSpots.length : (j.route?.places?.length || 1),
        duration: j.totalDuration || '2–3 hours',
        distance: j.route?.distance || '10 km',
        rating: 4.8,
        ratingCount: 14,
        likesCount: 0,
        commentsCount: 0,
        status: (j.status === 'COMPLETED' ? 'Completed' : 'Exploring') as any,
        tags: [j.route?.category || 'Nature', 'Live Journey'],
      }));
    }
    return MOCK_USER_EXPERIENCES;
  }, [userJourneys]);

  const profile = {
    ...MOCK_USER_PROFILE,
    name: authUser?.name || MOCK_USER_PROFILE.name,
    avatar: authUser?.avatar || MOCK_USER_PROFILE.avatar,
    spotCount: createdSpots.length,
    routeCount: createdRoutes.length,
    experienceCount: userExperiences.length,
  };

  const handleRoutePress = (route: Route) => {
    router.push(`/route/${route.id}` as any);
  };

  const handleSpotPress = (spot: Spot) => {
    router.push(`/spot/${spot.id}` as any);
  };

  const handleExperiencePress = (exp: Experience) => {
    router.push(`/journey/${exp.id || 'j1'}` as any);
  };

  const handleOpenRouteOptions = (route: Route) => {
    setSelectedRouteForOptions(route);
    setIsRouteOptionsVisible(true);
  };

  const handleTriggerEdit = () => {
    setIsRouteOptionsVisible(false);
    setTimeout(() => {
      setIsEditModalVisible(true);
    }, 250);
  };

  const handleTriggerDelete = () => {
    if (!selectedRouteForOptions) return;
    const target = selectedRouteForOptions;
    setIsRouteOptionsVisible(false);

    Alert.alert(
      'Delete Route',
      `Are you sure you want to delete "${target.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteRoute(target.id);
            if (success) {
              Alert.alert('Deleted', 'Route deleted successfully.');
              fetchFromBackend();
            } else {
              Alert.alert('Notice', 'Failed to delete route on server.');
            }
          },
        },
      ]
    );
  };

  const handleRefresh = async () => {
    await Promise.allSettled([fetchFromBackend(), loadUserJourneys()]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor="#FF6B00"
            colors={['#FF6B00']}
          />
        }
      >
        {/* 1. Cinematic Profile Header */}
        <ProfileHeader profile={profile} isOwnProfile={true} />

        {/* 2. Profile Stats Bar */}
        <ProfileStats profile={profile} />

        {/* 3. Navigation Tabs (Routes | Spots | Experiences) */}
        <ProfileTabs
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          routesCount={createdRoutes.length}
          spotsCount={createdSpots.length}
          experiencesCount={userExperiences.length}
        />

        {/* 4. Tab Content Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <Text style={styles.sectionTitle}>
              {activeTab === 'routes'
                ? 'My Routes'
                : activeTab === 'spots'
                ? 'My Spots'
                : 'My Experiences'}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {activeTab === 'routes'
                ? "Routes I've created and shared with the community."
                : activeTab === 'spots'
                ? "Spots I've discovered and added to DreamOut."
                : "Routes I've explored and the moments I've captured."}
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push(activeTab === 'routes' ? '/explore' : activeTab === 'spots' ? '/explore' : '/explore')}
          >
            <View style={styles.seeAllRow}>
              <Text style={styles.seeAllText}>See All</Text>
              <Ionicons name="chevron-forward" size={13} color="#FF6B00" />
            </View>
          </TouchableOpacity>
        </View>

        {/* 5. TAB CONTENT - ROUTES (2-COLUMN GRID) */}
        {activeTab === 'routes' && (
          <View style={styles.tabSection}>
            {createdRoutes.length > 0 ? (
              <View style={styles.gridContainer}>
                {createdRoutes.map((route) => (
                  <TouchableOpacity
                    key={route.id}
                    style={styles.gridCard}
                    activeOpacity={0.88}
                    onPress={() => handleRoutePress(route)}
                  >
                    {/* Cover Image */}
                    <View style={styles.cardImageContainer}>
                      <Image source={{ uri: route.image }} style={styles.cardImage} resizeMode="cover" />

                      {/* Top Right Option Overlay */}
                      <TouchableOpacity
                        style={styles.moreOverlayButton}
                        activeOpacity={0.7}
                        onPress={() => handleOpenRouteOptions(route)}
                      >
                        <Ionicons name="ellipsis-horizontal" size={14} color="#FFFFFF" />
                      </TouchableOpacity>

                      {/* Bottom Right Image Count Badge */}
                      <View style={styles.imageCountBadge}>
                        <Ionicons name="images-outline" size={11} color="#FFFFFF" />
                        <Text style={styles.imageCountText}>+{route.imageCount}</Text>
                      </View>
                    </View>

                    {/* Card Content Body */}
                    <View style={styles.cardBody}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {route.title}
                      </Text>
                      <Text style={styles.cardDescription} numberOfLines={2}>
                        {route.description}
                      </Text>

                      {/* Card Stats Row (Likes, Comments, Explored, Time) */}
                      <View style={styles.cardStatsRow}>
                        <View style={styles.cardStatGroup}>
                          <View style={styles.statSubItem}>
                            <Ionicons name="heart-outline" size={12} color="#8A8F9B" />
                            <Text style={styles.cardStatText}>{route.likesCount}</Text>
                          </View>
                          <View style={styles.statSubItem}>
                            <Ionicons name="chatbubble-outline" size={12} color="#8A8F9B" />
                            <Text style={styles.cardStatText}>{route.commentsCount}</Text>
                          </View>
                          <View style={styles.statSubItem}>
                            <Ionicons name="walk-outline" size={12} color="#8A8F9B" />
                            <Text style={styles.cardStatText}>{route.completedCount}</Text>
                          </View>
                        </View>
                        <Text style={styles.timeAgoText}>{route.timeAgo}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <ProfileEmptyState
                iconName="map-outline"
                title="No routes yet"
                description="Create your first route and share your journey with the community."
                actionText="Create Route"
                onActionPress={() => router.push('/create')}
              />
            )}

            {/* Bottom Dashed "Create a New Route" Card */}
            <TouchableOpacity
              style={styles.createDashedCard}
              activeOpacity={0.8}
              onPress={() => router.push('/create')}
            >
              <View style={styles.plusIconCircle}>
                <Ionicons name="add" size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.createDashedTitle}>Create a New Route</Text>
              <Text style={styles.createDashedSubtitle}>
                Share your next adventure with the community.
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 6. TAB CONTENT - SPOTS (2-COLUMN GRID) */}
        {activeTab === 'spots' && (
          <View style={styles.tabSection}>
            {createdSpots.length > 0 ? (
              <View style={styles.gridContainer}>
                {createdSpots.map((spot) => (
                  <TouchableOpacity
                    key={spot.id}
                    style={styles.gridCard}
                    activeOpacity={0.88}
                    onPress={() => handleSpotPress(spot)}
                  >
                    <View style={styles.cardImageContainer}>
                      <Image source={{ uri: spot.image }} style={styles.cardImage} resizeMode="cover" />
                      <View style={styles.spotCategoryBadge}>
                        <Text style={styles.spotCategoryText}>{spot.category}</Text>
                      </View>
                    </View>

                    <View style={styles.cardBody}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
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
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <ProfileEmptyState
                iconName="location-outline"
                title="No spots yet"
                description="Discover a place and add it to DreamOut."
                actionText="Create Spot"
                onActionPress={() => router.push('/create')}
              />
            )}

            {/* Bottom Dashed "Create a New Spot" Card */}
            <TouchableOpacity
              style={styles.createDashedCard}
              activeOpacity={0.8}
              onPress={() => router.push('/create')}
            >
              <View style={styles.plusIconCircle}>
                <Ionicons name="add" size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.createDashedTitle}>Create a New Spot</Text>
              <Text style={styles.createDashedSubtitle}>
                Add a new scenic spot or hidden gem to DreamOut.
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 7. TAB CONTENT - EXPERIENCES */}
        {activeTab === 'experiences' && (
          <View style={styles.tabSection}>
            {userExperiences.length > 0 ? (
              userExperiences.map((exp) => (
                <ExperienceCard
                  key={exp.id}
                  experience={exp}
                  onPress={() => handleExperiencePress(exp)}
                />
              ))
            ) : (
              <ProfileEmptyState
                iconName="trail-sign-outline"
                title="No experiences yet"
                description="Explore a route and start creating your journey."
                actionText="Explore Routes"
                onActionPress={() => router.push('/explore')}
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* Route Options Action Sheet Modal */}
      <Modal
        visible={isRouteOptionsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsRouteOptionsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setIsRouteOptionsVisible(false)}
        >
          <TouchableOpacity
            style={styles.actionSheetContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.sheetHandle} />

            {selectedRouteForOptions && (
              <View style={styles.sheetHeader}>
                <Image
                  source={{ uri: selectedRouteForOptions.image }}
                  style={styles.sheetRouteThumb}
                  resizeMode="cover"
                />
                <View style={styles.sheetHeaderText}>
                  <Text style={styles.sheetRouteTitle} numberOfLines={1}>
                    {selectedRouteForOptions.title}
                  </Text>
                  <Text style={styles.sheetRouteSubtitle} numberOfLines={1}>
                    {selectedRouteForOptions.location || selectedRouteForOptions.category || 'Created Route'}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.sheetDivider} />

            {/* Option 1: Edit Route */}
            <TouchableOpacity
              style={styles.sheetOption}
              activeOpacity={0.7}
              onPress={handleTriggerEdit}
            >
              <View style={[styles.sheetOptionIconBox, { backgroundColor: 'rgba(255, 107, 0, 0.15)' }]}>
                <Ionicons name="pencil" size={18} color="#FF6B00" />
              </View>
              <View style={styles.sheetOptionContent}>
                <Text style={styles.sheetOptionTitle}>Edit Route</Text>
                <Text style={styles.sheetOptionDesc}>
                  Update name, cover photo, category & details
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#8A8F9B" />
            </TouchableOpacity>

            {/* Option 2: Delete Route */}
            <TouchableOpacity
              style={styles.sheetOption}
              activeOpacity={0.7}
              onPress={handleTriggerDelete}
            >
              <View style={[styles.sheetOptionIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </View>
              <View style={styles.sheetOptionContent}>
                <Text style={[styles.sheetOptionTitle, { color: '#EF4444' }]}>
                  Delete Route
                </Text>
                <Text style={styles.sheetOptionDesc}>
                  Permanently remove this route from DreamOut
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#8A8F9B" />
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.sheetCancelButton}
              activeOpacity={0.8}
              onPress={() => setIsRouteOptionsVisible(false)}
            >
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Edit Route Modal */}
      <EditRouteModal
        visible={isEditModalVisible}
        route={selectedRouteForOptions}
        onClose={() => setIsEditModalVisible(false)}
        onSaveSuccess={() => {
          setIsEditModalVisible(false);
          fetchFromBackend();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0B0E',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  tabSection: {
    paddingHorizontal: 18,
  },

  /* Section Title Header */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flex: 1,
    paddingRight: 10,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  seeAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 3,
  },
  seeAllText: {
    color: '#FF6B00',
    fontSize: 13,
    fontWeight: '700',
  },

  /* 2-Column Grid Layout */
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '48%',
    backgroundColor: 'rgba(18, 20, 26, 0.84)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    marginBottom: 14,
  },
  cardImageContainer: {
    height: 115,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  moreOverlayButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(10, 11, 15, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCountBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(10, 11, 15, 0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  imageCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },

  /* Card Body */
  cardBody: {
    padding: 10,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 3,
  },
  cardDescription: {
    color: '#9CA3AF',
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 8,
  },

  /* Card Stats Row */
  cardStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  cardStatGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statSubItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  cardStatText: {
    color: '#8A8F9B',
    fontSize: 10,
    fontWeight: '500',
  },
  timeAgoText: {
    color: '#8A8F9B',
    fontSize: 9.5,
  },

  /* Spot Specific */
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
  },
  spotRouteBadgeText: {
    color: '#FF6B00',
    fontSize: 10,
    fontWeight: '700',
  },

  /* Bottom Dashed Create Card */
  createDashedCard: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderStyle: 'dashed',
    borderRadius: 18,
    paddingVertical: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 16,
    backgroundColor: 'rgba(18, 20, 26, 0.4)',
  },
  plusIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  createDashedTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  createDashedSubtitle: {
    color: '#9CA3AF',
    fontSize: 11.5,
  },

  /* Action Sheet Styles */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  actionSheetContainer: {
    backgroundColor: '#12141C',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: '#252836',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#353945',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  sheetRouteThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#1C1F2A',
  },
  sheetHeaderText: {
    flex: 1,
  },
  sheetRouteTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  sheetRouteSubtitle: {
    color: '#8A8F9B',
    fontSize: 12,
    marginTop: 2,
  },
  sheetDivider: {
    height: 1,
    backgroundColor: '#202430',
    marginVertical: 12,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 14,
  },
  sheetOptionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetOptionContent: {
    flex: 1,
  },
  sheetOptionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  sheetOptionDesc: {
    color: '#8A8F9B',
    fontSize: 12,
    marginTop: 2,
  },
  sheetCancelButton: {
    backgroundColor: '#1C1F2B',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#2A2D3A',
  },
  sheetCancelText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
