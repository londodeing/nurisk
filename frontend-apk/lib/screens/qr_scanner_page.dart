import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../services/qr_scanner_service.dart';
import '../services/api_service.dart';

/// QR Scanner Page
/// - Camera preview with scan overlay
/// - Decodes asset QR codes
/// - Shows asset detail bottom sheet
class QrScannerPage extends StatefulWidget {
  const QrScannerPage({super.key});

  @override
  State<QrScannerPage> createState() => _QrScannerPageState();
}

class _QrScannerPageState extends State<QrScannerPage> {
  bool _hasPermission = false;
  bool _isScanning = true;
  String? _lastScanned;

  @override
  void initState() {
    super.initState();
    _checkPermission();
  }

  Future<void> _checkPermission() async {
    final hasPermission = await QrScannerService.hasCameraPermission();
    if (!hasPermission) {
      final granted = await QrScannerService.requestCameraPermission();
      setState(() => _hasPermission = granted);
    } else {
      setState(() => _hasPermission = true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan Asset QR'),
        actions: [
          IconButton(
            icon: const Icon(Icons.flash_on),
            onPressed: () => QrScannerService.controller.toggleTorch(),
          ),
          IconButton(
            icon: const Icon(Icons.flip_camera_android),
            onPressed: () => QrScannerService.controller.switchCamera(),
          ),
        ],
      ),
      body: !_hasPermission
          ? _buildPermissionDenied()
          : Stack(
              children: [
                // Camera preview
                MobileScanner(
                  controller: QrScannerService.controller,
                  onDetect: _onDetect,
                ),
                // Scan overlay
                _buildScanOverlay(),
                // Instructions
                Positioned(
                  bottom: 100,
                  left: 0,
                  right: 0,
                  child: _buildInstructions(),
                ),
              ],
            ),
    );
  }

  Widget _buildPermissionDenied() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.camera_alt, size: 64, color: Colors.grey),
            const SizedBox(height: 16),
            const Text(
              'Camera permission required',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'Please grant camera permission to scan QR codes',
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _checkPermission,
              child: const Text('Grant Permission'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildScanOverlay() {
    return CustomPaint(
      painter: ScanOverlayPainter(),
      child: const SizedBox.expand(),
    );
  }

  Widget _buildInstructions() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.black54,
        borderRadius: BorderRadius.circular(12),
      ),
      child: const Text(
        'Point camera at asset QR code',
        style: TextStyle(color: Colors.white, fontSize: 16),
        textAlign: TextAlign.center,
      ),
    );
  }

  void _onDetect(BarcodeCapture capture) {
    if (!_isScanning) return;

    final barcodes = capture.barcodes;
    if (barcodes.isEmpty) return;

    final rawValue = barcodes.first.rawValue;
    if (rawValue == null || rawValue == _lastScanned) return;

    setState(() {
      _lastScanned = rawValue;
      _isScanning = false;
    });

    // Decode QR payload
    final result = QrScannerService.decodeQrPayload(rawValue);

    if (result.success && result.assetId != null) {
      _fetchAndShowAsset(result.assetId!);
    } else {
      _showError(result.errorMessage ?? 'Invalid QR code');
    }
  }

  Future<void> _fetchAndShowAsset(String assetId) async {
    try {
      // Fetch asset from API
      final asset = await ApiService.getAsset(assetId);
      if (asset != null) {
        if (mounted) {
          _showAssetDetail(asset);
        }
      } else {
        _showError('Asset not found');
      }
    } catch (e) {
      _showError('Failed to fetch asset');
    }
  }

  void _showAssetDetail(Map<String, dynamic> asset) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _AssetDetailSheet(
        asset: asset,
        onClose: () {
          setState(() => _isScanning = true);
          Navigator.pop(context);
        },
      ),
    );
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
    setState(() => _isScanning = true);
  }

  @override
  void dispose() {
    QrScannerService.dispose();
    super.dispose();
  }
}

/// Scan overlay painter
class ScanOverlayPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.black54
      ..style = PaintingStyle.fill;

    final scanAreaSize = size.width * 0.7;
    final scanAreaLeft = (size.width - scanAreaSize) / 2;
    final scanAreaTop = (size.height - scanAreaSize) / 2;

    // Draw overlay
    final path = Path()
      ..addRect(Rect.fromLTWH(0, 0, size.width, size.height))
      ..addRRect(RRect.fromRectAndRadius(
        Rect.fromLTWH(scanAreaLeft, scanAreaTop, scanAreaSize, scanAreaSize),
        const Radius.circular(12),
      ))
      ..fillType = PathFillType.evenOdd;

    canvas.drawPath(path, paint);

    // Draw corner brackets
    final bracketPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4
      ..strokeCap = StrokeCap.round;

    final cornerLength = 30.0;
    final corners = [
      // Top-left
      [
        Offset(scanAreaLeft, scanAreaTop + cornerLength),
        Offset(scanAreaLeft, scanAreaTop + 12),
        Offset(scanAreaLeft + cornerLength, scanAreaTop),
      ],
      // Top-right
      [
        Offset(scanAreaLeft + scanAreaSize - cornerLength, scanAreaTop),
        Offset(scanAreaLeft + scanAreaSize - 12, scanAreaTop),
        Offset(scanAreaLeft + scanAreaSize, scanAreaTop + cornerLength),
      ],
      // Bottom-left
      [
        Offset(scanAreaLeft, scanAreaTop + scanAreaSize - cornerLength),
        Offset(scanAreaLeft, scanAreaTop + scanAreaSize - 12),
        Offset(scanAreaLeft + cornerLength, scanAreaTop + scanAreaSize),
      ],
      // Bottom-right
      [
        Offset(scanAreaLeft + scanAreaSize - cornerLength, scanAreaTop + scanAreaSize),
        Offset(scanAreaLeft + scanAreaSize - 12, scanAreaTop + scanAreaSize),
        Offset(scanAreaLeft + scanAreaSize, scanAreaTop + scanAreaSize - cornerLength),
      ],
    ];

    for (final corner in corners) {
      final path = Path()
        ..moveTo(corner[0].dx, corner[0].dy)
        ..lineTo(corner[1].dx, corner[1].dy)
        ..lineTo(corner[2].dx, corner[2].dy);
      canvas.drawPath(path, bracketPaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Asset detail bottom sheet
class _AssetDetailSheet extends StatelessWidget {
  final Map<String, dynamic> asset;
  final VoidCallback onClose;

  const _AssetDetailSheet({
    required this.asset,
    required this.onClose,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle
          Container(
            margin: const EdgeInsets.only(top: 12),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          // Content
          Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title
                Text(
                  asset['name'] ?? 'Asset',
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                // Status
                _buildStatusChip(asset['status'] ?? 'unknown'),
                const SizedBox(height: 16),
                // Details
                _buildDetailRow('ID', asset['id']?.toString()),
                _buildDetailRow('Type', asset['type'] ?? 'unknown'),
                _buildDetailRow('Location', asset['location'] ?? 'unknown'),
                _buildDetailRow('Condition', asset['condition'] ?? 'unknown'),
                const SizedBox(height: 24),
                // Actions
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: onClose,
                        child: const Text('Close'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () {
                          // Navigate to asset detail
                          onClose();
                        },
                        child: const Text('View Details'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildStatusChip(String status) {
    Color color;
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        color = Colors.green;
        break;
      case 'MAINTENANCE':
        color = Colors.orange;
        break;
      case 'DAMAGED':
        color = Colors.red;
        break;
      default:
        color = Colors.grey;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(color: color, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}