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
  Dimensions,
  Pressable,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useRouteStore } from '@/store/useRouteStore';
import { Spot, DetailedRoute } from '@/data/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Preset scenic cover images for route header selection
const PRESET_COVERS = [
  { id: 'c1', name: 'Munnar Tea Hills', url: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80' },
  { id: 'c2', name: 'Kolukkumalai Sunrise', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80' },
  { id: 'c3', name: 'Waterfall Trail Pass', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80' },
  { id: 'c4', name: 'Varkala Coastal Cliff', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80' },
  { id: 'c5', name: 'Wayanad Forest Ridge', url: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=1200&q=80' },
];

const ROUTE_CATEGORIES = [
  'Nature & Mountains',
  'Beaches',
  'Waterfalls',
  'Heritage',
  'Adventure',
  'Food',
  'Culture',
  'Road Trip',
  'Photography',
  'Other',
];

// Search Spots Category Filter Chips
const SPOT_SEARCH_CATEGORIES = [
  'All',
  'Viewpoint',
  'Waterfall',
  'Tea Garden',
  'Lake',
  'Beach',
  'Mountain',
  'Heritage',
  'Nature',
];

type SortOption = 'Most Relevant' | 'Most Popular' | 'Recently Added' | 'Nearest';

export default function CreateRouteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { spots: allSpots, addSpot, addRoute } = useRouteStore();

  // Main Create Route Step: 1 | 2 | 3
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Sub-screen state within Step 2 for Add Place Flow:
  // 'none': Main Step 2 screen
  // 'add-place-options': Screen 1 (Choose Add Place method)
  // 'search-spots': Screen 2 (Search Existing Spots full screen)
  const [addPlaceSubScreen, setAddPlaceSubScreen] = useState<'none' | 'add-place-options' | 'search-spots'>('none');

  // STEP 1 FORM STATE
  const [routeTitle, setRouteTitle] = useState('Munnar Peak Trail');
  const [coverImage, setCoverImage] = useState(PRESET_COVERS[0].url);
  const [shortDescription, setShortDescription] = useState(
    'A scenic journey through tea gardens, waterfalls, and breathtaking viewpoints in Munnar.'
  );
  const [category, setCategory] = useState('Nature & Mountains');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Moderate' | 'Challenging'>('Moderate');
  const [visibility, setVisibility] = useState<'Public' | 'Followers' | 'Private'>('Public');

  // Validation Error States
  const [titleError, setTitleError] = useState<string | null>(null);
  const [descError, setDescError] = useState<string | null>(null);
  const [placesError, setPlacesError] = useState<string | null>(null);

  // STEP 2 SELECTED PLACES STATE
  // Initialized with existing spots matching Munnar Peak Trail prompt example
  const [selectedSpots, setSelectedSpots] = useState<Spot[]>(() => {
    const defaultSpotNames = [
      'Kolukkumalai View Point',
      'Attukal Waterfalls',
      'Tea Gardens Trail',
      'Echo Point',
    ];
    const initial = allSpots.filter((s) => defaultSpotNames.includes(s.name));
    return initial.length > 0 ? initial : allSpots.slice(0, 4);
  });

  // SCREEN 2 — SEARCH SPOTS STATE
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('Most Relevant');
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isSearchingLoading, setIsSearchingLoading] = useState(false);

  // Newly selected spots in the Search Spots screen before tapping "Add to Route"
  const [tempSelectedSpotIds, setTempSelectedSpotIds] = useState<string[]>([]);

  // STEP 3 HIGHLIGHTS STATE
  const [selectedHighlights, setSelectedHighlights] = useState<string[]>([
    'Tea Gardens',
    'Scenic Viewpoints',
    'Waterfalls',
    'Misty Valleys',
  ]);

  // PUBLISHING & SUCCESS STATE
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedRoute, setPublishedRoute] = useState<DetailedRoute | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // MODALS STATE
  const [isCoverModalVisible, setIsCoverModalVisible] = useState(false);
  const [customCoverUrlInput, setCustomCoverUrlInput] = useState('');

  const [isCreateSpotModalVisible, setIsCreateSpotModalVisible] = useState(false);
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [previewSpot, setPreviewSpot] = useState<Spot | null>(null);
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  // New Spot Form Inputs
  const [newSpotName, setNewSpotName] = useState('');
  const [newSpotCategory, setNewSpotCategory] = useState('Nature & Mountains');
  const [newSpotLocation, setNewSpotLocation] = useState('Munnar, Idukki');
  const [newSpotDescription, setNewSpotDescription] = useState('');

  // Handle Category Switch in Search Spots with loading simulation
  const handleCategoryFilterSelect = (cat: string) => {
    setActiveCategoryFilter(cat);
    setIsSearchingLoading(true);
    setTimeout(() => setIsSearchingLoading(false), 300);
  };

  // Handle Search Input Change with loading simulation
  const handleSearchInputChange = (text: string) => {
    setSearchQuery(text);
    if (!isSearchingLoading) {
      setIsSearchingLoading(true);
      setTimeout(() => setIsSearchingLoading(false), 350);
    }
  };

  // Filtered Search Results
  const searchResults = useMemo(() => {
    return allSpots.filter((spot) => {
      // Category filter
      if (activeCategoryFilter !== 'All') {
        const catMatch =
          spot.category.toLowerCase().includes(activeCategoryFilter.toLowerCase()) ||
          (spot.tags && spot.tags.some((t) => t.toLowerCase().includes(activeCategoryFilter.toLowerCase())));
        if (!catMatch) return false;
      }

      // Query filter
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = spot.name.toLowerCase().includes(q);
        const locMatch = spot.location.toLowerCase().includes(q);
        const catMatch = spot.category.toLowerCase().includes(q);
        const tagMatch = spot.tags && spot.tags.some((t) => t.toLowerCase().includes(q));
        return nameMatch || locMatch || catMatch || tagMatch;
      }

      return true;
    });
  }, [allSpots, activeCategoryFilter, searchQuery]);

  // Handle Back Navigation
  const handleBack = () => {
    if (isSuccess) {
      router.back();
      return;
    }

    if (addPlaceSubScreen === 'search-spots') {
      setAddPlaceSubScreen('add-place-options');
      return;
    }

    if (addPlaceSubScreen === 'add-place-options') {
      setAddPlaceSubScreen('none');
      return;
    }

    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as any);
    } else {
      router.back();
    }
  };

  // STEP 1 VALIDATION & PROCEED TO STEP 2
  const handleNextStep1 = () => {
    let hasErr = false;

    if (!routeTitle.trim()) {
      setTitleError('Route title is required.');
      hasErr = true;
    } else {
      setTitleError(null);
    }

    if (!shortDescription.trim()) {
      setDescError('Short description is required.');
      hasErr = true;
    } else {
      setDescError(null);
    }

    if (!hasErr) {
      setCurrentStep(2);
    }
  };

  // STEP 2 VALIDATION & PROCEED TO STEP 3
  const handleNextStep2 = () => {
    if (selectedSpots.length < 2) {
      setPlacesError('Add at least 2 places to create a route.');
      return;
    }
    setPlacesError(null);
    setCurrentStep(3);
  };

  // Toggle selection of spot in Search Spots screen
  const handleToggleSpotSelectionInSearch = (spot: Spot) => {
    // Check if already in main route
    const isAlreadyInRoute = selectedSpots.some((s) => s.id === spot.id);
    if (isAlreadyInRoute) return;

    if (tempSelectedSpotIds.includes(spot.id)) {
      setTempSelectedSpotIds((prev) => prev.filter((id) => id !== spot.id));
    } else {
      setTempSelectedSpotIds((prev) => [...prev, spot.id]);
    }
  };

  // Confirm Selection and Add to Route
  const handleConfirmAddToRoute = () => {
    const newlySelectedSpots = allSpots.filter((s) => tempSelectedSpotIds.includes(s.id));

    // Combine existing route spots + newly selected spots without duplication
    setSelectedSpots((prev) => {
      const existingIds = new Set(prev.map((s) => s.id));
      const filteredNew = newlySelectedSpots.filter((s) => !existingIds.has(s.id));
      return [...prev, ...filteredNew];
    });

    setTempSelectedSpotIds([]);
    setAddPlaceSubScreen('none');
    setPlacesError(null);
  };

  const handleRemoveSpotFromRoute = (spotId: string) => {
    setSelectedSpots((prev) => prev.filter((s) => s.id !== spotId));
  };

  const handleMoveSpotUp = (index: number) => {
    if (index <= 0) return;
    setSelectedSpots((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy;
    });
  };

  const handleMoveSpotDown = (index: number) => {
    if (index >= selectedSpots.length - 1) return;
    setSelectedSpots((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy;
    });
  };

  // CREATE NEW SPOT AND AUTOMATICALLY ATTACH TO ROUTE
  const handleCreateAndAttachNewSpot = () => {
    if (!newSpotName.trim()) return;

    const createdSpot = addSpot({
      name: newSpotName.trim(),
      category: newSpotCategory,
      location: newSpotLocation,
      description: newSpotDescription,
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    });

    // Automatically add newly created Spot to the Route sequence
    setSelectedSpots((prev) => [...prev, createdSpot]);
    setPlacesError(null);

    // Reset and return to Step 2
    setNewSpotName('');
    setNewSpotDescription('');
    setIsCreateSpotModalVisible(false);
    setAddPlaceSubScreen('none');
  };

  // PUBLISH ROUTE ACTION
  const handlePublishRoute = () => {
    if (selectedSpots.length < 2) {
      setPlacesError('Please add at least 2 places to your route.');
      setCurrentStep(2);
      return;
    }

    setIsPublishing(true);

    setTimeout(() => {
      const createdRoute = addRoute({
        title: routeTitle.trim(),
        coverImage,
        shortDescription: shortDescription.trim(),
        category,
        difficulty,
        visibility,
        places: selectedSpots,
        highlights: selectedHighlights,
      });

      setPublishedRoute(createdRoute);
      setIsPublishing(false);
      setIsSuccess(true);
    }, 1200);
  };

  // Total count of places selected (existing route spots + newly checked in search)
  const totalCombinedSelectedCount = useMemo(() => {
    const newlyChecked = tempSelectedSpotIds.filter(
      (id) => !selectedSpots.some((s) => s.id === id)
    );
    return selectedSpots.length + newlyChecked.length;
  }, [selectedSpots, tempSelectedSpotIds]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0B0E" />

      {/* ================================================== */}
      {/* 1. SCREEN 1 — ADD PLACE OPTIONS                    */}
      {/* ================================================== */}
      {addPlaceSubScreen === 'add-place-options' && (
        <View style={styles.fullSubScreen}>
          {/* Header */}
          <View style={[styles.subHeaderRow, { paddingTop: Math.max(insets.top, 12) }]}>
            <TouchableOpacity style={styles.backBtn} activeOpacity={0.8} onPress={handleBack}>
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.subHeaderTitle}>Add Place</Text>
            <View style={{ width: 38 }} />
          </View>

          <ScrollView contentContainerStyle={styles.subScreenContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.subScreenHeading}>Choose how you want to add a place to your route.</Text>

            {/* Option 1: Search Existing Spots (PRIMARY ORANGE OPTION) */}
            <TouchableOpacity
              style={styles.primaryOptionCard}
              activeOpacity={0.85}
              onPress={() => setAddPlaceSubScreen('search-spots')}
            >
              <View style={styles.primaryOptionIconCircle}>
                <Ionicons name="search" size={26} color="#FF6B00" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.primaryOptionTitle}>Search Existing Spots</Text>
                <Text style={styles.primaryOptionDesc}>
                  Find and add existing places from DreamOut.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#FF6B00" />
            </TouchableOpacity>

            {/* Option 2: Add from Map */}
            <TouchableOpacity
              style={styles.secondaryOptionCard}
              activeOpacity={0.85}
              onPress={() => setIsMapModalVisible(true)}
            >
              <View style={styles.secondaryOptionIconCircle}>
                <Ionicons name="map-outline" size={24} color="#8A8F9B" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.secondaryOptionTitle}>Add from Map</Text>
                <Text style={styles.secondaryOptionDesc}>
                  Explore the map and select nearby spots.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8A8F9B" />
            </TouchableOpacity>

            {/* Option 3: Create New Spot */}
            <TouchableOpacity
              style={styles.secondaryOptionCard}
              activeOpacity={0.85}
              onPress={() => setIsCreateSpotModalVisible(true)}
            >
              <View style={styles.secondaryOptionIconCircle}>
                <Ionicons name="add-circle-outline" size={24} color="#8A8F9B" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.secondaryOptionTitle}>Create New Spot</Text>
                <Text style={styles.secondaryOptionDesc}>
                  Can't find the place? Create a new spot and add it to your route.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8A8F9B" />
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* ================================================== */}
      {/* 2. SCREEN 2 — SEARCH EXISTING SPOTS                */}
      {/* ================================================== */}
      {addPlaceSubScreen === 'search-spots' && (
        <View style={styles.fullSubScreen}>
          {/* Header */}
          <View style={[styles.subHeaderRow, { paddingTop: Math.max(insets.top, 12) }]}>
            <TouchableOpacity style={styles.backBtn} activeOpacity={0.8} onPress={handleBack}>
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.subHeaderTitle}>Search Spots</Text>
              <Text style={styles.subHeaderSub}>Find amazing places to add to your route.</Text>
            </View>
          </View>

          {/* Search Bar & Filter Button Row */}
          <View style={styles.searchBarRow}>
            <View style={[styles.largeSearchBar, isSearchFocused && styles.largeSearchBarFocused]}>
              <Ionicons name="search-outline" size={20} color={isSearchFocused ? '#FF6B00' : '#8A8F9B'} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.largeSearchInput}
                placeholder="Search places..."
                placeholderTextColor="#6B7280"
                value={searchQuery}
                onChangeText={handleSearchInputChange}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color="#8A8F9B" />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={styles.filterTuneBtn}
              activeOpacity={0.8}
              onPress={() => setIsFilterModalVisible(true)}
            >
              <Ionicons name="options-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Horizontally Scrollable Category Filters */}
          <View style={styles.categoryScrollContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
              {SPOT_SEARCH_CATEGORIES.map((cat) => {
                const isActive = activeCategoryFilter === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catPill, isActive && styles.catPillActive]}
                    activeOpacity={0.8}
                    onPress={() => handleCategoryFilterSelect(cat)}
                  >
                    <Text style={[styles.catPillText, isActive && styles.catPillTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Search Result Count & Sort Dropdown Header */}
          <View style={styles.resultCountRow}>
            <Text style={styles.resultCountText}>
              {searchResults.length} spot{searchResults.length !== 1 ? 's' : ''} found
            </Text>

            <TouchableOpacity
              style={styles.sortDropdownBtn}
              activeOpacity={0.7}
              onPress={() => setIsSortModalVisible(true)}
            >
              <Text style={styles.sortDropdownText}>Sort: {sortBy}</Text>
              <Ionicons name="chevron-down" size={14} color="#8A8F9B" />
            </TouchableOpacity>
          </View>

          {/* Main Results Scrollable Body */}
          <ScrollView
            contentContainerStyle={[styles.searchScrollBody, { paddingBottom: 100 }]}
            showsVerticalScrollIndicator={false}
          >
            {/* Loading Skeleton Cards State */}
            {isSearchingLoading ? (
              <View style={{ gap: 12 }}>
                {[1, 2, 3].map((key) => (
                  <View key={key} style={styles.skeletonCard}>
                    <View style={styles.skeletonThumb} />
                    <View style={{ flex: 1, gap: 6 }}>
                      <View style={styles.skeletonLine1} />
                      <View style={styles.skeletonLine2} />
                      <View style={styles.skeletonLine3} />
                    </View>
                  </View>
                ))}
              </View>
            ) : searchResults.length === 0 ? (
              /* No Results Empty State */
              <View style={styles.noResultsBoxLarge}>
                <Ionicons name="search-outline" size={44} color="#8A8F9B" />
                <Text style={styles.noResultsHeading}>No spots found</Text>
                <Text style={styles.noResultsSubText}>
                  Try another search or create a new Spot.
                </Text>
                <TouchableOpacity
                  style={styles.primaryOrangeBtnSmall}
                  onPress={() => setIsCreateSpotModalVisible(true)}
                >
                  <Ionicons name="add" size={18} color="#FFFFFF" />
                  <Text style={styles.primaryOrangeBtnSmallText}>Create New Spot</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Empty Query Initial State Header */
              searchQuery.trim().length === 0 && activeCategoryFilter === 'All' && (
                <View style={styles.discoverHeaderBox}>
                  <Text style={styles.discoverTitle}>Discover Places</Text>
                  <Text style={styles.discoverSub}>
                    Search for a place, viewpoint, waterfall, beach, trail, or other interesting Spot to add to your route.
                  </Text>
                </View>
              )
            )}

            {/* Horizontal Spot Result Cards */}
            {!isSearchingLoading &&
              searchResults.map((spot) => {
                const isAlreadyInRoute = selectedSpots.some((s) => s.id === spot.id);
                const isCheckedInSearch = tempSelectedSpotIds.includes(spot.id);
                const isSelected = isAlreadyInRoute || isCheckedInSearch;

                return (
                  <TouchableOpacity
                    key={spot.id}
                    style={[
                      styles.spotCardHorizontal,
                      isSelected && styles.spotCardSelectedState,
                    ]}
                    activeOpacity={0.85}
                    onPress={() => setPreviewSpot(spot)}
                  >
                    {/* Thumbnail Image */}
                    <Image source={{ uri: spot.image }} style={styles.spotCardImage} />

                    {/* Spot Details */}
                    <View style={styles.spotCardDetails}>
                      <Text style={styles.spotCardName} numberOfLines={1}>
                        {spot.name}
                      </Text>
                      <View style={styles.locationRow}>
                        <Ionicons name="location-sharp" size={12} color="#FF6B00" />
                        <Text style={styles.spotCardLocation} numberOfLines={1}>
                          {spot.location}
                        </Text>
                      </View>

                      {/* Category & Secondary Tag Badges */}
                      <View style={styles.tagBadgeRow}>
                        <View style={styles.tagBadgePrimary}>
                          <Text style={styles.tagBadgePrimaryText}>{spot.category}</Text>
                        </View>
                        {spot.tags && spot.tags[1] && (
                          <View style={styles.tagBadgeSecondary}>
                            <Text style={styles.tagBadgeSecondaryText}>{spot.tags[1]}</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Add / Selected Checkbox Action Button */}
                    {isAlreadyInRoute ? (
                      <View style={styles.addedAlreadyBadge}>
                        <Ionicons name="checkmark" size={12} color="#10B981" />
                        <Text style={styles.addedAlreadyText}>Added</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[
                          styles.addCheckBtn,
                          isCheckedInSearch && styles.addCheckBtnChecked,
                        ]}
                        activeOpacity={0.8}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleToggleSpotSelectionInSearch(spot);
                        }}
                      >
                        <Ionicons
                          name={isCheckedInSearch ? 'checkmark' : 'add'}
                          size={20}
                          color="#FFFFFF"
                        />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                );
              })}
          </ScrollView>

          {/* Sticky Bottom Selection Bar */}
          <View style={[styles.stickyBottomSelectionBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
            <View style={styles.stickyBarTextCol}>
              <Text style={styles.stickyBarCountText}>
                {totalCombinedSelectedCount} place{totalCombinedSelectedCount !== 1 ? 's' : ''} selected
              </Text>

              {totalCombinedSelectedCount < 2 ? (
                <Text style={styles.stickyBarHintText}>
                  Add {2 - totalCombinedSelectedCount} more place{2 - totalCombinedSelectedCount > 1 ? 's' : ''} to continue
                </Text>
              ) : (
                <Text style={styles.stickyBarReadyText}>Ready to build your route</Text>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.primaryOrangeBtnSticky,
                totalCombinedSelectedCount < 2 && styles.stickyBtnDisabled,
              ]}
              disabled={totalCombinedSelectedCount < 2}
              activeOpacity={0.85}
              onPress={handleConfirmAddToRoute}
            >
              <Text style={styles.primaryOrangeBtnStickyText}>Add to Route</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ================================================== */}
      {/* MAIN CREATE ROUTE FLOW (STEP 1, 2, 3)             */}
      {/* ================================================== */}
      {addPlaceSubScreen === 'none' && (
        <>
          {/* Header with 3-Step Progress Indicator */}
          <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 12) }]}>
            <View style={styles.headerTopRow}>
              <TouchableOpacity style={styles.backBtn} activeOpacity={0.8} onPress={handleBack}>
                <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Create Route</Text>
              <TouchableOpacity style={styles.closeBtn} activeOpacity={0.8} onPress={() => router.back()}>
                <Ionicons name="close" size={22} color="#8A8F9B" />
              </TouchableOpacity>
            </View>

            {/* 3-Step Progress Bar */}
            {!isSuccess && (
              <View style={styles.progressContainer}>
                {/* Step 1 Indicator */}
                <View style={styles.stepItem}>
                  <View style={[styles.stepDot, currentStep >= 1 && styles.stepDotActive]}>
                    {currentStep > 1 ? (
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    ) : (
                      <Text style={styles.stepDotText}>1</Text>
                    )}
                  </View>
                  <Text style={[styles.stepLabel, currentStep >= 1 && styles.stepLabelActive]}>
                    Details
                  </Text>
                </View>

                <View style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]} />

                {/* Step 2 Indicator */}
                <View style={styles.stepItem}>
                  <View style={[styles.stepDot, currentStep >= 2 && styles.stepDotActive]}>
                    {currentStep > 2 ? (
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    ) : (
                      <Text style={styles.stepDotText}>2</Text>
                    )}
                  </View>
                  <Text style={[styles.stepLabel, currentStep >= 2 && styles.stepLabelActive]}>
                    Add Places
                  </Text>
                </View>

                <View style={[styles.stepLine, currentStep >= 3 && styles.stepLineActive]} />

                {/* Step 3 Indicator */}
                <View style={styles.stepItem}>
                  <View style={[styles.stepDot, currentStep >= 3 && styles.stepDotActive]}>
                    <Text style={styles.stepDotText}>3</Text>
                  </View>
                  <Text style={[styles.stepLabel, currentStep >= 3 && styles.stepLabelActive]}>
                    Review
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* MAIN SCREEN BODY */}
          {!isSuccess ? (
            <ScrollView
              contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* STEP 1 — ROUTE DETAILS */}
              {currentStep === 1 && (
                <View>
                  <Text style={styles.sectionTitle}>Basic Information</Text>
                  <Text style={styles.sectionSubtitle}>Give your route a name and tell us about it.</Text>

                  {/* COVER IMAGE DISPLAY */}
                  <View style={styles.coverCard}>
                    <Image source={{ uri: coverImage }} style={styles.coverImage} resizeMode="cover" />
                    <LinearGradient
                      colors={['transparent', 'rgba(10,11,14,0.85)']}
                      style={styles.coverGradient}
                    />
                    <TouchableOpacity
                      style={styles.changeCoverBtn}
                      activeOpacity={0.8}
                      onPress={() => setIsCoverModalVisible(true)}
                    >
                      <Ionicons name="camera-outline" size={18} color="#FFFFFF" />
                      <Text style={styles.changeCoverBtnText}>Change Cover</Text>
                    </TouchableOpacity>
                  </View>

                  {/* ROUTE TITLE INPUT */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                      Route Title <Text style={styles.requiredAsterisk}>*</Text>
                    </Text>
                    <TextInput
                      style={[styles.inputBox, titleError ? styles.inputErrorBorder : null]}
                      placeholder="e.g. Munnar Peak Trail"
                      placeholderTextColor="#6B7280"
                      value={routeTitle}
                      onChangeText={(val) => {
                        setRouteTitle(val);
                        if (val.trim()) setTitleError(null);
                      }}
                    />
                    {titleError && <Text style={styles.errorText}>{titleError}</Text>}
                  </View>

                  {/* SHORT DESCRIPTION TEXTAREA */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Text style={styles.inputLabel}>
                        Short Description <Text style={styles.requiredAsterisk}>*</Text>
                      </Text>
                      <Text style={styles.charCounter}>{shortDescription.length} / 300</Text>
                    </View>
                    <TextInput
                      style={[
                        styles.inputBox,
                        styles.textArea,
                        descError ? styles.inputErrorBorder : null,
                      ]}
                      placeholder="A scenic journey through tea gardens, waterfalls, and breathtaking viewpoints in Munnar."
                      placeholderTextColor="#6B7280"
                      multiline
                      numberOfLines={4}
                      maxLength={300}
                      value={shortDescription}
                      onChangeText={(val) => {
                        setShortDescription(val);
                        if (val.trim()) setDescError(null);
                      }}
                    />
                    {descError && <Text style={styles.errorText}>{descError}</Text>}
                  </View>

                  {/* CATEGORY SELECTOR */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Category</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll}>
                      {ROUTE_CATEGORIES.map((cat) => {
                        const isSelected = category === cat;
                        return (
                          <TouchableOpacity
                            key={cat}
                            style={[styles.pillItem, isSelected && styles.pillItemActive]}
                            activeOpacity={0.8}
                            onPress={() => setCategory(cat)}
                          >
                            <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                              {cat}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  {/* DIFFICULTY LEVEL */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Difficulty Level</Text>
                    <View style={styles.segmentedRow}>
                      {(['Easy', 'Moderate', 'Challenging'] as const).map((level) => {
                        const isSelected = difficulty === level;
                        return (
                          <TouchableOpacity
                            key={level}
                            style={[styles.segmentBtn, isSelected && styles.segmentBtnActive]}
                            activeOpacity={0.8}
                            onPress={() => setDifficulty(level)}
                          >
                            <Text style={[styles.segmentText, isSelected && styles.segmentTextActive]}>
                              {level}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* VISIBILITY */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Visibility</Text>
                    <View style={styles.segmentedRow}>
                      {(['Public', 'Followers', 'Private'] as const).map((vis) => {
                        const isSelected = visibility === vis;
                        return (
                          <TouchableOpacity
                            key={vis}
                            style={[styles.segmentBtn, isSelected && styles.segmentBtnActive]}
                            activeOpacity={0.8}
                            onPress={() => setVisibility(vis)}
                          >
                            <Text style={[styles.segmentText, isSelected && styles.segmentTextActive]}>
                              {vis === 'Public' ? '🌐 Public' : vis === 'Followers' ? '👥 Followers' : '🔒 Private'}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>
              )}

              {/* STEP 2 — ADD PLACES */}
              {currentStep === 2 && (
                <View>
                  <Text style={styles.sectionTitle}>Add Places</Text>
                  <Text style={styles.sectionSubtitle}>
                    Choose the places you want to include in this route.
                  </Text>

                  {placesError && (
                    <View style={styles.warningBanner}>
                      <Ionicons name="warning-outline" size={18} color="#FF6B00" />
                      <Text style={styles.warningText}>{placesError}</Text>
                    </View>
                  )}

                  {/* SELECTED PLACES SEQUENCED LIST */}
                  <View style={styles.selectedSectionHeader}>
                    <Text style={styles.selectedTitle}>Places in your route</Text>
                    <Text style={styles.selectedCountBadge}>{selectedSpots.length} Places</Text>
                  </View>

                  {selectedSpots.length === 0 ? (
                    <View style={styles.emptyPlacesCard}>
                      <Ionicons name="map-outline" size={36} color="#8A8F9B" />
                      <Text style={styles.emptyPlacesTitle}>No places added yet</Text>
                      <Text style={styles.emptyPlacesSub}>
                        Tap "+ Add Place" to search existing spots or create a new place.
                      </Text>
                    </View>
                  ) : (
                    selectedSpots.map((spot, index) => (
                      <TouchableOpacity
                        key={spot.id}
                        style={styles.spotRowCard}
                        activeOpacity={0.85}
                        onPress={() => setPreviewSpot(spot)}
                      >
                        {/* Order Number Circle */}
                        <View style={styles.orderCircle}>
                          <Text style={styles.orderNumber}>{index + 1}</Text>
                        </View>

                        {/* Spot Image */}
                        <Image source={{ uri: spot.image }} style={styles.spotRowThumb} />

                        {/* Spot Info */}
                        <View style={styles.spotRowDetails}>
                          <Text style={styles.spotRowName} numberOfLines={1}>
                            {spot.name}
                          </Text>
                          <Text style={styles.spotRowMeta} numberOfLines={1}>
                            {spot.category} • {spot.location}
                          </Text>
                        </View>

                        {/* Reorder Buttons & Delete */}
                        <View style={styles.spotRowActions}>
                          <TouchableOpacity
                            style={styles.reorderBtn}
                            disabled={index === 0}
                            onPress={() => handleMoveSpotUp(index)}
                          >
                            <Ionicons
                              name="chevron-up"
                              size={16}
                              color={index === 0 ? 'rgba(255,255,255,0.2)' : '#FFFFFF'}
                            />
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.reorderBtn}
                            disabled={index === selectedSpots.length - 1}
                            onPress={() => handleMoveSpotDown(index)}
                          >
                            <Ionicons
                              name="chevron-down"
                              size={16}
                              color={
                                index === selectedSpots.length - 1 ? 'rgba(255,255,255,0.2)' : '#FFFFFF'
                              }
                            />
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.removeBtn}
                            onPress={() => handleRemoveSpotFromRoute(spot.id)}
                          >
                            <Ionicons name="trash-outline" size={16} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    ))
                  )}

                  {/* ACTION BUTTON: + Add Place */}
                  <View style={styles.addPlacesActionRow}>
                    <TouchableOpacity
                      style={styles.actionOutlineBtnPrimary}
                      activeOpacity={0.8}
                      onPress={() => setAddPlaceSubScreen('add-place-options')}
                    >
                      <Ionicons name="add-circle" size={22} color="#FF6B00" />
                      <Text style={styles.actionOutlineTextPrimary}>+ Add Place</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionOutlineBtn}
                      activeOpacity={0.8}
                      onPress={() => setIsMapModalVisible(true)}
                    >
                      <Ionicons name="map-outline" size={20} color="#8A8F9B" />
                      <Text style={styles.actionOutlineText}>Add from Map</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* STEP 3 — REVIEW */}
              {currentStep === 3 && (
                <View>
                  <Text style={styles.sectionTitle}>Review Your Route</Text>
                  <Text style={styles.sectionSubtitle}>Check your route before publishing.</Text>

                  {/* COMPACT ROUTE PREVIEW HERO */}
                  <View style={styles.reviewHeroCard}>
                    <Image source={{ uri: coverImage }} style={styles.reviewHeroImage} />
                    <LinearGradient
                      colors={['transparent', 'rgba(10,11,14,0.92)']}
                      style={styles.reviewGradient}
                    />
                    <View style={styles.reviewHeroBadgeRow}>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>{category}</Text>
                      </View>
                      <View style={styles.difficultyBadge}>
                        <Text style={styles.difficultyBadgeText}>{difficulty}</Text>
                      </View>
                    </View>

                    <View style={styles.reviewHeroContent}>
                      <Text style={styles.reviewRouteTitle}>{routeTitle}</Text>
                      <Text style={styles.reviewLocation}>Munnar, Idukki</Text>

                      {/* Metrics Row */}
                      <View style={styles.metricsRow}>
                        <View style={styles.metricItem}>
                          <Ionicons name="location" size={15} color="#FF6B00" />
                          <Text style={styles.metricText}>{selectedSpots.length} Places</Text>
                        </View>
                        <View style={styles.metricDivider} />
                        <View style={styles.metricItem}>
                          <Ionicons name="navigate" size={15} color="#FF6B00" />
                          <Text style={styles.metricText}>~{Math.max(4, selectedSpots.length * 2)} km</Text>
                        </View>
                        <View style={styles.metricDivider} />
                        <View style={styles.metricItem}>
                          <Ionicons name="time" size={15} color="#FF6B00" />
                          <Text style={styles.metricText}>4–6 hours</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* SHORT DESCRIPTION PREVIEW */}
                  <View style={styles.reviewBox}>
                    <Text style={styles.reviewBoxTitle}>Description</Text>
                    <Text style={styles.reviewBoxDesc}>{shortDescription}</Text>
                  </View>

                  {/* PLACES IN THIS ROUTE */}
                  <View style={styles.reviewBox}>
                    <View style={styles.reviewBoxHeaderRow}>
                      <Text style={styles.reviewBoxTitle}>Places in this route</Text>
                      <TouchableOpacity onPress={() => setCurrentStep(2)}>
                        <Text style={styles.editOrderLink}>Edit Order</Text>
                      </TouchableOpacity>
                    </View>

                    {selectedSpots.map((spot, index) => (
                      <View key={spot.id} style={styles.reviewPlaceRow}>
                        <Text style={styles.reviewPlaceNum}>{index + 1}.</Text>
                        <Image source={{ uri: spot.image }} style={styles.reviewPlaceThumb} />
                        <View style={styles.reviewPlaceText}>
                          <Text style={styles.reviewPlaceName}>{spot.name}</Text>
                          <Text style={styles.reviewPlaceMeta}>
                            {spot.category} • {spot.location}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* ROUTE HIGHLIGHTS */}
                  <View style={styles.reviewBox}>
                    <Text style={styles.reviewBoxTitle}>Route Highlights</Text>
                    <Text style={styles.reviewBoxSubtitle}>
                      Highlights featured on your route.
                    </Text>
                    <View style={styles.highlightsContainer}>
                      {[
                        'Tea Gardens',
                        'Scenic Viewpoints',
                        'Waterfalls',
                        'Misty Valleys',
                      ].map((hl) => (
                        <View key={hl} style={[styles.hlChip, styles.hlChipSelected]}>
                          <Ionicons name="checkmark-circle" size={16} color="#FF6B00" />
                          <Text style={[styles.hlChipText, styles.hlChipTextSelected]}>{hl}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
          ) : (
            /* SUCCESS SCREEN */
            <ScrollView contentContainerStyle={styles.successScrollContent}>
              <View style={styles.successIconCircle}>
                <Ionicons name="checkmark" size={42} color="#FFFFFF" />
              </View>
              <Text style={styles.successTitle}>Route Created!</Text>
              <Text style={styles.successSubtitle}>Your route has been published successfully.</Text>

              {/* PUBLISHED ROUTE PREVIEW CARD */}
              {publishedRoute && (
                <View style={styles.publishedCard}>
                  <Image source={{ uri: publishedRoute.coverImage }} style={styles.publishedCardImage} />
                  <View style={styles.publishedCardBody}>
                    <Text style={styles.publishedCardTitle}>{publishedRoute.title}</Text>
                    <Text style={styles.publishedCardMeta}>
                      {publishedRoute.placeCount} Places • {publishedRoute.distance} • {publishedRoute.duration}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.successActionColumn}>
                <TouchableOpacity
                  style={styles.primaryOrangeBtn}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (publishedRoute) {
                      router.push(`/route/${publishedRoute.id}` as any);
                    }
                  }}
                >
                  <Text style={styles.primaryOrangeBtnText}>View Route</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryBtn}
                  activeOpacity={0.8}
                  onPress={() => setIsShareModalVisible(true)}
                >
                  <Ionicons name="share-social-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.secondaryBtnText}>Share Route</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}

          {/* BOTTOM STICKY PRIMARY ACTION BAR */}
          {!isSuccess && (
            <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
              {currentStep === 1 && (
                <TouchableOpacity
                  style={styles.primaryOrangeBtn}
                  activeOpacity={0.85}
                  onPress={handleNextStep1}
                >
                  <Text style={styles.primaryOrangeBtnText}>Next →</Text>
                </TouchableOpacity>
              )}

              {currentStep === 2 && (
                <View style={styles.step2BottomRow}>
                  <TouchableOpacity
                    style={styles.bottomAddBtn}
                    onPress={() => setAddPlaceSubScreen('add-place-options')}
                  >
                    <Text style={styles.bottomAddBtnText}>+ Add Place</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.primaryOrangeBtn, { flex: 1 }]}
                    activeOpacity={0.85}
                    onPress={handleNextStep2}
                  >
                    <Text style={styles.primaryOrangeBtnText}>Next →</Text>
                  </TouchableOpacity>
                </View>
              )}

              {currentStep === 3 && (
                <TouchableOpacity
                  style={[styles.primaryOrangeBtn, isPublishing && styles.btnDisabled]}
                  disabled={isPublishing}
                  activeOpacity={0.85}
                  onPress={handlePublishRoute}
                >
                  {isPublishing ? (
                    <View style={styles.publishingRow}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text style={styles.primaryOrangeBtnText}>Publishing route...</Text>
                    </View>
                  ) : (
                    <Text style={styles.primaryOrangeBtnText}>Publish Route</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}
        </>
      )}

      {/* ================================================== */}
      {/* MODAL — COVER IMAGE SELECTOR                       */}
      {/* ================================================== */}
      <Modal visible={isCoverModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Route Cover</Text>
              <TouchableOpacity onPress={() => setIsCoverModalVisible(false)}>
                <Ionicons name="close" size={22} color="#8A8F9B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false}>
              {PRESET_COVERS.map((preset) => (
                <TouchableOpacity
                  key={preset.id}
                  style={styles.presetOptionRow}
                  onPress={() => {
                    setCoverImage(preset.url);
                    setIsCoverModalVisible(false);
                  }}
                >
                  <Image source={{ uri: preset.url }} style={styles.presetThumb} />
                  <Text style={styles.presetName}>{preset.name}</Text>
                  {coverImage === preset.url && (
                    <Ionicons name="checkmark-circle" size={20} color="#FF6B00" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ================================================== */}
      {/* MODAL — CREATE NEW SPOT FLOW                      */}
      {/* ================================================== */}
      <Modal visible={isCreateSpotModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Spot</Text>
              <TouchableOpacity onPress={() => setIsCreateSpotModalVisible(false)}>
                <Ionicons name="close" size={22} color="#8A8F9B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitleText}>
              Add a new place to DreamOut. It will be added directly to your route.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Spot Name *</Text>
              <TextInput
                style={styles.inputBox}
                placeholder="e.g. Mattupetty Dam"
                placeholderTextColor="#6B7280"
                value={newSpotName}
                onChangeText={setNewSpotName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.inputBox}
                placeholder="e.g. Munnar, Idukki"
                placeholderTextColor="#6B7280"
                value={newSpotLocation}
                onChangeText={setNewSpotLocation}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <TextInput
                style={styles.inputBox}
                placeholder="e.g. Viewpoint"
                placeholderTextColor="#6B7280"
                value={newSpotCategory}
                onChangeText={setNewSpotCategory}
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryOrangeBtn, !newSpotName.trim() && { opacity: 0.5 }]}
              disabled={!newSpotName.trim()}
              onPress={handleCreateAndAttachNewSpot}
            >
              <Text style={styles.primaryOrangeBtnText}>Save & Add to Route</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================================================== */}
      {/* MODAL — INTERACTIVE MAP EXPLORER                  */}
      {/* ================================================== */}
      <Modal visible={isMapModalVisible} transparent animationType="fade">
        <View style={styles.mapModalContainer}>
          <View style={styles.mapHeaderRow}>
            <Text style={styles.mapHeaderTitle}>Select Spot from Map</Text>
            <TouchableOpacity onPress={() => setIsMapModalVisible(false)}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.simulatedMapArea}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80',
              }}
              style={styles.mapBgImage}
            />
            <View style={styles.mapDarkOverlay} />

            {allSpots.slice(0, 5).map((spot, i) => {
              const positions = [
                { top: '25%', left: '30%' },
                { top: '40%', left: '60%' },
                { top: '65%', left: '40%' },
                { top: '35%', left: '75%' },
                { top: '75%', left: '20%' },
              ];
              const pos = positions[i % positions.length];
              const isSelected = selectedSpots.some((s) => s.id === spot.id);

              return (
                <TouchableOpacity
                  key={spot.id}
                  style={[styles.mapPin, { top: pos.top as any, left: pos.left as any }]}
                  onPress={() => setPreviewSpot(spot)}
                >
                  <Ionicons name="location" size={28} color={isSelected ? '#10B981' : '#FF6B00'} />
                  <View style={styles.mapPinLabel}>
                    <Text style={styles.mapPinText} numberOfLines={1}>
                      {spot.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>

      {/* ================================================== */}
      {/* MODAL — SPOT DETAILS PREVIEW                       */}
      {/* ================================================== */}
      <Modal visible={previewSpot !== null} transparent animationType="slide">
        {previewSpot && (
          <Pressable style={styles.modalOverlay} onPress={() => setPreviewSpot(null)}>
            <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
              <View style={styles.previewImageCard}>
                <Image source={{ uri: previewSpot.image }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.previewCloseBtn}
                  onPress={() => setPreviewSpot(null)}
                >
                  <Ionicons name="close" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <Text style={styles.previewTitle}>{previewSpot.name}</Text>
              <Text style={styles.previewCategory}>
                📍 {previewSpot.location} • {previewSpot.category}
              </Text>
              <Text style={styles.previewDesc}>
                {previewSpot.description ||
                  'Existing spot in DreamOut. You can include it in your travel itinerary sequence.'}
              </Text>

              <View style={styles.previewActionRow}>
                {selectedSpots.some((s) => s.id === previewSpot.id) ? (
                  <View style={styles.previewAddedBadge}>
                    <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                    <Text style={styles.previewAddedText}>In Route</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.primaryOrangeBtn}
                    onPress={() => {
                      if (!tempSelectedSpotIds.includes(previewSpot.id)) {
                        setTempSelectedSpotIds((prev) => [...prev, previewSpot.id]);
                      }
                      setPreviewSpot(null);
                    }}
                  >
                    <Text style={styles.primaryOrangeBtnText}>Add to Route</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => {
                    const sid = previewSpot.id;
                    setPreviewSpot(null);
                    router.push(`/spot/${sid}` as any);
                  }}
                >
                  <Text style={styles.secondaryBtnText}>View Spot</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        )}
      </Modal>

      {/* ================================================== */}
      {/* MODAL — SORTING DROPDOWN SELECTION SHEET           */}
      {/* ================================================== */}
      <Modal visible={isSortModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setIsSortModalVisible(false)}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort Spots By</Text>
              <TouchableOpacity onPress={() => setIsSortModalVisible(false)}>
                <Ionicons name="close" size={22} color="#8A8F9B" />
              </TouchableOpacity>
            </View>

            {(['Most Relevant', 'Most Popular', 'Recently Added', 'Nearest'] as SortOption[]).map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.sortOptionRow}
                onPress={() => {
                  setSortBy(option);
                  setIsSortModalVisible(false);
                }}
              >
                <Text style={[styles.sortOptionText, sortBy === option && styles.sortOptionTextActive]}>
                  {option}
                </Text>
                {sortBy === option && <Ionicons name="checkmark" size={18} color="#FF6B00" />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* ================================================== */}
      {/* MODAL — ADVANCED FILTER SHEET                      */}
      {/* ================================================== */}
      <Modal visible={isFilterModalVisible} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setIsFilterModalVisible(false)}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Spots</Text>
              <TouchableOpacity onPress={() => setIsFilterModalVisible(false)}>
                <Ionicons name="close" size={22} color="#8A8F9B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Category</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {SPOT_SEARCH_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catPill, activeCategoryFilter === cat && styles.catPillActive]}
                  onPress={() => handleCategoryFilterSelect(cat)}
                >
                  <Text style={[styles.catPillText, activeCategoryFilter === cat && styles.catPillTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.primaryOrangeBtn}
              onPress={() => setIsFilterModalVisible(false)}
            >
              <Text style={styles.primaryOrangeBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* ================================================== */}
      {/* MODAL — SHARE ROUTE MODAL                          */}
      {/* ================================================== */}
      <Modal visible={isShareModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Share Route</Text>
              <TouchableOpacity onPress={() => setIsShareModalVisible(false)}>
                <Ionicons name="close" size={22} color="#8A8F9B" />
              </TouchableOpacity>
            </View>

            <View style={styles.sharePreviewCard}>
              <Image source={{ uri: coverImage }} style={styles.shareThumb} />
              <View style={{ flex: 1 }}>
                <Text style={styles.shareTitle}>{routeTitle}</Text>
                <Text style={styles.shareMeta}>
                  {selectedSpots.length} Places • ~{selectedSpots.length * 2} km • 4–6 hours
                </Text>
              </View>
            </View>

            <Text style={styles.inputLabel}>Optional Message</Text>
            <TextInput
              style={styles.inputBox}
              value="A must-do route in Munnar! Perfect for nature lovers."
              editable={false}
            />

            {shareNotice && (
              <View style={styles.shareNoticeBox}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.shareNoticeText}>{shareNotice}</Text>
              </View>
            )}

            <View style={styles.shareGrid}>
              <TouchableOpacity
                style={styles.shareChannel}
                onPress={() => {
                  setShareNotice('Route link copied to clipboard!');
                  setTimeout(() => setShareNotice(null), 2000);
                }}
              >
                <View style={[styles.shareIconCircle, { backgroundColor: '#3B82F6' }]}>
                  <Ionicons name="copy-outline" size={22} color="#FFFFFF" />
                </View>
                <Text style={styles.shareChannelLabel}>Copy Link</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareChannel}
                onPress={() => {
                  setShareNotice('Opening WhatsApp...');
                  setTimeout(() => setShareNotice(null), 2000);
                }}
              >
                <View style={[styles.shareIconCircle, { backgroundColor: '#25D366' }]}>
                  <Ionicons name="logo-whatsapp" size={22} color="#FFFFFF" />
                </View>
                <Text style={styles.shareChannelLabel}>WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareChannel}
                onPress={() => {
                  setShareNotice('Opening Instagram...');
                  setTimeout(() => setShareNotice(null), 2000);
                }}
              >
                <View style={[styles.shareIconCircle, { backgroundColor: '#E1306C' }]}>
                  <Ionicons name="logo-instagram" size={22} color="#FFFFFF" />
                </View>
                <Text style={styles.shareChannelLabel}>Instagram</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareChannel}
                onPress={() => {
                  setShareNotice('Opening options...');
                  setTimeout(() => setShareNotice(null), 2000);
                }}
              >
                <View style={[styles.shareIconCircle, { backgroundColor: '#6B7280' }]}>
                  <Ionicons name="share-outline" size={22} color="#FFFFFF" />
                </View>
                <Text style={styles.shareChannelLabel}>Other</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.primaryOrangeBtn}
              onPress={() => setIsShareModalVisible(false)}
            >
              <Text style={styles.primaryOrangeBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0B0E' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },

  // FULL SUB-SCREEN LAYOUT FOR SCREEN 1 & SCREEN 2
  fullSubScreen: { flex: 1, backgroundColor: '#0A0B0E' },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  subHeaderTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  subHeaderSub: { color: '#8A8F9B', fontSize: 12, marginTop: 2 },
  subScreenContent: { padding: 20 },
  subScreenHeading: { color: '#8A8F9B', fontSize: 14, marginBottom: 20 },

  // SCREEN 1 CARDS
  primaryOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 0, 0.08)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FF6B00',
    padding: 18,
    marginBottom: 16,

    elevation: 4,
  },
  primaryOptionIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 107, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionTextContainer: { flex: 1, marginRight: 8 },
  primaryOptionTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  primaryOptionDesc: { color: '#D1D5DB', fontSize: 13, marginTop: 4, lineHeight: 18 },

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
  secondaryOptionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  secondaryOptionTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secondaryOptionDesc: { color: '#8A8F9B', fontSize: 12, marginTop: 3, lineHeight: 17 },

  // SCREEN 2 SEARCH BAR & FILTER
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 10,
  },
  largeSearchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12141A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 14,
    height: 50,
  },
  largeSearchBarFocused: {
    borderColor: '#FF6B00',
    backgroundColor: '#161820',
  },
  largeSearchInput: { flex: 1, color: '#FFFFFF', fontSize: 15 },
  filterTuneBtn: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#12141A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // CATEGORY ROW
  categoryScrollContainer: { paddingVertical: 8 },
  catPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 8,
  },
  catPillActive: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  catPillText: { color: '#8A8F9B', fontSize: 13, fontWeight: '600' },
  catPillTextActive: { color: '#FFFFFF', fontWeight: '700' },

  // RESULT COUNT ROW
  resultCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  resultCountText: { color: '#8A8F9B', fontSize: 13, fontWeight: '600' },
  sortDropdownBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortDropdownText: { color: '#8A8F9B', fontSize: 12, fontWeight: '600' },

  // SEARCH BODY
  searchScrollBody: { paddingHorizontal: 16, paddingTop: 6 },
  discoverHeaderBox: {
    backgroundColor: '#12141A',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
  },
  discoverTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  discoverSub: { color: '#8A8F9B', fontSize: 12, marginTop: 4, lineHeight: 18 },

  // HORIZONTAL SPOT CARDS
  spotCardHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 20, 26, 0.85)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    marginBottom: 12,
  },
  spotCardSelectedState: {
    borderColor: '#FF6B00',
    backgroundColor: 'rgba(255, 107, 0, 0.08)',
  },
  spotCardImage: { width: 68, height: 68, borderRadius: 12, marginRight: 14 },
  spotCardDetails: { flex: 1, marginRight: 8 },
  spotCardName: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  spotCardLocation: { color: '#8A8F9B', fontSize: 12 },
  tagBadgeRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  tagBadgePrimary: {
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagBadgePrimaryText: { color: '#FF6B00', fontSize: 11, fontWeight: '700' },
  tagBadgeSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagBadgeSecondaryText: { color: '#9CA3AF', fontSize: 11, fontWeight: '600' },

  addCheckBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCheckBtnChecked: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  addedAlreadyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  addedAlreadyText: { color: '#10B981', fontSize: 11, fontWeight: '700' },

  // STICKY BOTTOM SELECTION BAR
  stickyBottomSelectionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#12141A',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 20,
    paddingTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stickyBarTextCol: { flex: 1, marginRight: 12 },
  stickyBarCountText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  stickyBarHintText: { color: '#8A8F9B', fontSize: 12, marginTop: 2 },
  stickyBarReadyText: { color: '#FF6B00', fontSize: 12, fontWeight: '600', marginTop: 2 },
  primaryOrangeBtnSticky: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryOrangeBtnStickyText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  stickyBtnDisabled: { opacity: 0.4 },

  // SKELETON LOADER
  skeletonCard: {
    flexDirection: 'row',
    backgroundColor: '#12141A',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  skeletonThumb: { width: 64, height: 64, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', marginRight: 12 },
  skeletonLine1: { width: '70%', height: 14, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.08)' },
  skeletonLine2: { width: '40%', height: 12, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.06)' },
  skeletonLine3: { width: '30%', height: 10, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.04)' },

  // NO RESULTS
  noResultsBoxLarge: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  noResultsHeading: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginTop: 12 },
  noResultsSubText: { color: '#8A8F9B', fontSize: 13, textAlign: 'center', marginTop: 4, marginBottom: 20 },
  primaryOrangeBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FF6B00',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  primaryOrangeBtnSmallText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

  // HEADER & PROGRESS BAR FOR STEP 1,2,3
  headerContainer: {
    backgroundColor: '#0A0B0E',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
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
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },

  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  stepItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: { backgroundColor: '#FF6B00' },
  stepDotText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  stepLabel: { color: '#8A8F9B', fontSize: 12, fontWeight: '600' },
  stepLabelActive: { color: '#FF6B00', fontWeight: '700' },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginHorizontal: 8,
  },
  stepLineActive: { backgroundColor: '#FF6B00' },

  sectionTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginTop: 12 },
  sectionSubtitle: { color: '#8A8F9B', fontSize: 13, marginTop: 4, marginBottom: 20 },

  // FORM INPUTS
  coverCard: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  coverImage: { width: '100%', height: '100%' },
  coverGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  changeCoverBtn: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(18, 20, 26, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  changeCoverBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },

  inputGroup: { marginBottom: 18 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  inputLabel: { color: '#9CA3AF', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  requiredAsterisk: { color: '#FF6B00' },
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
  textArea: { height: 100, textAlignVertical: 'top' },
  inputErrorBorder: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },

  pillsScroll: { flexDirection: 'row' },
  pillItem: {
    backgroundColor: '#12141A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
  },
  pillItemActive: {
    backgroundColor: 'rgba(255, 107, 0, 0.18)',
    borderColor: '#FF6B00',
  },
  pillText: { color: '#8A8F9B', fontSize: 13, fontWeight: '600' },
  pillTextActive: { color: '#FF6B00', fontWeight: '700' },

  segmentedRow: { flexDirection: 'row', gap: 8 },
  segmentBtn: {
    flex: 1,
    backgroundColor: '#12141A',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  segmentBtnActive: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  segmentText: { color: '#8A8F9B', fontSize: 13, fontWeight: '600' },
  segmentTextActive: { color: '#FFFFFF', fontWeight: '700' },

  // STEP 2 ADD PLACES
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.4)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  warningText: { color: '#FF6B00', fontSize: 13, fontWeight: '600' },

  selectedSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  selectedTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  selectedCountBadge: { color: '#FF6B00', fontSize: 13, fontWeight: '700' },

  spotRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 20, 26, 0.85)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    marginBottom: 10,
  },
  orderCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 107, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  orderNumber: { color: '#FF6B00', fontSize: 12, fontWeight: '800' },
  spotRowThumb: { width: 46, height: 46, borderRadius: 10, marginRight: 12 },
  spotRowDetails: { flex: 1, marginRight: 6 },
  spotRowName: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  spotRowMeta: { color: '#8A8F9B', fontSize: 11, marginTop: 2 },
  spotRowActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reorderBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },

  emptyPlacesCard: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#12141A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
  },
  emptyPlacesTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginTop: 10 },
  emptyPlacesSub: { color: '#8A8F9B', fontSize: 12, textAlign: 'center', marginTop: 4 },

  addPlacesActionRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionOutlineBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
    borderWidth: 1.5,
    borderColor: '#FF6B00',
    borderRadius: 16,
    paddingVertical: 14,
  },
  actionOutlineTextPrimary: { color: '#FF6B00', fontSize: 15, fontWeight: '800' },
  actionOutlineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingVertical: 14,
  },
  actionOutlineText: { color: '#8A8F9B', fontSize: 14, fontWeight: '600' },

  // STEP 3 REVIEW
  reviewHeroCard: {
    height: 190,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  reviewHeroImage: { width: '100%', height: '100%' },
  reviewGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  reviewHeroBadgeRow: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    gap: 6,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,107,0,0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  difficultyBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  difficultyBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  reviewHeroContent: { position: 'absolute', bottom: 14, left: 14, right: 14 },
  reviewRouteTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  reviewLocation: { color: '#D1D5DB', fontSize: 12, marginTop: 2 },

  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    backgroundColor: 'rgba(18, 20, 26, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  metricItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metricText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  metricDivider: { width: 1, height: 12, backgroundColor: 'rgba(255,255,255,0.2)' },

  reviewBox: {
    backgroundColor: '#12141A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    marginBottom: 16,
  },
  reviewBoxHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  reviewBoxTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginBottom: 6 },
  reviewBoxSubtitle: { color: '#8A8F9B', fontSize: 12, marginBottom: 12 },
  reviewBoxDesc: { color: '#D1D5DB', fontSize: 13, lineHeight: 20 },
  editOrderLink: { color: '#FF6B00', fontSize: 13, fontWeight: '700' },

  reviewPlaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  reviewPlaceNum: { color: '#FF6B00', fontSize: 13, fontWeight: '700', width: 22 },
  reviewPlaceThumb: { width: 36, height: 36, borderRadius: 8, marginRight: 10 },
  reviewPlaceText: { flex: 1 },
  reviewPlaceName: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  reviewPlaceMeta: { color: '#8A8F9B', fontSize: 11 },

  highlightsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hlChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  hlChipSelected: {
    backgroundColor: 'rgba(255,107,0,0.15)',
    borderColor: '#FF6B00',
  },
  hlChipText: { color: '#8A8F9B', fontSize: 12, fontWeight: '600' },
  hlChipTextSelected: { color: '#FF6B00', fontWeight: '700' },

  // BOTTOM STICKY BAR
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0A0B0E',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  step2BottomRow: { flexDirection: 'row', gap: 10 },
  bottomAddBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,107,0,0.4)',
    borderRadius: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomAddBtnText: { color: '#FF6B00', fontSize: 14, fontWeight: '700' },

  primaryOrangeBtn: {
    backgroundColor: '#FF6B00',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryOrangeBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  btnDisabled: { opacity: 0.7 },
  publishingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingVertical: 16,
  },
  secondaryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  // SUCCESS SCREEN
  successScrollContent: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80%',
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,

    elevation: 10,
  },
  successTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginBottom: 6 },
  successSubtitle: { color: '#9CA3AF', fontSize: 14, textAlign: 'center', marginBottom: 24 },

  publishedCard: {
    width: '100%',
    backgroundColor: '#12141A',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    marginBottom: 30,
  },
  publishedCardImage: { width: '100%', height: 140 },
  publishedCardBody: { padding: 16 },
  publishedCardTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  publishedCardMeta: { color: '#8A8F9B', fontSize: 12, marginTop: 4 },

  successActionColumn: { width: '100%', gap: 12 },

  // MODALS STYLING
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#12141A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  modalSubtitleText: { color: '#8A8F9B', fontSize: 13, marginBottom: 16 },

  presetOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  presetThumb: { width: 50, height: 38, borderRadius: 8, marginRight: 12 },
  presetName: { flex: 1, color: '#FFFFFF', fontSize: 14, fontWeight: '600' },

  // MAP MODAL
  mapModalContainer: { flex: 1, backgroundColor: '#0A0B0E' },
  mapHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
  },
  mapHeaderTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  simulatedMapArea: { flex: 1, position: 'relative' },
  mapBgImage: { width: '100%', height: '100%' },
  mapDarkOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(10,11,14,0.65)' },
  mapPin: { position: 'absolute', alignItems: 'center' },
  mapPinLabel: {
    backgroundColor: '#12141A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FF6B00',
    marginTop: -4,
  },
  mapPinText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700', maxWidth: 100 },

  // PREVIEW SPOT MODAL
  previewImageCard: { width: '100%', height: 160, borderRadius: 16, overflow: 'hidden', marginBottom: 14, position: 'relative' },
  previewImage: { width: '100%', height: '100%' },
  previewCloseBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  previewCategory: { color: '#FF6B00', fontSize: 12, fontWeight: '600', marginTop: 2 },
  previewDesc: { color: '#9CA3AF', fontSize: 13, lineHeight: 18, marginTop: 8, marginBottom: 16 },
  previewActionRow: { flexDirection: 'row', gap: 10 },
  previewAddedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  previewAddedText: { color: '#10B981', fontSize: 14, fontWeight: '700' },

  // SORT MODAL
  sortOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  sortOptionText: { color: '#8A8F9B', fontSize: 15, fontWeight: '600' },
  sortOptionTextActive: { color: '#FF6B00', fontWeight: '700' },

  // SHARE MODAL
  sharePreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161820',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    gap: 12,
  },
  shareThumb: { width: 50, height: 50, borderRadius: 10 },
  shareTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  shareMeta: { color: '#8A8F9B', fontSize: 11, marginTop: 2 },
  shareGrid: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 20 },
  shareChannel: { alignItems: 'center' },
  shareIconCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  shareChannelLabel: { color: '#9CA3AF', fontSize: 11, fontWeight: '600' },
  shareNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  shareNoticeText: { color: '#10B981', fontSize: 12, fontWeight: '600' },
});
