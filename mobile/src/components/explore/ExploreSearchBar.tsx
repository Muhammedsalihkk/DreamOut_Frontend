import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface ExploreSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress?: () => void;
}

export const ExploreSearchBar: React.FC<ExploreSearchBarProps> = ({
  value,
  onChangeText,
  onFilterPress,
}) => {
  const handleFilterTap = () => {
    if (onFilterPress) {
      onFilterPress();
    } else {
      Alert.alert('Filter Options', 'Configure category, distance, and difficulty filters.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color="#8A8F9B" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.input}
          placeholder="Search places, routes, people..."
          placeholderTextColor="#8A8F9B"
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText('')} style={{ padding: 2 }}>
            <Ionicons name="close-circle" size={16} color="#8A8F9B" />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={styles.filterButton}
        activeOpacity={0.75}
        onPress={handleFilterTap}
      >
        <Ionicons name="options-outline" size={18} color="#FF6B00" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginVertical: 10,
    gap: 10,
  },
  searchBox: {
    flex: 1,
    height: 44,
    backgroundColor: 'rgba(18, 20, 26, 0.84)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13.5,
    height: '100%',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(18, 20, 26, 0.84)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
