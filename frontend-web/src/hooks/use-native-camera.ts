/**
 * useNativeCamera Hook
 * Camera functionality with web fallback
 */

import { useState, useCallback } from 'react';
import {
  capturePhoto,
  pickFromGallery,
  compressPhoto,
  checkCameraPermission,
  requestCameraPermission,
  isNativePlatform,
  type CapturedPhoto,
  type CaptureOptions,
} from '@/services/native/camera';

// =============================================================================
// Hook
// =============================================================================

export function useNativeCamera() {
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Take photo from camera
   */
  const takePhoto = useCallback(async (options?: CaptureOptions): Promise<CapturedPhoto | null> => {
    setLoading(true);
    setError(null);

    try {
      const photo = await capturePhoto({
        quality: 80,
        width: 1920,
        height: 1080,
        ...options,
      });
      setPhotos((prev) => [...prev, photo]);
      return photo;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to take photo';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Pick photo from gallery
   */
  const pickPhoto = useCallback(async (): Promise<CapturedPhoto | null> => {
    setLoading(true);
    setError(null);

    try {
      const photos = await pickFromGallery(1);
      if (photos.length > 0) {
        const photo = photos[0];
        setPhotos((prev) => [...prev, photo]);
        return photo;
      }
      return null;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to pick photo';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Pick multiple photos from gallery
   */
  const pickPhotos = useCallback(async (count = 5): Promise<CapturedPhoto[]> => {
    setLoading(true);
    setError(null);

    try {
      const photos = await pickFromGallery(count);
      setPhotos((prev) => [...prev, ...photos]);
      return photos;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to pick photos';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Compress photo
   */
  const compress = useCallback(
    async (photo: CapturedPhoto, quality = 80): Promise<CapturedPhoto | null> => {
      try {
        const compressed = await compressPhoto(photo, {
          quality: quality / 100,
          maxWidth: 1920,
          maxHeight: 1080,
        });
        return compressed;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to compress';
        setError(message);
        return null;
      }
    },
    []
  );

  /**
   * Remove photo
   */
  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /**
   * Clear all photos
   */
  const clearPhotos = useCallback(() => {
    setPhotos([]);
  }, []);

  /**
   * Check permission
   */
  const checkPermission = useCallback(async (): Promise<boolean> => {
    return checkCameraPermission();
  }, []);

  /**
   * Request permission
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    return requestCameraPermission();
  }, []);

  return {
    photos,
    loading,
    error,
    isNative: isNativePlatform(),
    takePhoto,
    pickPhoto,
    pickPhotos,
    compress,
    removePhoto,
    clearPhotos,
    checkPermission,
    requestPermission,
  };
}