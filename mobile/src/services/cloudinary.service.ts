import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { API_BASE_URL } from './api.config';

export type CloudinaryFolder =
  | 'dreamout/profiles'
  | 'dreamout/destinations'
  | 'dreamout/hotels'
  | 'dreamout/restaurants'
  | 'dreamout/galleries';

export interface CloudinaryUploadOptions {
  folder?: CloudinaryFolder;
  maxSizeBytes?: number;
  allowedMimeTypes?: string[];
  onProgress?: (progress: number) => void;
  tags?: string[];
}

export interface CloudinaryUploadResult {
  url: string;
  secure_url: string;
  public_id: string;
  format: string;
  width?: number;
  height?: number;
  bytes?: number;
  created_at?: string;
  original_filename?: string;
}

export interface UploadableFile {
  uri: string;
  type?: string;
  mimeType?: string;
  name?: string;
  fileName?: string;
  fileSize?: number;
  size?: number;
}

const DEFAULT_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB default
const DEFAULT_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
];

const DEFAULT_ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif'];

export class CloudinaryService {
  /**
   * Resolve Cloudinary Cloud Name from environment configurations
   */
  static getCloudName(): string {
    const fromConfig = Constants.expoConfig?.extra?.cloudinaryCloudName;
    const fromExpoPublic = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const fromVite = process.env.VITE_CLOUDINARY_CLOUD_NAME;
    const cloudName = fromConfig || fromExpoPublic || fromVite || '';

    return typeof cloudName === 'string' ? cloudName.trim() : '';
  }

  /**
   * Resolve Cloudinary Upload Preset from environment configurations
   */
  static getUploadPreset(): string {
    const fromConfig = Constants.expoConfig?.extra?.cloudinaryUploadPreset;
    const fromExpoPublic = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const fromVite = process.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    const preset = fromConfig || fromExpoPublic || fromVite || '';

    return typeof preset === 'string' ? preset.trim() : '';
  }

  /**
   * Determine the appropriate Cloudinary folder based on category or content type
   */
  static getFolderForCategory(category?: string): CloudinaryFolder {
    if (!category) return 'dreamout/destinations';

    const normalized = category.toLowerCase().trim();

    if (
      normalized.includes('food') ||
      normalized.includes('restaurant') ||
      normalized.includes('cafe') ||
      normalized.includes('eat') ||
      normalized.includes('dining')
    ) {
      return 'dreamout/restaurants';
    }

    if (
      normalized.includes('hotel') ||
      normalized.includes('resort') ||
      normalized.includes('stay') ||
      normalized.includes('lodge') ||
      normalized.includes('homestay') ||
      normalized.includes('camp')
    ) {
      return 'dreamout/hotels';
    }

    if (
      normalized.includes('profile') ||
      normalized.includes('avatar') ||
      normalized.includes('user')
    ) {
      return 'dreamout/profiles';
    }

    if (
      normalized.includes('moment') ||
      normalized.includes('story') ||
      normalized.includes('gallery') ||
      normalized.includes('photo') ||
      normalized.includes('journey')
    ) {
      return 'dreamout/galleries';
    }

    return 'dreamout/destinations';
  }

  /**
   * Validate file size and type before performing network upload
   */
  static validateFile(file: UploadableFile, options?: CloudinaryUploadOptions): void {
    if (!file || !file.uri) {
      throw new Error('No image file provided for upload.');
    }

    const maxSize = options?.maxSizeBytes || DEFAULT_MAX_SIZE_BYTES;
    const fileSize = file.fileSize ?? file.size;

    if (fileSize && fileSize > maxSize) {
      const mbLimit = Math.round(maxSize / (1024 * 1024));
      throw new Error(`The selected image exceeds the maximum allowed size of ${mbLimit}MB.`);
    }

    const mime = (file.mimeType || file.type || '').toLowerCase();
    const name = (file.fileName || file.name || file.uri).toLowerCase();
    const ext = name.split('.').pop() || '';

    const allowedMimes = options?.allowedMimeTypes || DEFAULT_ALLOWED_MIME_TYPES;

    if (mime && !allowedMimes.includes(mime)) {
      throw new Error('Unsupported image format. Please select a JPG, PNG, WebP, or HEIC image.');
    }

    if (!mime && ext && !DEFAULT_ALLOWED_EXTENSIONS.includes(ext) && !file.uri.startsWith('data:image')) {
      throw new Error('Unsupported image file extension. Please select a valid image.');
    }
  }

  /**
   * Extract Public ID from a Cloudinary URL
   */
  static extractPublicId(urlOrPublicId: string): string | null {
    if (!urlOrPublicId) return null;
    if (!urlOrPublicId.startsWith('http://') && !urlOrPublicId.startsWith('https://')) {
      return urlOrPublicId;
    }

    try {
      const match = urlOrPublicId.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
      if (match && match[1]) {
        return match[1];
      }
    } catch {
      // Fallback
    }

    return null;
  }

  /**
   * Upload an image to Cloudinary using unsigned upload preset
   */
  static async uploadImage(
    file: UploadableFile,
    options?: CloudinaryUploadOptions
  ): Promise<CloudinaryUploadResult> {
    const cloudName = this.getCloudName();
    const uploadPreset = this.getUploadPreset();

    if (!cloudName) {
      throw new Error(
        'Cloudinary Cloud Name is not configured. Please set VITE_CLOUDINARY_CLOUD_NAME or EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME.'
      );
    }

    if (!uploadPreset) {
      throw new Error(
        'Cloudinary Upload Preset is not configured. Please set VITE_CLOUDINARY_UPLOAD_PRESET or EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET.'
      );
    }

    // Client-side validation
    this.validateFile(file, options);

    const folder = options?.folder || 'dreamout/destinations';
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const formData = new FormData();
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', folder);

    if (options?.tags && options.tags.length > 0) {
      formData.append('tags', options.tags.join(','));
    }

    // Attach file appropriately based on runtime environment (Web vs React Native)
    if (Platform.OS === 'web') {
      if (file.uri.startsWith('blob:') || file.uri.startsWith('data:')) {
        const response = await fetch(file.uri);
        const blob = await response.blob();
        formData.append('file', blob, file.fileName || file.name || `image_${Date.now()}.jpg`);
      } else {
        formData.append('file', file.uri);
      }
    } else {
      const mime = file.mimeType || file.type || 'image/jpeg';
      const name = file.fileName || file.name || `image_${Date.now()}.${mime.includes('png') ? 'png' : 'jpg'}`;

      formData.append('file', {
        uri: file.uri,
        type: mime,
        name,
      } as any);
    }

    // Upload with progress support using XMLHttpRequest
    return new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', uploadUrl);

      if (xhr.upload && options?.onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = event.loaded / event.total;
            options.onProgress?.(progress);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (!data.secure_url) {
              reject(new Error('Cloudinary response did not contain a secure HTTPS image URL.'));
              return;
            }

            resolve({
              url: data.url,
              secure_url: data.secure_url,
              public_id: data.public_id,
              format: data.format,
              width: data.width,
              height: data.height,
              bytes: data.bytes,
              created_at: data.created_at,
              original_filename: data.original_filename,
            });
          } catch (parseError: any) {
            reject(new Error(`Failed to parse Cloudinary response: ${parseError.message}`));
          }
        } else {
          try {
            const errorObj = JSON.parse(xhr.responseText);
            const serverMsg = errorObj.error?.message || `Upload failed with HTTP status ${xhr.status}`;
            reject(new Error(serverMsg));
          } catch {
            reject(new Error(`Upload failed with HTTP status ${xhr.status}: ${xhr.statusText}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(
          new Error(
            'Network request failed while uploading image to Cloudinary. Please check your network connection.'
          )
        );
      };

      xhr.ontimeout = () => {
        reject(new Error('Image upload timed out. Please try again.'));
      };

      xhr.timeout = 60000; // 60 seconds timeout
      xhr.send(formData);
    });
  }

  /**
   * Request backend deletion of a Cloudinary asset.
   * Never exposes credentials or attempts client-side deletion.
   */
  static async requestAssetDeletion(publicIdOrUrl: string): Promise<boolean> {
    const publicId = this.extractPublicId(publicIdOrUrl);
    if (!publicId) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/media/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId, url: publicIdOrUrl }),
      });

      return response.ok;
    } catch (err) {
      console.warn('[CloudinaryService] Warning: Failed to trigger backend asset deletion:', err);
      return false;
    }
  }
}
