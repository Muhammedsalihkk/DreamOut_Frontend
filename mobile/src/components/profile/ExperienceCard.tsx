import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Experience } from '@/data/mockData';

interface ExperienceCardProps {
  experience: Experience;
  onPress?: () => void;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({
  experience,
  onPress,
}) => {
  const progressRatio = Math.min(
    1,
    Math.max(0, experience.completedPlaces / (experience.totalPlaces || 1))
  );

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={onPress}
    >
      {/* Left Cover Image Column */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: experience.routeImage }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Bottom Left Image Count Badge */}
        <View style={styles.imageBadge}>
          <Ionicons name="images-outline" size={11} color="#FFFFFF" style={{ marginRight: 3 }} />
          <Text style={styles.imageBadgeText}>+{experience.imageCount}</Text>
        </View>
      </View>

      {/* Right Details Column */}
      <View style={styles.detailsContainer}>
        {/* Top Header Row: Title + Options */}
        <View style={styles.headerRow}>
          <Text style={styles.titleText} numberOfLines={1}>
            {experience.routeName}
          </Text>
          <TouchableOpacity
            style={styles.moreButton}
            activeOpacity={0.7}
            onPress={onPress}
          >
            <Ionicons name="ellipsis-horizontal" size={16} color="#8A8F9B" />
          </TouchableOpacity>
        </View>

        {/* Explored Date */}
        <Text style={styles.dateText}>{experience.exploredDateText}</Text>

        {/* Short Description */}
        <Text style={styles.descriptionText} numberOfLines={2}>
          {experience.description}
        </Text>

        {/* Places Completed Progress Bar */}
        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>
            {experience.completedPlaces} / {experience.totalPlaces} places completed
          </Text>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressRatio * 100}%` },
              ]}
            />
          </View>
        </View>

        {/* Bottom Stats Row (Moments, Notes, Distance Explored) */}
        <View style={styles.statsRow}>
          {/* 1. Moments */}
          <View style={styles.statItem}>
            <Ionicons name="images-outline" size={17} color="#FF6B00" style={{ marginRight: 5 }} />
            <View style={styles.statTextBlock}>
              <Text style={styles.statNumberText}>{experience.momentsCount}</Text>
              <Text style={styles.statLabelText}>Moments</Text>
            </View>
          </View>

          {/* 2. Notes */}
          <View style={styles.statItem}>
            <Ionicons name="chatbubble-outline" size={16} color="#FF6B00" style={{ marginRight: 5 }} />
            <View style={styles.statTextBlock}>
              <Text style={styles.statNumberText}>{experience.notesCount}</Text>
              <Text style={styles.statLabelText}>Notes</Text>
            </View>
          </View>

          {/* 3. Distance Explored */}
          <View style={styles.statItem}>
            <Ionicons name="walk-outline" size={18} color="#FF6B00" style={{ marginRight: 5 }} />
            <View style={styles.statTextBlock}>
              <Text style={styles.statNumberText}>{experience.distanceKm} km</Text>
              <Text style={styles.statLabelText}>Explored</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    height: 158,
    backgroundColor: 'rgba(18, 20, 26, 0.84)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    marginBottom: 14,
  },

  /* Image Column */
  imageContainer: {
    width: 135,
    height: '100%',
    backgroundColor: '#1E212A',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(10, 11, 15, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  imageBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },

  /* Details Column */
  detailsContainer: {
    flex: 1,
    height: '100%',
    padding: 10,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
    flex: 1,
    marginRight: 6,
  },
  moreButton: {
    padding: 2,
  },
  dateText: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: -2,
  },
  descriptionText: {
    color: '#D1D5DB',
    fontSize: 11,
    lineHeight: 14.5,
    marginVertical: 2,
  },

  /* Progress Bar */
  progressSection: {
    marginVertical: 2,
  },
  progressLabel: {
    color: '#E0E4EB',
    fontSize: 10.5,
    fontWeight: '600',
    marginBottom: 4,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B00',
    borderRadius: 2,
  },

  /* Stats Row */
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statTextBlock: {
    justifyContent: 'center',
  },
  statNumberText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
    lineHeight: 13,
  },
  statLabelText: {
    color: '#9CA3AF',
    fontSize: 9,
    fontWeight: '400',
    lineHeight: 11,
  },
});
