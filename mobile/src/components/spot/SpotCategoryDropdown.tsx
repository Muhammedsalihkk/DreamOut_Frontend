import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export interface SpotCategoryOption {
  id: string;
  label: string;
  emoji: string;
  iconName: keyof typeof Ionicons.glyphMap;
  description: string;
}

export const STATIC_SPOT_CATEGORIES: SpotCategoryOption[] = [
  {
    id: 'Food',
    label: 'Food & Dining',
    emoji: '🍔',
    iconName: 'restaurant-outline',
    description: 'Cafes, street food stalls, restaurants & local eats',
  },
  {
    id: 'Beach',
    label: 'Beach & Coastal',
    emoji: '🏖️',
    iconName: 'water-outline',
    description: 'Sandy beaches, coastal cliffs, shores & sunset spots',
  },
  {
    id: 'Nature & Mountains',
    label: 'Nature & Mountains',
    emoji: '⛰️',
    iconName: 'trail-sign-outline',
    description: 'Hill stations, valleys, mountain ridges & pine forests',
  },
  {
    id: 'Waterfalls & Lakes',
    label: 'Waterfalls & Lakes',
    emoji: '🌊',
    iconName: 'boat-outline',
    description: 'Cascading waterfalls, serene lakes & river banks',
  },
  {
    id: 'Culture & Heritage',
    label: 'Culture & Heritage',
    emoji: '🏛️',
    iconName: 'business-outline',
    description: 'Ancient forts, temples, colonial quarters & museums',
  },
  {
    id: 'Adventure',
    label: 'Adventure & Trek',
    emoji: '🧗',
    iconName: 'compass-outline',
    description: 'Hiking trails, camping, rafting & outdoor thrills',
  },
  {
    id: 'Viewpoint',
    label: 'Scenic Viewpoint',
    emoji: '🔭',
    iconName: 'eye-outline',
    description: 'Panoramic outlooks, sunrise points & cliff tops',
  },
  {
    id: 'Tea Gardens & Farms',
    label: 'Tea Gardens & Farms',
    emoji: '🍃',
    iconName: 'leaf-outline',
    description: 'Tea plantations, spice estates & countryside walks',
  },
  {
    id: 'Nightlife & Pubs',
    label: 'Nightlife & Pubs',
    emoji: '🌃',
    iconName: 'wine-outline',
    description: 'Evening lounges, live music & vibrant night spots',
  },
  {
    id: 'Scenic Drive',
    label: 'Scenic Drive & Pass',
    emoji: '🚗',
    iconName: 'car-outline',
    description: 'Ghat passes, coastal highways & viewpoints on wheels',
  },
  {
    id: 'Other',
    label: 'Other',
    emoji: '📍',
    iconName: 'location-outline',
    description: 'Hidden gems and community-discovered spots',
  },
];

interface SpotCategoryDropdownProps {
  value: string;
  onSelect: (category: string) => void;
  error?: string | null;
}

export const SpotCategoryDropdown: React.FC<SpotCategoryDropdownProps> = ({
  value,
  onSelect,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Find currently matched category or default
  const selectedCategory =
    STATIC_SPOT_CATEGORIES.find(
      (c) =>
        c.id.toLowerCase() === (value || '').toLowerCase() ||
        c.label.toLowerCase() === (value || '').toLowerCase()
    ) || STATIC_SPOT_CATEGORIES[0];

  const handleSelect = (category: SpotCategoryOption) => {
    onSelect(category.id);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      {/* Dropdown Trigger Box */}
      <TouchableOpacity
        style={[
          styles.triggerBox,
          isOpen && styles.triggerBoxOpen,
          Boolean(error) && styles.triggerBoxError,
        ]}
        activeOpacity={0.8}
        onPress={() => setIsOpen(true)}
      >
        <View style={styles.triggerLeft}>
          <Text style={styles.emojiBadge}>{selectedCategory.emoji}</Text>
          <View style={styles.labelContainer}>
            <Text style={styles.selectedLabel}>{selectedCategory.label}</Text>
            <Text style={styles.selectedSub} numberOfLines={1}>
              {selectedCategory.description}
            </Text>
          </View>
        </View>

        <View style={styles.chevronCircle}>
          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
            color="#FF6B00"
          />
        </View>
      </TouchableOpacity>

      {/* Dropdown Modal Selection Sheet */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsOpen(false)}>
          <Pressable
            style={styles.sheetContainer}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle */}
            <View style={styles.sheetHandle} />

            {/* Header */}
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Select Category</Text>
                <Text style={styles.sheetSubtitle}>
                  Choose the category that best describes your spot
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setIsOpen(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={20} color="#8A8F9B" />
              </TouchableOpacity>
            </View>

            {/* Options List */}
            <FlatList
              data={STATIC_SPOT_CATEGORIES}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const isSelected =
                  item.id.toLowerCase() === selectedCategory.id.toLowerCase();

                return (
                  <TouchableOpacity
                    style={[
                      styles.optionRow,
                      isSelected && styles.optionRowSelected,
                    ]}
                    activeOpacity={0.75}
                    onPress={() => handleSelect(item)}
                  >
                    <View style={styles.optionEmojiCircle}>
                      <Text style={styles.optionEmojiText}>{item.emoji}</Text>
                    </View>

                    <View style={styles.optionDetails}>
                      <View style={styles.optionTitleRow}>
                        <Text
                          style={[
                            styles.optionLabel,
                            isSelected && styles.optionLabelSelected,
                          ]}
                        >
                          {item.label}
                        </Text>
                        {isSelected && (
                          <View style={styles.activeTag}>
                            <Text style={styles.activeTagText}>Active</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.optionDescription} numberOfLines={2}>
                        {item.description}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.radioCircle,
                        isSelected && styles.radioCircleSelected,
                      ]}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={14} color="#0A0B0E" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  triggerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  triggerBoxOpen: {
    borderColor: '#FF6B00',
    backgroundColor: 'rgba(255, 107, 0, 0.06)',
  },
  triggerBoxError: {
    borderColor: '#EF4444',
  },
  triggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
    gap: 12,
  },
  emojiBadge: {
    fontSize: 22,
  },
  labelContainer: {
    flex: 1,
  },
  selectedLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  selectedSub: {
    color: '#8A8F9B',
    fontSize: 11,
    marginTop: 2,
  },
  chevronCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#12141A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingTop: 12,
    paddingBottom: 28,
    maxHeight: '80%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sheetTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  sheetSubtitle: {
    color: '#8A8F9B',
    fontSize: 12,
    marginTop: 3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 12,
  },
  optionRowSelected: {
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
    borderColor: '#FF6B00',
  },
  optionEmojiCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionEmojiText: {
    fontSize: 20,
  },
  optionDetails: {
    flex: 1,
    marginRight: 10,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  optionLabelSelected: {
    color: '#FF6B00',
  },
  activeTag: {
    backgroundColor: 'rgba(255, 107, 0, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  activeTagText: {
    color: '#FF6B00',
    fontSize: 10,
    fontWeight: '700',
  },
  optionDescription: {
    color: '#8A8F9B',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
});
