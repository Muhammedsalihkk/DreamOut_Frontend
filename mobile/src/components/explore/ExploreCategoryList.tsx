import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MOCK_CATEGORIES, Category } from '@/data/mockData';

interface ExploreCategoryListProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const ExploreCategoryList: React.FC<ExploreCategoryListProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {MOCK_CATEGORIES.map((cat: Category) => {
          const isSelected = selectedCategory.toLowerCase() === cat.id.toLowerCase() ||
                             (selectedCategory.toLowerCase() === 'all' && cat.id === 'all');

          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, isSelected && styles.chipActive]}
              activeOpacity={0.8}
              onPress={() => onSelectCategory(cat.id)}
            >
              <Ionicons
                name={cat.icon as any}
                size={14}
                color={isSelected ? '#FFFFFF' : '#FF6B00'}
                style={{ marginRight: 5 }}
              />
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  scrollContent: {
    paddingHorizontal: 18,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 20, 26, 0.84)',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chipActive: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  chipText: {
    color: '#9CA3AF',
    fontSize: 12.5,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
