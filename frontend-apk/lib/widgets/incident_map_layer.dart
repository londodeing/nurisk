import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../services/offline_map_service.dart';

/// Incident marker layer for map
/// - Renders severity-colored markers
/// - Shows popup on tap
/// - Implements clustering for performance
class IncidentMarkerLayer extends StatelessWidget {
  final List<IncidentMarker> incidents;
  final Function(IncidentMarker)? onMarkerTap;
  final MapController? mapController;

  const IncidentMarkerLayer({
    super.key,
    required this.incidents,
    this.onMarkerTap,
    this.mapController,
  });

  @override
  Widget build(BuildContext context) {
    final markers = _buildMarkers();
    return MarkerLayer(markers: markers);
  }

  /// Build markers with clustering
  List<Marker> _buildMarkers() {
    if (incidents.isEmpty) return [];

    // Get current zoom from map controller
    final zoom = mapController?.camera.zoom ?? 10.0;

    // Cluster if zoom < 10
    if (zoom < 10) {
      return _buildClusteredMarkers(zoom);
    }

    // Show individual markers
    return incidents.map((incident) => _createMarker(incident)).toList();
  }

  /// Build clustered markers
  List<Marker> _buildClusteredMarkers(double zoom) {
    // Simple clustering by grid
    final clusters = <String, List<IncidentMarker>>{};
    final clusterSize = _getClusterSize(zoom);

    for (final incident in incidents) {
      final key = '${(incident.position.latitude / clusterSize).floor()}_${(incident.position.longitude / clusterSize).floor()}';
      clusters.putIfAbsent(key, () => []).add(incident);
    }

    return clusters.entries.map((entry) {
      final clusterIncidents = entry.value;
      if (clusterIncidents.length == 1) {
        return _createMarker(clusterIncidents.first);
      }
      return _createClusterMarker(clusterIncidents);
    }).toList();
  }

  /// Get cluster size based on zoom
  double _getClusterSize(double zoom) {
    if (zoom < 6) return 2.0;
    if (zoom < 8) return 1.0;
    if (zoom < 10) return 0.5;
    return 0.25;
  }

  /// Create individual marker
  Marker _createMarker(IncidentMarker incident) {
    return Marker(
      point: incident.position,
      width: 40,
      height: 40,
      child: GestureDetector(
        onTap: () => onMarkerTap?.call(incident),
        child: _buildMarkerWidget(incident),
      ),
    );
  }

  /// Create cluster marker
  Marker _createClusterMarker(List<IncidentMarker> incidents) {
    // Calculate center
    var lat = 0.0;
    var lng = 0.0;
    for (final i in incidents) {
      lat += i.position.latitude;
      lng += i.position.longitude;
    }
    lat /= incidents.length;
    lng /= incidents.length;

    // Get highest severity
    String? highestSeverity;
    for (final i in incidents) {
      if (i.severity == 'CRITICAL') {
        highestSeverity = 'CRITICAL';
        break;
      }
      if (i.severity == 'HIGH' && highestSeverity != 'CRITICAL') {
        highestSeverity = 'HIGH';
      }
    }

    return Marker(
      point: LatLng(lat, lng),
      width: 50,
      height: 50,
      child: _buildClusterWidget(incidents.length, highestSeverity),
    );
  }

  /// Build marker widget
  Widget _buildMarkerWidget(IncidentMarker incident) {
    final color = IncidentMarkerColors.getColor(incident.severity);
    return Container(
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white, width: 2),
        boxShadow: [
          BoxShadow(
            color: Colors.black26,
            blurRadius: 4,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Center(
        child: Icon(
          _getSeverityIcon(incident.severity),
          color: Colors.white,
          size: 20,
        ),
      ),
    );
  }

  /// Build cluster widget
  Widget _buildClusterWidget(int count, String? severity) {
    final color = IncidentMarkerColors.getColor(severity);
    return Container(
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white, width: 2),
        boxShadow: [
          BoxShadow(
            color: Colors.black26,
            blurRadius: 4,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Center(
        child: Text(
          count > 99 ? '99+' : count.toString(),
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 14,
          ),
        ),
      ),
    );
  }

  /// Get severity icon
  IconData _getSeverityIcon(String? severity) {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return Icons.warning;
      case 'HIGH':
        return Icons.error;
      case 'MEDIUM':
        return Icons.info;
      case 'LOW':
        return Icons.check_circle;
      default:
        return Icons.help;
    }
  }
}

/// Incident marker data
class IncidentMarker {
  final int id;
  final String title;
  final String? description;
  final String? severity;
  final LatLng position;
  final String? status;
  final DateTime? createdAt;

  IncidentMarker({
    required this.id,
    required this.title,
    this.description,
    this.severity,
    required this.position,
    this.status,
    this.createdAt,
  });
}

/// Incident popup widget
class IncidentPopup extends StatelessWidget {
  final IncidentMarker incident;
  final VoidCallback? onTap;

  const IncidentPopup({
    super.key,
    required this.incident,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final color = IncidentMarkerColors.getColor(incident.severity);
    return Card(
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 12,
                    height: 12,
                    decoration: BoxDecoration(
                      color: color,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      incident.title,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              if (incident.severity != null) ...[
                const SizedBox(height: 4),
                Text(
                  incident.severity!,
                  style: TextStyle(
                    color: color,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
              if (incident.description != null) ...[
                const SizedBox(height: 4),
                Text(
                  incident.description!,
                  style: const TextStyle(fontSize: 12),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}