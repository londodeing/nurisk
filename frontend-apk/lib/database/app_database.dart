import 'dart:io';
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;

part 'app_database.g.dart';

/// Incidents table - mirrors API incidents endpoint
class Incidents extends Table {
  IntColumn get id => integer()();
  TextColumn get title => text()();
  TextColumn get description => text().nullable()();
  TextColumn get disasterType => text()();
  TextColumn get status => text().withDefault(const Constant('REPORTED'))();
  RealColumn get latitude => real()();
  RealColumn get longitude => real()();
  TextColumn get address => text().nullable()();
  TextColumn get region => text().nullable()();
  TextColumn get kecamatan => text().nullable()();
  TextColumn get desa => text().nullable()();
  IntColumn get affectedPeople => integer().withDefault(const Constant(0))();
  IntColumn get casualties => integer().nullable()();
  IntColumn get evacuated => integer().nullable()();
  TextColumn get reportedBy => text().nullable()();
  DateTimeColumn get reportedAt => dateTime().nullable()();
  DateTimeColumn get verifiedAt => dateTime().nullable()();
  DateTimeColumn get updatedAt => dateTime().nullable()();
  IntColumn get priorityScore => integer().withDefault(const Constant(0))();
  TextColumn get priorityLevel => text().withDefault(const Constant('LOW'))();
  BoolColumn get isAiGenerated => boolean().withDefault(const Constant(false))();
  TextColumn get sourceUrl => text().nullable()();
  TextColumn get photoData => text().nullable()();
  // Metadata
  DateTimeColumn get cachedAt => dateTime().nullable()();
  IntColumn get ttlSeconds => integer().withDefault(const Constant(300))();
  IntColumn get syncVersion => integer().withDefault(const Constant(1))();
}

/// Missions table - mirrors API incidents for field operations
class Missions extends Table {
  IntColumn get id => integer()();
  TextColumn get title => text()();
  TextColumn get description => text().nullable()();
  TextColumn get disasterType => text()();
  TextColumn get status => text().withDefault(const Constant('REPORTED'))();
  RealColumn get latitude => real()();
  RealColumn get longitude => real()();
  TextColumn get address => text().nullable()();
  TextColumn get region => text().nullable()();
  TextColumn get kecamatan => text().nullable()();
  TextColumn get desa => text().nullable()();
  IntColumn get affectedPeople => integer().withDefault(const Constant(0))();
  TextColumn get assignedTeam => text().nullable()();
  TextColumn get commanderName => text().nullable()();
  DateTimeColumn get missionStart => dateTime().nullable()();
  DateTimeColumn get missionEnd => dateTime().nullable()();
  TextColumn get notes => text().nullable()();
  // Metadata
  DateTimeColumn get cachedAt => dateTime().nullable()();
  IntColumn get ttlSeconds => integer().withDefault(const Constant(300))();
  IntColumn get syncVersion => integer().withDefault(const Constant(1))();
}

/// Volunteers table - mirrors API volunteers endpoint
class Volunteers extends Table {
  IntColumn get id => integer()();
  IntColumn get userId => integer().nullable()();
  TextColumn get fullName => text()();
  TextColumn get phone => text().nullable()();
  TextColumn get email => text().nullable()();
  DateTimeColumn get birthDate => dateTime().nullable()();
  TextColumn get gender => text().nullable()();
  TextColumn get bloodType => text().nullable()();
  TextColumn get regency => text().nullable()();
  TextColumn get district => text().nullable()();
  TextColumn get village => text().nullable()();
  TextColumn get detailAddress => text().nullable()();
  RealColumn get latitude => real().nullable()();
  RealColumn get longitude => real().nullable()();
  TextColumn get medicalHistory => text().nullable()();
  TextColumn get expertise => text().nullable()();
  TextColumn get experience => text().nullable()();
  TextColumn get status => text().withDefault(const Constant('approved'))();
  // Metadata
  DateTimeColumn get cachedAt => dateTime().nullable()();
  IntColumn get ttlSeconds => integer().withDefault(const Constant(3600))();
  IntColumn get syncVersion => integer().withDefault(const Constant(1))();
}

/// Shelters table - mirrors API shelters endpoint
class Shelters extends Table {
  IntColumn get id => integer()();
  IntColumn get incidentId => integer().nullable()();
  TextColumn get name => text()();
  TextColumn get region => text().nullable()();
  TextColumn get address => text().nullable()();
  RealColumn get latitude => real().nullable()();
  RealColumn get longitude => real().nullable()();
  TextColumn get status => text().withDefault(const Constant('AKTIF'))();
  IntColumn get score => integer().withDefault(const Constant(100))();
  IntColumn get refugeeCount => integer().withDefault(const Constant(0))();
  TextColumn get stockStatus => text().withDefault(const Constant('AMAN'))();
  TextColumn get contactPerson => text().nullable()();
  TextColumn get contactPhone => text().nullable()();
  // Metadata
  DateTimeColumn get cachedAt => dateTime().nullable()();
  IntColumn get ttlSeconds => integer().withDefault(const Constant(600))();
  IntColumn get syncVersion => integer().withDefault(const Constant(1))();
}

/// Pending changes table - for offline mutation queue
class PendingChanges extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get entityType => text()();
  IntColumn get entityId => integer()();
  TextColumn get operation => text()();
  TextColumn get payload => text()();
  IntColumn get retryCount => integer().withDefault(const Constant(0))();
  DateTimeColumn get createdAt => dateTime().nullable()();
  TextColumn get errorMessage => text().nullable()();
}

/// Historical disasters table - cached historical data
class HistoricalDisasters extends Table {
  IntColumn get id => integer()();
  TextColumn get region => text()();
  TextColumn get disasterType => text()();
  DateTimeColumn get eventDate => dateTime()();
  RealColumn get latitude => real().nullable()();
  RealColumn get longitude => real().nullable()();
  TextColumn get time => text().nullable()();
  // Metadata
  DateTimeColumn get cachedAt => dateTime().nullable()();
  IntColumn get ttlSeconds => integer().withDefault(const Constant(86400))();
  IntColumn get syncVersion => integer().withDefault(const Constant(1))();
}

@DriftDatabase(tables: [
  Incidents,
  Missions,
  Volunteers,
  Shelters,
  PendingChanges,
  HistoricalDisasters,
])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;

  @override
  MigrationStrategy get migration {
    return MigrationStrategy(
      onCreate: (Migrator m) async {
        await m.createAll();
      },
      onUpgrade: (Migrator m, int from, int to) async {
        // Handle migrations here
      },
    );
  }
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'nurisk_cache.db'));
    return NativeDatabase.createInBackground(file);
  });
}