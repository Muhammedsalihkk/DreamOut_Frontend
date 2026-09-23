import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, ScrollView, Alert, StatusBar, Platform } from 'react-native';
import { useRouter } from 'expo-router';

import { HomeHeader } from '@/components/home/HomeHeader';
import { StoriesSection } from '@/components/home/StoriesSection';
import { JourneyUpdates } from '@/components/home/JourneyUpdates';
import { RouteSection } from '@/components/home/RouteSection';
import { SpotSection } from '@/components/home/SpotSection';
import { CreateModal } from '@/components/home/CreateModal';
import { Route, Spot } from '@/data/mockData';

export default function HomeScreen() {
  const router = useRouter();
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const handleSeeAllRoutes = () => {
    router.push('/explore');
  };

  const handleSeeAllSpots = () => {
    router.push('/explore');
  };

  const handleRoutePress = (route: Route) => {
    router.push(`/route/${route.id}` as any);
  };

  const handleSpotPress = (spot: Spot) => {
    router.push(`/spot/${spot.id}` as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0B0E" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header with Profile & Notification Navigation */}
        <HomeHeader
          onProfilePress={() => router.push('/profile')}
          onNotificationPress={() => router.push('/notifications' as any)}
        />

        {/* 2. Stories Section (Positioned directly under Header) */}
        <StoriesSection
          onSeeAllPress={() => Alert.alert('Stories', 'View all travel stories.')}
          onAddStoryPress={() => router.push('/moment/create' as any)}
        />

        {/* 3. Journey Updates / Community Feed */}
        <JourneyUpdates
          onSeeAllPress={() => router.push('/explore')}
        />

        {/* 4. Latest Routes */}
        <RouteSection
          onSeeAllPress={handleSeeAllRoutes}
          onRoutePress={handleRoutePress}
        />

        {/* 5. Discover Spots (No Ratings) */}
        <SpotSection
          onSeeAllPress={handleSeeAllSpots}
          onSpotPress={handleSpotPress}
        />
      </ScrollView>

      {/* Create Modal Sheet */}
      <CreateModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onCreateRoute={() => router.push('/create')}
        onCreateSpot={() => router.push('/create')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0B0E',
  },
  scrollContent: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
    paddingBottom: 24,
  },
});
