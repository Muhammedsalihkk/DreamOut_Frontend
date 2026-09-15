import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface SearchBarProps {
  onSearchPress?: () => void;
  onFilterPress?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearchPress,
  onFilterPress,
}) => {
  const [query, setQuery] = useState('');

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.searchBox}
        activeOpacity={0.9}
        onPress={onSearchPress}
      >
        <Ionicons name="search-outline" size={18} color="#8A8F9B" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Search places, routes, or people..."
          placeholderTextColor="#6F7482"
          value={query}
          onChangeText={setQuery}
          selectionColor="#FF6B00"
        />
        <TouchableOpacity
          style={styles.filterButton}
          activeOpacity={0.7}
          onPress={onFilterPress}
        >
          <Ionicons name="options-outline" size={18} color="#FF6B00" />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    marginVertical: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 20, 26, 0.84)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 14,
    height: 48,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    paddingVertical: 8,
  },
  filterButton: {
    padding: 6,
    marginLeft: 6,
  },
});
