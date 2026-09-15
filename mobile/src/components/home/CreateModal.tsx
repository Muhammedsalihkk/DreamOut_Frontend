import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface CreateModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateRoute?: () => void;
  onCreateSpot?: () => void;
}

export const CreateModal: React.FC<CreateModalProps> = ({
  visible,
  onClose,
  onCreateRoute,
  onCreateSpot,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.contentContainer} onPress={(e) => e.stopPropagation()}>
          {/* Header Indicator */}
          <View style={styles.dragHandle} />

          <Text style={styles.modalTitle}>Create Content</Text>
          <Text style={styles.modalSubtitle}>Share your travel experiences with the DreamOut community</Text>

          {/* Action Cards */}
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() => {
              onClose();
              if (onCreateRoute) onCreateRoute();
            }}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="map-outline" size={24} color="#FF6B00" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Create Route</Text>
              <Text style={styles.actionDesc}>Build a multi-stop travel itinerary with custom spots & tips</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8A8F9B" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() => {
              onClose();
              if (onCreateSpot) onCreateSpot();
            }}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="location-outline" size={24} color="#FF6B00" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Create Spot</Text>
              <Text style={styles.actionDesc}>Add a unique location, viewpoint, or hidden place to the map</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8A8F9B" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  contentContainer: {
    backgroundColor: '#12141A',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  modalSubtitle: {
    color: '#9CA3AF',
    fontSize: 13,
    marginBottom: 20,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 25, 33, 0.85)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    marginBottom: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  actionDesc: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 16,
  },
  cancelButton: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#9CA3AF',
    fontSize: 15,
    fontWeight: '600',
  },
});
