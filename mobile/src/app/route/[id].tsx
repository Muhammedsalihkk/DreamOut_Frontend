import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Modal,
  Alert,
  Share,
  Platform,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import {
  MOCK_DETAILED_ROUTE,
  DetailedRoute,
  RoutePlace,
  RouteHighlight,
  ExploredUser,
  ExplorerExperience,
} from '@/data/mockData';

import { useRouteStore } from '@/store/useRouteStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type TabType = 'overview' | 'places' | 'photos' | 'experiences';
type ExperienceFilterType = 'all' | 'snaps' | 'stories' | 'following';

export default function RouteDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const getRouteById = useRouteStore((state) => state.getRouteById);
  const route: DetailedRoute = (id ? getRouteById(id) : null) || MOCK_DETAILED_ROUTE;

  // Local state
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowingCreator, setIsFollowingCreator] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [expFilter, setExpFilter] = useState<ExperienceFilterType>('all');

  // Follow states for explorers
  const [followingUsersMap, setFollowingUsersMap] = useState<Record<string, boolean>>({
    'user-3': true,
    'user-5': true,
  });

  // Modals state
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [isMoreMenuVisible, setIsMoreMenuVisible] = useState(false);
  const [isExploredPeopleModalVisible, setIsExploredPeopleModalVisible] = useState(false);
  const [selectedExplorerJourney, setSelectedExplorerJourney] = useState<ExplorerExperience | null>(null);
  const [selectedHighlight, setSelectedHighlight] = useState<RouteHighlight | null>(null);
  const [isHighlightModalVisible, setIsHighlightModalVisible] = useState(false);

  const handleHighlightPress = (highlight: RouteHighlight) => {
    setSelectedHighlight(highlight);
    setIsHighlightModalVisible(true);
  };

  // Top Action Handlers
  const handleBack = () => {
    router.back();
  };

  const handleToggleSave = () => {
    setIsSaved((prev) => !prev);
    Alert.alert(
      !isSaved ? 'Route Saved' : 'Route Unsaved',
      !isSaved
        ? `"${route.title}" added to your saved routes.`
        : `"${route.title}" removed from your saved routes.`
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this awesome route: ${route.title} on DreamOut! ${route.location}`,
      });
    } catch (error) {
      Alert.alert('Share', `Sharing "${route.title}"`);
    }
  };

  const handleCreatorPress = (creatorId: string) => {
    router.push(`/user/${creatorId}` as any);
  };

  const handleSpotPress = (place: RoutePlace) => {
    router.push(`/spot/${place.spotId || place.id}` as any);
  };

  const toggleFollowUser = (userId: string) => {
    setFollowingUsersMap((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const openImageViewer = (index: number) => {
    setSelectedImageIndex(index);
    setIsImageViewerVisible(true);
  };

  // Filtered experiences
  const filteredExperiences = route.explorerExperiences.filter((exp) => {
    if (expFilter === 'snaps') return exp.type === 'snap';
    if (expFilter === 'stories') return exp.type === 'story';
    if (expFilter === 'following') return followingUsersMap[exp.user.id] === true;
    return true;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* MAIN SCROLLABLE CONTENT */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 90 + Math.max(insets.bottom, 14) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ================================================== */}
        {/* 1. TOP HERO / COVER IMAGE + OVERLAY INFO          */}
        {/* ================================================== */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: route.coverImage }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Dark Gradient Overlay at the bottom */}
          <LinearGradient
            colors={['rgba(10,11,15,0.2)', 'rgba(10,11,15,0.7)', '#0A0B0E']}
            locations={[0, 0.6, 1]}
            style={styles.heroGradient}
          />

          {/* TOP FLOATING NAVIGATION BUTTONS */}
          <View style={[styles.topActionsRow, { paddingTop: Math.max(insets.top, 20) + 8 }]}>
            {/* Top Left: Back Button */}
            <TouchableOpacity
              style={styles.circleButton}
              activeOpacity={0.8}
              onPress={handleBack}
            >
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Top Right: Bookmark, Share, More */}
            <View style={styles.topRightActions}>
              <TouchableOpacity
                style={styles.circleButton}
                activeOpacity={0.8}
                onPress={handleToggleSave}
              >
                <Ionicons
                  name={isSaved ? 'bookmark' : 'bookmark-outline'}
                  size={19}
                  color={isSaved ? '#FF6B00' : '#FFFFFF'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.circleButton}
                activeOpacity={0.8}
                onPress={handleShare}
              >
                <Ionicons name="share-social-outline" size={19} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.circleButton}
                activeOpacity={0.8}
                onPress={() => setIsMoreMenuVisible(true)}
              >
                <Ionicons name="ellipsis-horizontal" size={19} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* ================================================== */}
          {/* 2. ROUTE INFORMATION OVERLAPPED AT BOTTOM OF HERO */}
          {/* ================================================== */}
          <View style={styles.heroInfoBlock}>
            {/* Small Route Label */}
            <View style={styles.routeBadge}>
              <Text style={styles.routeBadgeText}>ROUTE</Text>
            </View>

            {/* Route Title */}
            <Text style={styles.routeTitle}>{route.title}</Text>

            {/* Short Description */}
            <Text style={styles.shortDescription}>{route.shortDescription}</Text>

            {/* Compact Info Row */}
            <View style={styles.compactInfoRow}>
              <View style={styles.infoChip}>
                <Text style={styles.infoChipText}>📍 {route.location}</Text>
              </View>
              <View style={styles.infoChip}>
                <Text style={styles.infoChipText}>🖼 {route.placeCount} places</Text>
              </View>
              <View style={styles.infoChip}>
                <Text style={styles.infoChipText}>📏 {route.distance}</Text>
              </View>
              <View style={styles.infoChip}>
                <Text style={styles.infoChipText}>🕐 {route.duration}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ================================================== */}
        {/* 3. CREATOR SECTION                                 */}
        {/* ================================================== */}
        <View style={styles.sectionContainer}>
          <View style={styles.creatorCard}>
            <TouchableOpacity
              style={styles.creatorLeft}
              activeOpacity={0.8}
              onPress={() => handleCreatorPress(route.creator.id)}
            >
              <Image source={{ uri: route.creator.avatar }} style={styles.creatorAvatar} />
              <View style={styles.creatorDetails}>
                <View style={styles.creatorNameRow}>
                  <Text style={styles.creatorName}>{route.creator.name}</Text>
                  {route.creator.isVerified && (
                    <Ionicons name="checkmark-circle" size={15} color="#FF6B00" style={{ marginLeft: 4 }} />
                  )}
                </View>
                <Text style={styles.creatorUsername}>
                  @{route.creator.username} • {route.creator.routeCount || 28} routes
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.followButton, isFollowingCreator && styles.followingButton]}
              activeOpacity={0.8}
              onPress={() => setIsFollowingCreator((prev) => !prev)}
            >
              <Text style={[styles.followButtonText, isFollowingCreator && styles.followingButtonText]}>
                {isFollowingCreator ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================================================== */}
        {/* 4. ENGAGEMENT STATS ROW                           */}
        {/* ================================================== */}
        <View style={styles.sectionContainer}>
          <View style={styles.engagementRow}>
            <View style={styles.statsLeft}>
              <View style={styles.statPill}>
                <Ionicons name="heart" size={15} color="#FF6B00" />
                <Text style={styles.statPillText}>{route.likesCount}</Text>
              </View>

              <View style={styles.statPill}>
                <Ionicons name="chatbubble-outline" size={15} color="#8A8F9B" />
                <Text style={styles.statPillText}>{route.commentsCount}</Text>
              </View>

              <View style={styles.statPill}>
                <Ionicons name="walk-outline" size={16} color="#8A8F9B" />
                <Text style={styles.statPillText}>{(route.exploredCount / 1000).toFixed(1)}K explored</Text>
              </View>
            </View>

            <Text style={styles.postedTimeText}>Posted {route.postedTimeAgo}</Text>
          </View>
        </View>

        {/* ================================================== */}
        {/* 5. ROUTE DESCRIPTION                              */}
        {/* ================================================== */}
        <View style={styles.sectionContainer}>
          <Text
            style={styles.descriptionText}
            numberOfLines={isDescriptionExpanded ? undefined : 3}
          >
            {route.description}
          </Text>
          <TouchableOpacity
            style={styles.readMoreButton}
            activeOpacity={0.7}
            onPress={() => setIsDescriptionExpanded((prev) => !prev)}
          >
            <Text style={styles.readMoreText}>
              {isDescriptionExpanded ? 'Read Less ↑' : 'Read More ↓'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* ================================================== */}
        {/* 6. ROUTE CONTENT TABS                             */}
        {/* ================================================== */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContainer}
        >
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'overview' && styles.tabButtonActive]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
              Overview
            </Text>
            {activeTab === 'overview' && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'places' && styles.tabButtonActive]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('places')}
          >
            <Text style={[styles.tabText, activeTab === 'places' && styles.tabTextActive]}>
              Places ({route.places.length})
            </Text>
            {activeTab === 'places' && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'photos' && styles.tabButtonActive]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('photos')}
          >
            <Text style={[styles.tabText, activeTab === 'photos' && styles.tabTextActive]}>
              Photos ({route.photos.length})
            </Text>
            {activeTab === 'photos' && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'experiences' && styles.tabButtonActive]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('experiences')}
          >
            <Text style={[styles.tabText, activeTab === 'experiences' && styles.tabTextActive]}>
              Experiences ({route.explorerExperiences.length})
            </Text>
            {activeTab === 'experiences' && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>
        </ScrollView>

        {/* ================================================== */}
        {/* 7. TAB CONTENT 1: OVERVIEW                        */}
        {/* ================================================== */}
        {activeTab === 'overview' && (
          <View style={styles.tabContentContainer}>
            {/* 8. ABOUT THIS ROUTE (STRICT SINGLE LINE REQUIREMENT) */}
            <View style={styles.aboutSection}>
              <Text style={styles.subSectionTitle}>About This Route</Text>
              <View style={styles.aboutSingleLineCard}>
                <View style={styles.aboutLineItem}>
                  <Text style={styles.aboutLineText}>
                    📏 <Text style={styles.aboutLineLabel}>Distance </Text>
                    <Text style={styles.aboutLineValue}>{route.distance}</Text>
                  </Text>
                </View>

                <View style={styles.aboutLineDivider} />

                <View style={styles.aboutLineItem}>
                  <Text style={styles.aboutLineText}>
                    🕐 <Text style={styles.aboutLineLabel}>Duration </Text>
                    <Text style={styles.aboutLineValue}>{route.duration}</Text>
                  </Text>
                </View>
              </View>
            </View>

            {/* 9. ROUTE HIGHLIGHTS */}
            <View style={styles.highlightsSection}>
              <Text style={styles.subSectionTitle}>Route Highlights</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.highlightsScroll}
              >
                {route.highlights.map((highlight: RouteHighlight) => (
                  <TouchableOpacity
                    key={highlight.id}
                    style={styles.highlightCard}
                    activeOpacity={0.85}
                    onPress={() => handleHighlightPress(highlight)}
                  >
                    <Image source={{ uri: highlight.image }} style={styles.highlightImage} />
                    <View style={styles.highlightOverlay}>
                      <Text style={styles.highlightTitle} numberOfLines={1}>
                        {highlight.title}
                      </Text>
                      <Text style={styles.highlightDesc} numberOfLines={2}>
                        {highlight.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* 10. PLACES IN THIS ROUTE */}
            <View style={styles.placesSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.subSectionTitle}>
                  Places in This Route ({route.places.length})
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setActiveTab('places')}
                >
                  <Text style={styles.seeAllText}>See All →</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.placesHorizontalScroll}
              >
                {route.places.map((place: RoutePlace) => (
                  <TouchableOpacity
                    key={place.id}
                    style={styles.placeHorizontalCard}
                    activeOpacity={0.85}
                    onPress={() => handleSpotPress(place)}
                  >
                    <View style={styles.placeImageWrapper}>
                      <Image source={{ uri: place.image }} style={styles.placeImage} />
                      <View style={styles.orderBadge}>
                        <Text style={styles.orderBadgeText}>{place.order}</Text>
                      </View>
                    </View>

                    <View style={styles.placeInfoWrapper}>
                      <Text style={styles.placeName} numberOfLines={1}>
                        {place.name}
                      </Text>
                      <Text style={styles.placeDistanceText}>{place.distanceFromStart}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* ================================================== */}
        {/* TAB CONTENT 2: PLACES (IN ROUTE ORDER)           */}
        {/* ================================================== */}
        {activeTab === 'places' && (
          <View style={styles.tabContentContainer}>
            <View style={styles.placesHeaderBlock}>
              <Text style={styles.subSectionTitle}>Places in This Route</Text>
              <Text style={styles.placesSubtitleText}>
                {route.places.length} places along this journey, in route order.
              </Text>
            </View>

            <View style={styles.placesVerticalList}>
              {route.places.map((place: RoutePlace) => (
                <TouchableOpacity
                  key={place.id}
                  style={styles.placeVerticalCard}
                  activeOpacity={0.85}
                  onPress={() => handleSpotPress(place)}
                >
                  <View style={styles.placeOrderBadge}>
                    <Text style={styles.placeOrderBadgeText}>{place.order}</Text>
                  </View>

                  <Image source={{ uri: place.image }} style={styles.placeVerticalImage} />

                  <View style={styles.placeVerticalBody}>
                    <Text style={styles.placeVerticalName} numberOfLines={1}>
                      {place.name}
                    </Text>
                    <Text style={styles.placeCategoryText}>
                      {place.category || 'Mountain Viewpoint'}
                    </Text>
                    <Text style={styles.placeLocationText}>
                      📍 {place.location || 'Munnar, Kerala'}
                    </Text>
                    <Text style={styles.placeVerticalDistance}>
                      {place.distanceFromStart} from start
                    </Text>
                  </View>

                  <Ionicons name="chevron-forward" size={18} color="#FF6B00" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ================================================== */}
        {/* TAB CONTENT 3: PHOTOS (ROUTE REFERENCE PHOTOS)   */}
        {/* ================================================== */}
        {activeTab === 'photos' && (
          <View style={styles.tabContentContainer}>
            <View style={styles.photosHeaderBlock}>
              <Text style={styles.subSectionTitle}>Route Photos ({route.photos.length})</Text>
              <Text style={styles.photosSubtitle}>
                Photos added by the route creator.
              </Text>
              <Text style={styles.photosConceptBanner}>
                Reference images showing mountain views, waterfalls, trails and viewpoints along this route.
              </Text>
            </View>

            {/* Featured Large Route Photo */}
            {route.photos.length > 0 && (
              <TouchableOpacity
                style={styles.featuredRoutePhotoCard}
                activeOpacity={0.9}
                onPress={() => openImageViewer(0)}
              >
                <Image source={{ uri: route.photos[0] }} style={styles.featuredRoutePhotoImage} />
                <View style={styles.featuredPhotoBadge}>
                  <Ionicons name="star" size={12} color="#FF6B00" style={{ marginRight: 4 }} />
                  <Text style={styles.featuredPhotoBadgeText}>Featured Cover Photo</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Reference Grid */}
            <View style={styles.photosGrid}>
              {route.photos.slice(1).map((photoUri: string, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={styles.photoGridItem}
                  activeOpacity={0.9}
                  onPress={() => openImageViewer(index + 1)}
                >
                  <Image source={{ uri: photoUri }} style={styles.photoGridImage} />
                  {index === 5 && route.photos.length > 7 && (
                    <View style={styles.morePhotosOverlay}>
                      <Text style={styles.morePhotosText}>+{route.photos.length - 7}</Text>
                      <Text style={styles.morePhotosSubtext}>More</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ================================================== */}
        {/* TAB CONTENT 4: EXPERIENCES (EXPLORER MOMENTS FEED) */}
        {/* ================================================== */}
        {activeTab === 'experiences' && (
          <View style={styles.tabContentContainer}>
            <View style={styles.expHeaderBlock}>
              <Text style={styles.subSectionTitle}>Experiences ({route.explorerExperiences.length})</Text>
              <Text style={styles.expSubtitle}>
                Real moments from people who explored this route.
              </Text>
            </View>

            {/* Filter Chips: All | Snaps | Stories | Following */}
            <View style={styles.expFilterRow}>
              <TouchableOpacity
                style={[styles.expChip, expFilter === 'all' && styles.expChipActive]}
                onPress={() => setExpFilter('all')}
              >
                <Text style={[styles.expChipText, expFilter === 'all' && styles.expChipTextActive]}>
                  All
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.expChip, expFilter === 'snaps' && styles.expChipActive]}
                onPress={() => setExpFilter('snaps')}
              >
                <Ionicons name="camera-outline" size={12} color={expFilter === 'snaps' ? '#FF6B00' : '#8A8F9B'} style={{ marginRight: 4 }} />
                <Text style={[styles.expChipText, expFilter === 'snaps' && styles.expChipTextActive]}>
                  Snaps
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.expChip, expFilter === 'stories' && styles.expChipActive]}
                onPress={() => setExpFilter('stories')}
              >
                <Ionicons name="play-circle-outline" size={12} color={expFilter === 'stories' ? '#FF6B00' : '#8A8F9B'} style={{ marginRight: 4 }} />
                <Text style={[styles.expChipText, expFilter === 'stories' && styles.expChipTextActive]}>
                  Stories
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.expChip, expFilter === 'following' && styles.expChipActive]}
                onPress={() => setExpFilter('following')}
              >
                <Text style={[styles.expChipText, expFilter === 'following' && styles.expChipTextActive]}>
                  Following
                </Text>
              </TouchableOpacity>
            </View>

            {/* Feed of Public Experiences */}
            <View style={styles.expFeedList}>
              {filteredExperiences.map((exp: ExplorerExperience) => (
                <View key={exp.id} style={styles.expCard}>
                  {/* Explorer Header */}
                  <View style={styles.expCardHeader}>
                    <TouchableOpacity
                      style={styles.expUserRow}
                      activeOpacity={0.8}
                      onPress={() => handleCreatorPress(exp.user.id)}
                    >
                      <Image source={{ uri: exp.user.avatar }} style={styles.expUserAvatar} />
                      <View>
                        <View style={styles.expUserNameRow}>
                          <Text style={styles.expUserName}>{exp.user.name}</Text>
                          {exp.user.isVerified && (
                            <Ionicons name="checkmark-circle" size={13} color="#FF6B00" style={{ marginLeft: 3 }} />
                          )}
                        </View>
                        <Text style={styles.expDateText}>@{exp.user.username} • {exp.exploredDateText}</Text>
                      </View>
                    </TouchableOpacity>

                    {/* Privacy Badge */}
                    <View style={styles.privacyBadge}>
                      <Ionicons name="globe-outline" size={11} color="#FF6B00" style={{ marginRight: 3 }} />
                      <Text style={styles.privacyBadgeText}>{(exp.privacy || 'PUBLIC').toUpperCase()}</Text>
                    </View>
                  </View>

                  {/* Spot Location */}
                  <View style={styles.expLocationRow}>
                    <Ionicons name="location-outline" size={13} color="#FF6B00" style={{ marginRight: 3 }} />
                    <Text style={styles.expLocationText}>{exp.spotName}</Text>
                  </View>

                  {/* Media Content Box */}
                  <TouchableOpacity
                    style={styles.expMediaWrapper}
                    activeOpacity={0.9}
                    onPress={() => setSelectedExplorerJourney(exp)}
                  >
                    <Image source={{ uri: exp.mediaUri }} style={styles.expMediaImage} />
                    
                    {/* Media Type Indicators */}
                    {exp.mediaType === 'video' && (
                      <View style={styles.videoPlayBadge}>
                        <Ionicons name="play" size={16} color="#FFFFFF" style={{ marginLeft: 2 }} />
                        <Text style={styles.videoDurationText}>{exp.videoDuration || '0:28'}</Text>
                      </View>
                    )}

                    {exp.mediaType === 'collage' && (
                      <View style={styles.collageBadge}>
                        <Ionicons name="grid-outline" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                        <Text style={styles.collageBadgeText}>Moments Collage</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Quote / Note */}
                  <Text style={styles.expNoteText}>"{exp.note}"</Text>

                  {/* Card Action / Footer Bar */}
                  <View style={styles.expCardFooter}>
                    <View style={styles.expStatsGroup}>
                      <TouchableOpacity style={styles.expStatItem} activeOpacity={0.7}>
                        <Ionicons name="heart-outline" size={16} color="#FF6B00" />
                        <Text style={styles.expStatText}>{exp.likesCount}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.expStatItem} activeOpacity={0.7}>
                        <Ionicons name="chatbubble-outline" size={15} color="#8A8F9B" />
                        <Text style={styles.expStatText}>{exp.commentsCount}</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={styles.viewJourneyButton}
                      activeOpacity={0.8}
                      onPress={() => router.push('/journey/j1' as any)}
                    >
                      <Text style={styles.viewJourneyText}>View Journey ›</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* ================================================== */}
      {/* 19. STICKY BOTTOM ACTION BAR                      */}
      {/* ================================================== */}
      <View
        style={[
          styles.stickyBottomBar,
          { paddingBottom: Math.max(insets.bottom, 14), paddingTop: 12 },
        ]}
      >
        <TouchableOpacity
          style={[styles.bottomSaveButton, isSaved && styles.bottomSaveButtonActive]}
          activeOpacity={0.85}
          onPress={handleToggleSave}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={isSaved ? '#FF6B00' : '#FFFFFF'}
          />
          <Text style={[styles.bottomSaveText, isSaved && styles.bottomSaveTextActive]}>
            {isSaved ? 'Saved' : 'Save Route'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomExploreButton}
          activeOpacity={0.88}
          onPress={() => router.push(`/journey-mode/${route.id}` as any)}
        >
          <Ionicons name="map-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.bottomExploreText}>View Route Map</Text>
        </TouchableOpacity>
      </View>

      {/* ================================================== */}
      {/* MODAL 1: PEOPLE WHO EXPLORED MODAL                */}
      {/* ================================================== */}
      <Modal
        visible={isExploredPeopleModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsExploredPeopleModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheetContainer}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalSheetTitle}>
                People Who Explored ({route.exploredCount})
              </Text>
              <TouchableOpacity
                style={styles.modalCloseCircle}
                onPress={() => setIsExploredPeopleModalVisible(false)}
              >
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
            >
              {route.exploredPeople.map((person: ExploredUser) => {
                const isFollowing = followingUsersMap[person.id] ?? person.isFollowing ?? false;
                return (
                  <View key={person.id} style={styles.exploredPersonRow}>
                    <TouchableOpacity
                      style={styles.personRowLeft}
                      activeOpacity={0.8}
                      onPress={() => {
                        setIsExploredPeopleModalVisible(false);
                        handleCreatorPress(person.id);
                      }}
                    >
                      <Image source={{ uri: person.avatar }} style={styles.personAvatar} />
                      <View>
                        <View style={styles.personNameRow}>
                          <Text style={styles.personName}>{person.name}</Text>
                          {person.isVerified && (
                            <Ionicons name="checkmark-circle" size={13} color="#FF6B00" style={{ marginLeft: 3 }} />
                          )}
                        </View>
                        <Text style={styles.personMetaText}>
                          @{person.username} • {person.momentsCount} moments captured
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.smallFollowBtn, isFollowing && styles.smallFollowingBtn]}
                      activeOpacity={0.8}
                      onPress={() => toggleFollowUser(person.id)}
                    >
                      <Text style={[styles.smallFollowBtnText, isFollowing && styles.smallFollowingBtnText]}>
                        {isFollowing ? 'Following' : 'Follow'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ================================================== */}
      {/* MODAL 2: EXPLORER JOURNEY / VIEW JOURNEY MODAL   */}
      {/* ================================================== */}
      <Modal
        visible={!!selectedExplorerJourney}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedExplorerJourney(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheetContainer, { height: SCREEN_HEIGHT * 0.82 }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalSheetTitle}>Explorer's Journey</Text>
              <TouchableOpacity
                style={styles.modalCloseCircle}
                onPress={() => setSelectedExplorerJourney(null)}
              >
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {selectedExplorerJourney && (
              <ScrollView
                contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 30 }}
                showsVerticalScrollIndicator={false}
              >
                {/* Explorer Info Header */}
                <View style={styles.journeyUserBanner}>
                  <Image source={{ uri: selectedExplorerJourney.user.avatar }} style={styles.journeyAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.journeyUserName}>{selectedExplorerJourney.user.name}</Text>
                    <Text style={styles.journeyUserUsername}>@{selectedExplorerJourney.user.username}</Text>
                    <Text style={styles.journeyDate}>{selectedExplorerJourney.exploredDateText}</Text>
                  </View>
                </View>

                {/* Progress Bar & Summary */}
                <View style={styles.journeyProgressCard}>
                  <View style={styles.journeyProgressHeader}>
                    <Text style={styles.journeyRouteTitle}>{route.title}</Text>
                    <Text style={styles.journeyProgressBadge}>
                      {selectedExplorerJourney.completedPlaces || 0} / {selectedExplorerJourney.totalPlaces || 0} Places Explored
                    </Text>
                  </View>

                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${((selectedExplorerJourney.completedPlaces || 0) / (selectedExplorerJourney.totalPlaces || 1)) * 100}%`,
                        },
                      ]}
                    />
                  </View>

                  <Text style={styles.journeyMomentsCountText}>
                    📸 {selectedExplorerJourney.momentsCount || 0} Captured Moments
                  </Text>
                </View>

                {/* Moments Feed */}
                <Text style={styles.momentsFeedTitle}>Captured Moments</Text>
                <View style={styles.momentsList}>
                  {(selectedExplorerJourney.moments || []).map((moment: any, idx: number) => (
                    <View key={moment.id || idx} style={styles.momentCard}>
                      <View style={styles.momentHeaderRow}>
                        <View style={styles.momentBadge}>
                          <Ionicons
                            name={moment.type === 'video' ? 'videocam-outline' : moment.type === 'note' ? 'create-outline' : 'image-outline'}
                            size={12}
                            color="#FF6B00"
                            style={{ marginRight: 3 }}
                          />
                          <Text style={styles.momentBadgeText}>
                            {moment.spotName}
                          </Text>
                        </View>
                        <Text style={styles.momentTimeText}>{moment.timeAgo}</Text>
                      </View>

                      {moment.mediaUri && (
                        <Image source={{ uri: moment.mediaUri }} style={styles.momentImage} />
                      )}

                      {moment.caption && (
                        <Text style={styles.momentCaptionText}>"{moment.caption}"</Text>
                      )}
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ================================================== */}
      {/* MODAL 3: FULL SCREEN IMAGE VIEWER MODAL            */}
      {/* ================================================== */}
      <Modal
        visible={isImageViewerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsImageViewerVisible(false)}
      >
        <View style={styles.imageViewerModalContainer}>
          <StatusBar barStyle="light-content" />

          {/* Top Bar with Close */}
          <SafeAreaView style={styles.imageViewerHeader}>
            <Text style={styles.imageViewerIndexText}>
              {selectedImageIndex + 1} / {route.photos.length}
            </Text>
            <TouchableOpacity
              style={styles.imageViewerCloseBtn}
              onPress={() => setIsImageViewerVisible(false)}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Main View */}
          <View style={styles.imageViewerBody}>
            <Image
              source={{ uri: route.photos[selectedImageIndex] }}
              style={styles.imageViewerFullImage}
              resizeMode="contain"
            />
          </View>

          {/* Footer Controls */}
          <SafeAreaView style={styles.imageViewerFooter}>
            <TouchableOpacity
              style={[
                styles.navArrowBtn,
                selectedImageIndex === 0 && { opacity: 0.3 },
              ]}
              disabled={selectedImageIndex === 0}
              onPress={() => setSelectedImageIndex((prev) => Math.max(0, prev - 1))}
            >
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
              <Text style={styles.navArrowText}>Previous</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navArrowBtn,
                selectedImageIndex === route.photos.length - 1 && { opacity: 0.3 },
              ]}
              disabled={selectedImageIndex === route.photos.length - 1}
              onPress={() =>
                setSelectedImageIndex((prev) => Math.min(route.photos.length - 1, prev + 1))
              }
            >
              <Text style={styles.navArrowText}>Next</Text>
              <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      </Modal>

      {/* ================================================== */}
      {/* MODAL 4: ROUTE MAP MODAL                          */}
      {/* ================================================== */}
      <Modal
        visible={isMapModalVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setIsMapModalVisible(false)}
      >
        <View style={styles.mapModalContainer}>
          <StatusBar barStyle="light-content" />

          {/* Map Header */}
          <SafeAreaView style={styles.mapHeader}>
            <TouchableOpacity
              style={styles.mapCloseBtn}
              onPress={() => setIsMapModalVisible(false)}
            >
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.mapTitleWrapper}>
              <Text style={styles.mapTitle} numberOfLines={1}>
                {route.title}
              </Text>
              <Text style={styles.mapSubtitle}>
                {route.distance} • {route.placeCount} Stops
              </Text>
            </View>
            <View style={{ width: 36 }} />
          </SafeAreaView>

          {/* Styled Canvas Route Map View */}
          <View style={styles.mapCanvas}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80',
              }}
              style={styles.mapGraphicBackground}
            />
            <View style={styles.mapDarkOverlay} />

            <View style={styles.mapPinsOverlay}>
              <View style={styles.mapPinStart}>
                <Ionicons name="navigate" size={14} color="#FFFFFF" />
                <Text style={styles.mapPinStartText}>Start: Kolukkumalai</Text>
              </View>

              <View style={styles.mapLineVisual} />

              <View style={styles.mapPinEnd}>
                <Ionicons name="flag" size={14} color="#FF6B00" />
                <Text style={styles.mapPinEndText}>End: Anamudi Ridge</Text>
              </View>
            </View>
          </View>

          {/* Map Bottom Sheet */}
          <SafeAreaView style={styles.mapBottomSheet}>
            <Text style={styles.mapSheetHeaderTitle}>Stops along this route</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingVertical: 8 }}
            >
              {route.places.map((place) => (
                <View key={place.id} style={styles.mapStopCard}>
                  <View style={styles.mapStopOrder}>
                    <Text style={styles.mapStopOrderText}>{place.order}</Text>
                  </View>
                  <View>
                    <Text style={styles.mapStopName}>{place.name}</Text>
                    <Text style={styles.mapStopDist}>{place.distanceFromStart}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.startJourneyBtn}
              activeOpacity={0.88}
              onPress={() => {
                setIsMapModalVisible(false);
                Alert.alert(
                  'Explore Route Started',
                  `You are now exploring "${route.title}"!\nHave a great adventure.`
                );
              }}
            >
              <Ionicons name="compass" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.startJourneyBtnText}>Start Exploring Route</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      </Modal>

      {/* ================================================== */}
      {/* MODAL: HIGHLIGHT DETAILS VIEW                     */}
      {/* ================================================== */}
      <Modal
        visible={isHighlightModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsHighlightModalVisible(false)}
      >
        {selectedHighlight && (
          <View style={styles.highlightModalContainer}>
            <StatusBar barStyle="light-content" />

            {/* Modal Header Bar */}
            <View
              style={[
                styles.highlightModalHeader,
                { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 20) + 6 : 10 },
              ]}
            >
              <TouchableOpacity
                style={styles.highlightModalBackBtn}
                activeOpacity={0.8}
                onPress={() => setIsHighlightModalVisible(false)}
              >
                <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
                <Text style={styles.highlightModalBackText}>Back</Text>
              </TouchableOpacity>

              <Text style={styles.highlightModalHeaderTitle} numberOfLines={1}>
                {selectedHighlight.title}
              </Text>

              <TouchableOpacity
                style={styles.highlightModalShareBtn}
                activeOpacity={0.8}
                onPress={() => handleShare()}
              >
                <Ionicons name="share-outline" size={18} color="#FF6B00" />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={[
                styles.highlightModalScrollContent,
                { paddingBottom: 40 + Math.max(insets.bottom, 14) },
              ]}
              showsVerticalScrollIndicator={false}
            >
              {/* Hero Photo & Info */}
              <View style={styles.highlightHeroCard}>
                <Image
                  source={{ uri: selectedHighlight.image }}
                  style={styles.highlightHeroImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(10,11,14,0.7)', '#0A0B0E']}
                  style={styles.highlightHeroGradient}
                />
                <View style={styles.highlightHeroTextOverlay}>
                  <View style={styles.highlightBadgePill}>
                    <Ionicons name="sparkles" size={12} color="#FF6B00" style={{ marginRight: 4 }} />
                    <Text style={styles.highlightBadgeText}>ROUTE HIGHLIGHT</Text>
                  </View>
                  <Text style={styles.highlightModalHeroTitle}>{selectedHighlight.title}</Text>
                  <Text style={styles.highlightModalHeroDesc}>
                    {selectedHighlight.longDescription || selectedHighlight.description}
                  </Text>
                </View>
              </View>

              {/* Related Places */}
              {selectedHighlight.relatedSpots && selectedHighlight.relatedSpots.length > 0 && (
                <View style={styles.highlightSectionBlock}>
                  <View style={styles.highlightSectionHeader}>
                    <Text style={styles.highlightSectionTitle}>Related Places</Text>
                    <Text style={styles.highlightSectionSubCount}>
                      {selectedHighlight.relatedSpots.length} places in this route
                    </Text>
                  </View>

                  <View style={styles.highlightSpotsList}>
                    {selectedHighlight.relatedSpots.map((spotItem: RoutePlace) => (
                      <TouchableOpacity
                        key={spotItem.id}
                        style={styles.highlightSpotCard}
                        activeOpacity={0.85}
                        onPress={() => {
                          setIsHighlightModalVisible(false);
                          router.push(`/spot/${spotItem.spotId || spotItem.id}` as any);
                        }}
                      >
                        <View style={styles.highlightSpotOrderBadge}>
                          <Text style={styles.highlightSpotOrderBadgeText}>{spotItem.order}</Text>
                        </View>

                        <Image source={{ uri: spotItem.image }} style={styles.highlightSpotImage} />

                        <View style={styles.highlightSpotInfo}>
                          <Text style={styles.highlightSpotName} numberOfLines={1}>
                            {spotItem.name}
                          </Text>
                          <Text style={styles.highlightSpotLocation}>
                            📍 {spotItem.location || 'Munnar, Kerala'}
                          </Text>
                          <Text style={styles.highlightSpotDistance}>
                            {spotItem.distanceFromStart} from start
                          </Text>
                        </View>

                        <Ionicons name="chevron-forward" size={18} color="#FF6B00" />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Highlight Photos */}
              {selectedHighlight.photos && selectedHighlight.photos.length > 0 && (
                <View style={styles.highlightSectionBlock}>
                  <Text style={styles.highlightSectionTitle}>Highlight Photos</Text>
                  <Text style={styles.highlightSectionSubtitle}>
                    Photos capturing this route feature
                  </Text>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.highlightPhotosScroll}
                  >
                    {selectedHighlight.photos.map((photoUri: string, idx: number) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.highlightPhotoItem}
                        activeOpacity={0.9}
                        onPress={() => {
                          setSelectedImageIndex(idx);
                          setIsImageViewerVisible(true);
                        }}
                      >
                        <Image source={{ uri: photoUri }} style={styles.highlightPhotoImage} />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* ================================================== */}
      {/* MODAL 5: MORE OPTIONS MODAL MENU                  */}
      {/* ================================================== */}
      <Modal
        visible={isMoreMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMoreMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.moreMenuBackdrop}
          activeOpacity={1}
          onPress={() => setIsMoreMenuVisible(false)}
        >
          <View style={styles.moreMenuContainer}>
            <TouchableOpacity
              style={styles.moreMenuItem}
              onPress={() => {
                setIsMoreMenuVisible(false);
                handleShare();
              }}
            >
              <Ionicons name="share-outline" size={18} color="#FFFFFF" />
              <Text style={styles.moreMenuText}>Share Route</Text>
            </TouchableOpacity>

            <View style={styles.moreMenuDivider} />

            <TouchableOpacity
              style={styles.moreMenuItem}
              onPress={() => {
                setIsMoreMenuVisible(false);
                Alert.alert('Report Route', 'Thank you for reporting. We will review this route.');
              }}
            >
              <Ionicons name="flag-outline" size={18} color="#FF453A" />
              <Text style={[styles.moreMenuText, { color: '#FF453A' }]}>Report Route</Text>
            </TouchableOpacity>

            <View style={styles.moreMenuDivider} />

            <TouchableOpacity
              style={styles.moreMenuItem}
              onPress={() => {
                setIsMoreMenuVisible(false);
                Alert.alert('Hide Route', 'Route hidden from your feed.');
              }}
            >
              <Ionicons name="eye-off-outline" size={18} color="#8A8F9B" />
              <Text style={[styles.moreMenuText, { color: '#8A8F9B' }]}>Hide Route</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0B0E',
  },
  scrollContent: {
    paddingTop: 0,
  },

  /* Hero Header */
  heroContainer: {
    width: '100%',
    height: 380,
    position: 'relative',
    backgroundColor: '#1E212A',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    ...StyleSheet.absoluteFill,
  },
  topActionsRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  circleButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(10, 11, 15, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Hero Info Block */
  heroInfoBlock: {
    position: 'absolute',
    bottom: 12,
    left: 18,
    right: 18,
  },
  routeBadge: {
    backgroundColor: 'rgba(255, 107, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  routeBadgeText: {
    color: '#FF6B00',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  routeTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  shortDescription: {
    color: '#D1D5DB',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  compactInfoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  infoChip: {
    backgroundColor: 'rgba(18, 20, 26, 0.75)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  infoChipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },

  /* Creator Section */
  sectionContainer: {
    paddingHorizontal: 18,
    marginVertical: 8,
  },
  creatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(18, 20, 26, 0.84)',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  creatorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  creatorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  creatorDetails: {
    flex: 1,
  },
  creatorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  creatorUsername: {
    color: '#9CA3AF',
    fontSize: 11.5,
    marginTop: 1,
  },
  followButton: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 12,
  },
  followingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  followingButtonText: {
    color: '#9CA3AF',
  },

  /* Engagement Stats */
  engagementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(18, 20, 26, 0.5)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  statsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statPillText: {
    color: '#E0E4EB',
    fontSize: 12,
    fontWeight: '600',
  },
  postedTimeText: {
    color: '#8A8F9B',
    fontSize: 11,
  },

  /* Description */
  descriptionText: {
    color: '#D1D5DB',
    fontSize: 13.5,
    lineHeight: 20,
  },
  readMoreButton: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    color: '#FF6B00',
    fontSize: 12.5,
    fontWeight: '700',
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 10,
    marginHorizontal: 18,
  },

  /* Route Tabs */
  tabsScrollContainer: {
    paddingHorizontal: 18,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 2,
    marginBottom: 14,
  },
  tabButton: {
    paddingVertical: 8,
    position: 'relative',
  },
  tabButtonActive: {},
  tabText: {
    color: '#8A8F9B',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FF6B00',
    fontWeight: '700',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#FF6B00',
    borderRadius: 2,
  },

  /* Tab Content */
  tabContentContainer: {
    paddingHorizontal: 18,
  },
  subSectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 8,
  },

  /* About This Route - STRICT SINGLE LINE REQUIREMENT */
  aboutSection: {
    marginBottom: 18,
  },
  aboutSingleLineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(18, 20, 26, 0.84)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  aboutLineItem: {
    flex: 1,
    alignItems: 'center',
  },
  aboutLineDivider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  aboutLineText: {
    fontSize: 12.5,
  },
  aboutLineLabel: {
    color: '#9CA3AF',
    fontWeight: '500',
  },
  aboutLineValue: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* Highlights Section */
  highlightsSection: {
    marginBottom: 18,
  },
  highlightsScroll: {
    gap: 12,
  },
  highlightCard: {
    width: 150,
    height: 110,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1E212A',
  },
  highlightImage: {
    width: '100%',
    height: '100%',
  },
  highlightOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10, 11, 15, 0.82)',
    padding: 8,
  },
  highlightTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  highlightDesc: {
    color: '#9CA3AF',
    fontSize: 10,
    marginTop: 1,
  },

  /* Places in Route Section */
  placesSection: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  seeAllText: {
    color: '#FF6B00',
    fontSize: 12.5,
    fontWeight: '700',
  },
  placesHorizontalScroll: {
    gap: 12,
  },
  placeHorizontalCard: {
    width: 135,
    backgroundColor: 'rgba(18, 20, 26, 0.84)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  placeImageWrapper: {
    height: 95,
    position: 'relative',
  },
  placeImage: {
    width: '100%',
    height: '100%',
  },
  orderBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  placeInfoWrapper: {
    padding: 8,
  },
  placeName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  placeDistanceText: {
    color: '#9CA3AF',
    fontSize: 10.5,
    marginTop: 2,
  },

  /* Explored People Section */
  exploredPeopleSection: {
    marginBottom: 16,
  },
  exploredPeopleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 20, 26, 0.84)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
  },
  avatarStackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  stackedAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#0A0B0E',
  },
  plusCountBadge: {
    marginLeft: -8,
    zIndex: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 107, 0, 0.25)',
    borderWidth: 1.5,
    borderColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusCountText: {
    color: '#FF6B00',
    fontSize: 9.5,
    fontWeight: '800',
  },
  exploredTextWrapper: {
    flex: 1,
    paddingRight: 6,
  },
  exploredMainText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  exploredSubText: {
    color: '#9CA3AF',
    fontSize: 10.5,
    marginTop: 1,
  },

  /* Vertical Places List */
  placesHeaderBlock: {
    marginBottom: 12,
  },
  placesSubtitleText: {
    color: '#8A8F9B',
    fontSize: 12.5,
    marginTop: -4,
  },
  placesVerticalList: {
    gap: 12,
    marginTop: 4,
  },
  placeVerticalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 20, 26, 0.84)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
  },
  placeOrderBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  placeOrderBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  placeVerticalImage: {
    width: 72,
    height: 56,
    borderRadius: 10,
    marginRight: 12,
  },
  placeVerticalBody: {
    flex: 1,
    marginRight: 6,
  },
  placeVerticalName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  placeCategoryText: {
    color: '#8A8F9B',
    fontSize: 11.5,
    marginTop: 1,
  },
  placeLocationText: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 1,
  },
  placeVerticalDistance: {
    color: '#FF6B00',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },

  /* Photos Tab - ROUTE REFERENCE PHOTOS */
  photosHeaderBlock: {
    marginBottom: 12,
  },
  photosSubtitle: {
    color: '#FF6B00',
    fontSize: 12.5,
    fontWeight: '700',
    marginTop: -4,
  },
  photosConceptBanner: {
    color: '#9CA3AF',
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: 4,
    backgroundColor: 'rgba(18, 20, 26, 0.6)',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  featuredRoutePhotoCard: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
    backgroundColor: '#1E212A',
  },
  featuredRoutePhotoImage: {
    width: '100%',
    height: '100%',
  },
  featuredPhotoBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(10, 11, 15, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.4)',
  },
  featuredPhotoBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoGridItem: {
    width: (SCREEN_WIDTH - 36 - 16) / 3,
    height: (SCREEN_WIDTH - 36 - 16) / 3,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1E212A',
  },
  photoGridImage: {
    width: '100%',
    height: '100%',
  },
  morePhotosOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10, 11, 15, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  morePhotosText: {
    color: '#FF6B00',
    fontSize: 18,
    fontWeight: '800',
  },
  morePhotosSubtext: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },

  /* Experiences Tab */
  expHeaderBlock: {
    marginBottom: 10,
  },
  expSubtitle: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: -4,
  },
  expFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  expChip: {
    backgroundColor: 'rgba(18, 20, 26, 0.84)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  expChipActive: {
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
    borderColor: '#FF6B00',
  },
  expChipText: {
    color: '#8A8F9B',
    fontSize: 11.5,
    fontWeight: '600',
  },
  expChipTextActive: {
    color: '#FF6B00',
    fontWeight: '700',
  },

  /* Feed Cards */
  expFeedList: {
    gap: 14,
  },
  expCard: {
    backgroundColor: 'rgba(18, 20, 26, 0.84)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 14,
  },
  expCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  expUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  expUserAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 9,
  },
  expUserNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expUserName: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  expDateText: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 1,
  },
  privacyBadge: {
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  privacyBadgeText: {
    color: '#FF6B00',
    fontSize: 9.5,
    fontWeight: '800',
  },
  expLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  expLocationText: {
    color: '#FF6B00',
    fontSize: 12,
    fontWeight: '700',
  },
  expMediaWrapper: {
    height: 170,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 10,
    backgroundColor: '#1E212A',
  },
  expMediaImage: {
    width: '100%',
    height: '100%',
  },
  videoPlayBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(10, 11, 15, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  videoDurationText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  collageBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(10, 11, 15, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  collageBadgeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '600',
  },
  expNoteText: {
    color: '#D1D5DB',
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
    marginBottom: 10,
  },
  expCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  expStatsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  expStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expStatText: {
    color: '#9CA3AF',
    fontSize: 11.5,
    fontWeight: '600',
  },
  viewJourneyButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewJourneyText: {
    color: '#FF6B00',
    fontSize: 12.5,
    fontWeight: '700',
  },

  /* Sticky Bottom Action Bar */
  stickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10, 11, 15, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    paddingHorizontal: 18,
    gap: 12,
    alignItems: 'center',
  },
  bottomSaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 14,
    gap: 6,
  },
  bottomSaveButtonActive: {
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
    borderColor: '#FF6B00',
  },
  bottomSaveText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  bottomSaveTextActive: {
    color: '#FF6B00',
  },
  bottomExploreButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B00',
    height: 48,
    borderRadius: 14,
  },
  bottomExploreText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  /* Modal Generic */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalSheetContainer: {
    backgroundColor: '#14161E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    height: SCREEN_HEIGHT * 0.75,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalSheetTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  modalCloseCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Explored People Modal */
  exploredPersonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  personRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  personAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
  },
  personNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  personName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  personMetaText: {
    color: '#9CA3AF',
    fontSize: 11.5,
    marginTop: 2,
  },
  smallFollowBtn: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  smallFollowingBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  smallFollowBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  smallFollowingBtnText: {
    color: '#9CA3AF',
  },

  /* Journey Modal */
  journeyUserBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    backgroundColor: 'rgba(18, 20, 26, 0.84)',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  journeyAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  journeyUserName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  journeyUserUsername: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  journeyDate: {
    color: '#FF6B00',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  journeyProgressCard: {
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.3)',
    padding: 14,
    marginBottom: 16,
  },
  journeyProgressHeader: {
    marginBottom: 8,
  },
  journeyRouteTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  journeyProgressBadge: {
    color: '#FF6B00',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF6B00',
    borderRadius: 3,
  },
  journeyMomentsCountText: {
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '600',
  },
  momentsFeedTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  momentsList: {
    gap: 12,
  },
  momentCard: {
    backgroundColor: 'rgba(18, 20, 26, 0.84)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
  },
  momentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  momentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  momentBadgeText: {
    color: '#FF6B00',
    fontSize: 11,
    fontWeight: '700',
  },
  momentTimeText: {
    color: '#8A8F9B',
    fontSize: 10.5,
  },
  momentImage: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    marginBottom: 8,
  },
  momentCaptionText: {
    color: '#E0E4EB',
    fontSize: 12.5,
    fontStyle: 'italic',
  },

  /* Image Viewer Modal */
  imageViewerModalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  imageViewerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 30 : 10,
  },
  imageViewerIndexText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  imageViewerCloseBtn: {
    padding: 6,
  },
  imageViewerBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerFullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.75,
  },
  imageViewerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  navArrowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
  },
  navArrowText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  /* Map Modal */
  mapModalContainer: {
    flex: 1,
    backgroundColor: '#0A0B0E',
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 30 : 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  mapCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapTitleWrapper: {
    alignItems: 'center',
  },
  mapTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  mapSubtitle: {
    color: '#FF6B00',
    fontSize: 11,
    fontWeight: '600',
  },
  mapCanvas: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#151821',
  },
  mapGraphicBackground: {
    width: '100%',
    height: '100%',
  },
  mapDarkOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10, 11, 15, 0.55)',
  },
  mapPinsOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapPinStart: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  mapPinStartText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  mapLineVisual: {
    width: 3,
    height: 120,
    backgroundColor: '#FF6B00',
    marginVertical: 8,
    borderRadius: 2,
  },
  mapPinEnd: {
    backgroundColor: 'rgba(18, 20, 26, 0.9)',
    borderWidth: 1.5,
    borderColor: '#FF6B00',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  mapPinEndText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  mapBottomSheet: {
    backgroundColor: 'rgba(18, 20, 26, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 14,
    paddingBottom: 16,
  },
  mapSheetHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 18,
  },
  mapStopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  mapStopOrder: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapStopOrderText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  mapStopName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  mapStopDist: {
    color: '#9CA3AF',
    fontSize: 10,
  },
  startJourneyBtn: {
    backgroundColor: '#FF6B00',
    marginHorizontal: 18,
    marginTop: 10,
    height: 46,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startJourneyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  /* More Menu Modal */
  moreMenuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreMenuContainer: {
    width: 220,
    backgroundColor: '#161922',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 6,
    overflow: 'hidden',
  },
  moreMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  moreMenuText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '600',
  },
  moreMenuDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },

  /* Highlight Details Modal Styles */
  highlightModalContainer: {
    flex: 1,
    backgroundColor: '#0A0B0E',
  },
  highlightModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#0A0B0E',
  },
  highlightModalBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  highlightModalBackText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  highlightModalHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  highlightModalShareBtn: {
    padding: 4,
  },
  highlightModalScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  highlightHeroCard: {
    width: '100%',
    height: 220,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 18,
    backgroundColor: '#161922',
  },
  highlightHeroImage: {
    width: '100%',
    height: '100%',
  },
  highlightHeroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  highlightHeroTextOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  highlightBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 0, 0.2)',
    borderWidth: 1,
    borderColor: '#FF6B00',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
  },
  highlightBadgeText: {
    color: '#FF6B00',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  highlightModalHeroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  highlightModalHeroDesc: {
    color: '#D1D5DB',
    fontSize: 13,
    lineHeight: 18,
  },
  highlightSectionBlock: {
    marginBottom: 20,
  },
  highlightSectionHeader: {
    marginBottom: 10,
  },
  highlightSectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  highlightSectionSubCount: {
    color: '#8A8F9B',
    fontSize: 12,
    marginTop: 2,
  },
  highlightSectionSubtitle: {
    color: '#8A8F9B',
    fontSize: 12,
    marginTop: 2,
    marginBottom: 10,
  },
  highlightSpotsList: {
    gap: 12,
  },
  highlightSpotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 20, 26, 0.88)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 12,
  },
  highlightSpotOrderBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B00',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  highlightSpotOrderBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  highlightSpotImage: {
    width: 68,
    height: 52,
    borderRadius: 10,
    marginRight: 12,
  },
  highlightSpotInfo: {
    flex: 1,
    marginRight: 6,
  },
  highlightSpotName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  highlightSpotLocation: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 2,
  },
  highlightSpotDistance: {
    color: '#FF6B00',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  highlightPhotosScroll: {
    gap: 10,
    paddingTop: 4,
  },
  highlightPhotoItem: {
    width: 140,
    height: 100,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#1E212A',
  },
  highlightPhotoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
