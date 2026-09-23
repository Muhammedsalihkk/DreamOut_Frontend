import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Story, StorySegment } from '@/data/mockData';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface StoryViewProps {
  story: Story;
  onClose: () => void;
  onSelectRoute?: (routeId: string) => void;
  onNextStory?: () => void;
  onPrevStory?: () => void;
}

export const StoryView: React.FC<StoryViewProps> = ({
  story,
  onClose,
  onSelectRoute,
  onNextStory,
  onPrevStory,
}) => {
  const insets = useSafeAreaInsets();
  
  // Fallback if no segments provided
  const segments: StorySegment[] = story.segments && story.segments.length > 0
    ? story.segments
    : [
        {
          id: `default-${story.id}`,
          type: 'image',
          mediaUri: story.image,
          duration: 5,
          title: story.title,
          caption: 'Captured travel experience.',
          location: 'Dreamout Destination',
          timeAgo: story.timeAgo || 'Recently',
        },
      ];

  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const activeSegment = segments[currentSegmentIndex] || segments[0];
  const progressAnim = useRef(new Animated.Value(0)).current;
  const segmentDuration = (activeSegment.duration || 5) * 1000;

  // Progress bar animation timer
  useEffect(() => {
    progressAnim.setValue(0);
    if (isPaused) return;

    const anim = Animated.timing(progressAnim, {
      toValue: 1,
      duration: segmentDuration,
      useNativeDriver: false,
    });

    anim.start(({ finished }) => {
      if (finished) {
        handleNextSegment();
      }
    });

    return () => {
      anim.stop();
    };
  }, [currentSegmentIndex, isPaused, segmentDuration]);

  const handleNextSegment = () => {
    if (currentSegmentIndex < segments.length - 1) {
      setCurrentSegmentIndex((prev) => prev + 1);
    } else {
      if (onNextStory) {
        onNextStory();
      } else {
        onClose();
      }
    }
  };

  const handlePrevSegment = () => {
    if (currentSegmentIndex > 0) {
      setCurrentSegmentIndex((prev) => prev - 1);
    } else {
      if (onPrevStory) {
        onPrevStory();
      }
    }
  };

  const handleTapScreen = (evt: any) => {
    const touchX = evt.nativeEvent.locationX;
    if (touchX < SCREEN_WIDTH * 0.3) {
      handlePrevSegment();
    } else {
      handleNextSegment();
    }
  };

  const userAvatar = story.user?.avatar || story.image;
  const userName = story.user?.name || story.title;
  const timeAgo = activeSegment.timeAgo || story.timeAgo || '2h ago';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" hidden />

      {/* Full-Screen Story Image Backdrop */}
      <Image
        source={{ uri: activeSegment.mediaUri }}
        style={styles.backdropImage}
        resizeMode="cover"
      />

      {/* Touch Control Overlay for Navigation & Press-to-Pause */}
      <TouchableWithoutFeedback
        onPressIn={() => setIsPaused(true)}
        onPressOut={() => setIsPaused(false)}
        onPress={handleTapScreen}
      >
        <View style={StyleSheet.absoluteFill} />
      </TouchableWithoutFeedback>

      {/* Top Gradient Protection for Text Readability */}
      <LinearGradient
        colors={['rgba(10, 11, 14, 0.88)', 'rgba(10, 11, 14, 0.45)', 'transparent']}
        locations={[0, 0.6, 1]}
        style={[styles.topGradient, { paddingTop: Math.max(insets.top, 14) }]}
        pointerEvents="box-none"
      >
        {/* Story Progress Bars */}
        <View style={styles.progressContainer}>
          {segments.map((seg, idx) => {
            let widthInterpolation;
            if (idx < currentSegmentIndex) {
              widthInterpolation = '100%';
            } else if (idx === currentSegmentIndex) {
              widthInterpolation = progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              });
            } else {
              widthInterpolation = '0%';
            }

            return (
              <View key={seg.id || idx.toString()} style={styles.progressTrack}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    { width: widthInterpolation as any },
                  ]}
                />
              </View>
            );
          })}
        </View>

        {/* User Profile Info & Close Button */}
        <View style={styles.headerRow}>
          <View style={styles.userProfileLeft}>
            <View style={styles.avatarRing}>
              <Image source={{ uri: userAvatar }} style={styles.avatarImage} />
            </View>
            <View style={styles.userInfoCol}>
              <View style={styles.nameRow}>
                <Text style={styles.userNameText} numberOfLines={1}>
                  {userName}
                </Text>
                {story.user?.isVerified && (
                  <Ionicons name="checkmark-circle" size={14} color="#FF6B00" style={styles.verifiedIcon} />
                )}
              </View>
              <Text style={styles.timeAgoText}>{timeAgo}</Text>
            </View>
          </View>

          {/* Close (X) Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Bottom Gradient Protection for Content Readability */}
      <LinearGradient
        colors={['transparent', 'rgba(10, 11, 14, 0.7)', 'rgba(10, 11, 14, 0.95)']}
        locations={[0, 0.4, 1]}
        style={[styles.bottomGradient, { paddingBottom: Math.max(insets.bottom + 16, 28) }]}
        pointerEvents="box-none"
      >
        {/* Location Pill */}
        {activeSegment.location && (
          <View style={styles.locationPill}>
            <Ionicons name="location-sharp" size={13} color="#FF6B00" />
            <Text style={styles.locationText}>{activeSegment.location}</Text>
          </View>
        )}

        {/* Story Title & Short Caption */}
        {activeSegment.title && (
          <Text style={styles.storyTitleText}>{activeSegment.title}</Text>
        )}

        {activeSegment.caption && (
          <Text style={styles.storyCaptionText}>{activeSegment.caption}</Text>
        )}

        {/* Bottom Card: "Part of a route" */}
        {activeSegment.route && (
          <TouchableOpacity
            style={styles.routeCard}
            activeOpacity={0.85}
            onPress={() => onSelectRoute && onSelectRoute(activeSegment.route!.id)}
          >
            <Image
              source={{ uri: activeSegment.route.image }}
              style={styles.routeThumbnail}
            />
            <View style={styles.routeInfo}>
              <Text style={styles.routeBadgeLabel}>PART OF A ROUTE</Text>
              <Text style={styles.routeNameText} numberOfLines={1}>
                {activeSegment.route.title}
              </Text>
              {activeSegment.route.subtitle && (
                <Text style={styles.routeSubtitleText} numberOfLines={1}>
                  {activeSegment.route.subtitle}
                </Text>
              )}
            </View>
            <View style={styles.routeArrowCircle}>
              <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0B0E',
  },
  backdropImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 14,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userProfileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatarRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: '#FF6B00',
    padding: 1.5,
    backgroundColor: 'rgba(10, 11, 14, 0.5)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  userInfoCol: {
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userNameText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  verifiedIcon: {
    marginLeft: 2,
  },
  timeAgoText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '400',
    marginTop: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 18,
    paddingTop: 48,
    justifyContent: 'flex-end',
  },
  locationPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(18, 20, 26, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    marginBottom: 12,
  },
  locationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  storyTitleText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  storyCaptionText: {
    color: '#E5E7EB',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 24, 30, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 14,
    padding: 10,
    gap: 12,
  },
  routeThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#1E212A',
  },
  routeInfo: {
    flex: 1,
  },
  routeBadgeLabel: {
    color: '#FF6B00',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  routeNameText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  routeSubtitleText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 1,
  },
  routeArrowCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
