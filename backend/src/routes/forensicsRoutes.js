/**
 * Media Forensics Routes
 * =============
 * Express router for media forensics endpoints
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { MediaForensicsService } = require('../services/media-forensics');

const router = express.Router();
const forensicsService = new MediaForensicsService();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/forensics');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    if (allowedTypes.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// ==========================================================
// Image Forensics
// ==========================================================

// POST /api/trust/forensics/image - Analyze image
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image file provided' });
      return;
    }

    const { claimedLat, claimedLng } = req.body;
    const claimedLocation = claimedLat && claimedLng
      ? { lat: parseFloat(claimedLat), lng: parseFloat(claimedLng) }
      : undefined;

    const report = await forensicsService.analyzeImage(req.file.path, claimedLocation);

    // Clean up uploaded file after analysis
    try {
      fs.unlinkSync(req.file.path);
    } catch {
      // Ignore cleanup errors
    }

    res.json(report);
  } catch (error) {
    console.error('FORENSICS_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// EXIF Only
// ==========================================================

// POST /api/trust/forensics/exif - Extract EXIF only
router.post('/exif', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image file provided' });
      return;
    }

    const { ExifService } = require('../services/media-forensics');
    const exifService = new ExifService();

    const { claimedLat, claimedLng } = req.body;
    const claimedLocation = claimedLat && claimedLng
      ? { lat: parseFloat(claimedLat), lng: parseFloat(claimedLng) }
      : undefined;

    const analysis = await exifService.analyze(req.file.path, claimedLocation);

    // Clean up
    try {
      fs.unlinkSync(req.file.path);
    } catch {
      // Ignore
    }

    res.json(analysis);
  } catch (error) {
    console.error('EXIF_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// ELA Only
// ==========================================================

// POST /api/trust/forensics/ela - Run ELA only
router.post('/ela', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image file provided' });
      return;
    }

    const { ElaService } = require('../services/media-forensics');
    const elaService = new ElaService();

    const result = await elaService.analyze(req.file.path);

    // Clean up
    try {
      fs.unlinkSync(req.file.path);
      if (result.ela_heatmap_path) {
        fs.unlinkSync(result.ela_heatmap_path);
      }
    } catch {
      // Ignore
    }

    res.json(result);
  } catch (error) {
    console.error('ELA_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Batch Analysis
// ==========================================================

// POST /api/trust/forensics/batch - Batch analyze multiple images
router.post('/batch', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      res.status(400).json({ error: 'No image files provided' });
      return;
    }

    const { claimedLat, claimedLng } = req.body;
    const claimedLocation = claimedLat && claimedLng
      ? { lat: parseFloat(claimedLat), lng: parseFloat(claimedLng) }
      : undefined;

    const results = await Promise.all(
      req.files.map(async (file) => {
        try {
          return await forensicsService.analyzeImage(file.path, claimedLocation);
        } catch (error) {
          return {
            report_id: file.filename,
            error: error.message,
          };
        } finally {
          // Clean up
          try {
            fs.unlinkSync(file.path);
          } catch {
            // Ignore
          }
        }
      })
    );

    res.json(results);
  } catch (error) {
    console.error('FORENSICS_BATCH_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Health Check
// ==========================================================

// GET /api/trust/forensics/health - Health check
router.get('/health', async (req, res) => {
  try {
    res.json({
      status: 'healthy',
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});

module.exports = router;