import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  StatusBar,
  Modal,
  ActivityIndicator,
  Switch,
  Dimensions,
  Pressable,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useMomentStore, CreatedMoment } from '@/store/useMomentStore';
import { useRouteStore } from '@/store/useRouteStore';
import { Spot, MOCK_USER_PROFILE } from '@/data/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Preset Travel Media Photos for Camera Simulation
const SAMPLE_MOMENT_PHOTOS = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1080&q=80',
  'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1080&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1080&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&q=80',
  'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=1080&q=80',
];

// Photo Filter Presets
const PHOTO_FILTERS = [
  { id: 'normal', name: 'Normal', tint: 'transparent' },
  { id: 'warm', name: 'Warm Orange', tint: 'rgba(255, 107, 0, 0.12)' },
  { id: 'cinematic', name: 'Cinematic', tint: 'rgba(20, 30, 55, 0.18)' },
  { id: 'misty', name: 'Misty Mountain', tint: 'rgba(200, 220, 240, 0.15)' },
  { id: 'vintage', name: 'Vintage', tint: 'rgba(240, 190, 140, 0.15)' },
  { id: 'bw', name: 'B&W Film', tint: 'rgba(0, 0, 0, 0.4)' },
];

// Sample Journeys for shortcuts
const USER_JOURNEYS = [
  { id: 'j1', title: 'Munnar', trips: '2 trips', routeId: 'r1', routeTitle: 'Munnar Peak Trail', spotName: 'Kolukkumalai View Point' },
  { id: 'j2', title: 'Wayanad', trips: '1 trip', routeId: 'r3', routeTitle: 'Wayanad Explorer', spotName: 'Edakkal Caves' },
  { id: 'j3', title: 'Kozhikode', trips: '3 trips', routeId: 'r5', routeTitle: 'Kozhikode Heritage Trail', spotName: 'Kappad Beach' },
  { id: 'j4', title: 'Vagamon', trips: '3 trips', routeId: 'r6', routeTitle: 'Vagamon Escapes', spotName: 'Vagamon Pine Forest' },
];

export default function CreateMomentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const searchParams = useLocalSearchParams<{ isJourneyActive?: string; activeSpotId?: string; activeRouteId?: string }>();

  const { activeJourney, addMoment } = useMomentStore();
  const { spots: allSpots, routes: allRoutes } = useRouteStore();

  // Screen Flow Sub-State:
  // 'options': Screen 1 (Choose Photo/Video/Note or Journey)
  // 'camera': Screen 2 (Camera/Video/Note capture)
  // 'edit': Screen 3 (Photo Edit & Preview)
  // 'share-form': Screen 4 (Caption, Spot, Route, Privacy, Save)
  // 'success': Success Celebration & View Moment
  const [currentView, setCurrentView] = useState<'options' | 'camera' | 'edit' | 'share-form' | 'success'>('options');

  // Creation Type: 'photo' | 'video' | 'note'
  const [momentType, setMomentType] = useState<'photo' | 'video' | 'note'>('photo');

  // Captured Media State
  const [selectedMediaUri, setSelectedMediaUri] = useState(SAMPLE_MOMENT_PHOTOS[0]);
  const [selectedFilter, setSelectedFilter] = useState(PHOTO_FILTERS[0]);
  const [noteContent, setNoteContent] = useState('');

  // Form Details State
  const [caption, setCaption] = useState('');
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(() => {
    // Check if opened from Active Journey mode
    if (activeJourney) {
      const match = allSpots.find((s) => s.name === activeJourney.spotName);
      if (match) return match;
    }
    return allSpots.find((s) => s.name.includes('Kolukkumalai')) || allSpots[0];
  });

  const [selectedRoute, setSelectedRoute] = useState<{ id: string; title: string; placesCount?: number } | null>(() => {
    if (activeJourney) {
      return { id: activeJourney.routeId, title: activeJourney.routeTitle, placesCount: 7 };
    }
    return { id: 'r1', title: 'Munnar Peak Trail', placesCount: 7 };
  });

  const [visibility, setVisibility] = useState<'Public' | 'Followers' | 'Private'>('Public');
  const [addToStory, setAddToStory] = useState(true);
  const [shareToExplore, setShareToExplore] = useState(true);

  // Tags
  const [selectedTags, setSelectedTags] = useState<string[]>(['Sunrise', 'Mountains', 'Nature']);
  const [customTagInput, setCustomTagInput] = useState('');

  // Modals
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [isRouteModalVisible, setIsRouteModalVisible] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [routeSearchQuery, setRouteSearchQuery] = useState('');
  const [locationFilterTab, setLocationFilterTab] = useState<'Nearby' | 'Recent' | 'My Spots'>('Nearby');

  // Saving State
  const [isSaving, setIsSaving] = useState(false);
  const [createdMomentResult, setCreatedMomentResult] = useState<CreatedMoment | null>(null);
  const [isMomentDetailModalVisible, setIsMomentDetailModalVisible] = useState(false);

  // Filtered Spots for Location Picker
  const filteredLocationSpots = useMemo(() => {
    return allSpots.filter((spot) => {
      if (!locationSearchQuery.trim()) return true;
      const q = locationSearchQuery.toLowerCase();
      return (
        spot.name.toLowerCase().includes(q) ||
        spot.location.toLowerCase().includes(q) ||
        spot.category.toLowerCase().includes(q)
      );
    });
  }, [allSpots, locationSearchQuery]);

  // Filtered Routes for Route Picker
  const filteredRoutes = useMemo(() => {
    return allRoutes.filter((r) => {
      if (!routeSearchQuery.trim()) return true;
      return r.title.toLowerCase().includes(routeSearchQuery.toLowerCase());
    });
  }, [allRoutes, routeSearchQuery]);

  // Handle Back Button
  const handleBack = () => {
    if (currentView === 'success') {
      router.back();
      return;
    }
    if (currentView === 'share-form') {
      setCurrentView(momentType === 'note' ? 'camera' : 'edit');
      return;
    }
    if (currentView === 'edit') {
      setCurrentView('camera');
      return;
    }
    if (currentView === 'camera') {
      setCurrentView('options');
      return;
    }
    router.back();
  };

  // Launch Capture Mode
  const handleStartCapture = (type: 'photo' | 'video' | 'note') => {
    setMomentType(type);
    setCurrentView('camera');
  };

  // Select Journey Shortcut
  const handleSelectJourneyShortcut = (j: typeof USER_JOURNEYS[0]) => {
    const spotMatch = allSpots.find((s) => s.name.includes(j.title) || s.name === j.spotName) || allSpots[0];
    setSelectedSpot(spotMatch);
    setSelectedRoute({ id: j.routeId, title: j.routeTitle, placesCount: 6 });
    setMomentType('photo');
    setCurrentView('camera');
  };

  // Capture Media Action
  const handleCaptureAction = () => {
    if (momentType === 'note') {
      setCurrentView('share-form');
    } else {
      // Pick next photo in preset gallery for simulation
      const nextIdx = (SAMPLE_MOMENT_PHOTOS.indexOf(selectedMediaUri) + 1) % SAMPLE_MOMENT_PHOTOS.length;
      setSelectedMediaUri(SAMPLE_MOMENT_PHOTOS[nextIdx]);
      setCurrentView('edit');
    }
  };

  // Save Moment
  const handleSaveMoment = () => {
    setIsSaving(true);

    setTimeout(() => {
      const newMoment = addMoment({
        type: momentType,
        mediaUri: momentType !== 'note' ? selectedMediaUri : undefined,
        noteText: momentType === 'note' ? noteContent || 'Wonderful experience in Munnar.' : undefined,
        caption: caption.trim() || 'A beautiful moment captured in Munnar.',
        spot: selectedSpot ? { id: selectedSpot.id, name: selectedSpot.name, location: selectedSpot.location } : undefined,
        route: selectedRoute ? { id: selectedRoute.id, title: selectedRoute.title } : undefined,
        visibility,
        addToStory,
        shareToExplore: visibility !== 'Private' && shareToExplore,
        tags: selectedTags,
        filterName: selectedFilter.name,
      });

      setCreatedMomentResult(newMoment);
      setIsSaving(false);
      setCurrentView('success');
    }, 1200);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTag = () => {
    if (!customTagInput.trim()) return;
    const clean = customTagInput.trim().replace(/^#/, '');
    if (!selectedTags.includes(clean)) {
      setSelectedTags((prev) => [...prev, clean]);
    }
    setCustomTagInput('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0B0E" />

      {/* ================================================== */}
      {/* 1. SCREEN 1 — SHARE MOMENT OPTIONS                 */}
      {/* ================================================== */}
      {currentView === 'options' && (
        <View style={styles.fullScreen}>
          {/* Header */}
          <View style={[styles.headerRow, { paddingTop: Math.max(insets.top, 12) }]}>
            <TouchableOpacity style={styles.backBtn} activeOpacity={0.8} onPress={handleBack}>
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Share Moment</Text>
            <TouchableOpacity style={styles.closeBtn} activeOpacity={0.8} onPress={() => router.back()}>
              <Ionicons name="close" size={22} color="#8A8F9B" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.screenSubtitle}>Capture something worth remembering.</Text>

            {/* Active Journey Banner if exploring */}
            {activeJourney && (
              <View style={styles.activeJourneyBanner}>
                <Ionicons name="compass" size={20} color="#FF6B00" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.activeBannerTitle}>Exploring {activeJourney.routeTitle}</Text>
                  <Text style={styles.activeBannerSub}>Currently at {activeJourney.spotName}</Text>
                </View>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>ACTIVE</Text>
                </View>
              </View>
            )}

            {/* Creation Option 1: Take a Photo (PRIMARY HIGHLIGHTED ORANGE) */}
            <TouchableOpacity
              style={styles.primaryOptionCard}
              activeOpacity={0.85}
              onPress={() => handleStartCapture('photo')}
            >
              <View style={styles.primaryIconCircle}>
                <Ionicons name="camera" size={26} color="#FF6B00" />
              </View>
              <View style={styles.optionTextCol}>
                <Text style={styles.primaryOptionTitle}>📷 Take a Photo</Text>
                <Text style={styles.primaryOptionDesc}>Capture the moment in 4:5 format</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#FF6B00" />
            </TouchableOpacity>

            {/* Creation Option 2: Record a Video */}
            <TouchableOpacity
              style={styles.secondaryOptionCard}
              activeOpacity={0.85}
              onPress={() => handleStartCapture('video')}
            >
              <View style={styles.secondaryIconCircle}>
                <Ionicons name="videocam-outline" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.optionTextCol}>
                <Text style={styles.secondaryOptionTitle}>🎥 Record a Video</Text>
                <Text style={styles.secondaryOptionDesc}>Share the experience in motion</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8A8F9B" />
            </TouchableOpacity>

            {/* Creation Option 3: Write a Note */}
            <TouchableOpacity
              style={styles.secondaryOptionCard}
              activeOpacity={0.85}
              onPress={() => handleStartCapture('note')}
            >
              <View style={styles.secondaryIconCircle}>
                <Ionicons name="create-outline" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.optionTextCol}>
                <Text style={styles.secondaryOptionTitle}>✍️ Write a Note</Text>
                <Text style={styles.secondaryOptionDesc}>Share your thoughts and memories</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8A8F9B" />
            </TouchableOpacity>

            {/* FROM YOUR JOURNEYS SECTION */}
            <View style={styles.journeysHeaderRow}>
              <Text style={styles.journeysSectionTitle}>From your journeys</Text>
              <TouchableOpacity onPress={() => router.push('/explore')}>
                <Text style={styles.seeAllText}>See All &gt;</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.journeysScroll}>
              {USER_JOURNEYS.map((j) => (
                <TouchableOpacity
                  key={j.id}
                  style={styles.journeyCardItem}
                  activeOpacity={0.8}
                  onPress={() => handleSelectJourneyShortcut(j)}
                >
                  <View style={styles.journeyCardIcon}>
                    <Ionicons name="trail-sign-outline" size={20} color="#FF6B00" />
                  </View>
                  <Text style={styles.journeyCardTitle}>{j.title}</Text>
                  <Text style={styles.journeyCardTrips}>{j.trips}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </ScrollView>
        </View>
      )}

      {/* ================================================== */}
      {/* 2. SCREEN 2 — CAMERA CAPTURE INTERFACE            */}
      {/* ================================================== */}
      {currentView === 'camera' && (
        <View style={styles.cameraScreenContainer}>
          {/* Top Controls Overlay */}
          <View style={[styles.cameraTopBar, { paddingTop: Math.max(insets.top, 16) }]}>
            <TouchableOpacity style={styles.cameraIconBtn} onPress={handleBack}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.cameraTopRightActions}>
              <TouchableOpacity style={styles.cameraIconBtn}>
                <Ionicons name="flash-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.cameraIconBtn}>
                <Ionicons name="camera-reverse-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Full Screen Camera Simulation Frame */}
          <View style={styles.cameraFrame}>
            {momentType === 'note' ? (
              /* NOTE CREATION CANVAS */
              <View style={styles.noteCanvas}>
                <Ionicons name="document-text-outline" size={32} color="#FF6B00" style={{ marginBottom: 12 }} />
                <TextInput
                  style={styles.noteCanvasInput}
                  placeholder="Write your travel note..."
                  placeholderTextColor="#6B7280"
                  multiline
                  value={noteContent}
                  onChangeText={setNoteContent}
                />
              </View>
            ) : (
              /* PHOTO / VIDEO PREVIEW FRAME */
              <Image source={{ uri: selectedMediaUri }} style={styles.cameraPreviewImage} />
            )}
          </View>

          {/* Bottom Shutter & Mode Switcher Bar */}
          <View style={[styles.cameraBottomBar, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            {/* Mode Switcher */}
            <View style={styles.modeSwitcherRow}>
              {(['Photo', 'Video', 'Note'] as const).map((mode) => {
                const isSelected = momentType === mode.toLowerCase();
                return (
                  <TouchableOpacity
                    key={mode}
                    onPress={() => setMomentType(mode.toLowerCase() as any)}
                  >
                    <Text style={[styles.modeText, isSelected && styles.modeTextActive]}>
                      {mode}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Shutter Button */}
            <TouchableOpacity style={styles.shutterRing} activeOpacity={0.8} onPress={handleCaptureAction}>
              <View style={styles.shutterInnerCircle} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ================================================== */}
      {/* 3. SCREEN 3 — PHOTO PREVIEW / EDIT                */}
      {/* ================================================== */}
      {currentView === 'edit' && (
        <View style={styles.fullScreen}>
          {/* Top Bar */}
          <View style={[styles.headerRow, { paddingTop: Math.max(insets.top, 12) }]}>
            <TouchableOpacity style={styles.backBtn} activeOpacity={0.8} onPress={handleBack}>
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Photo</Text>
            <TouchableOpacity
              style={styles.nextTextBtn}
              onPress={() => setCurrentView('share-form')}
            >
              <Text style={styles.nextTextBtnLabel}>Next →</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.editScrollBody} showsVerticalScrollIndicator={false}>
            {/* 4:5 Aspect Ratio Photo Container */}
            <View style={styles.photoRatioFrame}>
              <Image source={{ uri: selectedMediaUri }} style={styles.photoEditImage} />
              <View style={[styles.filterOverlay, { backgroundColor: selectedFilter.tint }]} />
            </View>

            {/* Filter Selector */}
            <Text style={styles.filterSectionTitle}>Filters</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
              {PHOTO_FILTERS.map((f) => {
                const isSelected = selectedFilter.id === f.id;
                return (
                  <TouchableOpacity
                    key={f.id}
                    style={styles.filterChipItem}
                    onPress={() => setSelectedFilter(f)}
                  >
                    <View style={[styles.filterThumbBox, isSelected && styles.filterThumbActive]}>
                      <Image source={{ uri: selectedMediaUri }} style={styles.filterThumbImg} />
                      <View style={[styles.filterOverlay, { backgroundColor: f.tint }]} />
                    </View>
                    <Text style={[styles.filterChipName, isSelected && styles.filterChipNameActive]}>
                      {f.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Quick Action Tools Bar */}
            <View style={styles.toolsBar}>
              <TouchableOpacity style={styles.toolBtn}>
                <Ionicons name="crop-outline" size={20} color="#FFFFFF" />
                <Text style={styles.toolLabel}>Crop</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolBtn}>
                <Ionicons name="color-filter-outline" size={20} color="#FFFFFF" />
                <Text style={styles.toolLabel}>Adjust</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolBtn}>
                <Ionicons name="text-outline" size={20} color="#FFFFFF" />
                <Text style={styles.toolLabel}>Text</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolBtn}>
                <Ionicons name="pricetag-outline" size={20} color="#FFFFFF" />
                <Text style={styles.toolLabel}>Stickers</Text>
              </TouchableOpacity>
            </View>

            {/* Retake vs Use Photo */}
            <View style={styles.editFooterBtns}>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => setCurrentView('camera')}
              >
                <Text style={styles.secondaryBtnText}>Retake</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryOrangeBtn, { flex: 1 }]}
                onPress={() => setCurrentView('share-form')}
              >
                <Text style={styles.primaryOrangeBtnText}>Use Photo</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}

      {/* ================================================== */}
      {/* 4. SCREEN 4 — SHARE YOUR MOMENT (FORM)            */}
      {/* ================================================== */}
      {currentView === 'share-form' && (
        <View style={styles.fullScreen}>
          {/* Header */}
          <View style={[styles.headerRow, { paddingTop: Math.max(insets.top, 12) }]}>
            <TouchableOpacity style={styles.backBtn} activeOpacity={0.8} onPress={handleBack}>
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Share Your Moment</Text>
            <TouchableOpacity style={styles.closeBtn} activeOpacity={0.8} onPress={() => router.back()}>
              <Ionicons name="close" size={22} color="#8A8F9B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
            showsVerticalScrollIndicator={false}
          >
            {/* 4:5 Aspect Ratio Preview Snippet */}
            <View style={styles.sharePreviewContainer}>
              {momentType === 'note' ? (
                <View style={styles.shareNoteCard}>
                  <Ionicons name="document-text-outline" size={24} color="#FF6B00" />
                  <Text style={styles.shareNoteText}>{noteContent || 'Travel Note'}</Text>
                </View>
              ) : (
                <View style={styles.shareImageCard}>
                  <Image source={{ uri: selectedMediaUri }} style={styles.shareImageThumb} />
                  <View style={[styles.filterOverlay, { backgroundColor: selectedFilter.tint }]} />
                  {momentType === 'video' && (
                    <View style={styles.videoBadgeOverlay}>
                      <Ionicons name="play" size={16} color="#FFFFFF" />
                      <Text style={styles.videoBadgeText}>0:15</Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* CAPTION INPUT */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Caption</Text>
                <Text style={styles.charCounter}>{caption.length} / 300</Text>
              </View>
              <TextInput
                style={[styles.inputBox, styles.textArea]}
                placeholder="What's on your mind?"
                placeholderTextColor="#6B7280"
                multiline
                maxLength={300}
                value={caption}
                onChangeText={setCaption}
              />
            </View>

            {/* SPOT CONNECTION (PRE-FILLED IF EXPLORING) */}
            <View style={styles.connectionBox}>
              <Text style={styles.connectionLabel}>Location</Text>
              {selectedSpot ? (
                <View style={styles.connectedCard}>
                  <Ionicons name="location-sharp" size={18} color="#FF6B00" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.connectedTitle}>{selectedSpot.name}</Text>
                    <Text style={styles.connectedSub}>{selectedSpot.location}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedSpot(null)}>
                    <Text style={styles.removeLink}>× Remove</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addConnectionBtn}
                  onPress={() => setIsLocationModalVisible(true)}
                >
                  <Ionicons name="add-circle-outline" size={18} color="#FF6B00" />
                  <Text style={styles.addConnectionText}>Add Location</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* ROUTE CONNECTION (PRE-FILLED IF EXPLORING) */}
            <View style={styles.connectionBox}>
              <Text style={styles.connectionLabel}>Route</Text>
              {selectedRoute ? (
                <View style={styles.connectedCard}>
                  <Ionicons name="map" size={18} color="#FF6B00" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.connectedTitle}>{selectedRoute.title}</Text>
                    <Text style={styles.connectedSub}>{selectedRoute.placesCount || 7} places</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedRoute(null)}>
                    <Text style={styles.removeLink}>× Remove</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addConnectionBtn}
                  onPress={() => setIsRouteModalVisible(true)}
                >
                  <Ionicons name="map-outline" size={18} color="#FF6B00" />
                  <Text style={styles.addConnectionText}>Add Route</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* TAGS SECTION */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tags</Text>
              <View style={styles.tagsContainer}>
                {['Sunrise', 'Mountains', 'Nature', 'Waterfall', 'Adventure'].map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <TouchableOpacity
                      key={tag}
                      style={[styles.tagChip, isSelected && styles.tagChipSelected]}
                      onPress={() => toggleTag(tag)}
                    >
                      <Text style={[styles.tagChipText, isSelected && styles.tagChipTextSelected]}>
                        #{tag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* VISIBILITY / PRIVACY SETTINGS */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Who can see this?</Text>
              <Text style={styles.inputSubLabel}>Choose your privacy settings.</Text>

              <View style={{ gap: 10, marginTop: 10 }}>
                {([
                  { id: 'Public', title: '🌐 Public', desc: 'Anyone can see this' },
                  { id: 'Followers', title: '👥 Followers', desc: 'Only your followers can see this' },
                  { id: 'Private', title: '🔒 Private', desc: 'Only you can see this' },
                ] as const).map((opt) => {
                  const isSelected = visibility === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[styles.privacyCard, isSelected && styles.privacyCardSelected]}
                      activeOpacity={0.8}
                      onPress={() => setVisibility(opt.id)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.privacyTitle}>{opt.title}</Text>
                        <Text style={styles.privacyDesc}>{opt.desc}</Text>
                      </View>
                      {isSelected && <Ionicons name="checkmark-circle" size={20} color="#FF6B00" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* TOGGLES: ADD TO STORY & SHARE TO EXPLORE */}
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Add to Story</Text>
                <Text style={styles.toggleSub}>Share this moment to your story.</Text>
              </View>
              <Switch
                value={addToStory}
                onValueChange={setAddToStory}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#FF6B00' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Share to Explore</Text>
                <Text style={styles.toggleSub}>Make this Moment discoverable in Explore.</Text>
              </View>
              <Switch
                value={visibility !== 'Private' && shareToExplore}
                onValueChange={setShareToExplore}
                disabled={visibility === 'Private'}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#FF6B00' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </ScrollView>

          {/* Sticky Bottom Save Action Bar */}
          <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
            <TouchableOpacity
              style={[styles.primaryOrangeBtn, isSaving && styles.btnDisabled]}
              disabled={isSaving}
              activeOpacity={0.85}
              onPress={handleSaveMoment}
            >
              {isSaving ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.primaryOrangeBtnText}>Saving your moment...</Text>
                </View>
              ) : (
                <Text style={styles.primaryOrangeBtnText}>Save Moment</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ================================================== */}
      {/* 5. SUCCESS SCREEN & VIEW MOMENT                   */}
      {/* ================================================== */}
      {currentView === 'success' && (
        <ScrollView contentContainerStyle={styles.successScrollContent}>
          <View style={styles.successIconCircle}>
            <Ionicons name="checkmark" size={42} color="#FFFFFF" />
          </View>
          <Text style={styles.successTitle}>Moment Shared!</Text>
          <Text style={styles.successSubtitle}>Your moment has been shared successfully.</Text>

          {/* 4:5 Moment Preview Card */}
          {createdMomentResult && (
            <View style={styles.momentPreviewCard}>
              <View style={styles.momentHeaderRow}>
                <Image source={{ uri: createdMomentResult.user.avatar }} style={styles.momentUserAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.momentUserName}>{createdMomentResult.user.name}</Text>
                  <Text style={styles.momentTimeAgo}>{createdMomentResult.timeAgo}</Text>
                </View>
              </View>

              {createdMomentResult.mediaUri && (
                <View style={styles.momentImageFrame}>
                  <Image source={{ uri: createdMomentResult.mediaUri }} style={styles.momentImage} />
                </View>
              )}

              <Text style={styles.momentCaption}>{createdMomentResult.caption}</Text>

              {createdMomentResult.spot && (
                <View style={styles.momentBadgeTag}>
                  <Ionicons name="location-sharp" size={12} color="#FF6B00" />
                  <Text style={styles.momentBadgeText}>{createdMomentResult.spot.name}</Text>
                </View>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.successActionColumn}>
            <TouchableOpacity
              style={styles.primaryOrangeBtn}
              onPress={() => setIsMomentDetailModalVisible(true)}
            >
              <Text style={styles.primaryOrangeBtnText}>View Moment</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.secondaryBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* ================================================== */}
      {/* MODAL 1 — SELECT LOCATION / SPOT MODAL            */}
      {/* ================================================== */}
      <Modal visible={isLocationModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Location</Text>
              <TouchableOpacity onPress={() => setIsLocationModalVisible(false)}>
                <Ionicons name="close" size={22} color="#8A8F9B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchBar}>
              <Ionicons name="search-outline" size={18} color="#8A8F9B" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search for a spot or location"
                placeholderTextColor="#6B7280"
                value={locationSearchQuery}
                onChangeText={setLocationSearchQuery}
              />
            </View>

            <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
              {filteredLocationSpots.map((spot) => (
                <TouchableOpacity
                  key={spot.id}
                  style={styles.spotPickerRow}
                  onPress={() => {
                    setSelectedSpot(spot);
                    setIsLocationModalVisible(false);
                  }}
                >
                  <Image source={{ uri: spot.image }} style={styles.spotPickerThumb} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.spotPickerName}>{spot.name}</Text>
                    <Text style={styles.spotPickerLoc}>{spot.location}</Text>
                  </View>
                  {selectedSpot?.id === spot.id && (
                    <Ionicons name="checkmark-circle" size={20} color="#FF6B00" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ================================================== */}
      {/* MODAL 2 — SELECT ROUTE MODAL                      */}
      {/* ================================================== */}
      <Modal visible={isRouteModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Route</Text>
              <TouchableOpacity onPress={() => setIsRouteModalVisible(false)}>
                <Ionicons name="close" size={22} color="#8A8F9B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchBar}>
              <Ionicons name="search-outline" size={18} color="#8A8F9B" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search your routes"
                placeholderTextColor="#6B7280"
                value={routeSearchQuery}
                onChangeText={setRouteSearchQuery}
              />
            </View>

            <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
              {filteredRoutes.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={styles.spotPickerRow}
                  onPress={() => {
                    setSelectedRoute({ id: r.id, title: r.title, placesCount: r.placeCount });
                    setIsRouteModalVisible(false);
                  }}
                >
                  <Ionicons name="map" size={22} color="#FF6B00" style={{ marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.spotPickerName}>{r.title}</Text>
                    <Text style={styles.spotPickerLoc}>{r.placeCount} places • {r.distance}</Text>
                  </View>
                  {selectedRoute?.id === r.id && (
                    <Ionicons name="checkmark-circle" size={20} color="#FF6B00" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => {
                setSelectedRoute(null);
                setIsRouteModalVisible(false);
              }}
            >
              <Text style={styles.secondaryBtnText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================================================== */}
      {/* MODAL 3 — FULL DREAMOUT SOCIAL MOMENT DETAILS     */}
      {/* ================================================== */}
      <Modal visible={isMomentDetailModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.socialModalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Moment Details</Text>
              <TouchableOpacity onPress={() => setIsMomentDetailModalVisible(false)}>
                <Ionicons name="close" size={22} color="#8A8F9B" />
              </TouchableOpacity>
            </View>

            {createdMomentResult && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Social Post Header */}
                <View style={styles.socialHeader}>
                  <Image source={{ uri: createdMomentResult.user.avatar }} style={styles.socialAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.socialName}>{createdMomentResult.user.name}</Text>
                    <Text style={styles.socialTime}>{createdMomentResult.timeAgo}</Text>
                  </View>
                </View>

                {/* 4:5 Media Image */}
                {createdMomentResult.mediaUri && (
                  <View style={styles.social4x5Frame}>
                    <Image source={{ uri: createdMomentResult.mediaUri }} style={styles.socialImage} />
                  </View>
                )}

                {/* Social Action Bar */}
                <View style={styles.socialActionsRow}>
                  <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="heart" size={22} color="#FF6B00" />
                      <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '600' }}>12</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" />
                      <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '600' }}>3</Text>
                    </TouchableOpacity>

                    <TouchableOpacity>
                      <Ionicons name="paper-plane-outline" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity>
                    <Ionicons name="bookmark-outline" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.socialCaption}>{createdMomentResult.caption}</Text>

                {createdMomentResult.spot && (
                  <View style={styles.socialBadgeRow}>
                    <Ionicons name="location-sharp" size={14} color="#FF6B00" />
                    <Text style={styles.socialBadgeText}>{createdMomentResult.spot.name}</Text>
                  </View>
                )}

                {createdMomentResult.route && (
                  <View style={styles.socialBadgeRow}>
                    <Ionicons name="map" size={14} color="#FF6B00" />
                    <Text style={styles.socialBadgeText}>{createdMomentResult.route.title}</Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0B0E' },
  fullScreen: { flex: 1, backgroundColor: '#0A0B0E' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },

  // HEADER
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  screenSubtitle: { color: '#8A8F9B', fontSize: 13, marginBottom: 20 },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextTextBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#FF6B00', borderRadius: 12 },
  nextTextBtnLabel: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

  // ACTIVE JOURNEY BANNER
  activeJourneyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
    borderWidth: 1,
    borderColor: '#FF6B00',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  activeBannerTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  activeBannerSub: { color: '#FF6B00', fontSize: 12, marginTop: 2 },
  activeBadge: { backgroundColor: '#FF6B00', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  activeBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },

  // OPTIONS CARDS
  primaryOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 0, 0.08)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FF6B00',
    padding: 18,
    marginBottom: 14,
  },
  primaryIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 107, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionTextCol: { flex: 1, marginRight: 8 },
  primaryOptionTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  primaryOptionDesc: { color: '#D1D5DB', fontSize: 13, marginTop: 3 },

  secondaryOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12141A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 18,
    marginBottom: 14,
  },
  secondaryIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  secondaryOptionTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secondaryOptionDesc: { color: '#8A8F9B', fontSize: 12, marginTop: 3 },

  // FROM YOUR JOURNEYS
  journeysHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, marginBottom: 12 },
  journeysSectionTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  seeAllText: { color: '#FF6B00', fontSize: 13, fontWeight: '700' },
  journeysScroll: { flexDirection: 'row' },
  journeyCardItem: {
    backgroundColor: '#12141A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 14,
    marginRight: 10,
    width: 120,
  },
  journeyCardIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,107,0,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  journeyCardTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  journeyCardTrips: { color: '#8A8F9B', fontSize: 11, marginTop: 2 },

  // CAMERA SCREEN
  cameraScreenContainer: { flex: 1, backgroundColor: '#000000', position: 'relative' },
  cameraTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  cameraIconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  cameraTopRightActions: { flexDirection: 'row', gap: 12 },

  cameraFrame: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cameraPreviewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  noteCanvas: { flex: 1, width: '90%', justifyContent: 'center', alignItems: 'center', padding: 20 },
  noteCanvasInput: { color: '#FFFFFF', fontSize: 20, fontWeight: '600', textAlign: 'center', width: '100%' },

  cameraBottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center', paddingBottom: 30 },
  modeSwitcherRow: { flexDirection: 'row', gap: 24, marginBottom: 20 },
  modeText: { color: '#8A8F9B', fontSize: 14, fontWeight: '600' },
  modeTextActive: { color: '#FF6B00', fontWeight: '800' },
  shutterRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInnerCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFFFFF' },

  // EDIT PHOTO SCREEN
  editScrollBody: { padding: 20, alignItems: 'center' },
  photoRatioFrame: {
    width: SCREEN_WIDTH - 40,
    height: (SCREEN_WIDTH - 40) * (5 / 4),
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
  },
  photoEditImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  filterOverlay: { ...StyleSheet.absoluteFill },

  filterSectionTitle: { color: '#9CA3AF', fontSize: 13, fontWeight: '600', alignSelf: 'flex-start', marginBottom: 10 },
  filtersScroll: { flexDirection: 'row', marginBottom: 20, width: '100%' },
  filterChipItem: { alignItems: 'center', marginRight: 12 },
  filterThumbBox: { width: 60, height: 60, borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent', position: 'relative' },
  filterThumbActive: { borderColor: '#FF6B00' },
  filterThumbImg: { width: '100%', height: '100%' },
  filterChipName: { color: '#8A8F9B', fontSize: 11, marginTop: 4 },
  filterChipNameActive: { color: '#FF6B00', fontWeight: '700' },

  toolsBar: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', backgroundColor: '#12141A', padding: 14, borderRadius: 16, marginBottom: 20 },
  toolBtn: { alignItems: 'center' },
  toolLabel: { color: '#8A8F9B', fontSize: 11, marginTop: 4 },
  editFooterBtns: { flexDirection: 'row', gap: 12, width: '100%' },

  // SHARE FORM SCREEN
  sharePreviewContainer: { alignItems: 'center', marginBottom: 20 },
  shareImageCard: {
    width: 140,
    height: 175,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  shareImageThumb: { width: '100%', height: '100%' },
  videoBadgeOverlay: { position: 'absolute', bottom: 8, left: 8, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  videoBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  shareNoteCard: { width: '100%', backgroundColor: '#12141A', padding: 18, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  shareNoteText: { color: '#FFFFFF', fontSize: 15, marginTop: 8 },

  inputGroup: { marginBottom: 18 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  inputLabel: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  inputSubLabel: { color: '#8A8F9B', fontSize: 12, marginBottom: 8 },
  charCounter: { color: '#6B7280', fontSize: 12 },
  inputBox: {
    backgroundColor: '#12141A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  textArea: { height: 90, textAlignVertical: 'top' },

  connectionBox: { marginBottom: 16 },
  connectionLabel: { color: '#9CA3AF', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  connectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#12141A',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.3)',
  },
  connectedTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  connectedSub: { color: '#8A8F9B', fontSize: 11, marginTop: 1 },
  removeLink: { color: '#EF4444', fontSize: 12, fontWeight: '600' },
  addConnectionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 107, 0, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.3)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  addConnectionText: { color: '#FF6B00', fontSize: 14, fontWeight: '700' },

  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  tagChip: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tagChipSelected: { backgroundColor: 'rgba(255,107,0,0.15)', borderColor: '#FF6B00' },
  tagChipText: { color: '#8A8F9B', fontSize: 12, fontWeight: '600' },
  tagChipTextSelected: { color: '#FF6B00', fontWeight: '700' },

  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12141A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 14,
  },
  privacyCardSelected: { borderColor: '#FF6B00', backgroundColor: 'rgba(255, 107, 0, 0.08)' },
  privacyTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  privacyDesc: { color: '#8A8F9B', fontSize: 12, marginTop: 2 },

  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  toggleTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  toggleSub: { color: '#8A8F9B', fontSize: 12, marginTop: 2 },

  // BOTTOM STICKY BAR
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#0A0B0E', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 20, paddingTop: 12 },
  primaryOrangeBtn: { backgroundColor: '#FF6B00', borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  primaryOrangeBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  btnDisabled: { opacity: 0.7 },
  secondaryBtn: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  secondaryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  // SUCCESS SCREEN
  successScrollContent: { padding: 24, alignItems: 'center', justifyContent: 'center', minHeight: '80%' },
  successIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FF6B00', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  successTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginBottom: 6 },
  successSubtitle: { color: '#9CA3AF', fontSize: 14, textAlign: 'center', marginBottom: 24 },

  momentPreviewCard: { width: '100%', backgroundColor: '#12141A', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', padding: 16, marginBottom: 24 },
  momentHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  momentUserAvatar: { width: 36, height: 36, borderRadius: 18 },
  momentUserName: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  momentTimeAgo: { color: '#8A8F9B', fontSize: 11 },
  momentImageFrame: { width: '100%', height: 200, borderRadius: 12, overflow: 'hidden', marginBottom: 12 },
  momentImage: { width: '100%', height: '100%' },
  momentCaption: { color: '#FFFFFF', fontSize: 14, lineHeight: 18, marginBottom: 8 },
  momentBadgeTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,107,0,0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  momentBadgeText: { color: '#FF6B00', fontSize: 11, fontWeight: '700' },
  successActionColumn: { width: '100%', gap: 12 },

  // MODALS
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#12141A', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  modalSearchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1D26', borderRadius: 12, paddingHorizontal: 12, height: 44, marginBottom: 16 },
  modalSearchInput: { flex: 1, color: '#FFFFFF', fontSize: 14 },
  spotPickerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  spotPickerThumb: { width: 42, height: 42, borderRadius: 8, marginRight: 12 },
  spotPickerName: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  spotPickerLoc: { color: '#8A8F9B', fontSize: 11, marginTop: 2 },

  // SOCIAL MODAL
  socialModalSheet: { backgroundColor: '#0A0B0E', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%' },
  socialHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  socialAvatar: { width: 40, height: 40, borderRadius: 20 },
  socialName: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  socialTime: { color: '#8A8F9B', fontSize: 11 },
  social4x5Frame: { width: '100%', height: 320, borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
  socialImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  socialActionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  socialCaption: { color: '#FFFFFF', fontSize: 14, lineHeight: 20, marginBottom: 10 },
  socialBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#12141A', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 6 },
  socialBadgeText: { color: '#FF6B00', fontSize: 12, fontWeight: '700' },
});
