import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import {
  CloudinaryService,
  CloudinaryFolder,
  UploadableFile,
} from '@/services/cloudinary.service';

export interface CloudinaryImagePickerProps {
  value?: string | null;
  onChange: (url: string) => void;
  folder?: CloudinaryFolder;
  category?: string;
  aspect?: [number, number];
  label?: string;
  required?: boolean;
  error?: string | null;
  disabled?: boolean;
  shape?: 'rectangle' | 'circle' | 'square';
  placeholderText?: string;
}

export const CloudinaryImagePicker: React.FC<CloudinaryImagePickerProps> = ({
  value,
  onChange,
  folder,
  category,
  aspect = [16, 9],
  label,
  required = false,
  error,
  disabled = false,
  shape = 'rectangle',
  placeholderText = 'Add Photo',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isOptionsModalVisible, setIsOptionsModalVisible] = useState(false);

  const targetFolder = folder || CloudinaryService.getFolderForCategory(category);

  const handlePickFromLibrary = async () => {
    setIsOptionsModalVisible(false);
    setLocalError(null);

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Photo Library Permission Needed',
          'DreamOut needs access to your photos to upload an image to Cloudinary.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: aspect,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        await performUpload({
          uri: asset.uri,
          mimeType: asset.mimeType || 'image/jpeg',
          fileName: asset.fileName || `image_${Date.now()}.jpg`,
          fileSize: asset.fileSize,
        });
      }
    } catch (err: any) {
      console.error('[CloudinaryImagePicker] Error selecting photo:', err);
      setLocalError(err?.message || 'Failed to select image.');
    }
  };

  const handleLaunchCamera = async () => {
    setIsOptionsModalVisible(false);
    setLocalError(null);

    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Camera Permission Needed',
          'DreamOut needs camera permission to capture and upload a photo.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: aspect,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        await performUpload({
          uri: asset.uri,
          mimeType: asset.mimeType || 'image/jpeg',
          fileName: asset.fileName || `camera_${Date.now()}.jpg`,
          fileSize: asset.fileSize,
        });
      }
    } catch (err: any) {
      console.error('[CloudinaryImagePicker] Error capturing photo:', err);
      setLocalError(err?.message || 'Failed to capture photo.');
    }
  };

  const performUpload = async (file: UploadableFile) => {
    setIsUploading(true);
    setUploadProgress(0);
    setLocalError(null);

    try {
      const result = await CloudinaryService.uploadImage(file, {
        folder: targetFolder,
        onProgress: (p) => setUploadProgress(p),
      });

      // Notify parent component of newly uploaded secure HTTPS Cloudinary URL
      onChange(result.secure_url);
    } catch (err: any) {
      console.error('[CloudinaryImagePicker] Cloudinary upload failed:', err);
      setLocalError(err?.message || 'Upload failed. Please check network connection.');
      Alert.alert('Upload Failed', err?.message || 'Could not upload image to Cloudinary.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = () => {
    onChange('');
    setLocalError(null);
  };

  const activeError = error || localError;

  return (
    <View style={styles.container}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>
            {label} {required && <Text style={styles.requiredAsterisk}>*</Text>}
          </Text>
          {targetFolder && (
            <Text style={styles.folderBadge}>{targetFolder.replace('dreamout/', '')}</Text>
          )}
        </View>
      ) : null}

      {/* Main Tile / Preview */}
      <View
        style={[
          styles.previewContainer,
          shape === 'circle' && styles.shapeCircle,
          shape === 'square' && styles.shapeSquare,
          activeError ? styles.errorBorder : null,
        ]}
      >
        {value ? (
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: value }}
              style={[
                styles.previewImage,
                shape === 'circle' && styles.shapeCircle,
                shape === 'square' && styles.shapeSquare,
              ]}
              resizeMode="cover"
            />
            {isUploading && (
              <View style={styles.uploadOverlay}>
                <ActivityIndicator color="#FF6B00" size="large" />
                <Text style={styles.uploadText}>
                  Uploading to Cloudinary {Math.round(uploadProgress * 100)}%
                </Text>
              </View>
            )}
            {!isUploading && !disabled && (
              <View style={styles.actionsOverlay}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  activeOpacity={0.8}
                  onPress={() => setIsOptionsModalVisible(true)}
                >
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                  <Text style={styles.actionBtnText}>Change</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.removeBtn]}
                  activeOpacity={0.8}
                  onPress={handleRemoveImage}
                >
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.emptyPlaceholder,
              shape === 'circle' && styles.shapeCircle,
              shape === 'square' && styles.shapeSquare,
              disabled && { opacity: 0.5 },
            ]}
            activeOpacity={0.7}
            disabled={disabled || isUploading}
            onPress={() => setIsOptionsModalVisible(true)}
          >
            {isUploading ? (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator color="#FF6B00" size="small" />
                <Text style={styles.uploadText}>
                  Uploading {Math.round(uploadProgress * 100)}%
                </Text>
              </View>
            ) : (
              <View style={styles.placeholderContent}>
                <View style={styles.iconCircle}>
                  <Ionicons name="cloud-upload-outline" size={24} color="#FF6B00" />
                </View>
                <Text style={styles.placeholderText}>{placeholderText}</Text>
                <Text style={styles.placeholderSubtext}>JPG, PNG, WebP up to 10MB</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Error Message */}
      {activeError ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={14} color="#EF4444" />
          <Text style={styles.errorText}>{activeError}</Text>
        </View>
      ) : null}

      {/* Bottom Sheet Modal for Pick Source */}
      <Modal
        visible={isOptionsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOptionsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setIsOptionsModalVisible(false)}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Upload Image to Cloudinary</Text>
            <Text style={styles.modalSubtitle}>
              Folder: <Text style={styles.modalFolderText}>{targetFolder}</Text>
            </Text>

            <TouchableOpacity
              style={styles.optionRow}
              activeOpacity={0.7}
              onPress={handleLaunchCamera}
            >
              <View style={[styles.optionIcon, { backgroundColor: 'rgba(255, 107, 0, 0.15)' }]}>
                <Ionicons name="camera" size={22} color="#FF6B00" />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Take Photo</Text>
                <Text style={styles.optionDesc}>Use your device camera</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionRow}
              activeOpacity={0.7}
              onPress={handlePickFromLibrary}
            >
              <View style={[styles.optionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <Ionicons name="images" size={22} color="#3B82F6" />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Choose from Gallery</Text>
                <Text style={styles.optionDesc}>Select from your photo library</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.7}
              onPress={() => setIsOptionsModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  requiredAsterisk: {
    color: '#FF6B00',
  },
  folderBadge: {
    color: '#6B7280',
    fontSize: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  previewContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#12141A',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    position: 'relative',
  },
  shapeSquare: {
    height: 140,
    width: 140,
    alignSelf: 'center',
  },
  shapeCircle: {
    height: 110,
    width: 110,
    borderRadius: 55,
    alignSelf: 'center',
  },
  errorBorder: {
    borderColor: '#EF4444',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 11, 14, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  uploadText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  actionsOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(10, 11, 14, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  removeBtn: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 8,
  },
  emptyPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#12141A',
    borderStyle: 'dashed',
  },
  placeholderContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  placeholderText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  placeholderSubtext: {
    color: '#6B7280',
    fontSize: 11,
  },
  uploadingContainer: {
    alignItems: 'center',
    gap: 8,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  errorText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#161922',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalSubtitle: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  modalFolderText: {
    color: '#FF6B00',
    fontWeight: '700',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E212A',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  optionDesc: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  cancelButtonText: {
    color: '#9CA3AF',
    fontSize: 15,
    fontWeight: '700',
  },
});
