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
  Alert,
  Share,
  Platform,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  MOCK_SPOTS,
  MOCK_DETAILED_SPOT,
  MOCK_JOURNEY_DETAILS,
  Spot,
  JourneyMomentItem,
} from '@/data/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SpotDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Find target spot or default to rich detailed spot
  const matchedSpot = MOCK_SPOTS.find((s) => s.id === id);
  const spot: Spot = {
    ...MOCK_DETAILED_SPOT,
    ...(matchedSpot || {}),
    // Ensure all rich detailed properties exist if matchedSpot is simpler
    tags: matchedSpot?.tags || MOCK_DETAILED_SPOT.tags,
    heroPhotos: matchedSpot?.heroPhotos || MOCK_DETAILED_SPOT.heroPhotos,
    spotPhotos: matchedSpot?.spotPhotos || MOCK_DETAILED_SPOT.spotPhotos,
    elevation: matchedSpot?.elevation || MOCK_DETAILED_SPOT.elevation,
    bestTime: matchedSpot?.bestTime || MOCK_DETAILED_SPOT.bestTime,
    distanceText: matchedSpot?.distanceText || MOCK_DETAILED_SPOT.distanceText,
    nearbyTown: matchedSpot?.nearbyTown || MOCK_DETAILED_SPOT.nearbyTown,
    aboutDescription: matchedSpot?.aboutDescription || MOCK_DETAILED_SPOT.aboutDescription,
    routesContaining: matchedSpot?.routesContaining || MOCK_DETAILED_SPOT.routesContaining,
    nearbySpotsList: matchedSpot?.nearbySpotsList || MOCK_DETAILED_SPOT.nearbySpotsList,
    visitorTips: matchedSpot?.visitorTips || MOCK_DETAILED_SPOT.visitorTips,
    stories: matchedSpot?.stories || MOCK_DETAILED_SPOT.stories,
  };

  // State Management
  const [isSaved, setIsSaved] = useState(false);
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [likedMomentsMap, setLikedMomentsMap] = useState<Record<string, boolean>>({});

  const heroPhotosList = spot.heroPhotos || [spot.image];
  const spotPhotosList = spot.spotPhotos || heroPhotosList;
  const explorerMoments = MOCK_JOURNEY_DETAILS.moments;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${spot.name || spot.title} in ${spot.location} on DreamOut!`,
      });
    } catch (error) {
      Alert.alert('Share Spot', `Sharing ${spot.name || spot.title}`);
    }
  };

  const handleHeroScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(
      event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width
    );
    if (activeHeroSlide !== slideIndex) {
      setActiveHeroSlide(slideIndex);
    }
  };

  const toggleLikeMoment = (momentId: string) => {
    setLikedMomentsMap((prev) => ({
      ...prev,
      [momentId]: !prev[momentId],
    }));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 85 + Math.max(insets.bottom, 14) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ================================================== */}
        {/* 1. HEADER / SWIPEABLE HERO IMAGE                  */}
        {/* ================================================== */}
        <View style={styles.heroContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleHeroScroll}
            scrollEventThrottle={16}
            style={styles.heroScroll}
          >
            {heroPhotosList.map((photoUri, idx) => (
              <Image
                key={idx}
                source={{ uri: photoUri }}
                style={styles.heroImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Dark Overlay Gradient */}
          <LinearGradient
            colors={['rgba(10,11,14,0.35)', 'rgba(10,11,14,0.65)', '#0A0B0E']}
            locations={[0, 0.6, 1]}
            style={styles.heroGradient}
          />

          {/* Top Actions Row */}
          <View style={[styles.topActionsRow, { paddingTop: Math.max(insets.top, 20) + 8 }]}>
            <TouchableOpacity
              style={styles.circleButton}
              activeOpacity={0.8}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.topRightGroup}>
              <TouchableOpacity
                style={styles.circleButton}
                activeOpacity={0.8}
                onPress={() => setIsSaved((prev) => !prev)}
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
                <Ionicons name="share-outline" size={19} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.circleButton}
                activeOpacity={0.8}
                onPress={() => Alert.alert('Options', spot.name || spot.title)}
              >
                <Ionicons name="ellipsis-horizontal" size={19} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Slide Counter Badge */}
          {heroPhotosList.length > 1 && (
            <View style={styles.slideCounterBadge}>
              <Text style={styles.slideCounterText}>
                {activeHeroSlide + 1}/{heroPhotosList.length}
              </Text>
            </View>
          )}

          {/* Hero Bottom Overlay Info */}
          <View style={styles.heroTitleWrapper}>
            <View style={styles.spotBadgePill}>
              <Text style={styles.spotBadgeText}>SPOT</Text>
            </View>
            <Text style={styles.spotTitle}>{spot.name || spot.title}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={15} color="#FF6B00" style={{ marginRight: 4 }} />
              <Text style={styles.locationText}>{spot.location}</Text>
            </View>
          </View>
        </View>

        {/* ================================================== */}
        {/* 2. BASIC INFORMATION & STATS                      */}
        {/* ================================================== */}
        <View style={styles.sectionContainer}>
          <View style={styles.categoryTagsRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{spot.category}</Text>
            </View>
            {(spot.tags || ['Scenic', 'Popular']).map((tag, idx) => (
              <View key={idx} style={styles.tagBadge}>
                <Text style={styles.tagBadgeText}>{tag}</Text>
              </View>
            ))}
          </View>

          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <View style={styles.statValueRow}>
                <Ionicons name="star" size={15} color="#FF6B00" style={{ marginRight: 4 }} />
                <Text style={styles.statValueText}>{spot.rating || 4.8}</Text>
                <Text style={styles.statSubText}>({spot.ratingCount || 324})</Text>
              </View>
              <Text style={styles.statLabel}>Community Rating</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <View style={styles.statValueRow}>
                <Ionicons name="people" size={15} color="#FF6B00" style={{ marginRight: 4 }} />
                <Text style={styles.statValueText}>
                  {spot.exploredCount ? `${(spot.exploredCount / 1000).toFixed(1)}K` : '12.4K'}
                </Text>
              </View>
              <Text style={styles.statLabel}>Visited</Text>
            </View>
          </View>
        </View>

        {/* ================================================== */}
        {/* 3. SHORT DESCRIPTION                             */}
        {/* ================================================== */}
        <View style={styles.sectionContainer}>
          <Text
            style={styles.descriptionText}
            numberOfLines={isDescriptionExpanded ? undefined : 2}
          >
            "{spot.description}"
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsDescriptionExpanded((prev) => !prev)}
            style={styles.readMoreBtn}
          >
            <Text style={styles.readMoreBtnText}>
              {isDescriptionExpanded ? 'Show Less' : 'Read More'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================================================== */}
        {/* 4. COMPACT SPOT INFORMATION GRID                  */}
        {/* ================================================== */}
        <View style={styles.sectionContainer}>
          <View style={styles.infoGridCard}>
            <View style={styles.infoGridItem}>
              <Text style={styles.infoGridLabel}>Elevation</Text>
              <Text style={styles.infoGridValue}>{spot.elevation || '1,830 m'}</Text>
            </View>
            <View style={styles.infoGridDivider} />
            <View style={styles.infoGridItem}>
              <Text style={styles.infoGridLabel}>Best Time</Text>
              <Text style={styles.infoGridValue}>{spot.bestTime || 'Oct – Mar'}</Text>
            </View>
            <View style={styles.infoGridDivider} />
            <View style={styles.infoGridItem}>
              <Text style={styles.infoGridLabel}>Distance</Text>
              <Text style={styles.infoGridValue}>{spot.distanceText || '35 km'}</Text>
            </View>
            <View style={styles.infoGridDivider} />
            <View style={styles.infoGridItem}>
              <Text style={styles.infoGridLabel}>Nearby Town</Text>
              <Text style={styles.infoGridValue}>{spot.nearbyTown || 'Suryanelli'}</Text>
            </View>
          </View>
        </View>

        {/* ================================================== */}
        {/* 5. SPOT PHOTOS (REFERENCE PHOTOS)                 */}
        {/* ================================================== */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.seeAllText}>See All ({spotPhotosList.length}) ›</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionSubtitleText}>Spot reference photos</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photosHorizontalScroll}
          >
            {spotPhotosList.map((photoUri, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.spotPhotoThumbnail}
                activeOpacity={0.88}
                onPress={() => {
                  setSelectedPhotoIndex(idx);
                  setIsImageViewerVisible(true);
                }}
              >
                <Image source={{ uri: photoUri }} style={styles.spotPhotoImage} />
                {idx === 3 && spotPhotosList.length > 4 && (
                  <View style={styles.morePhotosOverlay}>
                    <Text style={styles.morePhotosCountText}>+{spotPhotosList.length - 4}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ================================================== */}
        {/* 6. ABOUT THIS SPOT                                */}
        {/* ================================================== */}
        <View style={styles.sectionCardContainer}>
          <Text style={styles.sectionTitle}>About This Spot</Text>
          <Text
            style={styles.aboutBodyText}
            numberOfLines={isAboutExpanded ? undefined : 3}
          >
            {spot.aboutDescription ||
              `${spot.name || spot.title} is known for its panoramic views of the Western Ghats and surrounding tea estates. Perched amidst high altitude ridges, it offers visitors spectacular cloud inversions and vibrant early morning sunrises.`}
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsAboutExpanded((prev) => !prev)}
            style={{ marginTop: 6 }}
          >
            <Text style={styles.readMoreBtnText}>
              {isAboutExpanded ? 'Read Less' : 'Read More'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================================================== */}
        {/* 7. ROUTES INCLUDING THIS SPOT                     */}
        {/* ================================================== */}
        {spot.routesContaining && spot.routesContaining.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Routes Including This Spot</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.seeAllText}>See All ›</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.routesStack}>
              {spot.routesContaining.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={styles.routeItemCard}
                  activeOpacity={0.88}
                  onPress={() => router.push(`/route/${r.id}` as any)}
                >
                  <Image source={{ uri: r.image }} style={styles.routeItemImage} />
                  <View style={styles.routeItemBody}>
                    <Text style={styles.routeItemTitle}>{r.title}</Text>
                    <Text style={styles.routeItemMeta}>
                      {r.placesCount} places • {r.distance} • {r.duration}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#FF6B00" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ================================================== */}
        {/* 8. LOCATION / MAP PREVIEW                         */}
        {/* ================================================== */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.mapCard}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80',
              }}
              style={styles.mapImage}
            />
            <View style={styles.mapDarkOverlay} />
            <View style={styles.mapPinBadge}>
              <Ionicons name="location" size={14} color="#FF6B00" style={{ marginRight: 4 }} />
              <Text style={styles.mapPinText}>{spot.name || spot.title}</Text>
            </View>

            <TouchableOpacity
              style={styles.openMapBtn}
              activeOpacity={0.85}
              onPress={() =>
                Alert.alert('Open Maps', `Opening map directions for ${spot.name || spot.title}`)
              }
            >
              <Ionicons name="navigate-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.openMapBtnText}>Open in Maps</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================================================== */}
        {/* 9. NEARBY SPOTS                                   */}
        {/* ================================================== */}
        {spot.nearbySpotsList && spot.nearbySpotsList.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Nearby Spots</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.seeAllText}>See All ›</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.nearbySpotsList}>
              {spot.nearbySpotsList.map((nearby) => (
                <TouchableOpacity
                  key={nearby.id}
                  style={styles.nearbySpotCard}
                  activeOpacity={0.88}
                  onPress={() => router.push(`/spot/${nearby.id}` as any)}
                >
                  <Image source={{ uri: nearby.image }} style={styles.nearbySpotImage} />
                  <View style={styles.nearbySpotInfo}>
                    <Text style={styles.nearbySpotName}>{nearby.name}</Text>
                    <Text style={styles.nearbySpotDist}>{nearby.distanceAway}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#FF6B00" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ================================================== */}
        {/* 10. VISITOR TIPS                                 */}
        {/* ================================================== */}
        {spot.visitorTips && spot.visitorTips.length > 0 && (
          <View style={styles.sectionCardContainer}>
            <Text style={styles.sectionTitle}>Visitor Tips</Text>
            <View style={styles.tipsList}>
              {spot.visitorTips.map((tip, idx) => (
                <View key={idx} style={styles.tipItemRow}>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ================================================== */}
        {/* 11. EXPERIENCES AT THIS SPOT (PUBLIC MOMENTS FEED) */}
        {/* 4:5 PORTRAIT FORMAT EXPLORER POSTS                */}
        {/* ================================================== */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Experiences at This Spot</Text>
              <Text style={styles.sectionSubtitleText}>Real moments from people who visited.</Text>
            </View>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.seeAllText}>See All ›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.momentsFeed}>
            {explorerMoments.map((moment: JourneyMomentItem) => {
              const isLiked = likedMomentsMap[moment.id] ?? false;
              return (
                <View key={moment.id} style={styles.momentPostCard}>
                  {/* Moment Post Header */}
                  <View style={styles.momentPostHeader}>
                    <Image
                      source={{ uri: MOCK_JOURNEY_DETAILS.explorer.avatar }}
                      style={styles.momentAvatar}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.momentAuthorName}>
                        {MOCK_JOURNEY_DETAILS.explorer.name} ✓
                      </Text>
                      <Text style={styles.momentTimeText}>
                        Visited {moment.exploredTimeText || '12 May 2026'}
                      </Text>
                    </View>
                    <Ionicons name="ellipsis-horizontal" size={18} color="#8A8F9B" />
                  </View>

                  {/* 4:5 Portrait Media Box */}
                  {moment.type !== 'note' && moment.mediaUri && (
                    <View style={styles.portraitAspectBox}>
                      <Image source={{ uri: moment.mediaUri }} style={styles.momentMediaImage} />
                      {moment.type === 'video' && (
                        <View style={styles.videoPlayCircle}>
                          <Ionicons name="play" size={24} color="#FFFFFF" style={{ marginLeft: 3 }} />
                        </View>
                      )}
                    </View>
                  )}

                  {/* Note Moment Container */}
                  {moment.type === 'note' && (
                    <View style={styles.noteBox}>
                      <Text style={styles.noteText}>"{moment.caption}"</Text>
                    </View>
                  )}

                  {/* Caption Quote */}
                  {moment.type !== 'note' && moment.caption && (
                    <Text style={styles.momentCaption}>"{moment.caption}"</Text>
                  )}

                  {/* Engagement Bar */}
                  <View style={styles.momentFooterRow}>
                    <TouchableOpacity
                      style={styles.engagementBtn}
                      activeOpacity={0.7}
                      onPress={() => toggleLikeMoment(moment.id)}
                    >
                      <Ionicons
                        name={isLiked ? 'heart' : 'heart-outline'}
                        size={18}
                        color={isLiked ? '#FF6B00' : '#8A8F9B'}
                      />
                      <Text style={[styles.engagementCount, isLiked && { color: '#FF6B00' }]}>
                        {(moment.likesCount || 0) + (isLiked ? 1 : 0)}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.engagementBtn} activeOpacity={0.7}>
                      <Ionicons name="chatbubble-outline" size={17} color="#8A8F9B" />
                      <Text style={styles.engagementCount}>{moment.commentsCount || 0}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* ================================================== */}
        {/* 12. RELATED STORIES FROM THIS SPOT                 */}
        {/* ================================================== */}
        {spot.stories && spot.stories.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Stories from This Spot</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.seeAllText}>See All ›</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.storiesScroll}
            >
              {spot.stories.map((st) => (
                <TouchableOpacity
                  key={st.id}
                  style={styles.storyAvatarItem}
                  activeOpacity={0.8}
                  onPress={() => router.push('/story/s1' as any)}
                >
                  <View style={styles.storyRing}>
                    <Image source={{ uri: st.avatar }} style={styles.storyAvatarImage} />
                  </View>
                  <Text style={styles.storyNameText}>{st.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* ================================================== */}
      {/* 14. STICKY BOTTOM ACTIONS: Save Spot | Get Directions */}
      {/* ================================================== */}
      <View
        style={[
          styles.bottomActionBar,
          { paddingBottom: Math.max(insets.bottom, 14), paddingTop: 12 },
        ]}
      >
        <TouchableOpacity
          style={[styles.saveBtn, isSaved && styles.saveBtnActive]}
          activeOpacity={0.85}
          onPress={() => setIsSaved((prev) => !prev)}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={isSaved ? '#FF6B00' : '#FFFFFF'}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.saveBtnText, isSaved && styles.saveBtnTextActive]}>
            {isSaved ? 'Saved' : 'Save Spot'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionPrimaryBtn}
          activeOpacity={0.88}
          onPress={() =>
            Alert.alert('Get Directions', `Opening map navigation to ${spot.name || spot.title}`)
          }
        >
          <Ionicons name="navigate" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.actionPrimaryText}>Get Directions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0B0E',
  },
  scrollContent: {
    paddingBottom: 40,
  },

  /* Hero Section */
  heroContainer: {
    width: SCREEN_WIDTH,
    height: 360,
    position: 'relative',
    backgroundColor: '#0F1117',
  },
  heroScroll: {
    width: '100%',
    height: '100%',
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: 360,
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topActionsRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  topRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  circleButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(10, 11, 14, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideCounterBadge: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  slideCounterText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  heroTitleWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 18,
    right: 18,
  },
  spotBadgePill: {
    backgroundColor: 'rgba(255, 107, 0, 0.2)',
    borderWidth: 1,
    borderColor: '#FF6B00',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
  },
  spotBadgeText: {
    color: '#FF6B00',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  spotTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
  },

  /* Sections */
  sectionContainer: {
    paddingHorizontal: 16,
    marginTop: 18,
  },
  sectionCardContainer: {
    backgroundColor: 'rgba(18, 20, 26, 0.88)',
    marginHorizontal: 16,
    marginTop: 18,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  seeAllText: {
    color: '#FF6B00',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionSubtitleText: {
    color: '#8A8F9B',
    fontSize: 12,
    marginBottom: 10,
  },

  /* Basic Info & Tags */
  categoryTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
    borderWidth: 1,
    borderColor: '#FF6B00',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  categoryBadgeText: {
    color: '#FF6B00',
    fontSize: 12,
    fontWeight: '700',
  },
  tagBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tagBadgeText: {
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '600',
  },

  /* Stats Bar */
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(18, 20, 26, 0.88)',
    borderRadius: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValueText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  statSubText: {
    color: '#8A8F9B',
    fontSize: 12,
    marginLeft: 3,
  },
  statLabel: {
    color: '#8A8F9B',
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  /* Description */
  descriptionText: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 21,
    fontStyle: 'italic',
  },
  aboutBodyText: {
    color: '#9CA3AF',
    fontSize: 13.5,
    lineHeight: 20,
    marginTop: 6,
  },
  readMoreBtn: {
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  readMoreBtnText: {
    color: '#FF6B00',
    fontSize: 13,
    fontWeight: '700',
  },

  /* Info Grid */
  infoGridCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(18, 20, 26, 0.88)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  infoGridItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoGridLabel: {
    color: '#8A8F9B',
    fontSize: 11,
    marginBottom: 4,
  },
  infoGridValue: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
    textAlign: 'center',
  },
  infoGridDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  /* Photos Horizontal Scroll */
  photosHorizontalScroll: {
    gap: 10,
    paddingTop: 4,
  },
  spotPhotoThumbnail: {
    width: 110,
    height: 85,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#161922',
  },
  spotPhotoImage: {
    width: '100%',
    height: '100%',
  },
  morePhotosOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 11, 14, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  morePhotosCountText: {
    color: '#FF6B00',
    fontSize: 16,
    fontWeight: '800',
  },

  /* Routes Stack */
  routesStack: {
    gap: 12,
    marginTop: 8,
  },
  routeItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 20, 26, 0.88)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 12,
  },
  routeItemImage: {
    width: 64,
    height: 50,
    borderRadius: 10,
    marginRight: 12,
  },
  routeItemBody: {
    flex: 1,
  },
  routeItemTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  routeItemMeta: {
    color: '#9CA3AF',
    fontSize: 11.5,
    marginTop: 2,
  },

  /* Location Map Card */
  mapCard: {
    height: 160,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 8,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapDarkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 11, 14, 0.45)',
  },
  mapPinBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(10, 11, 14, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.4)',
  },
  mapPinText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  openMapBtn: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    backgroundColor: '#FF6B00',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  openMapBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  /* Nearby Spots */
  nearbySpotsList: {
    gap: 10,
    marginTop: 8,
  },
  nearbySpotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 20, 26, 0.88)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  nearbySpotImage: {
    width: 48,
    height: 48,
    borderRadius: 10,
    marginRight: 12,
  },
  nearbySpotInfo: {
    flex: 1,
  },
  nearbySpotName: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  nearbySpotDist: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 2,
  },

  /* Visitor Tips */
  tipsList: {
    gap: 8,
    marginTop: 8,
  },
  tipItemRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  tipText: {
    color: '#D1D5DB',
    fontSize: 13,
    lineHeight: 18,
  },

  /* Moments Feed (Instagram Style 4:5 Posts) */
  momentsFeed: {
    gap: 16,
    marginTop: 10,
  },
  momentPostCard: {
    backgroundColor: 'rgba(18, 20, 26, 0.88)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    paddingBottom: 12,
  },
  momentPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  momentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  momentAuthorName: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  momentTimeText: {
    color: '#8A8F9B',
    fontSize: 11,
  },
  portraitAspectBox: {
    width: '100%',
    aspectRatio: 4 / 5,
    backgroundColor: '#0B0C10',
    position: 'relative',
  },
  momentMediaImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoPlayCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -24,
    marginTop: -24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteBox: {
    backgroundColor: 'rgba(255, 107, 0, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B00',
    padding: 14,
    marginHorizontal: 12,
    borderRadius: 10,
  },
  noteText: {
    color: '#E2E8F0',
    fontSize: 13.5,
    fontStyle: 'italic',
  },
  momentCaption: {
    color: '#E2E8F0',
    fontSize: 13,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  momentFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginTop: 10,
    gap: 16,
  },
  engagementBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  engagementCount: {
    color: '#8A8F9B',
    fontSize: 12,
    fontWeight: '600',
  },

  /* Stories Scroll */
  storiesScroll: {
    gap: 14,
    paddingTop: 8,
  },
  storyAvatarItem: {
    alignItems: 'center',
  },
  storyRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: '#FF6B00',
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyAvatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  storyNameText: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 4,
  },

  /* Bottom Bar */
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10, 11, 14, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 12,
  },
  saveBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnActive: {
    borderColor: '#FF6B00',
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  saveBtnTextActive: {
    color: '#FF6B00',
  },
  actionPrimaryBtn: {
    flex: 1.4,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF6B00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPrimaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
