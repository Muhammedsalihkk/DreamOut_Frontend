import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

export default function CreateScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Content</Text>
        <Text style={styles.subtitle}>Choose what you want to share with the community</Text>

        <TouchableOpacity
          style={styles.card}
          onPress={() => Alert.alert('Create Route', 'Route creation form ready.')}
        >
          <Ionicons name="map-outline" size={28} color="#FF6B00" />
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Create Route</Text>
            <Text style={styles.cardSub}>Combine multiple spots into a trail</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => Alert.alert('Create Spot', 'Spot creation form ready.')}
        >
          <Ionicons name="location-outline" size={28} color="#FF6B00" />
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Create Spot</Text>
            <Text style={styles.cardSub}>Add a new landmark or hidden gem</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0B0E' },
  content: { padding: 20 },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginTop: 10 },
  subtitle: { color: '#8A8F9B', fontSize: 13, marginBottom: 24 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 20, 26, 0.84)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 18,
    marginBottom: 14,
  },
  textContainer: { marginLeft: 14 },
  cardTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  cardSub: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
});
