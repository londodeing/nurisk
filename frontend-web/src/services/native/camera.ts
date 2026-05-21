/**
 * @deprecated Use SDK from @nurisk/sdk instead.
 *             Migrate to: import { sdk } from '@/services/api'
 */
/**
 * Camera Service
 * Native camera access via Capacitor with web fallback
 */

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

// =============================================================================
// Types
// =============================================================================

export interface CaptureOptions {
  quality?: number;
  width?: number;
  height?: number;
  allowEditing?: boolean;
  source?: 'camera' | 'gallery';
}

export interface CapturedPhoto {
  base64?: string;
  dataUrl?: string;
  path: string;
  format: 'jpeg' | 'png';
  width: number;
  height: number;
  size: number;
}

export interface CompressionOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png';
}

// =============================================================================
// Utility: Compress Image
// =============================================================================

/**
 * Compress image using canvas (web fallback)
 */
async function compressImageWeb(
  dataUrl: string,
  options: CompressionOptions = {}
): Promise<CapturedPhoto> {
  const { quality = 0.8, maxWidth = 1920, maxHeight = 1080, format = 'jpeg' } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // Scale down if needed
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      const outputFormat = format === 'png' ? 'image/png' : 'image/jpeg';
      const compressedDataUrl = canvas.toDataURL(outputFormat, quality);

      // Extract base64
      const base64 = compressedDataUrl.split(',')[1];

      // Calculate size
      const size = Math.round((base64.length * 3) / 4);

      resolve({
        dataUrl: compressedDataUrl,
        base64,
        path: '',
        format,
        width,
        height,
        size,
      });
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}

// =============================================================================
// Camera Service
// =============================================================================

/**
 * Check if running on native platform
 */
export function isNativePlatform(): boolean {
  return (
    typeof window !== 'undefined' &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    !!(window as any).Capacitor?.isNativePlatform?.()
  );
}

/**
 * Check camera permission
 */
export async function checkCameraPermission(): Promise<boolean> {
  try {
    if (isNativePlatform()) {
      const permission = await Camera.checkPermissions();
      return permission.camera === 'granted';
    }
    // Web fallback - always return true, will prompt on use
    return true;
  } catch {
    return false;
  }
}

/**
 * Request camera permission
 */
export async function requestCameraPermission(): Promise<boolean> {
  try {
    if (isNativePlatform()) {
      const permission = await Camera.requestPermissions();
      return permission.camera === 'granted';
    }
    // Web fallback - browser will prompt
    return true;
  } catch {
    return false;
  }
}

/**
 * Take photo from camera or gallery
 */
export async function capturePhoto(options: CaptureOptions = {}): Promise<CapturedPhoto> {
  const {
    quality = 80,
    width = 1920,
    height = 1080,
    allowEditing = false,
    source = 'camera',
  } = options;

  // Check permission first
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) {
    throw new Error('Camera permission denied');
  }

  try {
    if (isNativePlatform()) {
      // Use Capacitor Camera
      const result = await Camera.getPhoto({
        quality,
        allowEditing,
        resultType: CameraResultType.DataUrl,
        source: source === 'camera' ? CameraSource.Camera : CameraSource.Photos,
        width,
        height,
      });

      // Compress if needed
      if (quality < 100) {
        return compressImageWeb(result.dataUrl!, {
          quality: quality / 100,
          maxWidth: width,
          maxHeight: height,
        });
      }

      // Return as-is
      const base64 = result.dataUrl?.split(',')[1] || '';
      return {
        dataUrl: result.dataUrl,
        base64,
        path: result.webPath || '',
        format: result.format === 'png' ? 'png' : 'jpeg',
        width: result.width || width,
        height: result.height || height,
        size: Math.round(base64.length * 0.75),
      };
    } else {
      // Web fallback using input element
      return capturePhotoWeb(source);
    }
  } catch (error) {
    console.error('Camera capture error:', error);
    throw error;
  }
}

/**
 * Web fallback for camera capture
 */
function capturePhotoWeb(source: 'camera' | 'gallery'): Promise<CapturedPhoto> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = source === 'camera' ? 'environment' : undefined;

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }

      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;

        // Get dimensions
        const img = new Image();
        img.onload = async () => {
          const compressed = await compressImageWeb(dataUrl, {
            quality: 0.8,
            maxWidth: 1920,
            maxHeight: 1080,
          });
          resolve(compressed);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = dataUrl;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    };

    input.oncancel = () => reject(new Error('Capture cancelled'));
    input.click();
  });
}

/**
 * Pick multiple photos from gallery
 */
export async function pickFromGallery(count = 5): Promise<CapturedPhoto[]> {
  if (isNativePlatform()) {
    const result = await Camera.getPhotos({
      images: [],
      quality: 80,
    });
    // Handle multiple selection
    return result.images.map((img: any) => ({
      path: img.path,
      format: img.format === 'png' ? 'png' : 'jpeg',
      width: img.width,
      height: img.height,
      size: 0,
    }));
  }

  // Web fallback
  return pickFromGalleryWeb(count);
}

/**
 * Web fallback for gallery
 */
function pickFromGalleryWeb(count: number): Promise<CapturedPhoto[]> {
  return new Promise((resolve, _reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.maxFiles = count;

    input.onchange = async () => {
      const files = Array.from(input.files || []);
      const results: CapturedPhoto[] = [];

      for (const file of files) {
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((res, rej) => {
          reader.onload = () => res(reader.result as string);
          reader.onerror = () => rej(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        });

        const compressed = await compressImageWeb(dataUrl);
        results.push(compressed);
      }

      resolve(results);
    };

    input.oncancel = () => resolve([]);
    input.click();
  });
}

/**
 * Compress existing photo
 */
export async function compressPhoto(
  photo: CapturedPhoto,
  options: CompressionOptions = {}
): Promise<CapturedPhoto> {
  if (!photo.dataUrl) {
    throw new Error('No photo data to compress');
  }

  return compressImageWeb(photo.dataUrl, options);
}

/**
 * Convert photo to base64 for upload
 */
export function photoToBase64(photo: CapturedPhoto): string {
  return photo.base64 || photo.dataUrl?.split(',')[1] || '';
}

/**
 * Get photo blob for upload
 */
export async function photoToBlob(photo: CapturedPhoto): Promise<Blob> {
  const base64 = photoToBase64(photo);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: `image/${photo.format}` });
}