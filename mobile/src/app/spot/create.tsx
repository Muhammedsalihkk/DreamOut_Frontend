import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useRouteStore } from '@/store/useRouteStore';
import { SpotCategoryDropdown } from '@/components/spot/SpotCategoryDropdown';
import {
  GoogleMapLocationPicker,
  LocationData,
} from '@/components/spot/GoogleMapLocationPicker';

export default function CreateSpotPage() {
  const router = useRouter();
  const addSpot = useRouteStore((state) => state.addSpot);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Food');
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isLocationConfirmed, setIsLocationConfirmed] = useState(false);
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSpot = async () => {
    if (!name.trim()) {
      setError('Spot name is required');
      return;
    }

    // Validation: Prevent spot creation if no location is selected / confirmed
    if (!locationData || !locationData.address.trim() || !isLocationConfirmed) {
      setError('Please select a location for this spot.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const newSpot = await addSpot({
        name: name.trim(),
        category: category.trim() || 'Food',
        location: locationData.address,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        description: description.trim() || name.trim(),
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      });

      setSuccessNotice(`"${newSpot.name}" created successfully!`);
      setTimeout(() => {
        router.back();
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'Failed to create spot. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0B0E" />

      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} activeOpacity={0.8} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create New Spot</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {successNotice ? (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={22} color="#10B981" />
              <Text style={styles.successBannerText}>{successNotice}</Text>
            </View>
          ) : null}

          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          ) : null}

          {/* Spot Name */}
          <Text style={styles.fieldLabel}>Spot Name *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Kolukkumalai View Point, Calicut Beach"
            placeholderTextColor="#6B7280"
            value={name}
            onChangeText={(txt) => {
              setName(txt);
              if (error) setError(null);
            }}
          />

          {/* Category Dropdown */}
          <Text style={styles.fieldLabel}>Category</Text>
          <SpotCategoryDropdown
            value={category}
            onSelect={(cat) => {
              setCategory(cat);
              if (error) setError(null);
            }}
          />

          {/* Google Maps Location Picker Section */}
          <GoogleMapLocationPicker
            value={locationData}
            onLocationChange={(loc) => {
              setLocationData(loc);
              if (error) setError(null);
            }}
            onConfirm={(loc) => {
              setLocationData(loc);
              setIsLocationConfirmed(true);
              if (error) setError(null);
            }}
            error={error && !isLocationConfirmed ? error : null}
          />

          {/* Spot Description */}
          <Text style={styles.fieldLabel}>Description (Optional)</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Tell travelers what makes this spot unique..."
            placeholderTextColor="#6B7280"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              (!name.trim() || !isLocationConfirmed || isSubmitting) && { opacity: 0.6 },
            ]}
            disabled={!name.trim() || !isLocationConfirmed || isSubmitting}
            activeOpacity={0.85}
            onPress={handleCreateSpot}
          >
            {isSubmitting ? (
              <View style={styles.btnRow}>
                <ActivityIndicator color="#0A0B0E" size="small" />
                <Text style={styles.submitBtnText}>Creating Spot in Backend...</Text>
              </View>
            ) : (
              <Text style={styles.submitBtnText}>Create Spot</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0B0E',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  fieldLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 14,
  },
  textInput: {
    backgroundColor: '#161922',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#FF6B00',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 26,
  },
  submitBtnText: {
    color: '#0A0B0E',
    fontSize: 16,
    fontWeight: '800',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  successBannerText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '700',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderWidth: 1,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: '#F87171',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
});
