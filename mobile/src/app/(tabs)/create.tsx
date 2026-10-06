import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useRouteStore } from '@/store/useRouteStore';

export default function CreateScreen() {
  const router = useRouter();
  const addSpot = useRouteStore((state) => state.addSpot);

  // Quick Spot modal state
  const [isAddSpotModalVisible, setIsAddSpotModalVisible] = useState(false);
  const [spotName, setSpotName] = useState('');
  const [spotCategory, setSpotCategory] = useState('Nature & Mountains');
  const [spotLocation, setSpotLocation] = useState('Munnar, Kerala');
  const [spotDescription, setSpotDescription] = useState('');
  const [spotNotice, setSpotNotice] = useState<string | null>(null);
  const [spotError, setSpotError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSpot = async () => {
    if (!spotName.trim()) {
      setSpotError('Spot name is required');
      return;
    }
    setSpotError(null);
    setIsSubmitting(true);
    try {
      const newSpot = await addSpot({
        name: spotName.trim(),
        category: spotCategory.trim() || 'Nature & Mountains',
        location: spotLocation.trim() || 'Munnar, Kerala',
        description: spotDescription.trim() || spotName.trim(),
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      });
      setSpotNotice(`"${newSpot.name}" created successfully!`);
      setTimeout(() => {
        setSpotNotice(null);
        setIsAddSpotModalVisible(false);
        setSpotName('');
        setSpotDescription('');
      }, 1500);
    } catch (err: any) {
      setSpotError(err?.message || 'Failed to create spot. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Create</Text>
        <Text style={styles.subtitle}>Choose what you want to share with the community</Text>

        {/* Option 1: Create Route */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => router.push('/route/create' as any)}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="map-outline" size={26} color="#FF6B00" />
          </View>
          <View style={styles.textContainer}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>Create Route</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>3 Steps</Text>
              </View>
            </View>
            <Text style={styles.cardSub}>Plan and share your own travel route with amazing places</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8A8F9B" />
        </TouchableOpacity>

        {/* Option 2: Add Spot */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => setIsAddSpotModalVisible(true)}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="location-outline" size={26} color="#FF6B00" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Add Spot</Text>
            <Text style={styles.cardSub}>Add a new place to DreamOut</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8A8F9B" />
        </TouchableOpacity>

        {/* Option 3: Share Moment */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => router.push('/moment/create' as any)}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="camera-outline" size={26} color="#FF6B00" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Share Moment</Text>
            <Text style={styles.cardSub}>Post a photo, video or note</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8A8F9B" />
        </TouchableOpacity>

        {/* Option 4: Create Story */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => router.push('/moment/create' as any)}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="play-circle-outline" size={26} color="#FF6B00" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Create Story</Text>
            <Text style={styles.cardSub}>Share your ongoing journey</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8A8F9B" />
        </TouchableOpacity>
      </ScrollView>

      {/* Add Spot Modal */}
      <Modal
        visible={isAddSpotModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddSpotModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <Pressable
            style={styles.modalBackdropTouch}
            onPress={() => {
              Keyboard.dismiss();
              setSpotError(null);
              setIsAddSpotModalVisible(false);
            }}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalDragHandle} />

            <ScrollView
              bounces={false}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add a New Spot</Text>
                <TouchableOpacity
                  onPress={() => {
                    Keyboard.dismiss();
                    setSpotError(null);
                    setIsAddSpotModalVisible(false);
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close" size={22} color="#8A8F9B" />
                </TouchableOpacity>
              </View>

              {spotNotice ? (
                <View style={styles.successBanner}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text style={styles.successBannerText}>{spotNotice}</Text>
                </View>
              ) : (
                <>
                  {spotError ? (
                    <View style={styles.errorBanner}>
                      <Ionicons name="alert-circle" size={20} color="#EF4444" />
                      <Text style={styles.errorBannerText}>{spotError}</Text>
                    </View>
                  ) : null}

                  <Text style={styles.fieldLabel}>Spot Name *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Kolukkumalai View Point"
                    placeholderTextColor="#6B7280"
                    value={spotName}
                    onChangeText={(text) => {
                      setSpotName(text);
                      if (spotError) setSpotError(null);
                    }}
                    returnKeyType="next"
                  />

                  <Text style={styles.fieldLabel}>Location</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Munnar, Kerala"
                    placeholderTextColor="#6B7280"
                    value={spotLocation}
                    onChangeText={(text) => {
                      setSpotLocation(text);
                      if (spotError) setSpotError(null);
                    }}
                    returnKeyType="next"
                  />

                  <Text style={styles.fieldLabel}>Category</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Nature & Mountains"
                    placeholderTextColor="#6B7280"
                    value={spotCategory}
                    onChangeText={(text) => {
                      setSpotCategory(text);
                      if (spotError) setSpotError(null);
                    }}
                    returnKeyType="done"
                    onSubmitEditing={handleCreateSpot}
                  />

                  <TouchableOpacity
                    style={[styles.saveSpotBtn, (!spotName.trim() || isSubmitting) && { opacity: 0.5 }]}
                    disabled={!spotName.trim() || isSubmitting}
                    onPress={handleCreateSpot}
                  >
                    {isSubmitting ? (
                      <View style={styles.btnRow}>
                        <ActivityIndicator color="#0A0B0E" size="small" />
                        <Text style={styles.saveSpotBtnText}>Saving Spot...</Text>
                      </View>
                    ) : (
                      <Text style={styles.saveSpotBtnText}>Save Spot</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0B0E' },
  content: { padding: 20 },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', marginTop: 10 },
  subtitle: { color: '#8A8F9B', fontSize: 13, marginBottom: 24, marginTop: 4 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 20, 26, 0.84)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    marginBottom: 14,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textContainer: { flex: 1, marginRight: 8 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  badge: {
    backgroundColor: 'rgba(255, 107, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.4)',
  },
  badgeText: { color: '#FF6B00', fontSize: 10, fontWeight: '700' },
  cardSub: { color: '#9CA3AF', fontSize: 12, marginTop: 3, lineHeight: 17 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalBackdropTouch: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#12141A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '85%',
  },
  modalDragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#374151',
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  fieldLabel: { color: '#9CA3AF', fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 10 },
  textInput: {
    backgroundColor: '#1A1D26',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    color: '#FFFFFF',
    padding: 14,
    fontSize: 14,
  },
  saveSpotBtn: {
    backgroundColor: '#FF6B00',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveSpotBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    padding: 16,
    borderRadius: 12,
    marginVertical: 20,
  },
  successBannerText: { color: '#10B981', fontSize: 14, fontWeight: '600' },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderWidth: 1,
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  errorBannerText: { color: '#F87171', fontSize: 13, fontWeight: '600', flex: 1 },
  btnRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
});
