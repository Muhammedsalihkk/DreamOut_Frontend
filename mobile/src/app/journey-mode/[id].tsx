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
  TextInput,
  Platform,
  Dimensions,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  MOCK_DETAILED_ROUTE,
  MOCK_JOURNEY_DETAILS,
  RoutePlace,
} from '@/data/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type MomentType = 'photo' | 'video' | 'note';
type VisibilityType = 'public' | 'followers' | 'private';

export default function JourneyModeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Detailed Route data
  const route = MOCK_DETAILED_ROUTE;
  const totalPlaces = route.places.length;

  // Active Exploration State
  const [currentSpotIndex, setCurrentSpotIndex] = useState(1); // 0-indexed: index 1 is Spot 2 (Attukal Waterfalls)
  const [exploredSpotsMap, setExploredSpotsMap] = useState<Record<number, boolean>>({
    0: true, // Spot 1 explored
    1: true, // Spot 2 explored
  });
  const [momentsCount, setMomentsCount] = useState(4);
  const [isJourneyComplete, setIsJourneyComplete] = useState(false);

  // Modals & Flow States
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [isJourneyInfoVisible, setIsJourneyInfoVisible] = useState(false);
  const [isCaptureModalVisible, setIsCaptureModalVisible] = useState(false);

  // Capture Flow States
  const [captureType, setCaptureType] = useState<MomentType>('photo');
  const [captureStep, setCaptureStep] = useState<'capture' | 'share'>('capture');
  const [capturedMediaUri, setCapturedMediaUri] = useState<string | null>(null);
  const [captionText, setCaptionText] = useState('');
  const [visibility, setVisibility] = useState<VisibilityType>('public');
  const [addToStory, setAddToStory] = useState(false);

  // Active Spot
  const currentSpot: RoutePlace = route.places[currentSpotIndex] || route.places[0];
  const nextSpot: RoutePlace | null =
    currentSpotIndex < totalPlaces - 1 ? route.places[currentSpotIndex + 1] : null;
  const exploredPlacesCount = Object.keys(exploredSpotsMap).length;
  const progressPercent = Math.round((exploredPlacesCount / totalPlaces) * 100);

  // Handlers
  const handleNextDiscovery = () => {
    if (currentSpotIndex < totalPlaces - 1) {
      const nextIdx = currentSpotIndex + 1;
      setCurrentSpotIndex(nextIdx);
      setExploredSpotsMap((prev) => ({ ...prev, [nextIdx]: true }));

      // Check if finished
      if (nextIdx === totalPlaces - 1) {
        // Will reach last spot
      }
    } else {
      setIsJourneyComplete(true);
    }
  };

  const openCaptureFlow = (type: MomentType = 'photo') => {
    setCaptureType(type);
    setCaptureStep('capture');
    setCaptionText('');
    if (type === 'photo') {
      setCapturedMediaUri(currentSpot.image);
    } else if (type === 'video') {
      setCapturedMediaUri(
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'
      );
    } else {
      setCapturedMediaUri(null);
    }
    setIsCaptureModalVisible(true);
  };

  const handleTakeSnapshot = () => {
    setCaptureStep('share');
  };

  const handleSaveMoment = () => {
    setMomentsCount((prev) => prev + 1);
    setIsCaptureModalVisible(false);
    Alert.alert(
      'Moment Saved! 📸',
      `Your moment at "${currentSpot.name}" has been added to your journey.`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0B0E" />

      {/* ================================================== */}
      {/* 1. HEADER BAR: Back | Route Title | Options Menu  */}
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
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerTitleWrapper}
          activeOpacity={0.8}
          onPress={() => setIsJourneyInfoVisible(true)}
        >
          <Text style={styles.headerTitle} numberOfLines={1}>
            {route.title}
          </Text>
          <View style={styles.exploringBadge}>
            <View style={styles.greenLiveDot} />
            <Text style={styles.exploringBadgeText}>Exploring</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerOptionsBtn}
          activeOpacity={0.8}
          onPress={() => setIsJourneyInfoVisible(true)}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* ================================================== */}
      {/* 2. TOP PROGRESS DOTS INDICATOR (NO VERTICAL TIMELINE)*/}
      {/* ================================================== */}
      <View style={styles.topProgressContainer}>
        <View style={styles.topProgressTextRow}>
          <Text style={styles.progressCountText}>
            {exploredPlacesCount} / {totalPlaces} Places Explored
          </Text>
          <Text style={styles.progressPercentText}>{progressPercent}%</Text>
        </View>

        {/* Horizontal Dots Indicator */}
        <View style={styles.horizontalDotsRow}>
          {route.places.map((place, idx) => {
            const isExplored = !!exploredSpotsMap[idx];
            const isCurrent = idx === currentSpotIndex;
            return (
              <TouchableOpacity
                key={place.id}
                style={[
                  styles.progressDot,
                  isExplored && styles.progressDotExplored,
                  isCurrent && styles.progressDotCurrent,
                ]}
                activeOpacity={0.8}
                onPress={() => setCurrentSpotIndex(idx)}
              >
                {isExplored && !isCurrent ? (
                  <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                ) : (
                  <Text
                    style={[
                      styles.dotNumberText,
                      isCurrent && styles.dotNumberTextCurrent,
                    ]}
                  >
                    {place.order}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* MAIN SCROLLABLE CONTENT */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 90 + Math.max(insets.bottom, 14) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ================================================== */}
        {/* JOURNEY COMPLETION BANNER (WHEN 7/7 COMPLETE)      */}
        {/* ================================================== */}
        {isJourneyComplete ? (
          <View style={styles.completionCard}>
            <Text style={styles.completionEmoji}>🎉</Text>
            <Text style={styles.completionTitle}>Journey Complete!</Text>
            <Text style={styles.completionSubtitle}>{route.title}</Text>

            <View style={styles.completionStatsRow}>
              <View style={styles.compStatItem}>
                <Text style={styles.compStatValue}>{totalPlaces}/{totalPlaces}</Text>
                <Text style={styles.compStatLabel}>Places Explored</Text>
              </View>
              <View style={styles.compStatDivider} />
              <View style={styles.compStatItem}>
                <Text style={styles.compStatValue}>{momentsCount}</Text>
                <Text style={styles.compStatLabel}>Moments Captured</Text>
              </View>
              <View style={styles.compStatDivider} />
              <View style={styles.compStatItem}>
                <Text style={styles.compStatValue}>5h 20m</Text>
                <Text style={styles.compStatLabel}>Total Duration</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.viewJourneyBtn}
              activeOpacity={0.88}
              onPress={() => router.push('/journey/j1' as any)}
            >
              <Ionicons name="journal-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.viewJourneyBtnText}>View My Journey</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareExperienceBtn}
              activeOpacity={0.85}
              onPress={() => Alert.alert('Share Experience', 'Sharing your completed journey!')}
            >
              <Text style={styles.shareExperienceBtnText}>Share My Experience</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* ================================================== */}
            {/* 3. CURRENT DISCOVERY CARD (IMMERSIVE SPOT UI)      */}
            {/* ================================================== */}
            <View style={styles.currentDiscoveryCard}>
              {/* Large Immersive Travel Image */}
              <View style={styles.spotImageAspectBox}>
                <Image
                  source={{ uri: currentSpot.image }}
                  style={styles.spotCoverImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['rgba(10,11,14,0.1)', 'rgba(10,11,14,0.6)', 'rgba(10,11,14,0.92)']}
                  style={styles.spotImageGradient}
                />

                {/* You're Here Badge */}
                <View style={styles.youreHereBadge}>
                  <Ionicons name="sparkles" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.youreHereText}>✨ YOU'RE HERE</Text>
                </View>

                <View style={styles.spotOverlayTextGroup}>
                  <View style={styles.categoryTagPill}>
                    <Text style={styles.categoryTagPillText}>
                      {currentSpot.category || 'Spot'}
                    </Text>
                  </View>
                  <Text style={styles.spotOverlayTitle}>{currentSpot.name}</Text>
                  <Text style={styles.spotOverlayMeta}>
                    📍 {currentSpot.distanceFromStart} from start • ~45 min
                  </Text>
                </View>
              </View>

              {/* Spot Body Description & Spot Details Link */}
              <View style={styles.spotCardBody}>
                <Text style={styles.spotCardDesc}>
                  "A beautiful section of the trail with stunning surrounding nature, perfect for a short break during your journey."
                </Text>

                <TouchableOpacity
                  style={styles.viewSpotDetailsBtn}
                  activeOpacity={0.8}
                  onPress={() => router.push(`/spot/${currentSpot.spotId || currentSpot.id}` as any)}
                >
                  <Text style={styles.viewSpotDetailsText}>View Spot Details</Text>
                  <Ionicons name="arrow-forward" size={15} color="#FF6B00" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>

              {/* ================================================== */}
              {/* 4. CAPTURE MOMENT — PRIMARY PROMINENT CTA         */}
              {/* ================================================== */}
              <View style={styles.captureCtaContainer}>
                <TouchableOpacity
                  style={styles.primaryCaptureBtn}
                  activeOpacity={0.88}
                  onPress={() => openCaptureFlow('photo')}
                >
                  <View style={styles.cameraIconCircle}>
                    <Ionicons name="camera" size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.primaryCaptureText}>📸 Capture Moment</Text>
                </TouchableOpacity>

                {/* Quick Capture Options */}
                <View style={styles.quickCaptureRow}>
                  <TouchableOpacity
                    style={styles.quickCapPill}
                    activeOpacity={0.8}
                    onPress={() => openCaptureFlow('photo')}
                  >
                    <Ionicons name="image-outline" size={14} color="#FF6B00" />
                    <Text style={styles.quickCapText}>Photo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickCapPill}
                    activeOpacity={0.8}
                    onPress={() => openCaptureFlow('video')}
                  >
                    <Ionicons name="videocam-outline" size={14} color="#FF6B00" />
                    <Text style={styles.quickCapText}>Video</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickCapPill}
                    activeOpacity={0.8}
                    onPress={() => openCaptureFlow('note')}
                  >
                    <Ionicons name="create-outline" size={14} color="#FF6B00" />
                    <Text style={styles.quickCapText}>Note</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* ================================================== */}
            {/* 5. NEXT DISCOVERY PREVIEW CARD                     */}
            {/* ================================================== */}
            {nextSpot && (
              <View style={styles.nextDiscoverySection}>
                <Text style={styles.nextDiscoveryHeaderTitle}>Next Discovery</Text>
                <TouchableOpacity
                  style={styles.nextSpotCard}
                  activeOpacity={0.88}
                  onPress={handleNextDiscovery}
                >
                  <Image source={{ uri: nextSpot.image }} style={styles.nextSpotThumbnail} />

                  <View style={styles.nextSpotBody}>
                    <View style={styles.nextSpotOrderRow}>
                      <Text style={styles.nextSpotOrderText}>Stop {nextSpot.order}</Text>
                      <Text style={styles.nextSpotDot}>•</Text>
                      <Text style={styles.nextSpotDistText}>2.4 km away</Text>
                    </View>
                    <Text style={styles.nextSpotName}>{nextSpot.name}</Text>
                  </View>

                  <View style={styles.nextSpotChevronCircle}>
                    <Ionicons name="chevron-forward" size={18} color="#FF6B00" />
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* ================================================== */}
            {/* 6. JOURNEY PROGRESS SUMMARY CARD                  */}
            {/* ================================================== */}
            <View style={styles.progressSummaryCard}>
              <View style={styles.progressSummaryHeader}>
                <Text style={styles.progressSummaryTitle}>Journey Progress</Text>
                <Text style={styles.progressSummaryBadge}>
                  {exploredPlacesCount} / {totalPlaces} Places
                </Text>
              </View>

              {/* Progress Bar Track */}
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
              </View>

              {/* Compact Spot Indicators */}
              <View style={styles.compactIndicatorsRow}>
                {route.places.map((place, idx) => {
                  const isExplored = !!exploredSpotsMap[idx];
                  return (
                    <View
                      key={place.id}
                      style={[
                        styles.compactIndicatorItem,
                        isExplored && styles.compactIndicatorItemExplored,
                      ]}
                    >
                      <Text style={[styles.compactIndicatorText, isExplored && { color: '#FF6B00' }]}>
                        {isExplored ? '✓' : place.order}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* ================================================== */}
      {/* 7. FOCUSED BOTTOM ACTION BAR (NO NORMAL APP TABS)  */}
      {/* [ 🗺 View Route ]     [ 📸 Capture ]                */}
      {/* ================================================== */}
      <View
        style={[
          styles.focusedBottomBar,
          { paddingBottom: Math.max(insets.bottom, 14), paddingTop: 12 },
        ]}
      >
        <TouchableOpacity
          style={styles.viewRouteSecBtn}
          activeOpacity={0.85}
          onPress={() => setIsMapModalVisible(true)}
        >
          <Ionicons name="map-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.viewRouteSecText}>View Route</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.capturePrimaryBarBtn}
          activeOpacity={0.88}
          onPress={() => openCaptureFlow('photo')}
        >
          <Ionicons name="camera" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.capturePrimaryBarText}>Capture</Text>
        </TouchableOpacity>
      </View>

      {/* ================================================== */}
      {/* UTILITY MODAL 1: ROUTE MAP UTILITY VIEW            */}
      {/* ================================================== */}
      <Modal
        visible={isMapModalVisible}
        animationType="slide"
        transparent={false}
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
              <Text style={styles.mapTitle}>{route.title}</Text>
              <Text style={styles.mapSubtitle}>
                {route.distance} • {totalPlaces} Stops
              </Text>
            </View>

            <View style={{ width: 36 }} />
          </SafeAreaView>

          {/* Map Graphic Canvas */}
          <View style={styles.mapCanvas}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80',
              }}
              style={styles.mapGraphicImage}
            />
            <View style={styles.mapOverlayDark} />

            <View style={styles.mapPinsContainer}>
              <View style={styles.mapPinItem}>
                <Ionicons name="navigate" size={14} color="#FFFFFF" />
                <Text style={styles.mapPinItemText}>Start: Kolukkumalai</Text>
              </View>

              <View style={styles.mapDashedLine} />

              <View style={styles.mapPinItemActive}>
                <Ionicons name="location" size={14} color="#FF6B00" />
                <Text style={styles.mapPinItemText}>{currentSpot.name}</Text>
              </View>

              <View style={styles.mapDashedLine} />

              <View style={styles.mapPinItem}>
                <Ionicons name="flag" size={14} color="#FFFFFF" />
                <Text style={styles.mapPinItemText}>End: Anamudi Ridge</Text>
              </View>
            </View>
          </View>

          {/* Bottom Return CTA */}
          <SafeAreaView style={styles.mapBottomBar}>
            <TouchableOpacity
              style={styles.returnJourneyBtn}
              activeOpacity={0.88}
              onPress={() => setIsMapModalVisible(false)}
            >
              <Ionicons name="compass" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.returnJourneyText}>Back to Journey Mode</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      </Modal>

      {/* ================================================== */}
      {/* UTILITY MODAL 2: JOURNEY INFO MODAL                */}
      {/* ================================================== */}
      <Modal
        visible={isJourneyInfoVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsJourneyInfoVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setIsJourneyInfoVisible(false)}
        >
          <View style={styles.journeyInfoCard}>
            <View style={styles.infoModalHeader}>
              <Text style={styles.infoModalTitle}>{route.title}</Text>
              <TouchableOpacity onPress={() => setIsJourneyInfoVisible(false)}>
                <Ionicons name="close" size={20} color="#8A8F9B" />
              </TouchableOpacity>
            </View>

            <View style={styles.infoModalMetaRow}>
              <Text style={styles.infoMetaPill}>{totalPlaces} Places</Text>
              <Text style={styles.infoMetaPill}>{route.distance}</Text>
              <Text style={styles.infoMetaPill}>{route.duration}</Text>
            </View>

            <View style={styles.infoDetailsList}>
              <View style={styles.infoDetailRow}>
                <Text style={styles.infoDetailLabel}>Places Explored</Text>
                <Text style={styles.infoDetailValue}>
                  {exploredPlacesCount} / {totalPlaces}
                </Text>
              </View>
              <View style={styles.infoDetailRow}>
                <Text style={styles.infoDetailLabel}>Moments Captured</Text>
                <Text style={styles.infoDetailValue}>{momentsCount}</Text>
              </View>
              <View style={styles.infoDetailRow}>
                <Text style={styles.infoDetailLabel}>Started</Text>
                <Text style={styles.infoDetailValue}>Today at 8:30 AM</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ================================================== */}
      {/* CAPTURE MOMENT FLOW MODAL                          */}
      {/* ================================================== */}
      <Modal
        visible={isCaptureModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsCaptureModalVisible(false)}
      >
        <SafeAreaView style={styles.captureModalContainer}>
          <StatusBar barStyle="light-content" />

          {/* Capture Header */}
          <View style={styles.captureHeaderBar}>
            <TouchableOpacity
              style={styles.captureCloseBtn}
              onPress={() => setIsCaptureModalVisible(false)}
            >
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <Text style={styles.captureHeaderTitle}>
              {captureStep === 'capture' ? 'Capture Moment' : 'Share Your Moment'}
            </Text>

            <View style={{ width: 36 }} />
          </View>

          {/* Auto Context Banner */}
          <View style={styles.autoContextBanner}>
            <Ionicons name="compass" size={14} color="#FF6B00" style={{ marginRight: 6 }} />
            <Text style={styles.autoContextText}>
              <Text style={{ fontWeight: '700', color: '#FFFFFF' }}>{route.title}</Text> • {currentSpot.name}
            </Text>
          </View>

          {/* STEP 1: CAPTURE INTERFACE */}
          {captureStep === 'capture' ? (
            <View style={styles.captureStepContainer}>
              {/* Type Switcher Tabs */}
              <View style={styles.captureTypeTabs}>
                <TouchableOpacity
                  style={[styles.captureTypeBtn, captureType === 'photo' && styles.captureTypeBtnActive]}
                  onPress={() => openCaptureFlow('photo')}
                >
                  <Text style={[styles.captureTypeText, captureType === 'photo' && styles.captureTypeTextActive]}>
                    Photo
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.captureTypeBtn, captureType === 'video' && styles.captureTypeBtnActive]}
                  onPress={() => openCaptureFlow('video')}
                >
                  <Text style={[styles.captureTypeText, captureType === 'video' && styles.captureTypeTextActive]}>
                    Video
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.captureTypeBtn, captureType === 'note' && styles.captureTypeBtnActive]}
                  onPress={() => openCaptureFlow('note')}
                >
                  <Text style={[styles.captureTypeText, captureType === 'note' && styles.captureTypeTextActive]}>
                    Note
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Viewfinder Preview */}
              <View style={styles.viewfinderBox}>
                {captureType !== 'note' && capturedMediaUri ? (
                  <Image source={{ uri: capturedMediaUri }} style={styles.viewfinderImage} />
                ) : (
                  <View style={styles.noteInputViewfinder}>
                    <Ionicons name="create-outline" size={28} color="#FF6B00" style={{ marginBottom: 8 }} />
                    <TextInput
                      style={styles.noteTextInput}
                      placeholder="Write your note for this spot..."
                      placeholderTextColor="#8A8F9B"
                      multiline
                      value={captionText}
                      onChangeText={setCaptionText}
                    />
                  </View>
                )}
              </View>

              {/* Shutter Action Button */}
              <TouchableOpacity
                style={styles.shutterOuterCircle}
                activeOpacity={0.8}
                onPress={handleTakeSnapshot}
              >
                <View style={styles.shutterInnerCircle} />
              </TouchableOpacity>
            </View>
          ) : (
            /* STEP 2: SHARE & SAVE INTERFACE */
            <ScrollView
              contentContainerStyle={styles.shareStepScroll}
              showsVerticalScrollIndicator={false}
            >
              {/* Preview Media */}
              {capturedMediaUri && (
                <View style={styles.sharePreviewBox}>
                  <Image source={{ uri: capturedMediaUri }} style={styles.sharePreviewImage} />
                </View>
              )}

              {/* Caption Input */}
              <View style={styles.captionInputBlock}>
                <TextInput
                  style={styles.captionField}
                  placeholder="What's on your mind? Add a caption..."
                  placeholderTextColor="#8A8F9B"
                  multiline
                  value={captionText}
                  onChangeText={setCaptionText}
                />
              </View>

              {/* Visibility Selector */}
              <Text style={styles.visibilityLabelText}>Who can see this?</Text>
              <View style={styles.visibilityOptionsRow}>
                <TouchableOpacity
                  style={[styles.visPill, visibility === 'public' && styles.visPillActive]}
                  onPress={() => setVisibility('public')}
                >
                  <Ionicons name="globe-outline" size={14} color={visibility === 'public' ? '#FF6B00' : '#8A8F9B'} />
                  <Text style={[styles.visText, visibility === 'public' && styles.visTextActive]}>Public</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.visPill, visibility === 'followers' && styles.visPillActive]}
                  onPress={() => setVisibility('followers')}
                >
                  <Ionicons name="people-outline" size={14} color={visibility === 'followers' ? '#FF6B00' : '#8A8F9B'} />
                  <Text style={[styles.visText, visibility === 'followers' && styles.visTextActive]}>Followers</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.visPill, visibility === 'private' && styles.visPillActive]}
                  onPress={() => setVisibility('private')}
                >
                  <Ionicons name="lock-closed-outline" size={14} color={visibility === 'private' ? '#FF6B00' : '#8A8F9B'} />
                  <Text style={[styles.visText, visibility === 'private' && styles.visTextActive]}>Private</Text>
                </TouchableOpacity>
              </View>

              {/* Story Toggle Option */}
              <TouchableOpacity
                style={styles.storyToggleRow}
                activeOpacity={0.8}
                onPress={() => setAddToStory((prev) => !prev)}
              >
                <View style={styles.storyToggleLeft}>
                  <Ionicons name="add-circle-outline" size={20} color="#FF6B00" />
                  <Text style={styles.storyToggleText}>Add to Story</Text>
                </View>
                <Ionicons
                  name={addToStory ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={addToStory ? '#FF6B00' : '#8A8F9B'}
                />
              </TouchableOpacity>

              {/* Final Save CTA Button */}
              <TouchableOpacity
                style={styles.saveMomentFinalBtn}
                activeOpacity={0.88}
                onPress={handleSaveMoment}
              >
                <Text style={styles.saveMomentFinalText}>Save Moment to Journey</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </SafeAreaView>
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
    padding: 4,
  },
  headerTitleWrapper: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  exploringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  greenLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  exploringBadgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  headerOptionsBtn: {
    padding: 4,
  },

  /* Top Progress Dots */
  topProgressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(18, 20, 26, 0.6)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  topProgressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressCountText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  progressPercentText: {
    color: '#FF6B00',
    fontSize: 12.5,
    fontWeight: '800',
  },
  horizontalDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  progressDot: {
    flex: 1,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  progressDotExplored: {
    backgroundColor: '#FF6B00',
  },
  progressDotCurrent: {
    borderColor: '#FFFFFF',
    backgroundColor: '#FF6B00',
  },
  dotNumberText: {
    color: '#8A8F9B',
    fontSize: 10.5,
    fontWeight: '700',
  },
  dotNumberTextCurrent: {
    color: '#FFFFFF',
  },

  /* Current Discovery Card */
  currentDiscoveryCard: {
    backgroundColor: 'rgba(18, 20, 26, 0.88)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    marginTop: 14,
    marginBottom: 16,
  },
  spotImageAspectBox: {
    width: '100%',
    aspectRatio: 16 / 10,
    position: 'relative',
    backgroundColor: '#0F1117',
  },
  spotCoverImage: {
    width: '100%',
    height: '100%',
  },
  spotImageGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  youreHereBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B00',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  youreHereText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  spotOverlayTextGroup: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
  },
  categoryTagPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },
  categoryTagPillText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
  },
  spotOverlayTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  spotOverlayMeta: {
    color: '#FF6B00',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  spotCardBody: {
    padding: 14,
  },
  spotCardDesc: {
    color: '#D1D5DB',
    fontSize: 13.5,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  viewSpotDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  viewSpotDetailsText: {
    color: '#FF6B00',
    fontSize: 13,
    fontWeight: '700',
  },

  /* Primary Capture Action */
  captureCtaContainer: {
    padding: 14,
    paddingTop: 0,
    gap: 10,
  },
  primaryCaptureBtn: {
    backgroundColor: '#FF6B00',
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  cameraIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryCaptureText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  quickCaptureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickCapPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  quickCapText: {
    color: '#E0E4EB',
    fontSize: 12,
    fontWeight: '600',
  },

  /* Next Discovery Section */
  nextDiscoverySection: {
    marginBottom: 16,
  },
  nextDiscoveryHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
  },
  nextSpotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 20, 26, 0.84)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  nextSpotThumbnail: {
    width: 60,
    height: 48,
    borderRadius: 10,
    marginRight: 12,
  },
  nextSpotBody: {
    flex: 1,
  },
  nextSpotOrderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nextSpotOrderText: {
    color: '#FF6B00',
    fontSize: 11,
    fontWeight: '700',
  },
  nextSpotDot: {
    color: '#6F7482',
    fontSize: 10,
  },
  nextSpotDistText: {
    color: '#9CA3AF',
    fontSize: 11,
  },
  nextSpotName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  nextSpotChevronCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Progress Summary Card */
  progressSummaryCard: {
    backgroundColor: 'rgba(18, 20, 26, 0.84)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  progressSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressSummaryTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  progressSummaryBadge: {
    color: '#FF6B00',
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF6B00',
    borderRadius: 3,
  },
  compactIndicatorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  compactIndicatorItem: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactIndicatorItemExplored: {
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
    borderWidth: 1,
    borderColor: '#FF6B00',
  },
  compactIndicatorText: {
    color: '#8A8F9B',
    fontSize: 11,
    fontWeight: '700',
  },

  /* Completion Card */
  completionCard: {
    backgroundColor: 'rgba(18, 20, 26, 0.92)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF6B00',
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  completionEmoji: {
    fontSize: 42,
    marginBottom: 6,
  },
  completionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  completionSubtitle: {
    color: '#FF6B00',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 16,
  },
  completionStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    marginBottom: 18,
  },
  compStatItem: {
    alignItems: 'center',
  },
  compStatValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  compStatLabel: {
    color: '#8A8F9B',
    fontSize: 10.5,
    marginTop: 2,
  },
  compStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  viewJourneyBtn: {
    backgroundColor: '#FF6B00',
    width: '100%',
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  viewJourneyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  shareExperienceBtn: {
    paddingVertical: 8,
  },
  shareExperienceBtnText: {
    color: '#8A8F9B',
    fontSize: 13,
    fontWeight: '600',
  },

  /* Focused Bottom Action Bar (No Normal App Tabs) */
  focusedBottomBar: {
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
  viewRouteSecBtn: {
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
  viewRouteSecText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  capturePrimaryBarBtn: {
    flex: 1.4,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF6B00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  capturePrimaryBarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  /* Map Modal Utility */
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
    fontSize: 11,
    fontWeight: '600',
  },
  mapCanvas: {
    flex: 1,
    position: 'relative',
  },
  mapGraphicImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  mapOverlayDark: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 11, 14, 0.55)',
  },
  mapPinsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPinItem: {
    backgroundColor: 'rgba(18, 20, 26, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mapPinItemActive: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mapPinItemText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  mapDashedLine: {
    width: 2,
    height: 50,
    backgroundColor: '#FF6B00',
    marginVertical: 4,
  },
  mapBottomBar: {
    backgroundColor: '#12141A',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  returnJourneyBtn: {
    backgroundColor: '#FF6B00',
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  returnJourneyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  /* Journey Info Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  journeyInfoCard: {
    width: '100%',
    backgroundColor: '#14161E',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 18,
  },
  infoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoModalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  infoModalMetaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  infoMetaPill: {
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
    color: '#FF6B00',
    fontSize: 11.5,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  infoDetailsList: {
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 12,
  },
  infoDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoDetailLabel: {
    color: '#8A8F9B',
    fontSize: 13,
  },
  infoDetailValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  /* Capture Modal Flow */
  captureModalContainer: {
    flex: 1,
    backgroundColor: '#0A0B0E',
  },
  captureHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  captureCloseBtn: {
    padding: 4,
  },
  captureHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  autoContextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 107, 0, 0.2)',
  },
  autoContextText: {
    color: '#FF6B00',
    fontSize: 12,
  },
  captureStepContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  captureTypeTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 3,
    gap: 4,
  },
  captureTypeBtn: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 16,
  },
  captureTypeBtnActive: {
    backgroundColor: '#FF6B00',
  },
  captureTypeText: {
    color: '#8A8F9B',
    fontSize: 13,
    fontWeight: '600',
  },
  captureTypeTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  viewfinderBox: {
    width: SCREEN_WIDTH - 40,
    aspectRatio: 4 / 5,
    backgroundColor: '#14161F',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  viewfinderImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  noteInputViewfinder: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-start',
  },
  noteTextInput: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  shutterOuterCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#FF6B00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInnerCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FF6B00',
  },

  /* Share Step Scroll */
  shareStepScroll: {
    padding: 16,
    gap: 16,
  },
  sharePreviewBox: {
    width: '100%',
    aspectRatio: 4 / 5,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#14161F',
  },
  sharePreviewImage: {
    width: '100%',
    height: '100%',
  },
  captionInputBlock: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  captionField: {
    color: '#FFFFFF',
    fontSize: 14,
    minHeight: 60,
  },
  visibilityLabelText: {
    color: '#8A8F9B',
    fontSize: 12.5,
    fontWeight: '700',
  },
  visibilityOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  visPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  visPillActive: {
    borderColor: '#FF6B00',
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
  },
  visText: {
    color: '#8A8F9B',
    fontSize: 12,
    fontWeight: '600',
  },
  visTextActive: {
    color: '#FF6B00',
    fontWeight: '700',
  },
  storyToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  storyToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  storyToggleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  saveMomentFinalBtn: {
    backgroundColor: '#FF6B00',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  saveMomentFinalText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
