import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export type ProfileTabType = 'routes' | 'spots' | 'experiences';

interface ProfileTabsProps {
  activeTab: ProfileTabType;
  onSelectTab: (tab: ProfileTabType) => void;
  routesCount?: number;
  spotsCount?: number;
  experiencesCount?: number;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  activeTab,
  onSelectTab,
}) => {
  return (
    <View style={styles.container}>
      {/* 1. Routes Tab */}
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'routes' && styles.tabButtonActive]}
        onPress={() => onSelectTab('routes')}
        activeOpacity={0.75}
      >
        <View style={styles.tabContentRow}>
          <Ionicons
            name="git-network-outline"
            size={16}
            color={activeTab === 'routes' ? '#FF6B00' : '#8A8F9B'}
          />
          <Text style={[styles.tabText, activeTab === 'routes' && styles.tabTextActive]}>
            Routes
          </Text>
        </View>
        {activeTab === 'routes' && <View style={styles.activeLine} />}
      </TouchableOpacity>

      {/* 2. Spots Tab */}
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'spots' && styles.tabButtonActive]}
        onPress={() => onSelectTab('spots')}
        activeOpacity={0.75}
      >
        <View style={styles.tabContentRow}>
          <Ionicons
            name="location-outline"
            size={16}
            color={activeTab === 'spots' ? '#FF6B00' : '#8A8F9B'}
          />
          <Text style={[styles.tabText, activeTab === 'spots' && styles.tabTextActive]}>
            Spots
          </Text>
        </View>
        {activeTab === 'spots' && <View style={styles.activeLine} />}
      </TouchableOpacity>

      {/* 3. Experiences Tab */}
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'experiences' && styles.tabButtonActive]}
        onPress={() => onSelectTab('experiences')}
        activeOpacity={0.75}
      >
        <View style={styles.tabContentRow}>
          <Ionicons
            name="triangle-outline"
            size={16}
            color={activeTab === 'experiences' ? '#FF6B00' : '#8A8F9B'}
          />
          <Text style={[styles.tabText, activeTab === 'experiences' && styles.tabTextActive]}>
            Experiences
          </Text>
        </View>
        {activeTab === 'experiences' && <View style={styles.activeLine} />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 6,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  tabButtonActive: {},
  tabContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabText: {
    color: '#8A8F9B',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FF6B00',
    fontWeight: '700',
  },
  activeLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#FF6B00',
    borderRadius: 2,
  },
});
