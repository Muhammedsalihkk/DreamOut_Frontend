import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Modal,
  Alert,
  Share,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import {
  DetailedRoute,
  RoutePlace,
  RouteHighlight,
} from '@/data/mockData';
import { useRouteStore } from '@/store/useRouteStore';
import { RouteService } from '@/services/route.service';
import { useAuthStore } from '@/store/useAuthStore';
import { useJourneyStore } from '@/store/useJourneyStore';
import { RouteCommentsModal } from '@/components/route/RouteCommentsModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function RouteDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const getRouteById = useRouteStore((state) => state.getRouteById);
  const deleteRoute = useRouteStore((state) => state.deleteRoute);
  const authUser = useAuthStore((state) => state.user);

  const matchedRoute = id ? getRouteById(id) : null;
  const [backendRoute, setBackendRoute] = useState<DetailedRoute | null>(matchedRoute || null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(!matchedRoute);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      if (!matchedRoute) {
        setIsLoadingRoute(true);
      }
      RouteService.getRouteById(id)
        .then((r) => {
          setBackendRoute(r);
          setFetchError(null);
        })
        .catch((err) => {
          console.warn('[RouteDetails] Failed to fetch route:', err);
          if (!matchedRoute) {
            setFetchError('Unable to load route from backend.');
          }
        })
        .finally(() => {
          setIsLoadingRoute(false);
        });
    }
  }, [id]);

  const route = backendRoute || matchedRoute;

  // Interaction State
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(route?.likesCount || 0);
  const [isFollowingCreator, setIsFollowingCreator] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Modals State
  const [isCommentsModalVisible, setIsCommentsModalVisible] = useState(false);
  const [routeCommentsCount, setRouteCommentsCount] = useState(route?.commentsCount || 0);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [activePhotoUrl, setActivePhotoUrl] = useState<string>(route?.coverImage || '');
  const [activePhotoTitle, setActivePhotoTitle] = useState<string>('');

  useEffect(() => {
    if (route) {
      setLikesCount(route.likesCount || 0);
      setRouteCommentsCount(route.commentsCount || 0);
      if (!activePhotoUrl && route.coverImage) {
        setActivePhotoUrl(route.coverImage);
      }
    }
  }, [route]);

  // Check if current user is the route creator
  const isCreator = Boolean(
    authUser &&
    route &&
    (String(route.creator?.id) === String(authUser.id) || route.creator?.name === authUser.name)
  );

  const handleDeleteRoute = () => {
    if (!route) return;
    Alert.alert(
      'Delete Route',
      `Are you sure you want to delete "${route.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteRoute(route.id);
            if (success) {
              Alert.alert('Deleted', 'Route deleted successfully.');
              router.back();
            } else {
              Alert.alert('Error', 'Failed to delete route.');
            }
          },
        },
      ]
    );
  };

  // Top Action Handlers
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleToggleSave = () => {
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    Alert.alert(
      nextSaved ? 'Route Saved' : 'Route Removed',
      nextSaved
        ? `"${route.title}" added to your saved routes.`
        : `"${route.title}" removed from your saved routes.`
    );
  };

  const handleToggleLike = () => {
    setIsLiked((prev) => {
      const next = !prev;
      setLikesCount((c) => (next ? c + 1 : Math.max(0, c - 1)));
      return next;
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this route on DreamOut: ${route.title} (${route.location})`,
      });
    } catch {
      Alert.alert('Share', `Sharing "${route.title}"`);
    }
  };

  const handleCreatorPress = () => {
    router.push(`/user/${route.creator.id}` as any);
  };

  const handleSpotPress = (place: RoutePlace) => {
    router.push(`/spot/${place.spotId || place.id}` as any);
  };

  const [isStartingJourney, setIsStartingJourney] = useState(false);
  const startOrResumeJourney = useJourneyStore((state) => state.startOrResumeJourney);

  const handleStartJourney = async () => {
    if (!route) return;
    setIsStartingJourney(true);
    try {
      const journey = await startOrResumeJourney(route.id);
      router.push({
        pathname: `/journey-mode/${route.id}`,
        params: { journeyId: String(journey.id) },
      } as any);
    } catch (err: any) {
      console.warn('[RouteDetails] Start journey notice:', err);
      router.push(`/journey-mode/${route.id}` as any);
    } finally {
      setIsStartingJourney(false);
    }
  };

  const openPhoto = (url: string, title?: string) => {
    setActivePhotoUrl(url);
    setActivePhotoTitle(title || '');
    setIsImageViewerVisible(true);
  };

  // Safe Top Padding
  const topBarPadding = Math.max(insets.top, Platform.OS === 'android' ? 24 : 44) + 6;

  if (isLoadingRoute && !route) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text style={styles.loadingText}>Loading route details...</Text>
      </View>
    );
  }

  if (!route) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <StatusBar barStyle="light-content" />
        <Ionicons name="map-outline" size={48} color="#FF6B00" style={{ marginBottom: 12 }} />
        <Text style={styles.errorTitle}>Route Not Found</Text>
        <Text style={styles.errorSubText}>
          {fetchError || 'The requested route could not be found on the server.'}
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ================================================== */}
      {/* MAIN SCROLLABLE CONTENT                            */}
      {/* ================================================== */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 100 + Math.max(insets.bottom, 16) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Hero Cover Image with Navigation Overlay */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: route.coverImage }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          <LinearGradient
            colors={['rgba(10,11,15,0.7)', 'transparent', 'rgba(10,11,15,0.95)', '#0A0B0E']}
            locations={[0, 0.35, 0.85, 1]}
            style={StyleSheet.absoluteFill}
          />

          {/* Top Floating Header Buttons */}
          <View style={[styles.topActionsRow, { paddingTop: topBarPadding }]}>
            <TouchableOpacity
              style={styles.circleIconButton}
              activeOpacity={0.8}
              onPress={handleBack}
            >
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.topRightIcons}>
              {isCreator && (
                <TouchableOpacity
                  style={[styles.circleIconButton, styles.deleteIconButton]}
                  activeOpacity={0.8}
                  onPress={handleDeleteRoute}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.circleIconButton}
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
                style={styles.circleIconButton}
                activeOpacity={0.8}
                onPress={handleShare}
              >
                <Ionicons name="share-social-outline" size={19} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Hero Bottom Route Information */}
          <View style={styles.heroInfoContent}>
            {/* Location Pill */}
            <View style={styles.locationTag}>
              <Ionicons name="location-sharp" size={13} color="#FF6B00" />
              <Text style={styles.locationTagText} numberOfLines={1}>
                {route.location}
              </Text>
            </View>

            {/* Title */}
            <Text style={styles.routeTitle}>{route.title}</Text>

            {/* Short Tagline */}
            {route.shortDescription ? (
              <Text style={styles.shortDescriptionText}>
                {route.shortDescription}
              </Text>
            ) : null}
          </View>
        </View>

        {/* 2. Key Stats Strip (Simple & Easy to Read for Anyone) */}
        <View style={styles.statsStripContainer}>
          <View style={styles.statBox}>
            <View style={styles.statIconCircle}>
              <Ionicons name="map-outline" size={16} color="#FF6B00" />
            </View>
            <Text style={styles.statValue}>{route.distance || '12 km'}</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>

          <View style={styles.statBoxDivider} />

          <View style={styles.statBox}>
            <View style={styles.statIconCircle}>
              <Ionicons name="time-outline" size={16} color="#FF6B00" />
            </View>
            <Text style={styles.statValue}>{route.duration || '3-4 hrs'}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>

          <View style={styles.statBoxDivider} />

          <View style={styles.statBox}>
            <View style={styles.statIconCircle}>
              <Ionicons name="flag-outline" size={16} color="#FF6B00" />
            </View>
            <Text style={styles.statValue}>{route.places?.length || 4}</Text>
            <Text style={styles.statLabel}>Stops</Text>
          </View>

          <View style={styles.statBoxDivider} />

          <View style={styles.statBox}>
            <View style={styles.statIconCircle}>
              <Ionicons name="trending-up-outline" size={16} color="#FF6B00" />
            </View>
            <Text style={styles.statValue}>{route.difficulty || 'Moderate'}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
        </View>

        {/* 3. Creator Card */}
        <View style={styles.sectionWrapper}>
          <View style={styles.creatorCard}>
            <TouchableOpacity
              style={styles.creatorProfileRow}
              activeOpacity={0.8}
              onPress={handleCreatorPress}
            >
              <Image source={{ uri: route.creator.avatar }} style={styles.creatorAvatar} />
              <View style={styles.creatorInfo}>
                <View style={styles.creatorNameRow}>
                  <Text style={styles.creatorName} numberOfLines={1}>
                    {route.creator.name}
                  </Text>
                  {route.creator.isVerified && (
                    <Ionicons name="checkmark-circle" size={14} color="#FF6B00" style={{ marginLeft: 3 }} />
                  )}
                </View>
                <Text style={styles.creatorHandle}>
                  @{route.creator.username} • Route Creator
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.creatorFollowButton,
                isFollowingCreator && styles.creatorFollowingButton,
              ]}
              activeOpacity={0.8}
              onPress={() => setIsFollowingCreator((prev) => !prev)}
            >
              <Text
                style={[
                  styles.creatorFollowText,
                  isFollowingCreator && styles.creatorFollowingText,
                ]}
              >
                {isFollowingCreator ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. About / Description */}
        <View style={styles.sectionWrapper}>
          <Text style={styles.sectionHeaderTitle}>About This Journey</Text>
          <Text
            style={styles.descriptionText}
            numberOfLines={isDescriptionExpanded ? undefined : 3}
          >
            {route.description}
          </Text>
          {route.description && route.description.length > 120 && (
            <TouchableOpacity
              style={styles.readMoreButton}
              activeOpacity={0.7}
              onPress={() => setIsDescriptionExpanded((prev) => !prev)}
            >
              <Text style={styles.readMoreText}>
                {isDescriptionExpanded ? 'Show Less' : 'Read More'}
              </Text>
              <Ionicons
                name={isDescriptionExpanded ? 'chevron-up' : 'chevron-down'}
                size={14}
                color="#FF6B00"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* 5. Route Stops in Order (Timeline view: intuitive & easy for anyone!) */}
        <View style={styles.sectionWrapper}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>Route Stops in Order</Text>
            <View style={styles.stopCountBadge}>
              <Text style={styles.stopCountText}>{route.places?.length || 0} stops</Text>
            </View>
          </View>
          <Text style={styles.sectionHeaderSubtitle}>
            Follow these stops along the trail from start to finish.
          </Text>

          <View style={styles.timelineList}>
            {(route.places || []).map((place: RoutePlace, index: number) => {
              const isLast = index === (route.places?.length || 0) - 1;
              return (
                <View key={place.id || index} style={styles.timelineItemRow}>
                  {/* Left Column: Number Badge + Connecting Line */}
                  <View style={styles.timelineLeftTrack}>
                    <View
                      style={[
                        styles.timelineNumberBadge,
                        index === 0 && styles.timelineFirstBadge,
                        isLast && styles.timelineLastBadge,
                      ]}
                    >
                      <Text style={styles.timelineNumberText}>{place.order || index + 1}</Text>
                    </View>
                    {!isLast && <View style={styles.timelineDottedLine} />}
                  </View>

                  {/* Right Card: Place Info */}
                  <TouchableOpacity
                    style={styles.timelinePlaceCard}
                    activeOpacity={0.85}
                    onPress={() => handleSpotPress(place)}
                  >
                    <Image source={{ uri: place.image }} style={styles.placeCardThumb} />

                    <View style={styles.placeCardBody}>
                      <View style={styles.placeBadgeRow}>
                        <Text style={styles.placeTagText}>
                          {index === 0
                            ? 'STARTING POINT'
                            : isLast
                            ? 'DESTINATION'
                            : `STOP #${place.order || index + 1}`}
                        </Text>
                      </View>

                      <Text style={styles.placeCardTitle} numberOfLines={1}>
                        {place.name}
                      </Text>

                      <View style={styles.placeCardMeta}>
                        <Ionicons name="navigate-outline" size={12} color="#FF6B00" style={{ marginRight: 3 }} />
                        <Text style={styles.placeCardDistance}>
                          {place.distanceFromStart || 'Along the route'}
                        </Text>
                      </View>
                    </View>

                    <Ionicons name="chevron-forward" size={18} color="#8A8F9B" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        {/* 6. Route Highlights Preview */}
        {route.highlights && route.highlights.length > 0 && (
          <View style={styles.sectionWrapper}>
            <Text style={styles.sectionHeaderTitle}>Highlights Along The Route</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalCardScroll}
            >
              {route.highlights.map((highlight: RouteHighlight) => (
                <TouchableOpacity
                  key={highlight.id}
                  style={styles.highlightCard}
                  activeOpacity={0.88}
                  onPress={() => openPhoto(highlight.image, highlight.title)}
                >
                  <Image source={{ uri: highlight.image }} style={styles.highlightCardImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(10,11,15,0.85)']}
                    style={styles.highlightCardGradient}
                  >
                    <Text style={styles.highlightCardTitle} numberOfLines={1}>
                      {highlight.title}
                    </Text>
                    <Text style={styles.highlightCardDesc} numberOfLines={2}>
                      {highlight.description}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 7. Route Photos Gallery */}
        {route.photos && route.photos.length > 0 && (
          <View style={styles.sectionWrapper}>
            <Text style={styles.sectionHeaderTitle}>Photos ({route.photos.length})</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalCardScroll}
            >
              {route.photos.map((photoUrl: string, idx: number) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.photoThumbCard}
                  activeOpacity={0.85}
                  onPress={() => openPhoto(photoUrl, `Photo ${idx + 1}`)}
                >
                  <Image source={{ uri: photoUrl }} style={styles.photoThumbImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 8. Simple Community & Engagement Row */}
        <View style={styles.sectionWrapper}>
          <View style={styles.engagementCard}>
            <View style={styles.engagementLeft}>
              <TouchableOpacity
                style={[styles.engagementButton, isLiked && styles.engagementButtonLiked]}
                activeOpacity={0.7}
                onPress={handleToggleLike}
              >
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={18}
                  color={isLiked ? '#FF4500' : '#FF6B00'}
                />
                <Text style={styles.engagementText}>{likesCount}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.engagementButton}
                activeOpacity={0.7}
                onPress={() => setIsCommentsModalVisible(true)}
              >
                <Ionicons name="chatbubble-outline" size={17} color="#FF6B00" />
                <Text style={styles.engagementText}>{routeCommentsCount}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.exploredCountBadge}>
              {(route.exploredCount / 1000).toFixed(1)}k people explored
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ================================================== */}
      {/* 9. STICKY BOTTOM ACTION BAR (Clean, Clear, Usable) */}
      {/* ================================================== */}
      <View
        style={[
          styles.bottomActionBar,
          { paddingBottom: Math.max(insets.bottom, 12), paddingTop: 10 },
        ]}
      >
        <TouchableOpacity
          style={[styles.saveIconButton, isSaved && styles.saveIconButtonActive]}
          activeOpacity={0.8}
          onPress={handleToggleSave}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={isSaved ? '#FF6B00' : '#FFFFFF'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.startJourneyMainButton}
          activeOpacity={0.88}
          onPress={handleStartJourney}
        >
          <Ionicons name="compass" size={19} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.startJourneyButtonText}>Start Journey</Text>
        </TouchableOpacity>
      </View>

      {/* Comments Modal */}
      <RouteCommentsModal
        visible={isCommentsModalVisible}
        onClose={() => setIsCommentsModalVisible(false)}
        routeTitle={route.title}
        initialCommentsCount={routeCommentsCount}
        onCommentsCountChange={setRouteCommentsCount}
      />

      {/* Full Screen Image Viewer Modal */}
      <Modal
        visible={isImageViewerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsImageViewerVisible(false)}
      >
        <View style={styles.imageViewerModal}>
          <StatusBar barStyle="light-content" />
          <View style={[styles.imageViewerHeader, { paddingTop: topBarPadding }]}>
            <Text style={styles.imageViewerTitle} numberOfLines={1}>
              {activePhotoTitle || route.title}
            </Text>
            <TouchableOpacity
              style={styles.circleIconButton}
              onPress={() => setIsImageViewerVisible(false)}
            >
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.imageViewerContent}>
            <Image
              source={{ uri: activePhotoUrl }}
              style={styles.imageViewerFullPhoto}
              resizeMode="contain"
            />
          </View>
        </View>
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
    paddingBottom: 24,
  },

  /* 1. Hero Cover Image */
  heroContainer: {
    width: '100%',
    height: 380,
    position: 'relative',
    justifyContent: 'space-between',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  topActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  topRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  circleIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(10, 11, 15, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Hero Info Content */
  heroInfoContent: {
    paddingHorizontal: 18,
    paddingBottom: 16,
    zIndex: 10,
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 20, 26, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  locationTagText: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '600',
  },
  routeTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  shortDescriptionText: {
    color: '#9CA3AF',
    fontSize: 13,
    lineHeight: 18,
  },

  /* 2. Key Stats Strip */
  statsStripContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(18, 20, 26, 0.88)',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  statLabel: {
    color: '#8A8F9B',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  statBoxDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },

  /* 3. Section Wrapper */
  sectionWrapper: {
    marginTop: 22,
    paddingHorizontal: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  sectionHeaderSubtitle: {
    color: '#8A8F9B',
    fontSize: 12.5,
    marginBottom: 14,
  },
  stopCountBadge: {
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  stopCountText: {
    color: '#FF6B00',
    fontSize: 11.5,
    fontWeight: '700',
  },

  /* Creator Card */
  creatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(18, 20, 26, 0.7)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  creatorProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  creatorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#FF6B00',
    marginRight: 12,
  },
  creatorInfo: {
    flex: 1,
  },
  creatorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorName: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
  creatorHandle: {
    color: '#8A8F9B',
    fontSize: 11.5,
    marginTop: 2,
  },
  creatorFollowButton: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  creatorFollowingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  creatorFollowText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  creatorFollowingText: {
    color: '#9CA3AF',
    fontWeight: '600',
  },

  /* Description */
  descriptionText: {
    color: '#D1D5DB',
    fontSize: 13.5,
    lineHeight: 20,
    marginTop: 4,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    color: '#FF6B00',
    fontSize: 12.5,
    fontWeight: '600',
  },

  /* Timeline View for Stops */
  timelineList: {
    marginTop: 4,
  },
  timelineItemRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 4,
  },
  timelineLeftTrack: {
    width: 36,
    alignItems: 'center',
    marginRight: 10,
  },
  timelineNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  timelineFirstBadge: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF8533',
  },
  timelineLastBadge: {
    backgroundColor: '#10B981',
    borderColor: '#34D399',
  },
  timelineNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  timelineDottedLine: {
    flex: 1,
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: 4,
  },
  timelinePlaceCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 20, 26, 0.75)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12,
  },
  placeCardThumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: '#1E212A',
  },
  placeCardBody: {
    flex: 1,
    marginRight: 8,
  },
  placeBadgeRow: {
    marginBottom: 2,
  },
  placeTagText: {
    color: '#FF6B00',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  placeCardTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  placeCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeCardDistance: {
    color: '#8A8F9B',
    fontSize: 11.5,
  },

  /* Highlights Carousel */
  horizontalCardScroll: {
    gap: 12,
    paddingVertical: 6,
  },
  highlightCard: {
    width: 200,
    height: 130,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#12141A',
  },
  highlightCardImage: {
    width: '100%',
    height: '100%',
  },
  highlightCardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
  highlightCardTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  highlightCardDesc: {
    color: '#D1D5DB',
    fontSize: 10.5,
    lineHeight: 14,
  },

  /* Photos Thumbnails */
  photoThumbCard: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#12141A',
  },
  photoThumbImage: {
    width: '100%',
    height: '100%',
  },

  /* Community & Engagement */
  engagementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(18, 20, 26, 0.6)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  engagementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  engagementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  engagementButtonLiked: {
    backgroundColor: 'rgba(255, 69, 0, 0.12)',
  },
  engagementText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  exploredCountBadge: {
    color: '#8A8F9B',
    fontSize: 11.5,
  },

  /* Sticky Bottom Bar */
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10, 11, 15, 0.94)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  saveIconButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveIconButtonActive: {
    borderColor: '#FF6B00',
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
  },
  startJourneyMainButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FF6B00',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  startJourneyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  /* Full Screen Image Viewer Modal */
  imageViewerModal: {
    flex: 1,
    backgroundColor: '#000000',
  },
  imageViewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    zIndex: 10,
  },
  imageViewerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 10,
  },
  imageViewerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerFullPhoto: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.75,
  },
  deleteIconButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#8A8F9B',
    fontSize: 14,
    marginTop: 12,
  },
  errorTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  errorSubText: {
    color: '#8A8F9B',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
    borderWidth: 1,
    borderColor: '#FF6B00',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButtonText: {
    color: '#FF6B00',
    fontSize: 14,
    fontWeight: '600',
  },
});
