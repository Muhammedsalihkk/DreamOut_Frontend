import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function SavedScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Saved Items</Text>
        <Text style={styles.subtitle}>Your bookmarked routes and spots</Text>

        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={48} color="#FF6B00" />
          <Text style={styles.emptyTitle}>No Saved Items Yet</Text>
          <Text style={styles.emptySub}>Explore routes and tap the bookmark icon to save them for your next trip.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0B0E' },
  content: { padding: 20 },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginTop: 10 },
  subtitle: { color: '#8A8F9B', fontSize: 13, marginBottom: 24 },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: 'rgba(18, 20, 26, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 20,
  },
  emptyTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginTop: 14 },
  emptySub: { color: '#8A8F9B', fontSize: 13, textAlign: 'center', marginTop: 6 },
});
