import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { NotificationMomentData } from '@/data/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MomentDetailModalProps {
  visible: boolean;
  moment?: NotificationMomentData;
  onClose: () => void;
  onViewJourney?: () => void;
}

export const MomentDetailModal: React.FC<MomentDetailModalProps> = ({
  visible,
  moment,
  onClose,
  onViewJourney,
}) => {
  if (!moment) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.cardContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.userLeft}>
                <Image source={{ uri: moment.user.avatar }} style={styles.userAvatar} />
                <View>
                  <Text style={styles.modalHeaderTitle}>Your Moment</Text>
                  <Text style={styles.momentTimeText}>{moment.timeAgo}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* 4:5 Portrait Image Card */}
            <View style={styles.imageWrapper}>
              <Image source={{ uri: moment.mediaUri }} style={styles.portraitMedia} resizeMode="cover" />
              <LinearGradient
                colors={['transparent', 'rgba(10, 11, 14, 0.85)']}
                style={styles.imageGradient}
              >
                {/* Location Pill */}
                <View style={styles.pillsRow}>
                  <View style={styles.locationPill}>
                    <Ionicons name="location-sharp" size={12} color="#FF6B00" />
                    <Text style={styles.pillText}>{moment.spotName}</Text>
                  </View>

                  {moment.routeName && (
                    <View style={styles.routePill}>
                      <Ionicons name="map" size={12} color="#FF6B00" />
                      <Text style={styles.pillText}>{moment.routeName}</Text>
                    </View>
                  )}
                </View>
              </LinearGradient>
            </View>

            {/* Content Details */}
            <View style={styles.detailsContainer}>
              <Text style={styles.captionText}>"{moment.caption}"</Text>

              <View style={styles.likesCountRow}>
                <Ionicons name="heart" size={16} color="#EF4444" />
                <Text style={styles.likesText}>
                  ❤️ {moment.likesCount} others liked this moment
                </Text>
              </View>

              {/* View Journey Action Button */}
              <TouchableOpacity
                style={styles.actionBtn}
                activeOpacity={0.8}
                onPress={() => {
                  onClose();
                  if (onViewJourney) onViewJourney();
                }}
              >
                <Text style={styles.actionBtnText}>View Full Journey</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    width: '100%',
    alignItems: 'center',
  },
  cardContainer: {
    width: SCREEN_WIDTH - 32,
    backgroundColor: '#12141A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  userLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FF6B00',
  },
  modalHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  momentTimeText: {
    color: '#9CA3AF',
    fontSize: 11,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 4 / 5,
    backgroundColor: '#1E212A',
    position: 'relative',
  },
  portraitMedia: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
  },
  pillsRow: {
    flexDirection: 'column',
    gap: 6,
    alignItems: 'flex-start',
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(18, 20, 26, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  routePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(18, 20, 26, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  detailsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  captionText: {
    color: '#E5E7EB',
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: 12,
  },
  likesCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  likesText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
  },
  actionBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF6B00',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
