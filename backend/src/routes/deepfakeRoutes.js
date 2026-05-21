/**
 * Deepfake Detection Routes
 * =============
 * Express router for deepfake detection endpoints
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { DeepfakeDetectionService } = require('../services/deepfake-detection');

const router = express.Router();
const deepfakeService = new DeepfakeDetectionService();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/deepfake');
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
// Full Deepfake Analysis
// ==========================================================

// POST /api/trust/deepfake/analyze - Full analysis (Gemini + CNN)
router.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image file provided' });
      return;
    }

    const report = await deepfakeService.analyze(req.file.path);

    // Clean up uploaded file
    try {
      fs.unlinkSync(req.file.path);
    } catch {
      // Ignore cleanup errors
    }

    res.json(report);
  } catch (error) {
    console.error('DEEPFAKE_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Quick Analysis (CNN only)
// ==========================================================

// POST /api/trust/deepfake/quick - Quick analysis (CNN only)
router.post('/quick', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image file provided' });
      return;
    }

    const result = await deepfakeService.quickAnalyze(req.file.path);

    // Clean up
    try {
      fs.unlinkSync(req.file.path);
    } catch {
      // Ignore cleanup errors
    }

    res.json(result);
  } catch (error) {
    console.error('DEEPFAKE_QUICK_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Gemini Only
// ==========================================================

// POST /api/trust/deepfake/gemini - Gemini Vision only
router.post('/gemini', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image file provided' });
      return;
    }

    const { GeminiDeepfakeDetector } = require('../services/deepfake-detection');
    const geminiDetector = new GeminiDeepfakeDetector();

    const result = await geminiDetector.analyze(req.file.path);

    // Clean up
    try {
      fs.unlinkSync(req.file.path);
    } catch {
      // Ignore cleanup errors
    }

    res.json(result);
  } catch (error) {
    console.error('DEEPFAKE_GEMINI_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Batch Analysis
// ==========================================================

// POST /api/trust/deepfake/batch - Batch analyze multiple images
router.post('/batch', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      res.status(400).json({ error: 'No image files provided' });
      return;
    }

    const results = await Promise.all(
      req.files.map(async (file) => {
        try {
          return await deepfakeService.analyze(file.path);
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
    console.error('DEEPFAKE_BATCH_ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ==========================================================
// Health Check
// ==========================================================

// GET /api/trust/deepfake/health - Health check
router.get('/health', async (req, res) => {
  try {
    res.json({
      status: 'healthy',
      timestamp: new Date(),
      gemini_configured: !!process.env.GEMINI_API_KEY,
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});

module.exports = router;