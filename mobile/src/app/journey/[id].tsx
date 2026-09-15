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
  Modal,
  Alert,
  Share,
  Platform,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  MOCK_JOURNEY_DETAILS,
  JourneyDetailsData,
  JourneyMomentItem,
  MOCK_DETAILED_ROUTE,
} from '@/data/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type JourneyTabType = 'all' | 'photos' | 'videos' | 'notes';

export default function JourneyDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Journey Data
  const journey: JourneyDetailsData = MOCK_JOURNEY_DETAILS;
  const route = MOCK_DETAILED_ROUTE;

  // Interactive States
  const [activeTab, setActiveTab] = useState<JourneyTabType>('all');
  const [isFollowingExplorer, setIsFollowingExplorer] = useState(false);
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [likedMomentsMap, setLikedMomentsMap] = useState<Record<string, boolean>>({});
  const [savedMomentsMap, setSavedMomentsMap] = useState<Record<string, boolean>>({});
  const [expandedCaptionsMap, setExpandedCaptionsMap] = useState<Record<string, boolean>>({});
  const [activeSlideMap, setActiveSlideMap] = useState<Record<string, number>>({});

  const handleShareJourney = async () => {
    try {
      await Share.share({
        message: `Check out ${journey.explorer.name}'s journey through ${journey.routeTitle} on DreamOut!`,
      });
    } catch (error) {
      Alert.alert('Share Journey', `Sharing ${journey.explorer.name}'s journey.`);
    }
  };

  const toggleLikeMoment = (momentId: string) => {
    setLikedMomentsMap((prev) => ({
      ...prev,
      [momentId]: !prev[momentId],
    }));
  };

  const toggleSaveMoment = (momentId: string) => {
    setSavedMomentsMap((prev) => ({
      ...prev,
      [momentId]: !prev[momentId],
    }));
  };

  const toggleExpandCaption = (momentId: string) => {
    setExpandedCaptionsMap((prev) => ({
      ...prev,
      [momentId]: !prev[momentId],
    }));
  };

  const handleScrollCarousel = (momentId: string, event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const layoutWidth = event.nativeEvent.layoutMeasurement.width || (SCREEN_WIDTH - 36);
    const slideIndex = Math.round(contentOffsetX / layoutWidth);
    if (activeSlideMap[momentId] !== slideIndex) {
      setActiveSlideMap((prev) => ({
        ...prev,
        [momentId]: slideIndex,
      }));
    }
  };

  // Filter moments by active tab
  const filteredMoments = journey.moments.filter((m) => {
    if (activeTab === 'photos') return m.type === 'photo' || m.type === 'collage';
    if (activeTab === 'videos') return m.type === 'video';
    if (activeTab === 'notes') return m.type === 'note';
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0B0E" />

      {/* ================================================== */}
      {/* 1. TOP HEADER BAR: Back | Journey Details | Share */}
      {/* ================================================== */}
      <View
        style={[
          styles.headerBar,
          { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 20) + 6 : 8 },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Journey Details</Text>

        <TouchableOpacity
          style={styles.shareButton}
          activeOpacity={0.8}
          onPress={handleShareJourney}
        >
          <Text style={styles.shareButtonText}>Share</Text>
          <Ionicons name="share-outline" size={17} color="#FF6B00" style={{ marginLeft: 3 }} />
        </TouchableOpacity>
      </View>

      {/* ================================================== */}
      {/* 2. TABS BELOW HEADER                              */}
      {/* ================================================== */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'all' && styles.tabButtonActive]}
          activeOpacity={0.8}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            All ({journey.momentsCapturedCount})
          </Text>
          {activeTab === 'all' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'photos' && styles.tabButtonActive]}
          activeOpacity={0.8}
          onPress={() => setActiveTab('photos')}
        >
          <Text style={[styles.tabText, activeTab === 'photos' && styles.tabTextActive]}>
            Photos ({journey.photosCount})
          </Text>
          {activeTab === 'photos' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'videos' && styles.tabButtonActive]}
          activeOpacity={0.8}
          onPress={() => setActiveTab('videos')}
        >
          <Text style={[styles.tabText, activeTab === 'videos' && styles.tabTextActive]}>
            Videos ({journey.videosCount})
          </Text>
          {activeTab === 'videos' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'notes' && styles.tabButtonActive]}
          activeOpacity={0.8}
          onPress={() => setActiveTab('notes')}
        >
          <Text style={[styles.tabText, activeTab === 'notes' && styles.tabTextActive]}>
            Notes ({journey.notesCount})
          </Text>
          {activeTab === 'notes' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
      </View>

      {/* MAIN SCROLLABLE CONTENT */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 80 + Math.max(insets.bottom, 14) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ================================================== */}
        {/* 3. ELEGANT JOURNEY & EXPLORER HEADER CARD         */}
        {/* ================================================== */}
        <View style={styles.journeyHeaderCard}>
          <Text style={styles.journeyTitle}>
            {journey.explorer.name.split(' ')[0]}'s Journey
          </Text>
          <Text style={styles.routeName}>{journey.routeTitle}</Text>

          {/* Compact Stats Info */}
          <View style={styles.metaInfoRow}>
            <Text style={styles.metaItemText}>Explored {journey.exploredDateText}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaItemHighlight}>{journey.placesExploredText}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaItemText}>{journey.momentsCapturedCount} Moments</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaItemText}>{journey.totalDurationText}</Text>
          </View>

          {/* Explorer Profile Row */}
          <View style={styles.explorerRow}>
            <TouchableOpacity
              style={styles.explorerLeft}
              activeOpacity={0.8}
              onPress={() => router.push(`/user/${journey.explorer.id}` as any)}
            >
              <Image source={{ uri: journey.explorer.avatar }} style={styles.explorerAvatar} />
              <View>
                <View style={styles.explorerNameRow}>
                  <Text style={styles.explorerName}>{journey.explorer.name}</Text>
                  {journey.explorer.isVerified && (
                    <Ionicons name="checkmark-circle" size={14} color="#FF6B00" style={{ marginLeft: 3 }} />
                  )}
                </View>
                <Text style={styles.explorerUsername}>@{journey.explorer.username}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.followButton, isFollowingExplorer && styles.followingButton]}
              activeOpacity={0.8}
              onPress={() => setIsFollowingExplorer((prev) => !prev)}
            >
              <Text style={[styles.followButtonText, isFollowingExplorer && styles.followingButtonText]}>
                {isFollowingExplorer ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================================================== */}
        {/* 4. INSTAGRAM-STYLE SOCIAL FEED FOR MOMENTS        */}
        {/* 4:5 PORTRAIT MEDIA AREA FOR PHOTOS & VIDEOS        */}
        {/* ================================================== */}
        <View style={styles.momentsFeedContainer}>
          {filteredMoments.map((moment: JourneyMomentItem) => {
            const isLiked = likedMomentsMap[moment.id] ?? false;
            const isSaved = savedMomentsMap[moment.id] ?? false;
            const isExpanded = expandedCaptionsMap[moment.id] ?? false;
            const activeSlide = activeSlideMap[moment.id] ?? 0;
            const mediaList = moment.mediaUris && moment.mediaUris.length > 0
              ? moment.mediaUris
              : moment.mediaUri
              ? [moment.mediaUri]
              : [];

            return (
              <View key={moment.id} style={styles.postCard}>
                {/* 4.1 POST HEADER: Explorer Info + Options */}
                <View style={styles.postHeader}>
                  <TouchableOpacity
                    style={styles.postHeaderLeft}
                    activeOpacity={0.8}
                    onPress={() => router.push(`/user/${journey.explorer.id}` as any)}
                  >
                    <Image source={{ uri: journey.explorer.avatar }} style={styles.postAvatar} />
                    <View>
                      <View style={styles.postAuthorRow}>
                        <Text style={styles.postAuthorName}>{journey.explorer.name}</Text>
                        {journey.explorer.isVerified && (
                          <Ionicons name="checkmark-circle" size={13} color="#FF6B00" style={{ marginLeft: 3 }} />
                        )}
                      </View>
                      <Text style={styles.postTimeText}>
                        @{journey.explorer.username} • {moment.exploredTimeText || journey.exploredDateText}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.postOptionsBtn}
                    activeOpacity={0.7}
                    onPress={() => Alert.alert('Moment Options', `${moment.spotName}`)}
                  >
                    <Ionicons name="ellipsis-horizontal" size={18} color="#8A8F9B" />
                  </TouchableOpacity>
                </View>

                {/* 4.2 LOCATION TAG SUB-HEADER */}
                <View style={styles.postLocationBar}>
                  <Ionicons name="location" size={15} color="#FF6B00" style={{ marginRight: 5 }} />
                  <Text style={styles.postLocationSpotName}>
                    {moment.placeOrder ? `${moment.placeOrder}. ` : ''}{moment.spotName}
                  </Text>
                </View>

                {/* 4.3 MEDIA CONTAINER (PORTRAIT 4:5 ASPECT RATIO) */}
                {moment.type !== 'note' && mediaList.length > 0 && (
                  <View style={styles.portraitAspectBox}>
                    {/* Multi-Photo Swipeable Carousel */}
                    {mediaList.length > 1 ? (
                      <View style={{ flex: 1, position: 'relative' }}>
                        <ScrollView
                          horizontal
                          pagingEnabled
                          showsHorizontalScrollIndicator={false}
                          onScroll={(e) => handleScrollCarousel(moment.id, e)}
                          scrollEventThrottle={16}
                          style={{ flex: 1 }}
                        >
                          {mediaList.map((uri, idx) => (
                            <View key={idx} style={styles.carouselSlideWidth}>
                              <Image source={{ uri }} style={styles.mediaCoverImage} />
                            </View>
                          ))}
                        </ScrollView>

                        {/* Top-Right Carousel Index Pill (e.g. 1 / 3) */}
                        <View style={styles.carouselCounterBadge}>
                          <Text style={styles.carouselCounterText}>
                            {activeSlide + 1} / {mediaList.length}
                          </Text>
                        </View>

                        {/* Bottom Pagination Dots */}
                        <View style={styles.paginationDotsContainer}>
                          {mediaList.map((_, idx) => (
                            <View
                              key={idx}
                              style={[
                                styles.paginationDot,
                                idx === activeSlide && styles.paginationDotActive,
                              ]}
                            />
                          ))}
                        </View>
                      </View>
                    ) : moment.type === 'video' ? (
                      /* Single Video Post */
                      <View style={{ flex: 1, position: 'relative' }}>
                        <Image source={{ uri: mediaList[0] }} style={styles.mediaCoverImage} />

                        {/* Centered Play Button */}
                        <View style={styles.videoPlayOverlayCircle}>
                          <Ionicons name="play" size={26} color="#FFFFFF" style={{ marginLeft: 3 }} />
                        </View>

                        {/* Video Duration Badge */}
                        <View style={styles.videoDurationPill}>
                          <Ionicons name="videocam" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                          <Text style={styles.videoDurationPillText}>
                            {moment.videoDuration || '0:28'}
                          </Text>
                        </View>
                      </View>
                    ) : (
                      /* Single Photo Post */
                      <Image source={{ uri: mediaList[0] }} style={styles.mediaCoverImage} />
                    )}
                  </View>
                )}

                {/* 4.4 NOTE MOMENT CONTAINER (Matching 4:5 visual width with clean journal styling) */}
                {moment.type === 'note' && (
                  <View style={styles.noteJournalContainer}>
                    <View style={styles.noteQuoteHeader}>
                      <Ionicons name="create" size={18} color="#FF6B00" style={{ marginRight: 6 }} />
                      <Text style={styles.noteHeaderTag}>EXPLORER NOTE</Text>
                    </View>
                    <Text style={styles.noteBodyText}>"{moment.caption}"</Text>
                  </View>
                )}

                {/* 4.5 POST SOCIAL ACTION BAR (Like, Comment, Share, Save) */}
                <View style={styles.postActionBar}>
                  <View style={styles.postActionGroupLeft}>
                    <TouchableOpacity
                      style={styles.actionIconButton}
                      activeOpacity={0.7}
                      onPress={() => toggleLikeMoment(moment.id)}
                    >
                      <Ionicons
                        name={isLiked ? 'heart' : 'heart-outline'}
                        size={22}
                        color={isLiked ? '#FF6B00' : '#FFFFFF'}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionIconButton} activeOpacity={0.7}>
                      <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionIconButton}
                      activeOpacity={0.7}
                      onPress={handleShareJourney}
                    >
                      <Ionicons name="paper-plane-outline" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.actionIconButton}
                    activeOpacity={0.7}
                    onPress={() => toggleSaveMoment(moment.id)}
                  >
                    <Ionicons
                      name={isSaved ? 'bookmark' : 'bookmark-outline'}
                      size={20}
                      color={isSaved ? '#FF6B00' : '#FFFFFF'}
                    />
                  </TouchableOpacity>
                </View>

                {/* 4.6 LIKES COUNT & ENGAGEMENT SUMMARY */}
                <View style={styles.postLikesRow}>
                  <Text style={styles.postLikesText}>
                    <Text style={{ fontWeight: '800', color: '#FFFFFF' }}>
                      {(moment.likesCount || 0) + (isLiked ? 1 : 0)}
                    </Text>{' '}
                    likes •{' '}
                    <Text style={{ fontWeight: '700', color: '#8A8F9B' }}>
                      {moment.commentsCount || 0} comments
                    </Text>
                  </Text>
                </View>

                {/* 4.7 CAPTION & HASHTAGS */}
                {moment.type !== 'note' && (
                  <View style={styles.postCaptionSection}>
                    <Text
                      style={styles.postCaptionText}
                      numberOfLines={isExpanded ? undefined : 2}
                    >
                      <Text style={styles.postCaptionUsername}>{journey.explorer.username}</Text>{' '}
                      "{moment.caption}"
                    </Text>

                    {moment.caption && moment.caption.length > 70 && !isExpanded && (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => toggleExpandCaption(moment.id)}
                        style={{ marginTop: 2 }}
                      >
                        <Text style={styles.readMoreText}>more</Text>
                      </TouchableOpacity>
                    )}

                    {/* Hashtags */}
                    {moment.hashtags && moment.hashtags.length > 0 && (
                      <View style={styles.hashtagsRow}>
                        {moment.hashtags.map((tag, idx) => (
                          <Text key={idx} style={styles.hashtagText}>
                            {tag}{' '}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* ================================================== */}
      {/* 5. STICKY BOTTOM ACTION: View on Route Map         */}
      {/* ================================================== */}
      <View
        style={[
          styles.bottomActionBar,
          { paddingBottom: Math.max(insets.bottom, 14), paddingTop: 12 },
        ]}
      >
        <TouchableOpacity
          style={styles.viewMapButton}
          activeOpacity={0.88}
          onPress={() => setIsMapModalVisible(true)}
        >
          <Ionicons name="map-outline" size={19} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.viewMapButtonText}>View on Route Map</Text>
        </TouchableOpacity>
      </View>

      {/* ================================================== */}
      {/* ROUTE MAP MODAL                                   */}
      {/* ================================================== */}
      <Modal
        visible={isMapModalVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setIsMapModalVisible(false)}
      >
        <View style={styles.mapModalContainer}>
          <StatusBar barStyle="light-content" />

          <SafeAreaView style={styles.mapHeader}>
            <TouchableOpacity
              style={styles.mapCloseBtn}
              onPress={() => setIsMapModalVisible(false)}
            >
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.mapTitleWrapper}>
              <Text style={styles.mapTitle}>{journey.explorer.name}'s Route Map</Text>
              <Text style={styles.mapSubtitle}>{journey.routeTitle}</Text>
            </View>
            <View style={{ width: 36 }} />
          </SafeAreaView>

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

          <SafeAreaView style={styles.mapBottomSheet}>
            <Text style={styles.mapSheetHeaderTitle}>Places visited during this journey</Text>
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
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0B0E',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  /* Header Bar */
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  shareButtonText: {
    color: '#FF6B00',
    fontSize: 14,
    fontWeight: '700',
  },

  /* Tabs Bar */
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    gap: 16,
  },
  tabButton: {
    paddingVertical: 10,
    position: 'relative',
  },
  tabButtonActive: {},
  tabText: {
    color: '#8A8F9B',
    fontSize: 13.5,
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

  /* Journey Header Card */
  journeyHeaderCard: {
    backgroundColor: 'rgba(18, 20, 26, 0.84)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    marginVertical: 14,
  },
  journeyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  routeName: {
    color: '#FF6B00',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 8,
  },
  metaInfoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  metaItemText: {
    color: '#9CA3AF',
    fontSize: 11.5,
  },
  metaItemHighlight: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  metaDot: {
    color: '#6F7482',
    fontSize: 10,
  },
  explorerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  explorerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  explorerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },
  explorerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  explorerName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  explorerUsername: {
    color: '#9CA3AF',
    fontSize: 11.5,
    marginTop: 1,
  },
  followButton: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  followingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  followingButtonText: {
    color: '#9CA3AF',
  },

  /* Moments Feed Container - INSTAGRAM STYLE CARDS */
  momentsFeedContainer: {
    gap: 20,
    paddingBottom: 10,
  },
  postCard: {
    backgroundColor: 'rgba(18, 20, 26, 0.88)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    paddingBottom: 14,
  },

  /* Post Header */
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
  },
  postHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  postAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  postAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postAuthorName: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  postTimeText: {
    color: '#8A8F9B',
    fontSize: 11,
    marginTop: 1,
  },
  postOptionsBtn: {
    padding: 4,
  },

  /* Location Sub-Header Bar */
  postLocationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  postLocationSpotName: {
    color: '#FF6B00',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  /* 4:5 PORTRAIT MEDIA AREA */
  portraitAspectBox: {
    width: '100%',
    aspectRatio: 4 / 5,
    backgroundColor: '#0B0C10',
    position: 'relative',
    overflow: 'hidden',
  },
  carouselSlideWidth: {
    width: SCREEN_WIDTH - 34, // SCREEN_WIDTH minus padding (16*2) + card border (1*2)
    height: '100%',
  },
  mediaCoverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  /* Carousel Badges & Indicators */
  carouselCounterBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  carouselCounterText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  paginationDotsContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  paginationDotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B00',
  },

  /* Video Overlays */
  videoPlayOverlayCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -28,
    marginTop: -28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoDurationPill: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  videoDurationPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  /* Note Journal Card Container */
  noteJournalContainer: {
    backgroundColor: 'rgba(255, 107, 0, 0.06)',
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B00',
    padding: 16,
    marginHorizontal: 14,
    marginVertical: 4,
    borderRadius: 12,
  },
  noteQuoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteHeaderTag: {
    color: '#FF6B00',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  noteBodyText: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 21,
    fontStyle: 'italic',
  },

  /* Social Action Bar */
  postActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 6,
  },
  postActionGroupLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionIconButton: {
    padding: 2,
  },

  /* Likes & Comments Summary */
  postLikesRow: {
    paddingHorizontal: 14,
    marginBottom: 4,
  },
  postLikesText: {
    color: '#9CA3AF',
    fontSize: 13,
  },

  /* Caption & Hashtags */
  postCaptionSection: {
    paddingHorizontal: 14,
    marginTop: 2,
  },
  postCaptionText: {
    color: '#E2E8F0',
    fontSize: 13.5,
    lineHeight: 19,
  },
  postCaptionUsername: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  readMoreText: {
    color: '#8A8F9B',
    fontSize: 12,
    fontWeight: '600',
  },
  hashtagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  hashtagText: {
    color: '#FF6B00',
    fontSize: 12,
    fontWeight: '600',
  },

  /* Bottom Floating Action Bar */
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10, 11, 14, 0.94)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  viewMapButton: {
    backgroundColor: '#FF6B00',
    width: '100%',
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  viewMapButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  /* Route Map Modal */
  mapModalContainer: {
    flex: 1,
    backgroundColor: '#0A0B0E',
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  mapCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapTitleWrapper: {
    alignItems: 'center',
  },
  mapTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  mapSubtitle: {
    color: '#FF6B00',
    fontSize: 12,
    fontWeight: '600',
  },
  mapCanvas: {
    flex: 1,
    position: 'relative',
  },
  mapGraphicBackground: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  mapDarkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 11, 14, 0.55)',
  },
  mapPinsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  mapPinStart: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 40,
  },
  mapPinStartText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  mapLineVisual: {
    width: 2,
    height: 80,
    backgroundColor: '#FF6B00',
    borderStyle: 'dashed',
  },
  mapPinEnd: {
    backgroundColor: 'rgba(18, 20, 26, 0.9)',
    borderWidth: 1,
    borderColor: '#FF6B00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 40,
  },
  mapPinEndText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  mapBottomSheet: {
    backgroundColor: '#12141A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 14,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  mapSheetHeaderTitle: {
    color: '#8A8F9B',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  mapStopCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  mapStopOrder: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF6B00',
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#8A8F9B',
    fontSize: 10,
  },
});
