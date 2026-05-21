import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:permission_handler/permission_handler.dart';

/// QR Scanner Service
/// - Handles camera permission
/// - Provides QR code scanning
/// - Decodes asset ID from QR payload
class QrScannerService {
  static final MobileScannerController _controller = MobileScannerController(
    detectionSpeed: DetectionSpeed.normal,
    facing: CameraFacing.back,
    torchEnabled: false,
  );

  /// Get scanner controller
  static MobileScannerController get controller => _controller;

  /// Request camera permission
  static Future<bool> requestCameraPermission() async {
    final status = await Permission.camera.request();
    return status.isGranted;
  }

  /// Check camera permission
  static Future<bool> hasCameraPermission() async {
    final status = await Permission.camera.status;
    return status.isGranted;
  }

  /// Decode asset ID from QR payload
  /// Expected format: nurisk://asset:{id} or JSON {type: "asset", id: 123}
  static QrDecodeResult decodeQrPayload(String rawValue) {
    // Try JSON format first
    try {
      final json = _parseJson(rawValue);
      if (json != null) {
        final type = json['type'] as String?;
        final id = json['id'];
        if (type == 'asset' && id != null) {
          return QrDecodeResult(
            success: true,
            assetId: id.toString(),
            rawValue: rawValue,
          );
        }
      }
    } catch (_) {
      // Not JSON
    }

    // Try URI format: nurisk://asset:123
    if (rawValue.startsWith('nurisk://asset/')) {
      final id = rawValue.replaceFirst('nurisk://asset/', '');
      return QrDecodeResult(
        success: true,
        assetId: id,
        rawValue: rawValue,
      );
    }

    // Try simple ID format
    if (_isNumeric(rawValue)) {
      return QrDecodeResult(
        success: true,
        assetId: rawValue,
        rawValue: rawValue,
      );
    }

    // Unknown format
    return QrDecodeResult(
      success: false,
      rawValue: rawValue,
      errorMessage: 'Unknown QR format',
    );
  }

  /// Parse JSON
  static Map<String, dynamic>? _parseJson(String value) {
    try {
      // Simple JSON parsing without import
      if (value.startsWith('{') && value.endsWith('}')) {
        final map = <String, dynamic>{};
        final content = value.substring(1, value.length - 1);
        final pairs = content.split(',');
        for (final pair in pairs) {
          final kv = pair.split(':');
          if (kv.length == 2) {
            final key = kv[0].trim().replaceAll('"', '');
            final v = kv[1].trim().replaceAll('"', '');
            map[key] = v;
          }
        }
        return map;
      }
    } catch (_) {}
    return null;
  }

  /// Check if string is numeric
  static bool _isNumeric(String s) {
    return double.tryParse(s) != null;
  }

  /// Dispose controller
  static void dispose() {
    _controller.dispose();
  }
}

/// QR decode result
class QrDecodeResult {
  final bool success;
  final String? assetId;
  final String rawValue;
  final String? errorMessage;

  QrDecodeResult({
    required this.success,
    this.assetId,
    required this.rawValue,
    this.errorMessage,
  });
}