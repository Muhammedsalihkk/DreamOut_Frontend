import React, { useState, useEffect, useMemo } from 'react';
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
  Linking,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spot } from '@/data/mockData';
import { useRouteStore } from '@/store/useRouteStore';
import { SpotService } from '@/services/spot.service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SpotDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Find target spot from store/backend
  const getSpotById = useRouteStore((state) => state.getSpotById);
  const deleteSpot = useRouteStore((state) => state.deleteSpot);
  const storeRoutes = useRouteStore((state) => state.routes);
  const storeSpots = useRouteStore((state) => state.spots);

  const matchedSpot = id ? getSpotById(id) : null;
  const [backendSpot, setBackendSpot] = useState<Spot | null>(matchedSpot || null);
  const [isLoadingSpot, setIsLoadingSpot] = useState(!matchedSpot);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      if (!matchedSpot) {
        setIsLoadingSpot(true);
      }
      SpotService.getSpotById(id)
        .then((s) => {
          setBackendSpot(s);
          setFetchError(null);
        })
        .catch((err) => {
          console.warn('[SpotDetails] Failed to fetch spot:', err);
          if (!matchedSpot) {
            setFetchError('Unable to load spot from backend.');
          }
        })
        .finally(() => {
          setIsLoadingSpot(false);
        });
    }
  }, [id]);

  const activeSpot = backendSpot || matchedSpot;

  // Real routes that include this spot matching Spot['routesContaining']
  const routesContaining = useMemo(() => {
    if (!activeSpot) return [];
    return storeRoutes
      .filter((r) =>
        r.places?.some((p) => String(p.spotId) === String(activeSpot.id) || p.name === activeSpot.name)
      )
      .map((r) => ({
        id: String(r.id),
        title: r.title,
        image: r.coverImage || (r.photos && r.photos[0]) || '',
        placesCount: r.places ? r.places.length : 1,
        distance: r.distance || '10 km',
        duration: r.duration || '2 hrs',
      }));
  }, [storeRoutes, activeSpot]);

  // Real nearby spots from backend spots matching Spot['nearbySpotsList']
  const nearbySpotsList = useMemo(() => {
    if (!activeSpot) return [];
    return storeSpots
      .filter((s) => String(s.id) !== String(activeSpot.id))
      .slice(0, 4)
      .map((s) => ({
        id: String(s.id),
        name: s.name,
        image: s.image,
        category: s.category || 'Spot',
        distanceAway: s.location || 'Nearby',
      }));
  }, [storeSpots, activeSpot]);

  // State Management
  const [isSaved, setIsSaved] = useState(false);
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  if (isLoadingSpot && !activeSpot) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text style={styles.loadingText}>Loading spot details...</Text>
      </View>
    );
  }

  if (!activeSpot) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <StatusBar barStyle="light-content" />
        <Ionicons name="location-outline" size={48} color="#FF6B00" style={{ marginBottom: 12 }} />
        <Text style={styles.errorTitle}>Spot Not Found</Text>
        <Text style={styles.errorSubText}>
          {fetchError || 'The requested spot could not be found on the server.'}
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const spot: Spot = {
    ...activeSpot,
    tags: activeSpot.tags || (activeSpot.category ? [activeSpot.category] : ['Spot']),
    heroPhotos: activeSpot.heroPhotos?.length ? activeSpot.heroPhotos : [activeSpot.image],
    spotPhotos: activeSpot.spotPhotos?.length ? activeSpot.spotPhotos : [activeSpot.image],
    aboutDescription: activeSpot.aboutDescription || activeSpot.description || '',
    routesContaining,
    nearbySpotsList,
  };

  const heroPhotosList = spot.heroPhotos || [spot.image];
  const spotPhotosList = spot.spotPhotos || heroPhotosList;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${spot.name || spot.title} in ${spot.location} on DreamOut!`,
      });
    } catch (error) {
      Alert.alert('Share Spot', `Sharing ${spot.name || spot.title}`);
    }
  };

  const handleSpotOptions = () => {
    Alert.alert(
      spot.name || spot.title,
      'Select an action',
      [
        { text: 'Share Spot', onPress: handleShare },
        {
          text: 'Delete Spot',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Delete Spot',
              `Are you sure you want to delete "${spot.name || spot.title}"?`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    const deleted = await deleteSpot(spot.id);
                    if (deleted) {
                      Alert.alert('Deleted', 'Spot deleted successfully.');
                      router.back();
                    } else {
                      Alert.alert('Error', 'Failed to delete spot.');
                    }
                  },
                },
              ]
            );
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleGetDirections = () => {
    const lat = spot.latitude || 10.0889;
    const lng = spot.longitude || 77.0595;
    const label = encodeURIComponent(spot.name || spot.title || 'Spot');
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${label})`,
      default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    });
    Linking.openURL(url!).catch(() => {
      Alert.alert('Directions', `Location: ${spot.location || `${lat}, ${lng}`}`);
    });
  };

  const handleHeroScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(
      event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width
    );
    if (activeHeroSlide !== slideIndex) {
      setActiveHeroSlide(slideIndex);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

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
                onPress={handleSpotOptions}
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
            {(spot.tags || ['Scenic', 'Spot']).map((tag, idx) => (
              <View key={idx} style={styles.tagBadge}>
                <Text style={styles.tagBadgeText}>{tag}</Text>
              </View>
            ))}
          </View>

          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <View style={styles.statValueRow}>
                <Ionicons name="compass" size={15} color="#FF6B00" style={{ marginRight: 4 }} />
                <Text style={styles.statValueText}>{routesContaining.length}</Text>
              </View>
              <Text style={styles.statLabel}>Routes</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <View style={styles.statValueRow}>
                <Ionicons name="person" size={15} color="#FF6B00" style={{ marginRight: 4 }} />
                <Text style={styles.statValueText} numberOfLines={1}>
                  {spot.creator?.name || 'Explorer'}
                </Text>
              </View>
              <Text style={styles.statLabel}>Added By</Text>
            </View>
          </View>
        </View>

        {/* ================================================== */}
        {/* 3. SHORT DESCRIPTION                             */}
        {/* ================================================== */}
        {spot.description ? (
          <View style={styles.sectionContainer}>
            <Text
              style={styles.descriptionText}
              numberOfLines={isDescriptionExpanded ? 0 : 2}
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
        ) : null}

        {/* ================================================== */}
        {/* 4. COMPACT SPOT INFORMATION GRID                  */}
        {/* ================================================== */}
        <View style={styles.sectionContainer}>
          <View style={styles.infoGridCard}>
            <View style={styles.infoGridItem}>
              <Text style={styles.infoGridLabel}>Category</Text>
              <Text style={styles.infoGridValue} numberOfLines={1}>{spot.category || 'Spot'}</Text>
            </View>
            <View style={styles.infoGridDivider} />
            <View style={styles.infoGridItem}>
              <Text style={styles.infoGridLabel}>Latitude</Text>
              <Text style={styles.infoGridValue}>
                {spot.latitude ? Number(spot.latitude).toFixed(4) : '10.0889'}
              </Text>
            </View>
            <View style={styles.infoGridDivider} />
            <View style={styles.infoGridItem}>
              <Text style={styles.infoGridLabel}>Longitude</Text>
              <Text style={styles.infoGridValue}>
                {spot.longitude ? Number(spot.longitude).toFixed(4) : '77.0595'}
              </Text>
            </View>
            <View style={styles.infoGridDivider} />
            <View style={styles.infoGridItem}>
              <Text style={styles.infoGridLabel}>Location</Text>
              <Text style={styles.infoGridValue} numberOfLines={1}>{spot.location || 'Munnar'}</Text>
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
            numberOfLines={isAboutExpanded ? 0 : 3}
          >
            {spot.aboutDescription ||
              spot.description ||
              `${spot.name || spot.title} is a scenic destination situated in ${spot.location || 'Munnar'}.`}
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
        {routesContaining && routesContaining.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Routes Including This Spot</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.seeAllText}>See All ›</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.routesStack}>
              {routesContaining.map((r) => (
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
                uri: spot.image || 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80',
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
              onPress={handleGetDirections}
            >
              <Ionicons name="navigate-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.openMapBtnText}>Open in Maps</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================================================== */}
        {/* 9. NEARBY SPOTS                                   */}
        {/* ================================================== */}
        {nearbySpotsList && nearbySpotsList.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Nearby Spots</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/explore')}>
                <Text style={styles.seeAllText}>See All ›</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.nearbySpotsList}>
              {nearbySpotsList.map((nearby) => (
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
          onPress={handleGetDirections}
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
    fontWeight: '700',
    fontSize: 14,
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
