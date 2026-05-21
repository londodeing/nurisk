/**
 * Media Forensics Service
 * =================
 * EXIF extraction and Error Level Analysis for image verification
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

export interface ExifData {
  // GPS
  gps_latitude?: number;
  gps_longitude?: number;
  gps_altitude?: number;
  
  // Date/Time
  date_taken?: string;
  date_modified?: string;
  date_digitized?: string;
  
  // Camera
  camera_make?: string;
  camera_model?: string;
  lens_model?: string;
  focal_length?: number;
  aperture?: number;
  shutter_speed?: string;
  iso?: number;
  flash?: string;
  
  // Software
  software?: string;
  processing_software?: string;
  
  // Image info
  image_width?: number;
  image_height?: number;
  orientation?: number;
  color_space?: string;
  
  // Raw tags
  raw?: Record<string, unknown>;
}

export interface ExifAnalysisResult {
  is_valid: boolean;
  has_gps: boolean;
  location_mismatch: boolean;
  date_issues: string[];
  camera_info: {
    make?: string;
    model?: string;
  };
  software_flags: string[];
  warnings: string[];
  exif_data: ExifData;
}

export interface ElaResult {
  is_tampered: boolean;
  tampering_probability: number;
  ela_heatmap_path?: string;
  suspicious_regions: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    severity: number;
  }>;
}

export interface ForensicsReport {
  report_id: string;
  filename: string;
  uploaded_at: Date;
  exif_analysis: ExifAnalysisResult;
  ela_analysis: ElaResult;
  combined_assessment: {
    is_authentic: boolean;
    confidence: number;
    flags: string[];
    recommended_action: 'publish' | 'review' | 'reject';
  };
}

// Location tolerance in degrees (approximately 10km)
const LOCATION_TOLERANCE = 0.1;

/**
 * EXIF Parser Options interface
 * Based on exifr library options
 */
interface ExifParserOptions {
  gps?: boolean;
  tiff?: boolean;
  exif?: boolean;
  ifd0?: boolean;
  interop?: boolean;
  pick?: string[];
  [key: string]: boolean | string | string[] | undefined;
}

/**
 * EXIF Service
 */
class ExifService {
  /**
   * Extract EXIF data from image
   */
  async extract(imagePath: string): Promise<ExifData> {
    const exifData: ExifData = {};

    try {
      // Use exifr if available, otherwise use basic parsing
      const exifr = await import('exifr');

      // Use true to enable all EXIF parsing, or use specific options
      const parsed = await exifr.parse(imagePath, true) as Record<string, unknown>;

      if (!parsed) {
        return exifData;
      }

      // GPS
      const gpsLat = parsed.GPSLatitude ?? parsed.latitude;
      const gpsLng = parsed.GPSLongitude ?? parsed.longitude;
      const gpsAlt = parsed.GPSAltitude ?? parsed.altitude;
      if (typeof gpsLat === 'number') {
        exifData.gps_latitude = gpsLat;
      }
      if (typeof gpsLng === 'number') {
        exifData.gps_longitude = gpsLng;
      }
      if (typeof gpsAlt === 'number') {
        exifData.gps_altitude = gpsAlt;
      }

      // Dates
      const dateOriginal = parsed.DateTimeOriginal as unknown;
      const dateTime = parsed.DateTime as unknown;
      const dateDigitized = parsed.DateTimeDigitized as unknown;
      if (dateOriginal instanceof Date) {
        exifData.date_taken = dateOriginal.toISOString();
      } else if (typeof dateOriginal === 'string') {
        exifData.date_taken = dateOriginal;
      }
      if (dateTime instanceof Date) {
        exifData.date_modified = dateTime.toISOString();
      } else if (typeof dateTime === 'string') {
        exifData.date_modified = dateTime;
      }
      if (dateDigitized instanceof Date) {
        exifData.date_digitized = dateDigitized.toISOString();
      } else if (typeof dateDigitized === 'string') {
        exifData.date_digitized = dateDigitized;
      }

      // Camera
      const make = parsed.Make as unknown;
      const model = parsed.Model as unknown;
      const lensModel = parsed.LensModel as unknown;
      const focalLength = parsed.FocalLength as unknown;
      const fNumber = parsed.FNumber as unknown;
      const exposureTime = parsed.ExposureTime as unknown;
      const iso = parsed.ISO as unknown;
      const flash = parsed.Flash as unknown;
      if (typeof make === 'string') {
        exifData.camera_make = make;
      }
      if (typeof model === 'string') {
        exifData.camera_model = model;
      }
      if (typeof lensModel === 'string') {
        exifData.lens_model = lensModel;
      }
      if (typeof focalLength === 'number') {
        exifData.focal_length = focalLength;
      }
      if (typeof fNumber === 'number') {
        exifData.aperture = fNumber;
      }
      if (typeof exposureTime === 'number' && exposureTime > 0) {
        exifData.shutter_speed = `1/${Math.round(1 / exposureTime)}`;
      }
      if (typeof iso === 'number') {
        exifData.iso = iso;
      }
      if (typeof flash === 'string') {
        exifData.flash = flash;
      }

      // Software
      const software = parsed.Software as unknown;
      const processingSoftware = parsed.ProcessingSoftware as unknown;
      if (typeof software === 'string') {
        exifData.software = software;
      }
      if (typeof processingSoftware === 'string') {
        exifData.processing_software = processingSoftware;
      }

      // Image info
      const imageWidth = parsed.ImageWidth ?? parsed.width;
      const imageHeight = parsed.ImageHeight ?? parsed.height;
      const orientation = parsed.Orientation as unknown;
      const colorSpace = parsed.ColorSpace as unknown;
      if (typeof imageWidth === 'number') {
        exifData.image_width = imageWidth;
      }
      if (typeof imageHeight === 'number') {
        exifData.image_height = imageHeight;
      }
      if (typeof orientation === 'number') {
        exifData.orientation = orientation;
      }
      if (typeof colorSpace === 'string') {
        exifData.color_space = colorSpace;
      }

      // Store raw
      exifData.raw = { ...parsed };

    } catch {
      // Fallback: try to read basic EXIF with sharp or return empty
      try {
        const sharp = await import('sharp');
        const metadata = await sharp.default(imagePath).metadata();
        
        exifData.image_width = metadata.width;
        exifData.image_height = metadata.height;
        exifData.orientation = metadata.orientation;
        
        if (metadata.exif) {
          exifData.raw = { exif: metadata.exif.toString('base64') };
        }
      } catch {
        // No EXIF data available
      }
    }

    return exifData;
  }

  /**
   * Analyze EXIF data against claimed location
   */
  async analyze(
    imagePath: string,
    claimedLocation?: { lat: number; lng: number }
  ): Promise<ExifAnalysisResult> {
    const exifData = await this.extract(imagePath);
    const warnings: string[] = [];
    const dateIssues: string[] = [];
    const softwareFlags: string[] = [];
    let locationMismatch = false;

    // Check GPS presence
    const hasGps = !!(exifData.gps_latitude && exifData.gps_longitude);

    // Check location mismatch
    if (claimedLocation && hasGps) {
      const latDiff = Math.abs(exifData.gps_latitude! - claimedLocation.lat);
      const lngDiff = Math.abs(exifData.gps_longitude! - claimedLocation.lng);
      
      if (latDiff > LOCATION_TOLERANCE || lngDiff > LOCATION_TOLERANCE) {
        locationMismatch = true;
        warnings.push(
          `GPS location (${exifData.gps_latitude}, ${exifData.gps_longitude}) contradicts claimed location`
        );
      }
    }

    // Check date issues
    if (exifData.date_taken && exifData.date_modified) {
      const taken = new Date(exifData.date_taken);
      const modified = new Date(exifData.date_modified);
      
      // Modified before taken is suspicious
      if (modified < taken) {
        dateIssues.push('Modified date is before capture date');
        warnings.push('Date inconsistency detected');
      }
      
      // Modified much later than taken
      const hoursDiff = (modified.getTime() - taken.getTime()) / (1000 * 60 * 60);
      if (hoursDiff > 24) {
        dateIssues.push(`Modified ${hoursDiff.toFixed(1)} hours after capture`);
      }
    }

    // Check for editing software
    if (exifData.software) {
      const editors = ['photoshop', 'gimp', 'lightroom', 'capture', 'edit'];
      const softwareLower = exifData.software.toLowerCase();
      
      for (const editor of editors) {
        if (softwareLower.includes(editor)) {
          softwareFlags.push(`Edited with ${exifData.software}`);
          warnings.push(`Image was processed with ${exifData.software}`);
          break;
        }
      }
    }

    // Check for stock images
    if (exifData.camera_make && exifData.camera_model) {
      const models = exifData.camera_model.toLowerCase();
      if (models.includes('dslr') || models.includes('mirrorless')) {
        // Professional camera - good sign
      }
    }

    return {
      is_valid: warnings.length === 0,
      has_gps: hasGps,
      location_mismatch: locationMismatch,
      date_issues: dateIssues,
      camera_info: {
        make: exifData.camera_make,
        model: exifData.camera_model,
      },
      software_flags: softwareFlags,
      warnings,
      exif_data: exifData,
    };
  }
}

/**
 * ELA Service - Error Level Analysis
 */
class ElaService {
  private tempDir: string;

  constructor(tempDir = '/tmp/ela') {
    this.tempDir = tempDir;
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Perform Error Level Analysis
   */
  async analyze(imagePath: string): Promise<ElaResult> {
    const result: ElaResult = {
      is_tampered: false,
      tampering_probability: 0,
      suspicious_regions: [],
    };

    try {
      // Use sharp for image processing
      const sharp = await import('sharp');
      
      const imageBuffer = fs.readFileSync(imagePath);
      const filename = path.basename(imagePath, path.extname(imagePath));
      
      // Step 1: Load original image
      const original = await sharp.default(imageBuffer);
      const metadata = await original.metadata();
      
      if (!metadata.width || !metadata.height) {
        return result;
      }

      // Step 2: Re-compress at 95% quality
      const recompressedPath = path.join(this.tempDir, `${filename}_recompressed.jpg`);
      await sharp.default(imageBuffer)
        .jpeg({ quality: 95 })
        .toFile(recompressedPath);

      // Step 3: Load both images
      const originalData = await sharp.default(imageBuffer)
        .raw()
        .toBuffer({ resolveWithObject: true });
      
      const recompressedData = await sharp.default(fs.readFileSync(recompressedPath))
        .raw()
        .toBuffer({ resolveWithObject: true });

      // Step 4: Calculate difference
      const diffBuffer = Buffer.alloc(originalData.data.length);
      let maxDiff = 0;
      let totalDiff = 0;
      let suspiciousCount = 0;

      const width = metadata.width;
      const channels = metadata.channels || 3;

      for (let i = 0; i < originalData.data.length; i++) {
        const diff = Math.abs(originalData.data[i] - recompressedData.data[i]);
        diffBuffer[i] = diff;
        totalDiff += diff;
        
        if (diff > maxDiff) {
          maxDiff = diff;
        }
        
        // Flag high-difference regions
        if (diff > 20) {
          suspiciousCount++;
        }
      }

      // Clean up temp file
      try {
        fs.unlinkSync(recompressedPath);
      } catch {
        // Ignore cleanup errors
      }

      // Step 5: Generate heatmap (simplified - just use difference buffer)
      const heatmapPath = path.join(this.tempDir, `${filename}_ela_heatmap.jpg`);
      await sharp.default(diffBuffer, {
        raw: {
          width,
          height: metadata.height,
          channels,
        },
      })
        .normalize()
        .jpeg({ quality: 80 })
        .toFile(heatmapPath);

      result.ela_heatmap_path = heatmapPath;

      // Step 6: Calculate tampering probability
      const avgDiff = totalDiff / originalData.data.length;
      const suspiciousRatio = suspiciousCount / (originalData.data.length / channels);

      // Higher values = more likely tampered
      if (avgDiff > 10 || suspiciousRatio > 0.01) {
        result.is_tampered = true;
        result.tampering_probability = Math.min(95, Math.round(avgDiff * 5 + suspiciousRatio * 1000));
      } else if (avgDiff > 5) {
        result.tampering_probability = Math.round(avgDiff * 2 + suspiciousRatio * 500);
      } else {
        result.tampering_probability = Math.round(avgDiff * 10);
      }

      // Detect suspicious regions (simplified grid-based)
      const gridSize = 50;
      const gridWidth = Math.ceil(width / gridSize);
      const gridHeight = Math.ceil(metadata.height / gridSize);

      for (let gy = 0; gy < gridHeight; gy++) {
        for (let gx = 0; gx < gridWidth; gx++) {
          let regionDiff = 0;
          let regionPixels = 0;

          for (let y = gy * gridSize; y < (gy + 1) * gridSize && y < metadata.height; y++) {
            for (let x = gx * gridSize; x < (gx + 1) * gridSize && x < width; x++) {
              const idx = (y * width + x) * channels;
              regionDiff += diffBuffer[idx];
              regionPixels++;
            }
          }

          const regionAvg = regionDiff / regionPixels;
          if (regionAvg > 15) {
            result.suspicious_regions.push({
              x: gx * gridSize,
              y: gy * gridSize,
              width: gridSize,
              height: gridSize,
              severity: Math.min(100, regionAvg),
            });
          }
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[ELA_SERVICE] Error:', errorMessage);
    }

    return result;
  }
}

/**
 * Combined Media Forensics
 */
class MediaForensicsService {
  private exifService: ExifService;
  private elaService: ElaService;

  constructor() {
    this.exifService = new ExifService();
    this.elaService = new ElaService();
  }

  /**
   * Analyze image
   */
  async analyzeImage(
    imagePath: string,
    claimedLocation?: { lat: number; lng: number }
  ): Promise<ForensicsReport> {
    const reportId = `forensics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const filename = path.basename(imagePath);

    // Run EXIF and ELA in parallel
    const [exifAnalysis, elaAnalysis] = await Promise.all([
      this.exifService.analyze(imagePath, claimedLocation),
      this.elaService.analyze(imagePath),
    ]);

    // Combined assessment
    const flags: string[] = [
      ...exifAnalysis.warnings,
    ];

    if (elaAnalysis.is_tampered) {
      flags.push('ELA detected potential tampering');
    }

    let isAuthentic = true;
    let confidence = 100;
    let recommendedAction: 'publish' | 'review' | 'reject' = 'publish';

    // Determine authenticity
    if (exifAnalysis.location_mismatch || exifAnalysis.date_issues.length > 0) {
      isAuthentic = false;
      confidence -= 30;
      recommendedAction = 'review';
    }

    if (elaAnalysis.tampering_probability > 50) {
      isAuthentic = false;
      confidence -= elaAnalysis.tampering_probability * 0.5;
      recommendedAction = 'reject';
    } else if (elaAnalysis.tampering_probability > 20) {
      isAuthentic = false;
      confidence -= 20;
      recommendedAction = 'review';
    }

    confidence = Math.max(0, Math.min(100, Math.round(confidence)));

    return {
      report_id: reportId,
      filename,
      uploaded_at: new Date(),
      exif_analysis: exifAnalysis,
      ela_analysis: elaAnalysis,
      combined_assessment: {
        is_authentic: isAuthentic,
        confidence,
        flags,
        recommended_action: recommendedAction,
      },
    };
  }
}

// Export for CommonJS
export { MediaForensicsService as MediaForensicsService, ExifService, ElaService };