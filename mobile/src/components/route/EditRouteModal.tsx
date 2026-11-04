import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DetailedRoute, Route } from '@/data/mockData';
import { useRouteStore } from '@/store/useRouteStore';
import { CloudinaryImagePicker } from '@/components/ui/CloudinaryImagePicker';

const PRESET_COVERS = [
  { id: 'c1', name: 'Munnar Tea Hills', url: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80' },
  { id: 'c2', name: 'Kolukkumalai Sunrise', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80' },
  { id: 'c3', name: 'Waterfall Trail Pass', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80' },
  { id: 'c4', name: 'Varkala Coastal Cliff', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80' },
  { id: 'c5', name: 'Wayanad Forest Ridge', url: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=1200&q=80' },
  { id: 'c6', name: 'Alleppey Backwaters', url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80' },
];

const ROUTE_CATEGORIES = [
  'Nature & Mountains',
  'Beaches',
  'Waterfalls',
  'Heritage',
  'Adventure',
  'Food',
  'Culture',
  'Road Trip',
  'Photography',
  'Other',
];

const DIFFICULTIES = ['Easy', 'Moderate', 'Challenging', 'Strenuous'];
const VISIBILITIES = ['Public', 'Followers', 'Private'] as const;

export interface EditRouteModalProps {
  visible: boolean;
  route: DetailedRoute | Route | null;
  onClose: () => void;
  onSaveSuccess?: (updatedRoute: DetailedRoute) => void;
}

export const EditRouteModal: React.FC<EditRouteModalProps> = ({
  visible,
  route,
  onClose,
  onSaveSuccess,
}) => {
  const updateRoute = useRouteStore((state) => state.updateRoute);

  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Nature & Mountains');
  const [difficulty, setDifficulty] = useState('Moderate');
  const [visibility, setVisibility] = useState<'Public' | 'Followers' | 'Private'>('Public');

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (route) {
      setTitle(route.title || '');
      setCoverImage(
        (route as any).coverImage ||
          (route as any).image ||
          'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80'
      );
      setShortDescription(
        (route as any).shortDescription || route.description || ''
      );
      setDescription(
        route.description || (route as any).shortDescription || ''
      );
      setLocation(route.location || 'Munnar, Kerala');
      setCategory(route.category || 'Nature & Mountains');
      setDifficulty((route as any).difficulty || 'Moderate');
      setVisibility(((route as any).visibility as any) || 'Public');
    }
  }, [route, visible]);

  if (!route) return null;

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a route name/title.');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateRoute(route.id, {
        title: title.trim(),
        coverImage,
        shortDescription: shortDescription.trim(),
        description: description.trim() || shortDescription.trim(),
        location: location.trim(),
        category,
        difficulty,
        visibility,
      });

      Alert.alert('Success', 'Route updated successfully!');
      if (onSaveSuccess) {
        onSaveSuccess(updated);
      }
      onClose();
    } catch (err: any) {
      console.error('[EditRouteModal] Failed to update route:', err);
      Alert.alert(
        'Update Notice',
        err?.message || 'Failed to update route on server, saved locally.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onClose}
            disabled={isSaving}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Edit Route</Text>

          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* 1. Cover Image Section */}
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>Cover Photo</Text>
              <Text style={styles.fieldSubLabel}>
                Choose a scenic photo representing your route
              </Text>

              {/* Cover Preview */}
              <View style={styles.coverPreviewContainer}>
                <Image
                  source={{ uri: coverImage }}
                  style={styles.coverPreviewImage}
                  resizeMode="cover"
                />
              </View>

              {/* Cloudinary Upload */}
              <View style={styles.uploaderWrapper}>
                <CloudinaryImagePicker
                  value={coverImage}
                  onChange={(url) => setCoverImage(url)}
                  category="routes"
                  placeholderText="Upload Custom Cover Photo"
                  label=""
                />
              </View>

              {/* Preset Scenic Covers */}
              <Text style={[styles.fieldSubLabel, { marginTop: 14, marginBottom: 8 }]}>
                Or pick from scenic presets:
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.presetsRow}
              >
                {PRESET_COVERS.map((preset) => {
                  const isSelected = coverImage === preset.url;
                  return (
                    <TouchableOpacity
                      key={preset.id}
                      style={[
                        styles.presetCard,
                        isSelected && styles.presetCardSelected,
                      ]}
                      activeOpacity={0.8}
                      onPress={() => setCoverImage(preset.url)}
                    >
                      <Image source={{ uri: preset.url }} style={styles.presetImage} />
                      <View style={styles.presetOverlay}>
                        <Text style={styles.presetName} numberOfLines={1}>
                          {preset.name}
                        </Text>
                        {isSelected && (
                          <View style={styles.presetCheckmark}>
                            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* 2. Route Title */}
            <View style={styles.fieldSection}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>Route Name *</Text>
                <Text style={styles.charCount}>{title.length}/100</Text>
              </View>
              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Munnar Mountain Tea Trail"
                placeholderTextColor="#6B7280"
                maxLength={100}
              />
            </View>

            {/* 3. Location */}
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>Location</Text>
              <View style={styles.inputWithIcon}>
                <Ionicons name="location-outline" size={18} color="#FF6B00" style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, styles.textInputWithIcon]}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="e.g. Munnar, Idukki, Kerala"
                  placeholderTextColor="#6B7280"
                  maxLength={100}
                />
              </View>
            </View>

            {/* 4. Category Selector */}
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsScroll}
              >
                {ROUTE_CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => setCategory(cat)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextSelected,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* 5. Difficulty Level */}
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>Difficulty</Text>
              <View style={styles.chipsRow}>
                {DIFFICULTIES.map((diff) => {
                  const isSelected = difficulty === diff;
                  return (
                    <TouchableOpacity
                      key={diff}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => setDifficulty(diff)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextSelected,
                        ]}
                      >
                        {diff}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 6. Visibility */}
            <View style={styles.fieldSection}>
              <Text style={styles.fieldLabel}>Visibility</Text>
              <View style={styles.chipsRow}>
                {VISIBILITIES.map((vis) => {
                  const isSelected = visibility === vis;
                  return (
                    <TouchableOpacity
                      key={vis}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => setVisibility(vis)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={
                          vis === 'Public'
                            ? 'globe-outline'
                            : vis === 'Followers'
                            ? 'people-outline'
                            : 'lock-closed-outline'
                        }
                        size={14}
                        color={isSelected ? '#FFFFFF' : '#8A8F9B'}
                        style={{ marginRight: 6 }}
                      />
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextSelected,
                        ]}
                      >
                        {vis}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 7. Short Tagline / Summary */}
            <View style={styles.fieldSection}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>Short Tagline</Text>
                <Text style={styles.charCount}>{shortDescription.length}/150</Text>
              </View>
              <TextInput
                style={styles.textInput}
                value={shortDescription}
                onChangeText={setShortDescription}
                placeholder="A brief punchy hook about this route"
                placeholderTextColor="#6B7280"
                maxLength={150}
              />
            </View>

            {/* 8. Detailed Story / Description */}
            <View style={styles.fieldSection}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>Full Description</Text>
                <Text style={styles.charCount}>{description.length}/1000</Text>
              </View>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe the terrain, hidden gems, tips for other travelers..."
                placeholderTextColor="#6B7280"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={1000}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0B0E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1D26',
    backgroundColor: '#0E1017',
  },
  headerButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  cancelText: {
    color: '#8A8F9B',
    fontSize: 15,
    fontWeight: '500',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 48,
  },
  fieldSection: {
    marginBottom: 22,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  fieldSubLabel: {
    color: '#8A8F9B',
    fontSize: 13,
    marginBottom: 10,
  },
  charCount: {
    color: '#6B7280',
    fontSize: 12,
  },
  coverPreviewContainer: {
    width: '100%',
    height: 170,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#14161D',
    borderWidth: 1,
    borderColor: '#222530',
    marginBottom: 10,
  },
  coverPreviewImage: {
    width: '100%',
    height: '100%',
  },
  uploaderWrapper: {
    marginTop: 4,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  presetCard: {
    width: 120,
    height: 75,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  presetCardSelected: {
    borderColor: '#FF6B00',
  },
  presetImage: {
    width: '100%',
    height: '100%',
  },
  presetOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    padding: 6,
  },
  presetName: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  presetCheckmark: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FF6B00',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    backgroundColor: '#14161D',
    borderWidth: 1,
    borderColor: '#222530',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 15,
  },
  inputWithIcon: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 2,
  },
  textInputWithIcon: {
    paddingLeft: 38,
  },
  textArea: {
    minHeight: 90,
    paddingTop: 12,
  },
  chipsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#14161D',
    borderWidth: 1,
    borderColor: '#222530',
  },
  chipSelected: {
    backgroundColor: 'rgba(255, 107, 0, 0.15)',
    borderColor: '#FF6B00',
  },
  chipText: {
    color: '#8A8F9B',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#FF6B00',
  },
});
