import '../services/api_service.dart';

/// Warehouse Repository
/// ==================
/// Repository for warehouse-related API operations

class WarehouseRepository {
  final ApiService _api = ApiService();

  // ==========================================================
  // Warehouse Operations
  // ==========================================================

  /// Get all warehouses with optional filters
  Future<List<Warehouse>> getWarehouses({WarehouseFilters? filters}) async {
    final queryParams = filters?.toQueryParams() ?? {};
    final response = await _api.getWarehouses(params: queryParams);
    final data = response.data['warehouses'] ?? response.data;
    if (data is List) {
      return data.map((json) => Warehouse.fromJson(json)).toList();
    }
    return [];
  }

  /// Get warehouse by ID
  Future<Warehouse> getWarehouseById(int id) async {
    final response = await _api.getWarehouseById(id);
    return Warehouse.fromJson(response.data);
  }

  /// Get warehouse inventory
  Future<List<InventoryItem>> getInventory(int warehouseId, {InventoryFilters? filters}) async {
    final queryParams = filters?.toQueryParams() ?? {};
    final response = await _api.getWarehouseInventory(warehouseId, params: queryParams);
    final data = response.data['inventory'] ?? response.data;
    if (data is List) {
      return data.map((json) => InventoryItem.fromJson(json)).toList();
    }
    return [];
  }

  /// Search warehouses within bounding box
  Future<List<Warehouse>> searchByBoundingBox(WarehouseBBox bbox) async {
    final queryParams = bbox.toQueryParams();
    final response = await _api.getWarehouses(params: queryParams);
    final data = response.data['warehouses'] ?? response.data;
    if (data is List) {
      return data.map((json) => Warehouse.fromJson(json)).toList();
    }
    return [];
  }

  /// Search warehouses near a point
  Future<List<Warehouse>> searchNearby(double lat, double lng, {double radiusKm = 10}) async {
    final bbox = _calculateBoundingBox(lat, lng, radiusKm);
    return searchByBoundingBox(bbox);
  }

  // Helper: Calculate bounding box from center point and radius
  WarehouseBBox _calculateBoundingBox(double lat, double lng, double radiusKm) {
    final latDelta = radiusKm / 111;
    final lngDelta = radiusKm / (111 * _cos(lat * 3.14159 / 180));
    return WarehouseBBox(
      minLat: lat - latDelta,
      maxLat: lat + latDelta,
      minLng: lng - lngDelta,
      maxLng: lng + lngDelta,
    );
  }

  double _cos(double radians) {
    return 1 - (radians * radians / 2) + (radians * radians * radians * radians / 24);
  }
}

/// Warehouse Model
class Warehouse {
  final int id;
  final String name;
  final String address;
  final double latitude;
  final double longitude;
  final String? regency;
  final String? district;
  final String status;
  final String? warehouseType;
  final int? totalCapacity;
  final String? contactPerson;
  final String? phone;
  final String? notes;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Warehouse({
    required this.id,
    required this.name,
    required this.address,
    required this.latitude,
    required this.longitude,
    this.regency,
    this.district,
    required this.status,
    this.warehouseType,
    this.totalCapacity,
    this.contactPerson,
    this.phone,
    this.notes,
    this.createdAt,
    this.updatedAt,
  });

  factory Warehouse.fromJson(Map<String, dynamic> json) {
    return Warehouse(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      address: json['address'] ?? '',
      latitude: (json['latitude'] ?? json['lat'] ?? 0).toDouble(),
      longitude: (json['longitude'] ?? json['lng'] ?? 0).toDouble(),
      regency: json['regency'],
      district: json['district'],
      status: json['status'] ?? 'ACTIVE',
      warehouseType: json['warehouseType'] ?? json['warehouse_type'],
      totalCapacity: json['totalCapacity'] ?? json['total_capacity'],
      contactPerson: json['contactPerson'] ?? json['contact_person'],
      phone: json['phone'],
      notes: json['notes'],
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
      updatedAt: json['updatedAt'] != null ? DateTime.tryParse(json['updatedAt']) : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'address': address,
        'latitude': latitude,
        'longitude': longitude,
        'regency': regency,
        'district': district,
        'status': status,
        'warehouseType': warehouseType,
        'totalCapacity': totalCapacity,
        'contactPerson': contactPerson,
        'phone': phone,
        'notes': notes,
        'createdAt': createdAt?.toIso8601String(),
        'updatedAt': updatedAt?.toIso8601String(),
      };
}

/// Inventory Item Model
class InventoryItem {
  final int id;
  final int warehouseId;
  final String categoryId;
  final String categoryName;
  final String itemName;
  final int quantity;
  final String unit;
  final int? minStock;
  final int? maxStock;
  final DateTime? expiryDate;
  final String? notes;
  final DateTime? updatedAt;

  InventoryItem({
    required this.id,
    required this.warehouseId,
    required this.categoryId,
    required this.categoryName,
    required this.itemName,
    required this.quantity,
    required this.unit,
    this.minStock,
    this.maxStock,
    this.expiryDate,
    this.notes,
    this.updatedAt,
  });

  factory InventoryItem.fromJson(Map<String, dynamic> json) {
    return InventoryItem(
      id: json['id'] ?? 0,
      warehouseId: json['warehouseId'] ?? json['warehouse_id'] ?? 0,
      categoryId: json['categoryId'] ?? json['category_id'] ?? '',
      categoryName: json['categoryName'] ?? json['category_name'] ?? '',
      itemName: json['itemName'] ?? json['item_name'] ?? '',
      quantity: json['quantity'] ?? 0,
      unit: json['unit'] ?? 'Paket',
      minStock: json['minStock'] ?? json['min_stock'],
      maxStock: json['maxStock'] ?? json['max_stock'],
      expiryDate: json['expiryDate'] != null ? DateTime.tryParse(json['expiryDate']) : null,
      notes: json['notes'],
      updatedAt: json['updatedAt'] != null ? DateTime.tryParse(json['updatedAt']) : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'warehouseId': warehouseId,
        'categoryId': categoryId,
        'categoryName': categoryName,
        'itemName': itemName,
        'quantity': quantity,
        'unit': unit,
        'minStock': minStock,
        'maxStock': maxStock,
        'expiryDate': expiryDate?.toIso8601String(),
        'notes': notes,
        'updatedAt': updatedAt?.toIso8601String(),
      };

  bool get isLowStock => minStock != null && quantity < minStock!;
  bool get isExpired => expiryDate != null && expiryDate!.isBefore(DateTime.now());
}

/// Filter options for warehouse queries
class WarehouseFilters {
  final String? status;
  final String? regency;
  final String? warehouseType;
  final int? limit;
  final int? offset;

  WarehouseFilters({
    this.status,
    this.regency,
    this.warehouseType,
    this.limit,
    this.offset,
  });

  Map<String, dynamic> toQueryParams() {
    final params = <String, dynamic>{};
    if (status != null) params['status'] = status;
    if (regency != null) params['regency'] = regency;
    if (warehouseType != null) params['warehouseType'] = warehouseType;
    if (limit != null) params['limit'] = limit;
    if (offset != null) params['offset'] = offset;
    return params;
  }
}

/// Filter options for inventory queries
class InventoryFilters {
  final String? categoryId;
  final String? search;
  final bool? lowStockOnly;
  final bool? expiringSoon;
  final int? limit;
  final int? offset;

  InventoryFilters({
    this.categoryId,
    this.search,
    this.lowStockOnly,
    this.expiringSoon,
    this.limit,
    this.offset,
  });

  Map<String, dynamic> toQueryParams() {
    final params = <String, dynamic>{};
    if (categoryId != null) params['categoryId'] = categoryId;
    if (search != null) params['search'] = search;
    if (lowStockOnly != null) params['lowStockOnly'] = lowStockOnly;
    if (expiringSoon != null) params['expiringSoon'] = expiringSoon;
    if (limit != null) params['limit'] = limit;
    if (offset != null) params['offset'] = offset;
    return params;
  }
}

/// Bounding box for warehouse spatial queries
class WarehouseBBox {
  final double minLat;
  final double maxLat;
  final double minLng;
  final double maxLng;

  WarehouseBBox({
    required this.minLat,
    required this.maxLat,
    required this.minLng,
    required this.maxLng,
  });

  Map<String, dynamic> toQueryParams() => {
        'minLat': minLat,
        'maxLat': maxLat,
        'minLng': minLng,
        'maxLng': maxLng,
      };
}