import React, { useState } from 'react';
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
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  MOCK_OTHER_USER_PROFILE,
  MOCK_OTHER_USER_ROUTES,
  MOCK_OTHER_USER_SPOTS,
  MOCK_OTHER_USER_EXPERIENCES,
  Route,
  Spot,
  Experience,
} from '@/data/mockData';

import { OtherProfileHeader } from '@/components/profile/OtherProfileHeader';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { ProfileTabs, ProfileTabType } from '@/components/profile/ProfileTabs';
import { ExperienceCard } from '@/components/profile/ExperienceCard';
import { ProfileEmptyState } from '@/components/profile/ProfileEmptyState';

export default function OtherUserProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<ProfileTabType>('routes');

  // Load public profile data for requested user (defaults to Arjun Nair mock data)
  const profile = MOCK_OTHER_USER_PROFILE;
  const userCreatedRoutes = MOCK_OTHER_USER_ROUTES;
  const userCreatedSpots = MOCK_OTHER_USER_SPOTS;
  const userExperiences = MOCK_OTHER_USER_EXPERIENCES;

  const handleRoutePress = (route: Route) => {
    router.push(`/route/${route.id}` as any);
  };

  const handleSpotPress = (spot: Spot) => {
    router.push(`/spot/${spot.id}` as any);
  };

  const handleExperiencePress = (exp: Experience) => {
    router.push(`/journey/${exp.id || 'j1'}` as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0B0E" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Public Profile Header (Follow / Message / Back Button) */}
        <OtherProfileHeader profile={profile} />

        {/* 2. Profile Stats Bar */}
        <ProfileStats profile={profile} />

        {/* 3. Content Tabs (Routes | Spots | Experiences) */}
        <ProfileTabs
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          routesCount={userCreatedRoutes.length}
          spotsCount={userCreatedSpots.length}
          experiencesCount={userExperiences.length}
        />

        {/* 4. Tab Content Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <Text style={styles.sectionTitle}>
              {activeTab === 'routes'
                ? `Routes by ${profile.name.split(' ')[0]}`
                : activeTab === 'spots'
                ? `Spots by ${profile.name.split(' ')[0]}`
                : `Experiences with ${profile.name.split(' ')[0]}`}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {activeTab === 'routes'
                ? `Incredible routes created and shared by ${profile.name.split(' ')[0]}.`
                : activeTab === 'spots'
                ? `Amazing places discovered and added by ${profile.name.split(' ')[0]}.`
                : `Routes ${profile.name.split(' ')[0]} has explored and the moments captured.`}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/explore')}
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
            {userCreatedRoutes.length > 0 ? (
              <View style={styles.gridContainer}>
                {userCreatedRoutes.map((route) => (
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
                        onPress={() => handleRoutePress(route)}
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
                description={`${profile.name} hasn't created any public routes yet.`}
              />
            )}
          </View>
        )}

        {/* 6. TAB CONTENT - SPOTS (2-COLUMN GRID - NO RATINGS) */}
        {activeTab === 'spots' && (
          <View style={styles.tabSection}>
            {userCreatedSpots.length > 0 ? (
              <View style={styles.gridContainer}>
                {userCreatedSpots.map((spot) => (
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
                description={`${profile.name} hasn't added any spots yet.`}
              />
            )}
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
                description={`${profile.name} hasn't recorded any public experiences yet.`}
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
    paddingBottom: 24,
  },
  tabSection: {
    paddingHorizontal: 18,
  },

  /* Section Header */
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
});
