// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_database.dart';

// ignore_for_file: type=lint
class $IncidentsTable extends Incidents
    with TableInfo<$IncidentsTable, Incident> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $IncidentsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _titleMeta = const VerificationMeta('title');
  @override
  late final GeneratedColumn<String> title = GeneratedColumn<String>(
      'title', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _descriptionMeta =
      const VerificationMeta('description');
  @override
  late final GeneratedColumn<String> description = GeneratedColumn<String>(
      'description', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _disasterTypeMeta =
      const VerificationMeta('disasterType');
  @override
  late final GeneratedColumn<String> disasterType = GeneratedColumn<String>(
      'disaster_type', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
      'status', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('REPORTED'));
  static const VerificationMeta _latitudeMeta =
      const VerificationMeta('latitude');
  @override
  late final GeneratedColumn<double> latitude = GeneratedColumn<double>(
      'latitude', aliasedName, false,
      type: DriftSqlType.double, requiredDuringInsert: true);
  static const VerificationMeta _longitudeMeta =
      const VerificationMeta('longitude');
  @override
  late final GeneratedColumn<double> longitude = GeneratedColumn<double>(
      'longitude', aliasedName, false,
      type: DriftSqlType.double, requiredDuringInsert: true);
  static const VerificationMeta _addressMeta =
      const VerificationMeta('address');
  @override
  late final GeneratedColumn<String> address = GeneratedColumn<String>(
      'address', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _regionMeta = const VerificationMeta('region');
  @override
  late final GeneratedColumn<String> region = GeneratedColumn<String>(
      'region', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _kecamatanMeta =
      const VerificationMeta('kecamatan');
  @override
  late final GeneratedColumn<String> kecamatan = GeneratedColumn<String>(
      'kecamatan', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _desaMeta = const VerificationMeta('desa');
  @override
  late final GeneratedColumn<String> desa = GeneratedColumn<String>(
      'desa', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _affectedPeopleMeta =
      const VerificationMeta('affectedPeople');
  @override
  late final GeneratedColumn<int> affectedPeople = GeneratedColumn<int>(
      'affected_people', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(0));
  static const VerificationMeta _casualtiesMeta =
      const VerificationMeta('casualties');
  @override
  late final GeneratedColumn<int> casualties = GeneratedColumn<int>(
      'casualties', aliasedName, true,
      type: DriftSqlType.int, requiredDuringInsert: false);
  static const VerificationMeta _evacuatedMeta =
      const VerificationMeta('evacuated');
  @override
  late final GeneratedColumn<int> evacuated = GeneratedColumn<int>(
      'evacuated', aliasedName, true,
      type: DriftSqlType.int, requiredDuringInsert: false);
  static const VerificationMeta _reportedByMeta =
      const VerificationMeta('reportedBy');
  @override
  late final GeneratedColumn<String> reportedBy = GeneratedColumn<String>(
      'reported_by', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _reportedAtMeta =
      const VerificationMeta('reportedAt');
  @override
  late final GeneratedColumn<DateTime> reportedAt = GeneratedColumn<DateTime>(
      'reported_at', aliasedName, true,
      type: DriftSqlType.dateTime, requiredDuringInsert: false);
  static const VerificationMeta _verifiedAtMeta =
      const VerificationMeta('verifiedAt');
  @override
  late final GeneratedColumn<DateTime> verifiedAt = GeneratedColumn<DateTime>(
      'verified_at', aliasedName, true,
      type: DriftSqlType.dateTime, requiredDuringInsert: false);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
      'updated_at', aliasedName, true,
      type: DriftSqlType.dateTime, requiredDuringInsert: false);
  static const VerificationMeta _priorityScoreMeta =
      const VerificationMeta('priorityScore');
  @override
  late final GeneratedColumn<int> priorityScore = GeneratedColumn<int>(
      'priority_score', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(0));
  static const VerificationMeta _priorityLevelMeta =
      const VerificationMeta('priorityLevel');
  @override
  late final GeneratedColumn<String> priorityLevel = GeneratedColumn<String>(
      'priority_level', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('LOW'));
  static const VerificationMeta _isAiGeneratedMeta =
      const VerificationMeta('isAiGenerated');
  @override
  late final GeneratedColumn<bool> isAiGenerated = GeneratedColumn<bool>(
      'is_ai_generated', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'CHECK ("is_ai_generated" IN (0, 1))'),
      defaultValue: const Constant(false));
  static const VerificationMeta _sourceUrlMeta =
      const VerificationMeta('sourceUrl');
  @override
  late final GeneratedColumn<String> sourceUrl = GeneratedColumn<String>(
      'source_url', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _photoDataMeta =
      const VerificationMeta('photoData');
  @override
  late final GeneratedColumn<String> photoData = GeneratedColumn<String>(
      'photo_data', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _cachedAtMeta =
      const VerificationMeta('cachedAt');
  @override
  late final GeneratedColumn<DateTime> cachedAt = GeneratedColumn<DateTime>(
      'cached_at', aliasedName, true,
      type: DriftSqlType.dateTime, requiredDuringInsert: false);
  static const VerificationMeta _ttlSecondsMeta =
      const VerificationMeta('ttlSeconds');
  @override
  late final GeneratedColumn<int> ttlSeconds = GeneratedColumn<int>(
      'ttl_seconds', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(300));
  static const VerificationMeta _syncVersionMeta =
      const VerificationMeta('syncVersion');
  @override
  late final GeneratedColumn<int> syncVersion = GeneratedColumn<int>(
      'sync_version', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(1));
  @override
  List<GeneratedColumn> get $columns => [
        id,
        title,
        description,
        disasterType,
        status,
        latitude,
        longitude,
        address,
        region,
        kecamatan,
        desa,
        affectedPeople,
        casualties,
        evacuated,
        reportedBy,
        reportedAt,
        verifiedAt,
        updatedAt,
        priorityScore,
        priorityLevel,
        isAiGenerated,
        sourceUrl,
        photoData,
        cachedAt,
        ttlSeconds,
        syncVersion
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'incidents';
  @override
  VerificationContext validateIntegrity(Insertable<Incident> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('title')) {
      context.handle(
          _titleMeta, title.isAcceptableOrUnknown(data['title']!, _titleMeta));
    } else if (isInserting) {
      context.missing(_titleMeta);
    }
    if (data.containsKey('description')) {
      context.handle(
          _descriptionMeta,
          description.isAcceptableOrUnknown(
              data['description']!, _descriptionMeta));
    }
    if (data.containsKey('disaster_type')) {
      context.handle(
          _disasterTypeMeta,
          disasterType.isAcceptableOrUnknown(
              data['disaster_type']!, _disasterTypeMeta));
    } else if (isInserting) {
      context.missing(_disasterTypeMeta);
    }
    if (data.containsKey('status')) {
      context.handle(_statusMeta,
          status.isAcceptableOrUnknown(data['status']!, _statusMeta));
    }
    if (data.containsKey('latitude')) {
      context.handle(_latitudeMeta,
          latitude.isAcceptableOrUnknown(data['latitude']!, _latitudeMeta));
    } else if (isInserting) {
      context.missing(_latitudeMeta);
    }
    if (data.containsKey('longitude')) {
      context.handle(_longitudeMeta,
          longitude.isAcceptableOrUnknown(data['longitude']!, _longitudeMeta));
    } else if (isInserting) {
      context.missing(_longitudeMeta);
    }
    if (data.containsKey('address')) {
      context.handle(_addressMeta,
          address.isAcceptableOrUnknown(data['address']!, _addressMeta));
    }
    if (data.containsKey('region')) {
      context.handle(_regionMeta,
          region.isAcceptableOrUnknown(data['region']!, _regionMeta));
    }
    if (data.containsKey('kecamatan')) {
      context.handle(_kecamatanMeta,
          kecamatan.isAcceptableOrUnknown(data['kecamatan']!, _kecamatanMeta));
    }
    if (data.containsKey('desa')) {
      context.handle(
          _desaMeta, desa.isAcceptableOrUnknown(data['desa']!, _desaMeta));
    }
    if (data.containsKey('affected_people')) {
      context.handle(
          _affectedPeopleMeta,
          affectedPeople.isAcceptableOrUnknown(
              data['affected_people']!, _affectedPeopleMeta));
    }
    if (data.containsKey('casualties')) {
      context.handle(
          _casualtiesMeta,
          casualties.isAcceptableOrUnknown(
              data['casualties']!, _casualtiesMeta));
    }
    if (data.containsKey('evacuated')) {
      context.handle(_evacuatedMeta,
          evacuated.isAcceptableOrUnknown(data['evacuated']!, _evacuatedMeta));
    }
    if (data.containsKey('reported_by')) {
      context.handle(
          _reportedByMeta,
          reportedBy.isAcceptableOrUnknown(
              data['reported_by']!, _reportedByMeta));
    }
    if (data.containsKey('reported_at')) {
      context.handle(
          _reportedAtMeta,
          reportedAt.isAcceptableOrUnknown(
              data['reported_at']!, _reportedAtMeta));
    }
    if (data.containsKey('verified_at')) {
      context.handle(
          _verifiedAtMeta,
          verifiedAt.isAcceptableOrUnknown(
              data['verified_at']!, _verifiedAtMeta));
    }
    if (data.containsKey('updated_at')) {
      context.handle(_updatedAtMeta,
          updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta));
    }
    if (data.containsKey('priority_score')) {
      context.handle(
          _priorityScoreMeta,
          priorityScore.isAcceptableOrUnknown(
              data['priority_score']!, _priorityScoreMeta));
    }
    if (data.containsKey('priority_level')) {
      context.handle(
          _priorityLevelMeta,
          priorityLevel.isAcceptableOrUnknown(
              data['priority_level']!, _priorityLevelMeta));
    }
    if (data.containsKey('is_ai_generated')) {
      context.handle(
          _isAiGeneratedMeta,
          isAiGenerated.isAcceptableOrUnknown(
              data['is_ai_generated']!, _isAiGeneratedMeta));
    }
    if (data.containsKey('source_url')) {
      context.handle(_sourceUrlMeta,
          sourceUrl.isAcceptableOrUnknown(data['source_url']!, _sourceUrlMeta));
    }
    if (data.containsKey('photo_data')) {
      context.handle(_photoDataMeta,
          photoData.isAcceptableOrUnknown(data['photo_data']!, _photoDataMeta));
    }
    if (data.containsKey('cached_at')) {
      context.handle(_cachedAtMeta,
          cachedAt.isAcceptableOrUnknown(data['cached_at']!, _cachedAtMeta));
    }
    if (data.containsKey('ttl_seconds')) {
      context.handle(
          _ttlSecondsMeta,
          ttlSeconds.isAcceptableOrUnknown(
              data['ttl_seconds']!, _ttlSecondsMeta));
    }
    if (data.containsKey('sync_version')) {
      context.handle(
          _syncVersionMeta,
          syncVersion.isAcceptableOrUnknown(
              data['sync_version']!, _syncVersionMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => const {};
  @override
  Incident map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Incident(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      title: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}title'])!,
      description: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}description']),
      disasterType: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}disaster_type'])!,
      status: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}status'])!,
      latitude: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}latitude'])!,
      longitude: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}longitude'])!,
      address: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}address']),
      region: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}region']),
      kecamatan: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}kecamatan']),
      desa: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}desa']),
      affectedPeople: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}affected_people'])!,
      casualties: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}casualties']),
      evacuated: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}evacuated']),
      reportedBy: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}reported_by']),
      reportedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}reported_at']),
      verifiedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}verified_at']),
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}updated_at']),
      priorityScore: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}priority_score'])!,
      priorityLevel: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}priority_level'])!,
      isAiGenerated: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}is_ai_generated'])!,
      sourceUrl: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}source_url']),
      photoData: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}photo_data']),
      cachedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}cached_at']),
      ttlSeconds: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}ttl_seconds'])!,
      syncVersion: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}sync_version'])!,
    );
  }

  @override
  $IncidentsTable createAlias(String alias) {
    return $IncidentsTable(attachedDatabase, alias);
  }
}

class Incident extends DataClass implements Insertable<Incident> {
  final int id;
  final String title;
  final String? description;
  final String disasterType;
  final String status;
  final double latitude;
  final double longitude;
  final String? address;
  final String? region;
  final String? kecamatan;
  final String? desa;
  final int affectedPeople;
  final int? casualties;
  final int? evacuated;
  final String? reportedBy;
  final DateTime? reportedAt;
  final DateTime? verifiedAt;
  final DateTime? updatedAt;
  final int priorityScore;
  final String priorityLevel;
  final bool isAiGenerated;
  final String? sourceUrl;
  final String? photoData;
  final DateTime? cachedAt;
  final int ttlSeconds;
  final int syncVersion;
  const Incident(
      {required this.id,
      required this.title,
      this.description,
      required this.disasterType,
      required this.status,
      required this.latitude,
      required this.longitude,
      this.address,
      this.region,
      this.kecamatan,
      this.desa,
      required this.affectedPeople,
      this.casualties,
      this.evacuated,
      this.reportedBy,
      this.reportedAt,
      this.verifiedAt,
      this.updatedAt,
      required this.priorityScore,
      required this.priorityLevel,
      required this.isAiGenerated,
      this.sourceUrl,
      this.photoData,
      this.cachedAt,
      required this.ttlSeconds,
      required this.syncVersion});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['title'] = Variable<String>(title);
    if (!nullToAbsent || description != null) {
      map['description'] = Variable<String>(description);
    }
    map['disaster_type'] = Variable<String>(disasterType);
    map['status'] = Variable<String>(status);
    map['latitude'] = Variable<double>(latitude);
    map['longitude'] = Variable<double>(longitude);
    if (!nullToAbsent || address != null) {
      map['address'] = Variable<String>(address);
    }
    if (!nullToAbsent || region != null) {
      map['region'] = Variable<String>(region);
    }
    if (!nullToAbsent || kecamatan != null) {
      map['kecamatan'] = Variable<String>(kecamatan);
    }
    if (!nullToAbsent || desa != null) {
      map['desa'] = Variable<String>(desa);
    }
    map['affected_people'] = Variable<int>(affectedPeople);
    if (!nullToAbsent || casualties != null) {
      map['casualties'] = Variable<int>(casualties);
    }
    if (!nullToAbsent || evacuated != null) {
      map['evacuated'] = Variable<int>(evacuated);
    }
    if (!nullToAbsent || reportedBy != null) {
      map['reported_by'] = Variable<String>(reportedBy);
    }
    if (!nullToAbsent || reportedAt != null) {
      map['reported_at'] = Variable<DateTime>(reportedAt);
    }
    if (!nullToAbsent || verifiedAt != null) {
      map['verified_at'] = Variable<DateTime>(verifiedAt);
    }
    if (!nullToAbsent || updatedAt != null) {
      map['updated_at'] = Variable<DateTime>(updatedAt);
    }
    map['priority_score'] = Variable<int>(priorityScore);
    map['priority_level'] = Variable<String>(priorityLevel);
    map['is_ai_generated'] = Variable<bool>(isAiGenerated);
    if (!nullToAbsent || sourceUrl != null) {
      map['source_url'] = Variable<String>(sourceUrl);
    }
    if (!nullToAbsent || photoData != null) {
      map['photo_data'] = Variable<String>(photoData);
    }
    if (!nullToAbsent || cachedAt != null) {
      map['cached_at'] = Variable<DateTime>(cachedAt);
    }
    map['ttl_seconds'] = Variable<int>(ttlSeconds);
    map['sync_version'] = Variable<int>(syncVersion);
    return map;
  }

  IncidentsCompanion toCompanion(bool nullToAbsent) {
    return IncidentsCompanion(
      id: Value(id),
      title: Value(title),
      description: description == null && nullToAbsent
          ? const Value.absent()
          : Value(description),
      disasterType: Value(disasterType),
      status: Value(status),
      latitude: Value(latitude),
      longitude: Value(longitude),
      address: address == null && nullToAbsent
          ? const Value.absent()
          : Value(address),
      region:
          region == null && nullToAbsent ? const Value.absent() : Value(region),
      kecamatan: kecamatan == null && nullToAbsent
          ? const Value.absent()
          : Value(kecamatan),
      desa: desa == null && nullToAbsent ? const Value.absent() : Value(desa),
      affectedPeople: Value(affectedPeople),
      casualties: casualties == null && nullToAbsent
          ? const Value.absent()
          : Value(casualties),
      evacuated: evacuated == null && nullToAbsent
          ? const Value.absent()
          : Value(evacuated),
      reportedBy: reportedBy == null && nullToAbsent
          ? const Value.absent()
          : Value(reportedBy),
      reportedAt: reportedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(reportedAt),
      verifiedAt: verifiedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(verifiedAt),
      updatedAt: updatedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(updatedAt),
      priorityScore: Value(priorityScore),
      priorityLevel: Value(priorityLevel),
      isAiGenerated: Value(isAiGenerated),
      sourceUrl: sourceUrl == null && nullToAbsent
          ? const Value.absent()
          : Value(sourceUrl),
      photoData: photoData == null && nullToAbsent
          ? const Value.absent()
          : Value(photoData),
      cachedAt: cachedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(cachedAt),
      ttlSeconds: Value(ttlSeconds),
      syncVersion: Value(syncVersion),
    );
  }

  factory Incident.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Incident(
      id: serializer.fromJson<int>(json['id']),
      title: serializer.fromJson<String>(json['title']),
      description: serializer.fromJson<String?>(json['description']),
      disasterType: serializer.fromJson<String>(json['disasterType']),
      status: serializer.fromJson<String>(json['status']),
      latitude: serializer.fromJson<double>(json['latitude']),
      longitude: serializer.fromJson<double>(json['longitude']),
      address: serializer.fromJson<String?>(json['address']),
      region: serializer.fromJson<String?>(json['region']),
      kecamatan: serializer.fromJson<String?>(json['kecamatan']),
      desa: serializer.fromJson<String?>(json['desa']),
      affectedPeople: serializer.fromJson<int>(json['affectedPeople']),
      casualties: serializer.fromJson<int?>(json['casualties']),
      evacuated: serializer.fromJson<int?>(json['evacuated']),
      reportedBy: serializer.fromJson<String?>(json['reportedBy']),
      reportedAt: serializer.fromJson<DateTime?>(json['reportedAt']),
      verifiedAt: serializer.fromJson<DateTime?>(json['verifiedAt']),
      updatedAt: serializer.fromJson<DateTime?>(json['updatedAt']),
      priorityScore: serializer.fromJson<int>(json['priorityScore']),
      priorityLevel: serializer.fromJson<String>(json['priorityLevel']),
      isAiGenerated: serializer.fromJson<bool>(json['isAiGenerated']),
      sourceUrl: serializer.fromJson<String?>(json['sourceUrl']),
      photoData: serializer.fromJson<String?>(json['photoData']),
      cachedAt: serializer.fromJson<DateTime?>(json['cachedAt']),
      ttlSeconds: serializer.fromJson<int>(json['ttlSeconds']),
      syncVersion: serializer.fromJson<int>(json['syncVersion']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'title': serializer.toJson<String>(title),
      'description': serializer.toJson<String?>(description),
      'disasterType': serializer.toJson<String>(disasterType),
      'status': serializer.toJson<String>(status),
      'latitude': serializer.toJson<double>(latitude),
      'longitude': serializer.toJson<double>(longitude),
      'address': serializer.toJson<String?>(address),
      'region': serializer.toJson<String?>(region),
      'kecamatan': serializer.toJson<String?>(kecamatan),
      'desa': serializer.toJson<String?>(desa),
      'affectedPeople': serializer.toJson<int>(affectedPeople),
      'casualties': serializer.toJson<int?>(casualties),
      'evacuated': serializer.toJson<int?>(evacuated),
      'reportedBy': serializer.toJson<String?>(reportedBy),
      'reportedAt': serializer.toJson<DateTime?>(reportedAt),
      'verifiedAt': serializer.toJson<DateTime?>(verifiedAt),
      'updatedAt': serializer.toJson<DateTime?>(updatedAt),
      'priorityScore': serializer.toJson<int>(priorityScore),
      'priorityLevel': serializer.toJson<String>(priorityLevel),
      'isAiGenerated': serializer.toJson<bool>(isAiGenerated),
      'sourceUrl': serializer.toJson<String?>(sourceUrl),
      'photoData': serializer.toJson<String?>(photoData),
      'cachedAt': serializer.toJson<DateTime?>(cachedAt),
      'ttlSeconds': serializer.toJson<int>(ttlSeconds),
      'syncVersion': serializer.toJson<int>(syncVersion),
    };
  }

  Incident copyWith(
          {int? id,
          String? title,
          Value<String?> description = const Value.absent(),
          String? disasterType,
          String? status,
          double? latitude,
          double? longitude,
          Value<String?> address = const Value.absent(),
          Value<String?> region = const Value.absent(),
          Value<String?> kecamatan = const Value.absent(),
          Value<String?> desa = const Value.absent(),
          int? affectedPeople,
          Value<int?> casualties = const Value.absent(),
          Value<int?> evacuated = const Value.absent(),
          Value<String?> reportedBy = const Value.absent(),
          Value<DateTime?> reportedAt = const Value.absent(),
          Value<DateTime?> verifiedAt = const Value.absent(),
          Value<DateTime?> updatedAt = const Value.absent(),
          int? priorityScore,
          String? priorityLevel,
          bool? isAiGenerated,
          Value<String?> sourceUrl = const Value.absent(),
          Value<String?> photoData = const Value.absent(),
          Value<DateTime?> cachedAt = const Value.absent(),
          int? ttlSeconds,
          int? syncVersion}) =>
      Incident(
        id: id ?? this.id,
        title: title ?? this.title,
        description: description.present ? description.value : this.description,
        disasterType: disasterType ?? this.disasterType,
        status: status ?? this.status,
        latitude: latitude ?? this.latitude,
        longitude: longitude ?? this.longitude,
        address: address.present ? address.value : this.address,
        region: region.present ? region.value : this.region,
        kecamatan: kecamatan.present ? kecamatan.value : this.kecamatan,
        desa: desa.present ? desa.value : this.desa,
        affectedPeople: affectedPeople ?? this.affectedPeople,
        casualties: casualties.present ? casualties.value : this.casualties,
        evacuated: evacuated.present ? evacuated.value : this.evacuated,
        reportedBy: reportedBy.present ? reportedBy.value : this.reportedBy,
        reportedAt: reportedAt.present ? reportedAt.value : this.reportedAt,
        verifiedAt: verifiedAt.present ? verifiedAt.value : this.verifiedAt,
        updatedAt: updatedAt.present ? updatedAt.value : this.updatedAt,
        priorityScore: priorityScore ?? this.priorityScore,
        priorityLevel: priorityLevel ?? this.priorityLevel,
        isAiGenerated: isAiGenerated ?? this.isAiGenerated,
        sourceUrl: sourceUrl.present ? sourceUrl.value : this.sourceUrl,
        photoData: photoData.present ? photoData.value : this.photoData,
        cachedAt: cachedAt.present ? cachedAt.value : this.cachedAt,
        ttlSeconds: ttlSeconds ?? this.ttlSeconds,
        syncVersion: syncVersion ?? this.syncVersion,
      );
  Incident copyWithCompanion(IncidentsCompanion data) {
    return Incident(
      id: data.id.present ? data.id.value : this.id,
      title: data.title.present ? data.title.value : this.title,
      description:
          data.description.present ? data.description.value : this.description,
      disasterType: data.disasterType.present
          ? data.disasterType.value
          : this.disasterType,
      status: data.status.present ? data.status.value : this.status,
      latitude: data.latitude.present ? data.latitude.value : this.latitude,
      longitude: data.longitude.present ? data.longitude.value : this.longitude,
      address: data.address.present ? data.address.value : this.address,
      region: data.region.present ? data.region.value : this.region,
      kecamatan: data.kecamatan.present ? data.kecamatan.value : this.kecamatan,
      desa: data.desa.present ? data.desa.value : this.desa,
      affectedPeople: data.affectedPeople.present
          ? data.affectedPeople.value
          : this.affectedPeople,
      casualties:
          data.casualties.present ? data.casualties.value : this.casualties,
      evacuated: data.evacuated.present ? data.evacuated.value : this.evacuated,
      reportedBy:
          data.reportedBy.present ? data.reportedBy.value : this.reportedBy,
      reportedAt:
          data.reportedAt.present ? data.reportedAt.value : this.reportedAt,
      verifiedAt:
          data.verifiedAt.present ? data.verifiedAt.value : this.verifiedAt,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
      priorityScore: data.priorityScore.present
          ? data.priorityScore.value
          : this.priorityScore,
      priorityLevel: data.priorityLevel.present
          ? data.priorityLevel.value
          : this.priorityLevel,
      isAiGenerated: data.isAiGenerated.present
          ? data.isAiGenerated.value
          : this.isAiGenerated,
      sourceUrl: data.sourceUrl.present ? data.sourceUrl.value : this.sourceUrl,
      photoData: data.photoData.present ? data.photoData.value : this.photoData,
      cachedAt: data.cachedAt.present ? data.cachedAt.value : this.cachedAt,
      ttlSeconds:
          data.ttlSeconds.present ? data.ttlSeconds.value : this.ttlSeconds,
      syncVersion:
          data.syncVersion.present ? data.syncVersion.value : this.syncVersion,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Incident(')
          ..write('id: $id, ')
          ..write('title: $title, ')
          ..write('description: $description, ')
          ..write('disasterType: $disasterType, ')
          ..write('status: $status, ')
          ..write('latitude: $latitude, ')
          ..write('longitude: $longitude, ')
          ..write('address: $address, ')
          ..write('region: $region, ')
          ..write('kecamatan: $kecamatan, ')
          ..write('desa: $desa, ')
          ..write('affectedPeople: $affectedPeople, ')
          ..write('casualties: $casualties, ')
          ..write('evacuated: $evacuated, ')
          ..write('reportedBy: $reportedBy, ')
          ..write('reportedAt: $reportedAt, ')
          ..write('verifiedAt: $verifiedAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('priorityScore: $priorityScore, ')
          ..write('priorityLevel: $priorityLevel, ')
          ..write('isAiGenerated: $isAiGenerated, ')
          ..write('sourceUrl: $sourceUrl, ')
          ..write('photoData: $photoData, ')
          ..write('cachedAt: $cachedAt, ')
          ..write('ttlSeconds: $ttlSeconds, ')
          ..write('syncVersion: $syncVersion')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hashAll([
        id,
        title,
        description,
        disasterType,
        status,
        latitude,
        longitude,
        address,
        region,
        kecamatan,
        desa,
        affectedPeople,
        casualties,
        evacuated,
        reportedBy,
        reportedAt,
        verifiedAt,
        updatedAt,
        priorityScore,
        priorityLevel,
        isAiGenerated,
        sourceUrl,
        photoData,
        cachedAt,
        ttlSeconds,
        syncVersion
      ]);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Incident &&
          other.id == this.id &&
          other.title == this.title &&
          other.description == this.description &&
          other.disasterType == this.disasterType &&
          other.status == this.status &&
          other.latitude == this.latitude &&
          other.longitude == this.longitude &&
          other.address == this.address &&
          other.region == this.region &&
          other.kecamatan == this.kecamatan &&
          other.desa == this.desa &&
          other.affectedPeople == this.affectedPeople &&
          other.casualties == this.casualties &&
          other.evacuated == this.evacuated &&
          other.reportedBy == this.reportedBy &&
          other.reportedAt == this.reportedAt &&
          other.verifiedAt == this.verifiedAt &&
          other.updatedAt == this.updatedAt &&
          other.priorityScore == this.priorityScore &&
          other.priorityLevel == this.priorityLevel &&
          other.isAiGenerated == this.isAiGenerated &&
          other.sourceUrl == this.sourceUrl &&
          other.photoData == this.photoData &&
          other.cachedAt == this.cachedAt &&
          other.ttlSeconds == this.ttlSeconds &&
          other.syncVersion == this.syncVersion);
}

class IncidentsCompanion extends UpdateCompanion<Incident> {
  final Value<int> id;
  final Value<String> title;
  final Value<String?> description;
  final Value<String> disasterType;
  final Value<String> status;
  final Value<double> latitude;
  final Value<double> longitude;
  final Value<String?> address;
  final Value<String?> region;
  final Value<String?> kecamatan;
  final Value<String?> desa;
  final Value<int> affectedPeople;
  final Value<int?> casualties;
  final Value<int?> evacuated;
  final Value<String?> reportedBy;
  final Value<DateTime?> reportedAt;
  final Value<DateTime?> verifiedAt;
  final Value<DateTime?> updatedAt;
  final Value<int> priorityScore;
  final Value<String> priorityLevel;
  final Value<bool> isAiGenerated;
  final Value<String?> sourceUrl;
  final Value<String?> photoData;
  final Value<DateTime?> cachedAt;
  final Value<int> ttlSeconds;
  final Value<int> syncVersion;
  final Value<int> rowid;
  const IncidentsCompanion({
    this.id = const Value.absent(),
    this.title = const Value.absent(),
    this.description = const Value.absent(),
    this.disasterType = const Value.absent(),
    this.status = const Value.absent(),
    this.latitude = const Value.absent(),
    this.longitude = const Value.absent(),
    this.address = const Value.absent(),
    this.region = const Value.absent(),
    this.kecamatan = const Value.absent(),
    this.desa = const Value.absent(),
    this.affectedPeople = const Value.absent(),
    this.casualties = const Value.absent(),
    this.evacuated = const Value.absent(),
    this.reportedBy = const Value.absent(),
    this.reportedAt = const Value.absent(),
    this.verifiedAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.priorityScore = const Value.absent(),
    this.priorityLevel = const Value.absent(),
    this.isAiGenerated = const Value.absent(),
    this.sourceUrl = const Value.absent(),
    this.photoData = const Value.absent(),
    this.cachedAt = const Value.absent(),
    this.ttlSeconds = const Value.absent(),
    this.syncVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  IncidentsCompanion.insert({
    required int id,
    required String title,
    this.description = const Value.absent(),
    required String disasterType,
    this.status = const Value.absent(),
    required double latitude,
    required double longitude,
    this.address = const Value.absent(),
    this.region = const Value.absent(),
    this.kecamatan = const Value.absent(),
    this.desa = const Value.absent(),
    this.affectedPeople = const Value.absent(),
    this.casualties = const Value.absent(),
    this.evacuated = const Value.absent(),
    this.reportedBy = const Value.absent(),
    this.reportedAt = const Value.absent(),
    this.verifiedAt = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.priorityScore = const Value.absent(),
    this.priorityLevel = const Value.absent(),
    this.isAiGenerated = const Value.absent(),
    this.sourceUrl = const Value.absent(),
    this.photoData = const Value.absent(),
    this.cachedAt = const Value.absent(),
    this.ttlSeconds = const Value.absent(),
    this.syncVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        title = Value(title),
        disasterType = Value(disasterType),
        latitude = Value(latitude),
        longitude = Value(longitude);
  static Insertable<Incident> custom({
    Expression<int>? id,
    Expression<String>? title,
    Expression<String>? description,
    Expression<String>? disasterType,
    Expression<String>? status,
    Expression<double>? latitude,
    Expression<double>? longitude,
    Expression<String>? address,
    Expression<String>? region,
    Expression<String>? kecamatan,
    Expression<String>? desa,
    Expression<int>? affectedPeople,
    Expression<int>? casualties,
    Expression<int>? evacuated,
    Expression<String>? reportedBy,
    Expression<DateTime>? reportedAt,
    Expression<DateTime>? verifiedAt,
    Expression<DateTime>? updatedAt,
    Expression<int>? priorityScore,
    Expression<String>? priorityLevel,
    Expression<bool>? isAiGenerated,
    Expression<String>? sourceUrl,
    Expression<String>? photoData,
    Expression<DateTime>? cachedAt,
    Expression<int>? ttlSeconds,
    Expression<int>? syncVersion,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (title != null) 'title': title,
      if (description != null) 'description': description,
      if (disasterType != null) 'disaster_type': disasterType,
      if (status != null) 'status': status,
      if (latitude != null) 'latitude': latitude,
      if (longitude != null) 'longitude': longitude,
      if (address != null) 'address': address,
      if (region != null) 'region': region,
      if (kecamatan != null) 'kecamatan': kecamatan,
      if (desa != null) 'desa': desa,
      if (affectedPeople != null) 'affected_people': affectedPeople,
      if (casualties != null) 'casualties': casualties,
      if (evacuated != null) 'evacuated': evacuated,
      if (reportedBy != null) 'reported_by': reportedBy,
      if (reportedAt != null) 'reported_at': reportedAt,
      if (verifiedAt != null) 'verified_at': verifiedAt,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (priorityScore != null) 'priority_score': priorityScore,
      if (priorityLevel != null) 'priority_level': priorityLevel,
      if (isAiGenerated != null) 'is_ai_generated': isAiGenerated,
      if (sourceUrl != null) 'source_url': sourceUrl,
      if (photoData != null) 'photo_data': photoData,
      if (cachedAt != null) 'cached_at': cachedAt,
      if (ttlSeconds != null) 'ttl_seconds': ttlSeconds,
      if (syncVersion != null) 'sync_version': syncVersion,
      if (rowid != null) 'rowid': rowid,
    });
  }

  IncidentsCompanion copyWith(
      {Value<int>? id,
      Value<String>? title,
      Value<String?>? description,
      Value<String>? disasterType,
      Value<String>? status,
      Value<double>? latitude,
      Value<double>? longitude,
      Value<String?>? address,
      Value<String?>? region,
      Value<String?>? kecamatan,
      Value<String?>? desa,
      Value<int>? affectedPeople,
      Value<int?>? casualties,
      Value<int?>? evacuated,
      Value<String?>? reportedBy,
      Value<DateTime?>? reportedAt,
      Value<DateTime?>? verifiedAt,
      Value<DateTime?>? updatedAt,
      Value<int>? priorityScore,
      Value<String>? priorityLevel,
      Value<bool>? isAiGenerated,
      Value<String?>? sourceUrl,
      Value<String?>? photoData,
      Value<DateTime?>? cachedAt,
      Value<int>? ttlSeconds,
      Value<int>? syncVersion,
      Value<int>? rowid}) {
    return IncidentsCompanion(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      disasterType: disasterType ?? this.disasterType,
      status: status ?? this.status,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      address: address ?? this.address,
      region: region ?? this.region,
      kecamatan: kecamatan ?? this.kecamatan,
      desa: desa ?? this.desa,
      affectedPeople: affectedPeople ?? this.affectedPeople,
      casualties: casualties ?? this.casualties,
      evacuated: evacuated ?? this.evacuated,
      reportedBy: reportedBy ?? this.reportedBy,
      reportedAt: reportedAt ?? this.reportedAt,
      verifiedAt: verifiedAt ?? this.verifiedAt,
      updatedAt: updatedAt ?? this.updatedAt,
      priorityScore: priorityScore ?? this.priorityScore,
      priorityLevel: priorityLevel ?? this.priorityLevel,
      isAiGenerated: isAiGenerated ?? this.isAiGenerated,
      sourceUrl: sourceUrl ?? this.sourceUrl,
      photoData: photoData ?? this.photoData,
      cachedAt: cachedAt ?? this.cachedAt,
      ttlSeconds: ttlSeconds ?? this.ttlSeconds,
      syncVersion: syncVersion ?? this.syncVersion,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (title.present) {
      map['title'] = Variable<String>(title.value);
    }
    if (description.present) {
      map['description'] = Variable<String>(description.value);
    }
    if (disasterType.present) {
      map['disaster_type'] = Variable<String>(disasterType.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (latitude.present) {
      map['latitude'] = Variable<double>(latitude.value);
    }
    if (longitude.present) {
      map['longitude'] = Variable<double>(longitude.value);
    }
    if (address.present) {
      map['address'] = Variable<String>(address.value);
    }
    if (region.present) {
      map['region'] = Variable<String>(region.value);
    }
    if (kecamatan.present) {
      map['kecamatan'] = Variable<String>(kecamatan.value);
    }
    if (desa.present) {
      map['desa'] = Variable<String>(desa.value);
    }
    if (affectedPeople.present) {
      map['affected_people'] = Variable<int>(affectedPeople.value);
    }
    if (casualties.present) {
      map['casualties'] = Variable<int>(casualties.value);
    }
    if (evacuated.present) {
      map['evacuated'] = Variable<int>(evacuated.value);
    }
    if (reportedBy.present) {
      map['reported_by'] = Variable<String>(reportedBy.value);
    }
    if (reportedAt.present) {
      map['reported_at'] = Variable<DateTime>(reportedAt.value);
    }
    if (verifiedAt.present) {
      map['verified_at'] = Variable<DateTime>(verifiedAt.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
    }
    if (priorityScore.present) {
      map['priority_score'] = Variable<int>(priorityScore.value);
    }
    if (priorityLevel.present) {
      map['priority_level'] = Variable<String>(priorityLevel.value);
    }
    if (isAiGenerated.present) {
      map['is_ai_generated'] = Variable<bool>(isAiGenerated.value);
    }
    if (sourceUrl.present) {
      map['source_url'] = Variable<String>(sourceUrl.value);
    }
    if (photoData.present) {
      map['photo_data'] = Variable<String>(photoData.value);
    }
    if (cachedAt.present) {
      map['cached_at'] = Variable<DateTime>(cachedAt.value);
    }
    if (ttlSeconds.present) {
      map['ttl_seconds'] = Variable<int>(ttlSeconds.value);
    }
    if (syncVersion.present) {
      map['sync_version'] = Variable<int>(syncVersion.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('IncidentsCompanion(')
          ..write('id: $id, ')
          ..write('title: $title, ')
          ..write('description: $description, ')
          ..write('disasterType: $disasterType, ')
          ..write('status: $status, ')
          ..write('latitude: $latitude, ')
          ..write('longitude: $longitude, ')
          ..write('address: $address, ')
          ..write('region: $region, ')
          ..write('kecamatan: $kecamatan, ')
          ..write('desa: $desa, ')
          ..write('affectedPeople: $affectedPeople, ')
          ..write('casualties: $casualties, ')
          ..write('evacuated: $evacuated, ')
          ..write('reportedBy: $reportedBy, ')
          ..write('reportedAt: $reportedAt, ')
          ..write('verifiedAt: $verifiedAt, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('priorityScore: $priorityScore, ')
          ..write('priorityLevel: $priorityLevel, ')
          ..write('isAiGenerated: $isAiGenerated, ')
          ..write('sourceUrl: $sourceUrl, ')
          ..write('photoData: $photoData, ')
          ..write('cachedAt: $cachedAt, ')
          ..write('ttlSeconds: $ttlSeconds, ')
          ..write('syncVersion: $syncVersion, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $MissionsTable extends Missions with TableInfo<$MissionsTable, Mission> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $MissionsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _titleMeta = const VerificationMeta('title');
  @override
  late final GeneratedColumn<String> title = GeneratedColumn<String>(
      'title', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _descriptionMeta =
      const VerificationMeta('description');
  @override
  late final GeneratedColumn<String> description = GeneratedColumn<String>(
      'description', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _disasterTypeMeta =
      const VerificationMeta('disasterType');
  @override
  late final GeneratedColumn<String> disasterType = GeneratedColumn<String>(
      'disaster_type', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
      'status', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('REPORTED'));
  static const VerificationMeta _latitudeMeta =
      const VerificationMeta('latitude');
  @override
  late final GeneratedColumn<double> latitude = GeneratedColumn<double>(
      'latitude', aliasedName, false,
      type: DriftSqlType.double, requiredDuringInsert: true);
  static const VerificationMeta _longitudeMeta =
      const VerificationMeta('longitude');
  @override
  late final GeneratedColumn<double> longitude = GeneratedColumn<double>(
      'longitude', aliasedName, false,
      type: DriftSqlType.double, requiredDuringInsert: true);
  static const VerificationMeta _addressMeta =
      const VerificationMeta('address');
  @override
  late final GeneratedColumn<String> address = GeneratedColumn<String>(
      'address', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _regionMeta = const VerificationMeta('region');
  @override
  late final GeneratedColumn<String> region = GeneratedColumn<String>(
      'region', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _kecamatanMeta =
      const VerificationMeta('kecamatan');
  @override
  late final GeneratedColumn<String> kecamatan = GeneratedColumn<String>(
      'kecamatan', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _desaMeta = const VerificationMeta('desa');
  @override
  late final GeneratedColumn<String> desa = GeneratedColumn<String>(
      'desa', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _affectedPeopleMeta =
      const VerificationMeta('affectedPeople');
  @override
  late final GeneratedColumn<int> affectedPeople = GeneratedColumn<int>(
      'affected_people', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(0));
  static const VerificationMeta _assignedTeamMeta =
      const VerificationMeta('assignedTeam');
  @override
  late final GeneratedColumn<String> assignedTeam = GeneratedColumn<String>(
      'assigned_team', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _commanderNameMeta =
      const VerificationMeta('commanderName');
  @override
  late final GeneratedColumn<String> commanderName = GeneratedColumn<String>(
      'commander_name', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _missionStartMeta =
      const VerificationMeta('missionStart');
  @override
  late final GeneratedColumn<DateTime> missionStart = GeneratedColumn<DateTime>(
      'mission_start', aliasedName, true,
      type: DriftSqlType.dateTime, requiredDuringInsert: false);
  static const VerificationMeta _missionEndMeta =
      const VerificationMeta('missionEnd');
  @override
  late final GeneratedColumn<DateTime> missionEnd = GeneratedColumn<DateTime>(
      'mission_end', aliasedName, true,
      type: DriftSqlType.dateTime, requiredDuringInsert: false);
  static const VerificationMeta _notesMeta = const VerificationMeta('notes');
  @override
  late final GeneratedColumn<String> notes = GeneratedColumn<String>(
      'notes', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _cachedAtMeta =
      const VerificationMeta('cachedAt');
  @override
  late final GeneratedColumn<DateTime> cachedAt = GeneratedColumn<DateTime>(
      'cached_at', aliasedName, true,
      type: DriftSqlType.dateTime, requiredDuringInsert: false);
  static const VerificationMeta _ttlSecondsMeta =
      const VerificationMeta('ttlSeconds');
  @override
  late final GeneratedColumn<int> ttlSeconds = GeneratedColumn<int>(
      'ttl_seconds', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(300));
  static const VerificationMeta _syncVersionMeta =
      const VerificationMeta('syncVersion');
  @override
  late final GeneratedColumn<int> syncVersion = GeneratedColumn<int>(
      'sync_version', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(1));
  @override
  List<GeneratedColumn> get $columns => [
        id,
        title,
        description,
        disasterType,
        status,
        latitude,
        longitude,
        address,
        region,
        kecamatan,
        desa,
        affectedPeople,
        assignedTeam,
        commanderName,
        missionStart,
        missionEnd,
        notes,
        cachedAt,
        ttlSeconds,
        syncVersion
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'missions';
  @override
  VerificationContext validateIntegrity(Insertable<Mission> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('title')) {
      context.handle(
          _titleMeta, title.isAcceptableOrUnknown(data['title']!, _titleMeta));
    } else if (isInserting) {
      context.missing(_titleMeta);
    }
    if (data.containsKey('description')) {
      context.handle(
          _descriptionMeta,
          description.isAcceptableOrUnknown(
              data['description']!, _descriptionMeta));
    }
    if (data.containsKey('disaster_type')) {
      context.handle(
          _disasterTypeMeta,
          disasterType.isAcceptableOrUnknown(
              data['disaster_type']!, _disasterTypeMeta));
    } else if (isInserting) {
      context.missing(_disasterTypeMeta);
    }
    if (data.containsKey('status')) {
      context.handle(_statusMeta,
          status.isAcceptableOrUnknown(data['status']!, _statusMeta));
    }
    if (data.containsKey('latitude')) {
      context.handle(_latitudeMeta,
          latitude.isAcceptableOrUnknown(data['latitude']!, _latitudeMeta));
    } else if (isInserting) {
      context.missing(_latitudeMeta);
    }
    if (data.containsKey('longitude')) {
      context.handle(_longitudeMeta,
          longitude.isAcceptableOrUnknown(data['longitude']!, _longitudeMeta));
    } else if (isInserting) {
      context.missing(_longitudeMeta);
    }
    if (data.containsKey('address')) {
      context.handle(_addressMeta,
          address.isAcceptableOrUnknown(data['address']!, _addressMeta));
    }
    if (data.containsKey('region')) {
      context.handle(_regionMeta,
          region.isAcceptableOrUnknown(data['region']!, _regionMeta));
    }
    if (data.containsKey('kecamatan')) {
      context.handle(_kecamatanMeta,
          kecamatan.isAcceptableOrUnknown(data['kecamatan']!, _kecamatanMeta));
    }
    if (data.containsKey('desa')) {
      context.handle(
          _desaMeta, desa.isAcceptableOrUnknown(data['desa']!, _desaMeta));
    }
    if (data.containsKey('affected_people')) {
      context.handle(
          _affectedPeopleMeta,
          affectedPeople.isAcceptableOrUnknown(
              data['affected_people']!, _affectedPeopleMeta));
    }
    if (data.containsKey('assigned_team')) {
      context.handle(
          _assignedTeamMeta,
          assignedTeam.isAcceptableOrUnknown(
              data['assigned_team']!, _assignedTeamMeta));
    }
    if (data.containsKey('commander_name')) {
      context.handle(
          _commanderNameMeta,
          commanderName.isAcceptableOrUnknown(
              data['commander_name']!, _commanderNameMeta));
    }
    if (data.containsKey('mission_start')) {
      context.handle(
          _missionStartMeta,
          missionStart.isAcceptableOrUnknown(
              data['mission_start']!, _missionStartMeta));
    }
    if (data.containsKey('mission_end')) {
      context.handle(
          _missionEndMeta,
          missionEnd.isAcceptableOrUnknown(
              data['mission_end']!, _missionEndMeta));
    }
    if (data.containsKey('notes')) {
      context.handle(
          _notesMeta, notes.isAcceptableOrUnknown(data['notes']!, _notesMeta));
    }
    if (data.containsKey('cached_at')) {
      context.handle(_cachedAtMeta,
          cachedAt.isAcceptableOrUnknown(data['cached_at']!, _cachedAtMeta));
    }
    if (data.containsKey('ttl_seconds')) {
      context.handle(
          _ttlSecondsMeta,
          ttlSeconds.isAcceptableOrUnknown(
              data['ttl_seconds']!, _ttlSecondsMeta));
    }
    if (data.containsKey('sync_version')) {
      context.handle(
          _syncVersionMeta,
          syncVersion.isAcceptableOrUnknown(
              data['sync_version']!, _syncVersionMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => const {};
  @override
  Mission map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Mission(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      title: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}title'])!,
      description: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}description']),
      disasterType: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}disaster_type'])!,
      status: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}status'])!,
      latitude: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}latitude'])!,
      longitude: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}longitude'])!,
      address: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}address']),
      region: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}region']),
      kecamatan: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}kecamatan']),
      desa: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}desa']),
      affectedPeople: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}affected_people'])!,
      assignedTeam: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}assigned_team']),
      commanderName: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}commander_name']),
      missionStart: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}mission_start']),
      missionEnd: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}mission_end']),
      notes: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}notes']),
      cachedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}cached_at']),
      ttlSeconds: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}ttl_seconds'])!,
      syncVersion: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}sync_version'])!,
    );
  }

  @override
  $MissionsTable createAlias(String alias) {
    return $MissionsTable(attachedDatabase, alias);
  }
}

class Mission extends DataClass implements Insertable<Mission> {
  final int id;
  final String title;
  final String? description;
  final String disasterType;
  final String status;
  final double latitude;
  final double longitude;
  final String? address;
  final String? region;
  final String? kecamatan;
  final String? desa;
  final int affectedPeople;
  final String? assignedTeam;
  final String? commanderName;
  final DateTime? missionStart;
  final DateTime? missionEnd;
  final String? notes;
  final DateTime? cachedAt;
  final int ttlSeconds;
  final int syncVersion;
  const Mission(
      {required this.id,
      required this.title,
      this.description,
      required this.disasterType,
      required this.status,
      required this.latitude,
      required this.longitude,
      this.address,
      this.region,
      this.kecamatan,
      this.desa,
      required this.affectedPeople,
      this.assignedTeam,
      this.commanderName,
      this.missionStart,
      this.missionEnd,
      this.notes,
      this.cachedAt,
      required this.ttlSeconds,
      required this.syncVersion});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['title'] = Variable<String>(title);
    if (!nullToAbsent || description != null) {
      map['description'] = Variable<String>(description);
    }
    map['disaster_type'] = Variable<String>(disasterType);
    map['status'] = Variable<String>(status);
    map['latitude'] = Variable<double>(latitude);
    map['longitude'] = Variable<double>(longitude);
    if (!nullToAbsent || address != null) {
      map['address'] = Variable<String>(address);
    }
    if (!nullToAbsent || region != null) {
      map['region'] = Variable<String>(region);
    }
    if (!nullToAbsent || kecamatan != null) {
      map['kecamatan'] = Variable<String>(kecamatan);
    }
    if (!nullToAbsent || desa != null) {
      map['desa'] = Variable<String>(desa);
    }
    map['affected_people'] = Variable<int>(affectedPeople);
    if (!nullToAbsent || assignedTeam != null) {
      map['assigned_team'] = Variable<String>(assignedTeam);
    }
    if (!nullToAbsent || commanderName != null) {
      map['commander_name'] = Variable<String>(commanderName);
    }
    if (!nullToAbsent || missionStart != null) {
      map['mission_start'] = Variable<DateTime>(missionStart);
    }
    if (!nullToAbsent || missionEnd != null) {
      map['mission_end'] = Variable<DateTime>(missionEnd);
    }
    if (!nullToAbsent || notes != null) {
      map['notes'] = Variable<String>(notes);
    }
    if (!nullToAbsent || cachedAt != null) {
      map['cached_at'] = Variable<DateTime>(cachedAt);
    }
    map['ttl_seconds'] = Variable<int>(ttlSeconds);
    map['sync_version'] = Variable<int>(syncVersion);
    return map;
  }

  MissionsCompanion toCompanion(bool nullToAbsent) {
    return MissionsCompanion(
      id: Value(id),
      title: Value(title),
      description: description == null && nullToAbsent
          ? const Value.absent()
          : Value(description),
      disasterType: Value(disasterType),
      status: Value(status),
      latitude: Value(latitude),
      longitude: Value(longitude),
      address: address == null && nullToAbsent
          ? const Value.absent()
          : Value(address),
      region:
          region == null && nullToAbsent ? const Value.absent() : Value(region),
      kecamatan: kecamatan == null && nullToAbsent
          ? const Value.absent()
          : Value(kecamatan),
      desa: desa == null && nullToAbsent ? const Value.absent() : Value(desa),
      affectedPeople: Value(affectedPeople),
      assignedTeam: assignedTeam == null && nullToAbsent
          ? const Value.absent()
          : Value(assignedTeam),
      commanderName: commanderName == null && nullToAbsent
          ? const Value.absent()
          : Value(commanderName),
      missionStart: missionStart == null && nullToAbsent
          ? const Value.absent()
          : Value(missionStart),
      missionEnd: missionEnd == null && nullToAbsent
          ? const Value.absent()
          : Value(missionEnd),
      notes:
          notes == null && nullToAbsent ? const Value.absent() : Value(notes),
      cachedAt: cachedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(cachedAt),
      ttlSeconds: Value(ttlSeconds),
      syncVersion: Value(syncVersion),
    );
  }

  factory Mission.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Mission(
      id: serializer.fromJson<int>(json['id']),
      title: serializer.fromJson<String>(json['title']),
      description: serializer.fromJson<String?>(json['description']),
      disasterType: serializer.fromJson<String>(json['disasterType']),
      status: serializer.fromJson<String>(json['status']),
      latitude: serializer.fromJson<double>(json['latitude']),
      longitude: serializer.fromJson<double>(json['longitude']),
      address: serializer.fromJson<String?>(json['address']),
      region: serializer.fromJson<String?>(json['region']),
      kecamatan: serializer.fromJson<String?>(json['kecamatan']),
      desa: serializer.fromJson<String?>(json['desa']),
      affectedPeople: serializer.fromJson<int>(json['affectedPeople']),
      assignedTeam: serializer.fromJson<String?>(json['assignedTeam']),
      commanderName: serializer.fromJson<String?>(json['commanderName']),
      missionStart: serializer.fromJson<DateTime?>(json['missionStart']),
      missionEnd: serializer.fromJson<DateTime?>(json['missionEnd']),
      notes: serializer.fromJson<String?>(json['notes']),
      cachedAt: serializer.fromJson<DateTime?>(json['cachedAt']),
      ttlSeconds: serializer.fromJson<int>(json['ttlSeconds']),
      syncVersion: serializer.fromJson<int>(json['syncVersion']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'title': serializer.toJson<String>(title),
      'description': serializer.toJson<String?>(description),
      'disasterType': serializer.toJson<String>(disasterType),
      'status': serializer.toJson<String>(status),
      'latitude': serializer.toJson<double>(latitude),
      'longitude': serializer.toJson<double>(longitude),
      'address': serializer.toJson<String?>(address),
      'region': serializer.toJson<String?>(region),
      'kecamatan': serializer.toJson<String?>(kecamatan),
      'desa': serializer.toJson<String?>(desa),
      'affectedPeople': serializer.toJson<int>(affectedPeople),
      'assignedTeam': serializer.toJson<String?>(assignedTeam),
      'commanderName': serializer.toJson<String?>(commanderName),
      'missionStart': serializer.toJson<DateTime?>(missionStart),
      'missionEnd': serializer.toJson<DateTime?>(missionEnd),
      'notes': serializer.toJson<String?>(notes),
      'cachedAt': serializer.toJson<DateTime?>(cachedAt),
      'ttlSeconds': serializer.toJson<int>(ttlSeconds),
      'syncVersion': serializer.toJson<int>(syncVersion),
    };
  }

  Mission copyWith(
          {int? id,
          String? title,
          Value<String?> description = const Value.absent(),
          String? disasterType,
          String? status,
          double? latitude,
          double? longitude,
          Value<String?> address = const Value.absent(),
          Value<String?> region = const Value.absent(),
          Value<String?> kecamatan = const Value.absent(),
          Value<String?> desa = const Value.absent(),
          int? affectedPeople,
          Value<String?> assignedTeam = const Value.absent(),
          Value<String?> commanderName = const Value.absent(),
          Value<DateTime?> missionStart = const Value.absent(),
          Value<DateTime?> missionEnd = const Value.absent(),
          Value<String?> notes = const Value.absent(),
          Value<DateTime?> cachedAt = const Value.absent(),
          int? ttlSeconds,
          int? syncVersion}) =>
      Mission(
        id: id ?? this.id,
        title: title ?? this.title,
        description: description.present ? description.value : this.description,
        disasterType: disasterType ?? this.disasterType,
        status: status ?? this.status,
        latitude: latitude ?? this.latitude,
        longitude: longitude ?? this.longitude,
        address: address.present ? address.value : this.address,
        region: region.present ? region.value : this.region,
        kecamatan: kecamatan.present ? kecamatan.value : this.kecamatan,
        desa: desa.present ? desa.value : this.desa,
        affectedPeople: affectedPeople ?? this.affectedPeople,
        assignedTeam:
            assignedTeam.present ? assignedTeam.value : this.assignedTeam,
        commanderName:
            commanderName.present ? commanderName.value : this.commanderName,
        missionStart:
            missionStart.present ? missionStart.value : this.missionStart,
        missionEnd: missionEnd.present ? missionEnd.value : this.missionEnd,
        notes: notes.present ? notes.value : this.notes,
        cachedAt: cachedAt.present ? cachedAt.value : this.cachedAt,
        ttlSeconds: ttlSeconds ?? this.ttlSeconds,
        syncVersion: syncVersion ?? this.syncVersion,
      );
  Mission copyWithCompanion(MissionsCompanion data) {
    return Mission(
      id: data.id.present ? data.id.value : this.id,
      title: data.title.present ? data.title.value : this.title,
      description:
          data.description.present ? data.description.value : this.description,
      disasterType: data.disasterType.present
          ? data.disasterType.value
          : this.disasterType,
      status: data.status.present ? data.status.value : this.status,
      latitude: data.latitude.present ? data.latitude.value : this.latitude,
      longitude: data.longitude.present ? data.longitude.value : this.longitude,
      address: data.address.present ? data.address.value : this.address,
      region: data.region.present ? data.region.value : this.region,
      kecamatan: data.kecamatan.present ? data.kecamatan.value : this.kecamatan,
      desa: data.desa.present ? data.desa.value : this.desa,
      affectedPeople: data.affectedPeople.present
          ? data.affectedPeople.value
          : this.affectedPeople,
      assignedTeam: data.assignedTeam.present
          ? data.assignedTeam.value
          : this.assignedTeam,
      commanderName: data.commanderName.present
          ? data.commanderName.value
          : this.commanderName,
      missionStart: data.missionStart.present
          ? data.missionStart.value
          : this.missionStart,
      missionEnd:
          data.missionEnd.present ? data.missionEnd.value : this.missionEnd,
      notes: data.notes.present ? data.notes.value : this.notes,
      cachedAt: data.cachedAt.present ? data.cachedAt.value : this.cachedAt,
      ttlSeconds:
          data.ttlSeconds.present ? data.ttlSeconds.value : this.ttlSeconds,
      syncVersion:
          data.syncVersion.present ? data.syncVersion.value : this.syncVersion,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Mission(')
          ..write('id: $id, ')
          ..write('title: $title, ')
          ..write('description: $description, ')
          ..write('disasterType: $disasterType, ')
          ..write('status: $status, ')
          ..write('latitude: $latitude, ')
          ..write('longitude: $longitude, ')
          ..write('address: $address, ')
          ..write('region: $region, ')
          ..write('kecamatan: $kecamatan, ')
          ..write('desa: $desa, ')
          ..write('affectedPeople: $affectedPeople, ')
          ..write('assignedTeam: $assignedTeam, ')
          ..write('commanderName: $commanderName, ')
          ..write('missionStart: $missionStart, ')
          ..write('missionEnd: $missionEnd, ')
          ..write('notes: $notes, ')
          ..write('cachedAt: $cachedAt, ')
          ..write('ttlSeconds: $ttlSeconds, ')
          ..write('syncVersion: $syncVersion')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      id,
      title,
      description,
      disasterType,
      status,
      latitude,
      longitude,
      address,
      region,
      kecamatan,
      desa,
      affectedPeople,
      assignedTeam,
      commanderName,
      missionStart,
      missionEnd,
      notes,
      cachedAt,
      ttlSeconds,
      syncVersion);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Mission &&
          other.id == this.id &&
          other.title == this.title &&
          other.description == this.description &&
          other.disasterType == this.disasterType &&
          other.status == this.status &&
          other.latitude == this.latitude &&
          other.longitude == this.longitude &&
          other.address == this.address &&
          other.region == this.region &&
          other.kecamatan == this.kecamatan &&
          other.desa == this.desa &&
          other.affectedPeople == this.affectedPeople &&
          other.assignedTeam == this.assignedTeam &&
          other.commanderName == this.commanderName &&
          other.missionStart == this.missionStart &&
          other.missionEnd == this.missionEnd &&
          other.notes == this.notes &&
          other.cachedAt == this.cachedAt &&
          other.ttlSeconds == this.ttlSeconds &&
          other.syncVersion == this.syncVersion);
}

class MissionsCompanion extends UpdateCompanion<Mission> {
  final Value<int> id;
  final Value<String> title;
  final Value<String?> description;
  final Value<String> disasterType;
  final Value<String> status;
  final Value<double> latitude;
  final Value<double> longitude;
  final Value<String?> address;
  final Value<String?> region;
  final Value<String?> kecamatan;
  final Value<String?> desa;
  final Value<int> affectedPeople;
  final Value<String?> assignedTeam;
  final Value<String?> commanderName;
  final Value<DateTime?> missionStart;
  final Value<DateTime?> missionEnd;
  final Value<String?> notes;
  final Value<DateTime?> cachedAt;
  final Value<int> ttlSeconds;
  final Value<int> syncVersion;
  final Value<int> rowid;
  const MissionsCompanion({
    this.id = const Value.absent(),
    this.title = const Value.absent(),
    this.description = const Value.absent(),
    this.disasterType = const Value.absent(),
    this.status = const Value.absent(),
    this.latitude = const Value.absent(),
    this.longitude = const Value.absent(),
    this.address = const Value.absent(),
    this.region = const Value.absent(),
    this.kecamatan = const Value.absent(),
    this.desa = const Value.absent(),
    this.affectedPeople = const Value.absent(),
    this.assignedTeam = const Value.absent(),
    this.commanderName = const Value.absent(),
    this.missionStart = const Value.absent(),
    this.missionEnd = const Value.absent(),
    this.notes = const Value.absent(),
    this.cachedAt = const Value.absent(),
    this.ttlSeconds = const Value.absent(),
    this.syncVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  MissionsCompanion.insert({
    required int id,
    required String title,
    this.description = const Value.absent(),
    required String disasterType,
    this.status = const Value.absent(),
    required double latitude,
    required double longitude,
    this.address = const Value.absent(),
    this.region = const Value.absent(),
    this.kecamatan = const Value.absent(),
    this.desa = const Value.absent(),
    this.affectedPeople = const Value.absent(),
    this.assignedTeam = const Value.absent(),
    this.commanderName = const Value.absent(),
    this.missionStart = const Value.absent(),
    this.missionEnd = const Value.absent(),
    this.notes = const Value.absent(),
    this.cachedAt = const Value.absent(),
    this.ttlSeconds = const Value.absent(),
    this.syncVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        title = Value(title),
        disasterType = Value(disasterType),
        latitude = Value(latitude),
        longitude = Value(longitude);
  static Insertable<Mission> custom({
    Expression<int>? id,
    Expression<String>? title,
    Expression<String>? description,
    Expression<String>? disasterType,
    Expression<String>? status,
    Expression<double>? latitude,
    Expression<double>? longitude,
    Expression<String>? address,
    Expression<String>? region,
    Expression<String>? kecamatan,
    Expression<String>? desa,
    Expression<int>? affectedPeople,
    Expression<String>? assignedTeam,
    Expression<String>? commanderName,
    Expression<DateTime>? missionStart,
    Expression<DateTime>? missionEnd,
    Expression<String>? notes,
    Expression<DateTime>? cachedAt,
    Expression<int>? ttlSeconds,
    Expression<int>? syncVersion,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (title != null) 'title': title,
      if (description != null) 'description': description,
      if (disasterType != null) 'disaster_type': disasterType,
      if (status != null) 'status': status,
      if (latitude != null) 'latitude': latitude,
      if (longitude != null) 'longitude': longitude,
      if (address != null) 'address': address,
      if (region != null) 'region': region,
      if (kecamatan != null) 'kecamatan': kecamatan,
      if (desa != null) 'desa': desa,
      if (affectedPeople != null) 'affected_people': affectedPeople,
      if (assignedTeam != null) 'assigned_team': assignedTeam,
      if (commanderName != null) 'commander_name': commanderName,
      if (missionStart != null) 'mission_start': missionStart,
      if (missionEnd != null) 'mission_end': missionEnd,
      if (notes != null) 'notes': notes,
      if (cachedAt != null) 'cached_at': cachedAt,
      if (ttlSeconds != null) 'ttl_seconds': ttlSeconds,
      if (syncVersion != null) 'sync_version': syncVersion,
      if (rowid != null) 'rowid': rowid,
    });
  }

  MissionsCompanion copyWith(
      {Value<int>? id,
      Value<String>? title,
      Value<String?>? description,
      Value<String>? disasterType,
      Value<String>? status,
      Value<double>? latitude,
      Value<double>? longitude,
      Value<String?>? address,
      Value<String?>? region,
      Value<String?>? kecamatan,
      Value<String?>? desa,
      Value<int>? affectedPeople,
      Value<String?>? assignedTeam,
      Value<String?>? commanderName,
      Value<DateTime?>? missionStart,
      Value<DateTime?>? missionEnd,
      Value<String?>? notes,
      Value<DateTime?>? cachedAt,
      Value<int>? ttlSeconds,
      Value<int>? syncVersion,
      Value<int>? rowid}) {
    return MissionsCompanion(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      disasterType: disasterType ?? this.disasterType,
      status: status ?? this.status,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      address: address ?? this.address,
      region: region ?? this.region,
      kecamatan: kecamatan ?? this.kecamatan,
      desa: desa ?? this.desa,
      affectedPeople: affectedPeople ?? this.affectedPeople,
      assignedTeam: assignedTeam ?? this.assignedTeam,
      commanderName: commanderName ?? this.commanderName,
      missionStart: missionStart ?? this.missionStart,
      missionEnd: missionEnd ?? this.missionEnd,
      notes: notes ?? this.notes,
      cachedAt: cachedAt ?? this.cachedAt,
      ttlSeconds: ttlSeconds ?? this.ttlSeconds,
      syncVersion: syncVersion ?? this.syncVersion,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (title.present) {
      map['title'] = Variable<String>(title.value);
    }
    if (description.present) {
      map['description'] = Variable<String>(description.value);
    }
    if (disasterType.present) {
      map['disaster_type'] = Variable<String>(disasterType.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (latitude.present) {
      map['latitude'] = Variable<double>(latitude.value);
    }
    if (longitude.present) {
      map['longitude'] = Variable<double>(longitude.value);
    }
    if (address.present) {
      map['address'] = Variable<String>(address.value);
    }
    if (region.present) {
      map['region'] = Variable<String>(region.value);
    }
    if (kecamatan.present) {
      map['kecamatan'] = Variable<String>(kecamatan.value);
    }
    if (desa.present) {
      map['desa'] = Variable<String>(desa.value);
    }
    if (affectedPeople.present) {
      map['affected_people'] = Variable<int>(affectedPeople.value);
    }
    if (assignedTeam.present) {
      map['assigned_team'] = Variable<String>(assignedTeam.value);
    }
    if (commanderName.present) {
      map['commander_name'] = Variable<String>(commanderName.value);
    }
    if (missionStart.present) {
      map['mission_start'] = Variable<DateTime>(missionStart.value);
    }
    if (missionEnd.present) {
      map['mission_end'] = Variable<DateTime>(missionEnd.value);
    }
    if (notes.present) {
      map['notes'] = Variable<String>(notes.value);
    }
    if (cachedAt.present) {
      map['cached_at'] = Variable<DateTime>(cachedAt.value);
    }
    if (ttlSeconds.present) {
      map['ttl_seconds'] = Variable<int>(ttlSeconds.value);
    }
    if (syncVersion.present) {
      map['sync_version'] = Variable<int>(syncVersion.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('MissionsCompanion(')
          ..write('id: $id, ')
          ..write('title: $title, ')
          ..write('description: $description, ')
          ..write('disasterType: $disasterType, ')
          ..write('status: $status, ')
          ..write('latitude: $latitude, ')
          ..write('longitude: $longitude, ')
          ..write('address: $address, ')
          ..write('region: $region, ')
          ..write('kecamatan: $kecamatan, ')
          ..write('desa: $desa, ')
          ..write('affectedPeople: $affectedPeople, ')
          ..write('assignedTeam: $assignedTeam, ')
          ..write('commanderName: $commanderName, ')
          ..write('missionStart: $missionStart, ')
          ..write('missionEnd: $missionEnd, ')
          ..write('notes: $notes, ')
          ..write('cachedAt: $cachedAt, ')
          ..write('ttlSeconds: $ttlSeconds, ')
          ..write('syncVersion: $syncVersion, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $VolunteersTable extends Volunteers
    with TableInfo<$VolunteersTable, Volunteer> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $VolunteersTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _userIdMeta = const VerificationMeta('userId');
  @override
  late final GeneratedColumn<int> userId = GeneratedColumn<int>(
      'user_id', aliasedName, true,
      type: DriftSqlType.int, requiredDuringInsert: false);
  static const VerificationMeta _fullNameMeta =
      const VerificationMeta('fullName');
  @override
  late final GeneratedColumn<String> fullName = GeneratedColumn<String>(
      'full_name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _phoneMeta = const VerificationMeta('phone');
  @override
  late final GeneratedColumn<String> phone = GeneratedColumn<String>(
      'phone', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _emailMeta = const VerificationMeta('email');
  @override
  late final GeneratedColumn<String> email = GeneratedColumn<String>(
      'email', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _birthDateMeta =
      const VerificationMeta('birthDate');
  @override
  late final GeneratedColumn<DateTime> birthDate = GeneratedColumn<DateTime>(
      'birth_date', aliasedName, true,
      type: DriftSqlType.dateTime, requiredDuringInsert: false);
  static const VerificationMeta _genderMeta = const VerificationMeta('gender');
  @override
  late final GeneratedColumn<String> gender = GeneratedColumn<String>(
      'gender', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _bloodTypeMeta =
      const VerificationMeta('bloodType');
  @override
  late final GeneratedColumn<String> bloodType = GeneratedColumn<String>(
      'blood_type', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _regencyMeta =
      const VerificationMeta('regency');
  @override
  late final GeneratedColumn<String> regency = GeneratedColumn<String>(
      'regency', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _districtMeta =
      const VerificationMeta('district');
  @override
  late final GeneratedColumn<String> district = GeneratedColumn<String>(
      'district', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _villageMeta =
      const VerificationMeta('village');
  @override
  late final GeneratedColumn<String> village = GeneratedColumn<String>(
      'village', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _detailAddressMeta =
      const VerificationMeta('detailAddress');
  @override
  late final GeneratedColumn<String> detailAddress = GeneratedColumn<String>(
      'detail_address', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _latitudeMeta =
      const VerificationMeta('latitude');
  @override
  late final GeneratedColumn<double> latitude = GeneratedColumn<double>(
      'latitude', aliasedName, true,
      type: DriftSqlType.double, requiredDuringInsert: false);
  static const VerificationMeta _longitudeMeta =
      const VerificationMeta('longitude');
  @override
  late final GeneratedColumn<double> longitude = GeneratedColumn<double>(
      'longitude', aliasedName, true,
      type: DriftSqlType.double, requiredDuringInsert: false);
  static const VerificationMeta _medicalHistoryMeta =
      const VerificationMeta('medicalHistory');
  @override
  late final GeneratedColumn<String> medicalHistory = GeneratedColumn<String>(
      'medical_history', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _expertiseMeta =
      const VerificationMeta('expertise');
  @override
  late final GeneratedColumn<String> expertise = GeneratedColumn<String>(
      'expertise', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _experienceMeta =
      const VerificationMeta('experience');
  @override
  late final GeneratedColumn<String> experience = GeneratedColumn<String>(
      'experience', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
      'status', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('approved'));
  static const VerificationMeta _cachedAtMeta =
      const VerificationMeta('cachedAt');
  @override
  late final GeneratedColumn<DateTime> cachedAt = GeneratedColumn<DateTime>(
      'cached_at', aliasedName, true,
      type: DriftSqlType.dateTime, requiredDuringInsert: false);
  static const VerificationMeta _ttlSecondsMeta =
      const VerificationMeta('ttlSeconds');
  @override
  late final GeneratedColumn<int> ttlSeconds = GeneratedColumn<int>(
      'ttl_seconds', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(3600));
  static const VerificationMeta _syncVersionMeta =
      const VerificationMeta('syncVersion');
  @override
  late final GeneratedColumn<int> syncVersion = GeneratedColumn<int>(
      'sync_version', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(1));
  @override
  List<GeneratedColumn> get $columns => [
        id,
        userId,
        fullName,
        phone,
        email,
        birthDate,
        gender,
        bloodType,
        regency,
        district,
        village,
        detailAddress,
        latitude,
        longitude,
        medicalHistory,
        expertise,
        experience,
        status,
        cachedAt,
        ttlSeconds,
        syncVersion
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'volunteers';
  @override
  VerificationContext validateIntegrity(Insertable<Volunteer> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('user_id')) {
      context.handle(_userIdMeta,
          userId.isAcceptableOrUnknown(data['user_id']!, _userIdMeta));
    }
    if (data.containsKey('full_name')) {
      context.handle(_fullNameMeta,
          fullName.isAcceptableOrUnknown(data['full_name']!, _fullNameMeta));
    } else if (isInserting) {
      context.missing(_fullNameMeta);
    }
    if (data.containsKey('phone')) {
      context.handle(
          _phoneMeta, phone.isAcceptableOrUnknown(data['phone']!, _phoneMeta));
    }
    if (data.containsKey('email')) {
      context.handle(
          _emailMeta, email.isAcceptableOrUnknown(data['email']!, _emailMeta));
    }
    if (data.containsKey('birth_date')) {
      context.handle(_birthDateMeta,
          birthDate.isAcceptableOrUnknown(data['birth_date']!, _birthDateMeta));
    }
    if (data.containsKey('gender')) {
      context.handle(_genderMeta,
          gender.isAcceptableOrUnknown(data['gender']!, _genderMeta));
    }
    if (data.containsKey('blood_type')) {
      context.handle(_bloodTypeMeta,
          bloodType.isAcceptableOrUnknown(data['blood_type']!, _bloodTypeMeta));
    }
    if (data.containsKey('regency')) {
      context.handle(_regencyMeta,
          regency.isAcceptableOrUnknown(data['regency']!, _regencyMeta));
    }
    if (data.containsKey('district')) {
      context.handle(_districtMeta,
          district.isAcceptableOrUnknown(data['district']!, _districtMeta));
    }
    if (data.containsKey('village')) {
      context.handle(_villageMeta,
          village.isAcceptableOrUnknown(data['village']!, _villageMeta));
    }
    if (data.containsKey('detail_address')) {
      context.handle(
          _detailAddressMeta,
          detailAddress.isAcceptableOrUnknown(
              data['detail_address']!, _detailAddressMeta));
    }
    if (data.containsKey('latitude')) {
      context.handle(_latitudeMeta,
          latitude.isAcceptableOrUnknown(data['latitude']!, _latitudeMeta));
    }
    if (data.containsKey('longitude')) {
      context.handle(_longitudeMeta,
          longitude.isAcceptableOrUnknown(data['longitude']!, _longitudeMeta));
    }
    if (data.containsKey('medical_history')) {
      context.handle(
          _medicalHistoryMeta,
          medicalHistory.isAcceptableOrUnknown(
              data['medical_history']!, _medicalHistoryMeta));
    }
    if (data.containsKey('expertise')) {
      context.handle(_expertiseMeta,
          expertise.isAcceptableOrUnknown(data['expertise']!, _expertiseMeta));
    }
    if (data.containsKey('experience')) {
      context.handle(
          _experienceMeta,
          experience.isAcceptableOrUnknown(
              data['experience']!, _experienceMeta));
    }
    if (data.containsKey('status')) {
      context.handle(_statusMeta,
          status.isAcceptableOrUnknown(data['status']!, _statusMeta));
    }
    if (data.containsKey('cached_at')) {
      context.handle(_cachedAtMeta,
          cachedAt.isAcceptableOrUnknown(data['cached_at']!, _cachedAtMeta));
    }
    if (data.containsKey('ttl_seconds')) {
      context.handle(
          _ttlSecondsMeta,
          ttlSeconds.isAcceptableOrUnknown(
              data['ttl_seconds']!, _ttlSecondsMeta));
    }
    if (data.containsKey('sync_version')) {
      context.handle(
          _syncVersionMeta,
          syncVersion.isAcceptableOrUnknown(
              data['sync_version']!, _syncVersionMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => const {};
  @override
  Volunteer map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Volunteer(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      userId: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}user_id']),
      fullName: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}full_name'])!,
      phone: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}phone']),
      email: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}email']),
      birthDate: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}birth_date']),
      gender: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}gender']),
      bloodType: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}blood_type']),
      regency: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}regency']),
      district: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}district']),
      village: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}village']),
      detailAddress: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}detail_address']),
      latitude: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}latitude']),
      longitude: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}longitude']),
      medicalHistory: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}medical_history']),
      expertise: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}expertise']),
      experience: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}experience']),
      status: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}status'])!,
      cachedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}cached_at']),
      ttlSeconds: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}ttl_seconds'])!,
      syncVersion: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}sync_version'])!,
    );
  }

  @override
  $VolunteersTable createAlias(String alias) {
    return $VolunteersTable(attachedDatabase, alias);
  }
}

class Volunteer extends DataClass implements Insertable<Volunteer> {
  final int id;
  final int? userId;
  final String fullName;
  final String? phone;
  final String? email;
  final DateTime? birthDate;
  final String? gender;
  final String? bloodType;
  final String? regency;
  final String? district;
  final String? village;
  final String? detailAddress;
  final double? latitude;
  final double? longitude;
  final String? medicalHistory;
  final String? expertise;
  final String? experience;
  final String status;
  final DateTime? cachedAt;
  final int ttlSeconds;
  final int syncVersion;
  const Volunteer(
      {required this.id,
      this.userId,
      required this.fullName,
      this.phone,
      this.email,
      this.birthDate,
      this.gender,
      this.bloodType,
      this.regency,
      this.district,
      this.village,
      this.detailAddress,
      this.latitude,
      this.longitude,
      this.medicalHistory,
      this.expertise,
      this.experience,
      required this.status,
      this.cachedAt,
      required this.ttlSeconds,
      required this.syncVersion});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    if (!nullToAbsent || userId != null) {
      map['user_id'] = Variable<int>(userId);
    }
    map['full_name'] = Variable<String>(fullName);
    if (!nullToAbsent || phone != null) {
      map['phone'] = Variable<String>(phone);
    }
    if (!nullToAbsent || email != null) {
      map['email'] = Variable<String>(email);
    }
    if (!nullToAbsent || birthDate != null) {
      map['birth_date'] = Variable<DateTime>(birthDate);
    }
    if (!nullToAbsent || gender != null) {
      map['gender'] = Variable<String>(gender);
    }
    if (!nullToAbsent || bloodType != null) {
      map['blood_type'] = Variable<String>(bloodType);
    }
    if (!nullToAbsent || regency != null) {
      map['regency'] = Variable<String>(regency);
    }
    if (!nullToAbsent || district != null) {
      map['district'] = Variable<String>(district);
    }
    if (!nullToAbsent || village != null) {
      map['village'] = Variable<String>(village);
    }
    if (!nullToAbsent || detailAddress != null) {
      map['detail_address'] = Variable<String>(detailAddress);
    }
    if (!nullToAbsent || latitude != null) {
      map['latitude'] = Variable<double>(latitude);
    }
    if (!nullToAbsent || longitude != null) {
      map['longitude'] = Variable<double>(longitude);
    }
    if (!nullToAbsent || medicalHistory != null) {
      map['medical_history'] = Variable<String>(medicalHistory);
    }
    if (!nullToAbsent || expertise != null) {
      map['expertise'] = Variable<String>(expertise);
    }
    if (!nullToAbsent || experience != null) {
      map['experience'] = Variable<String>(experience);
    }
    map['status'] = Variable<String>(status);
    if (!nullToAbsent || cachedAt != null) {
      map['cached_at'] = Variable<DateTime>(cachedAt);
    }
    map['ttl_seconds'] = Variable<int>(ttlSeconds);
    map['sync_version'] = Variable<int>(syncVersion);
    return map;
  }

  VolunteersCompanion toCompanion(bool nullToAbsent) {
    return VolunteersCompanion(
      id: Value(id),
      userId:
          userId == null && nullToAbsent ? const Value.absent() : Value(userId),
      fullName: Value(fullName),
      phone:
          phone == null && nullToAbsent ? const Value.absent() : Value(phone),
      email:
          email == null && nullToAbsent ? const Value.absent() : Value(email),
      birthDate: birthDate == null && nullToAbsent
          ? const Value.absent()
          : Value(birthDate),
      gender:
          gender == null && nullToAbsent ? const Value.absent() : Value(gender),
      bloodType: bloodType == null && nullToAbsent
          ? const Value.absent()
          : Value(bloodType),
      regency: regency == null && nullToAbsent
          ? const Value.absent()
          : Value(regency),
      district: district == null && nullToAbsent
          ? const Value.absent()
          : Value(district),
      village: village == null && nullToAbsent
          ? const Value.absent()
          : Value(village),
      detailAddress: detailAddress == null && nullToAbsent
          ? const Value.absent()
          : Value(detailAddress),
      latitude: latitude == null && nullToAbsent
          ? const Value.absent()
          : Value(latitude),
      longitude: longitude == null && nullToAbsent
          ? const Value.absent()
          : Value(longitude),
      medicalHistory: medicalHistory == null && nullToAbsent
          ? const Value.absent()
          : Value(medicalHistory),
      expertise: expertise == null && nullToAbsent
          ? const Value.absent()
          : Value(expertise),
      experience: experience == null && nullToAbsent
          ? const Value.absent()
          : Value(experience),
      status: Value(status),
      cachedAt: cachedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(cachedAt),
      ttlSeconds: Value(ttlSeconds),
      syncVersion: Value(syncVersion),
    );
  }

  factory Volunteer.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Volunteer(
      id: serializer.fromJson<int>(json['id']),
      userId: serializer.fromJson<int?>(json['userId']),
      fullName: serializer.fromJson<String>(json['fullName']),
      phone: serializer.fromJson<String?>(json['phone']),
      email: serializer.fromJson<String?>(json['email']),
      birthDate: serializer.fromJson<DateTime?>(json['birthDate']),
      gender: serializer.fromJson<String?>(json['gender']),
      bloodType: serializer.fromJson<String?>(json['bloodType']),
      regency: serializer.fromJson<String?>(json['regency']),
      district: serializer.fromJson<String?>(json['district']),
      village: serializer.fromJson<String?>(json['village']),
      detailAddress: serializer.fromJson<String?>(json['detailAddress']),
      latitude: serializer.fromJson<double?>(json['latitude']),
      longitude: serializer.fromJson<double?>(json['longitude']),
      medicalHistory: serializer.fromJson<String?>(json['medicalHistory']),
      expertise: serializer.fromJson<String?>(json['expertise']),
      experience: serializer.fromJson<String?>(json['experience']),
      status: serializer.fromJson<String>(json['status']),
      cachedAt: serializer.fromJson<DateTime?>(json['cachedAt']),
      ttlSeconds: serializer.fromJson<int>(json['ttlSeconds']),
      syncVersion: serializer.fromJson<int>(json['syncVersion']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'userId': serializer.toJson<int?>(userId),
      'fullName': serializer.toJson<String>(fullName),
      'phone': serializer.toJson<String?>(phone),
      'email': serializer.toJson<String?>(email),
      'birthDate': serializer.toJson<DateTime?>(birthDate),
      'gender': serializer.toJson<String?>(gender),
      'bloodType': serializer.toJson<String?>(bloodType),
      'regency': serializer.toJson<String?>(regency),
      'district': serializer.toJson<String?>(district),
      'village': serializer.toJson<String?>(village),
      'detailAddress': serializer.toJson<String?>(detailAddress),
      'latitude': serializer.toJson<double?>(latitude),
      'longitude': serializer.toJson<double?>(longitude),
      'medicalHistory': serializer.toJson<String?>(medicalHistory),
      'expertise': serializer.toJson<String?>(expertise),
      'experience': serializer.toJson<String?>(experience),
      'status': serializer.toJson<String>(status),
      'cachedAt': serializer.toJson<DateTime?>(cachedAt),
      'ttlSeconds': serializer.toJson<int>(ttlSeconds),
      'syncVersion': serializer.toJson<int>(syncVersion),
    };
  }

  Volunteer copyWith(
          {int? id,
          Value<int?> userId = const Value.absent(),
          String? fullName,
          Value<String?> phone = const Value.absent(),
          Value<String?> email = const Value.absent(),
          Value<DateTime?> birthDate = const Value.absent(),
          Value<String?> gender = const Value.absent(),
          Value<String?> bloodType = const Value.absent(),
          Value<String?> regency = const Value.absent(),
          Value<String?> district = const Value.absent(),
          Value<String?> village = const Value.absent(),
          Value<String?> detailAddress = const Value.absent(),
          Value<double?> latitude = const Value.absent(),
          Value<double?> longitude = const Value.absent(),
          Value<String?> medicalHistory = const Value.absent(),
          Value<String?> expertise = const Value.absent(),
          Value<String?> experience = const Value.absent(),
          String? status,
          Value<DateTime?> cachedAt = const Value.absent(),
          int? ttlSeconds,
          int? syncVersion}) =>
      Volunteer(
        id: id ?? this.id,
        userId: userId.present ? userId.value : this.userId,
        fullName: fullName ?? this.fullName,
        phone: phone.present ? phone.value : this.phone,
        email: email.present ? email.value : this.email,
        birthDate: birthDate.present ? birthDate.value : this.birthDate,
        gender: gender.present ? gender.value : this.gender,
        bloodType: bloodType.present ? bloodType.value : this.bloodType,
        regency: regency.present ? regency.value : this.regency,
        district: district.present ? district.value : this.district,
        village: village.present ? village.value : this.village,
        detailAddress:
            detailAddress.present ? detailAddress.value : this.detailAddress,
        latitude: latitude.present ? latitude.value : this.latitude,
        longitude: longitude.present ? longitude.value : this.longitude,
        medicalHistory:
            medicalHistory.present ? medicalHistory.value : this.medicalHistory,
        expertise: expertise.present ? expertise.value : this.expertise,
        experience: experience.present ? experience.value : this.experience,
        status: status ?? this.status,
        cachedAt: cachedAt.present ? cachedAt.value : this.cachedAt,
        ttlSeconds: ttlSeconds ?? this.ttlSeconds,
        syncVersion: syncVersion ?? this.syncVersion,
      );
  Volunteer copyWithCompanion(VolunteersCompanion data) {
    return Volunteer(
      id: data.id.present ? data.id.value : this.id,
      userId: data.userId.present ? data.userId.value : this.userId,
      fullName: data.fullName.present ? data.fullName.value : this.fullName,
      phone: data.phone.present ? data.phone.value : this.phone,
      email: data.email.present ? data.email.value : this.email,
      birthDate: data.birthDate.present ? data.birthDate.value : this.birthDate,
      gender: data.gender.present ? data.gender.value : this.gender,
      bloodType: data.bloodType.present ? data.bloodType.value : this.bloodType,
      regency: data.regency.present ? data.regency.value : this.regency,
      district: data.district.present ? data.district.value : this.district,
      village: data.village.present ? data.village.value : this.village,
      detailAddress: data.detailAddress.present
          ? data.detailAddress.value
          : this.detailAddress,
      latitude: data.latitude.present ? data.latitude.value : this.latitude,
      longitude: data.longitude.present ? data.longitude.value : this.longitude,
      medicalHistory: data.medicalHistory.present
          ? data.medicalHistory.value
          : this.medicalHistory,
      expertise: data.expertise.present ? data.expertise.value : this.expertise,
      experience:
          data.experience.present ? data.experience.value : this.experience,
      status: data.status.present ? data.status.value : this.status,
      cachedAt: data.cachedAt.present ? data.cachedAt.value : this.cachedAt,
      ttlSeconds:
          data.ttlSeconds.present ? data.ttlSeconds.value : this.ttlSeconds,
      syncVersion:
          data.syncVersion.present ? data.syncVersion.value : this.syncVersion,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Volunteer(')
          ..write('id: $id, ')
          ..write('userId: $userId, ')
          ..write('fullName: $fullName, ')
          ..write('phone: $phone, ')
          ..write('email: $email, ')
          ..write('birthDate: $birthDate, ')
          ..write('gender: $gender, ')
          ..write('bloodType: $bloodType, ')
          ..write('regency: $regency, ')
          ..write('district: $district, ')
          ..write('village: $village, ')
          ..write('detailAddress: $detailAddress, ')
          ..write('latitude: $latitude, ')
          ..write('longitude: $longitude, ')
          ..write('medicalHistory: $medicalHistory, ')
          ..write('expertise: $expertise, ')
          ..write('experience: $experience, ')
          ..write('status: $status, ')
          ..write('cachedAt: $cachedAt, ')
          ..write('ttlSeconds: $ttlSeconds, ')
          ..write('syncVersion: $syncVersion')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hashAll([
        id,
        userId,
        fullName,
        phone,
        email,
        birthDate,
        gender,
        bloodType,
        regency,
        district,
        village,
        detailAddress,
        latitude,
        longitude,
        medicalHistory,
        expertise,
        experience,
        status,
        cachedAt,
        ttlSeconds,
        syncVersion
      ]);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Volunteer &&
          other.id == this.id &&
          other.userId == this.userId &&
          other.fullName == this.fullName &&
          other.phone == this.phone &&
          other.email == this.email &&
          other.birthDate == this.birthDate &&
          other.gender == this.gender &&
          other.bloodType == this.bloodType &&
          other.regency == this.regency &&
          other.district == this.district &&
          other.village == this.village &&
          other.detailAddress == this.detailAddress &&
          other.latitude == this.latitude &&
          other.longitude == this.longitude &&
          other.medicalHistory == this.medicalHistory &&
          other.expertise == this.expertise &&
          other.experience == this.experience &&
          other.status == this.status &&
          other.cachedAt == this.cachedAt &&
          other.ttlSeconds == this.ttlSeconds &&
          other.syncVersion == this.syncVersion);
}

class VolunteersCompanion extends UpdateCompanion<Volunteer> {
  final Value<int> id;
  final Value<int?> userId;
  final Value<String> fullName;
  final Value<String?> phone;
  final Value<String?> email;
  final Value<DateTime?> birthDate;
  final Value<String?> gender;
  final Value<String?> bloodType;
  final Value<String?> regency;
  final Value<String?> district;
  final Value<String?> village;
  final Value<String?> detailAddress;
  final Value<double?> latitude;
  final Value<double?> longitude;
  final Value<String?> medicalHistory;
  final Value<String?> expertise;
  final Value<String?> experience;
  final Value<String> status;
  final Value<DateTime?> cachedAt;
  final Value<int> ttlSeconds;
  final Value<int> syncVersion;
  final Value<int> rowid;
  const VolunteersCompanion({
    this.id = const Value.absent(),
    this.userId = const Value.absent(),
    this.fullName = const Value.absent(),
    this.phone = const Value.absent(),
    this.email = const Value.absent(),
    this.birthDate = const Value.absent(),
    this.gender = const Value.absent(),
    this.bloodType = const Value.absent(),
    this.regency = const Value.absent(),
    this.district = const Value.absent(),
    this.village = const Value.absent(),
    this.detailAddress = const Value.absent(),
    this.latitude = const Value.absent(),
    this.longitude = const Value.absent(),
    this.medicalHistory = const Value.absent(),
    this.expertise = const Value.absent(),
    this.experience = const Value.absent(),
    this.status = const Value.absent(),
    this.cachedAt = const Value.absent(),
    this.ttlSeconds = const Value.absent(),
    this.syncVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  VolunteersCompanion.insert({
    required int id,
    this.userId = const Value.absent(),
    required String fullName,
    this.phone = const Value.absent(),
    this.email = const Value.absent(),
    this.birthDate = const Value.absent(),
    this.gender = const Value.absent(),
    this.bloodType = const Value.absent(),
    this.regency = const Value.absent(),
    this.district = const Value.absent(),
    this.village = const Value.absent(),
    this.detailAddress = const Value.absent(),
    this.latitude = const Value.absent(),
    this.longitude = const Value.absent(),
    this.medicalHistory = const Value.absent(),
    this.expertise = const Value.absent(),
    this.experience = const Value.absent(),
    this.status = const Value.absent(),
    this.cachedAt = const Value.absent(),
    this.ttlSeconds = const Value.absent(),
    this.syncVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        fullName = Value(fullName);
  static Insertable<Volunteer> custom({
    Expression<int>? id,
    Expression<int>? userId,
    Expression<String>? fullName,
    Expression<String>? phone,
    Expression<String>? email,
    Expression<DateTime>? birthDate,
    Expression<String>? gender,
    Expression<String>? bloodType,
    Expression<String>? regency,
    Expression<String>? district,
    Expression<String>? village,
    Expression<String>? detailAddress,
    Expression<double>? latitude,
    Expression<double>? longitude,
    Expression<String>? medicalHistory,
    Expression<String>? expertise,
    Expression<String>? experience,
    Expression<String>? status,
    Expression<DateTime>? cachedAt,
    Expression<int>? ttlSeconds,
    Expression<int>? syncVersion,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (userId != null) 'user_id': userId,
      if (fullName != null) 'full_name': fullName,
      if (phone != null) 'phone': phone,
      if (email != null) 'email': email,
      if (birthDate != null) 'birth_date': birthDate,
      if (gender != null) 'gender': gender,
      if (bloodType != null) 'blood_type': bloodType,
      if (regency != null) 'regency': regency,
      if (district != null) 'district': district,
      if (village != null) 'village': village,
      if (detailAddress != null) 'detail_address': detailAddress,
      if (latitude != null) 'latitude': latitude,
      if (longitude != null) 'longitude': longitude,
      if (medicalHistory != null) 'medical_history': medicalHistory,
      if (expertise != null) 'expertise': expertise,
      if (experience != null) 'experience': experience,
      if (status != null) 'status': status,
      if (cachedAt != null) 'cached_at': cachedAt,
      if (ttlSeconds != null) 'ttl_seconds': ttlSeconds,
      if (syncVersion != null) 'sync_version': syncVersion,
      if (rowid != null) 'rowid': rowid,
    });
  }

  VolunteersCompanion copyWith(
      {Value<int>? id,
      Value<int?>? userId,
      Value<String>? fullName,
      Value<String?>? phone,
      Value<String?>? email,
      Value<DateTime?>? birthDate,
      Value<String?>? gender,
      Value<String?>? bloodType,
      Value<String?>? regency,
      Value<String?>? district,
      Value<String?>? village,
      Value<String?>? detailAddress,
      Value<double?>? latitude,
      Value<double?>? longitude,
      Value<String?>? medicalHistory,
      Value<String?>? expertise,
      Value<String?>? experience,
      Value<String>? status,
      Value<DateTime?>? cachedAt,
      Value<int>? ttlSeconds,
      Value<int>? syncVersion,
      Value<int>? rowid}) {
    return VolunteersCompanion(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      fullName: fullName ?? this.fullName,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      birthDate: birthDate ?? this.birthDate,
      gender: gender ?? this.gender,
      bloodType: bloodType ?? this.bloodType,
      regency: regency ?? this.regency,
      district: district ?? this.district,
      village: village ?? this.village,
      detailAddress: detailAddress ?? this.detailAddress,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      medicalHistory: medicalHistory ?? this.medicalHistory,
      expertise: expertise ?? this.expertise,
      experience: experience ?? this.experience,
      status: status ?? this.status,
      cachedAt: cachedAt ?? this.cachedAt,
      ttlSeconds: ttlSeconds ?? this.ttlSeconds,
      syncVersion: syncVersion ?? this.syncVersion,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (userId.present) {
      map['user_id'] = Variable<int>(userId.value);
    }
    if (fullName.present) {
      map['full_name'] = Variable<String>(fullName.value);
    }
    if (phone.present) {
      map['phone'] = Variable<String>(phone.value);
    }
    if (email.present) {
      map['email'] = Variable<String>(email.value);
    }
    if (birthDate.present) {
      map['birth_date'] = Variable<DateTime>(birthDate.value);
    }
    if (gender.present) {
      map['gender'] = Variable<String>(gender.value);
    }
    if (bloodType.present) {
      map['blood_type'] = Variable<String>(bloodType.value);
    }
    if (regency.present) {
      map['regency'] = Variable<String>(regency.value);
    }
    if (district.present) {
      map['district'] = Variable<String>(district.value);
    }
    if (village.present) {
      map['village'] = Variable<String>(village.value);
    }
    if (detailAddress.present) {
      map['detail_address'] = Variable<String>(detailAddress.value);
    }
    if (latitude.present) {
      map['latitude'] = Variable<double>(latitude.value);
    }
    if (longitude.present) {
      map['longitude'] = Variable<double>(longitude.value);
    }
    if (medicalHistory.present) {
      map['medical_history'] = Variable<String>(medicalHistory.value);
    }
    if (expertise.present) {
      map['expertise'] = Variable<String>(expertise.value);
    }
    if (experience.present) {
      map['experience'] = Variable<String>(experience.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (cachedAt.present) {
      map['cached_at'] = Variable<DateTime>(cachedAt.value);
    }
    if (ttlSeconds.present) {
      map['ttl_seconds'] = Variable<int>(ttlSeconds.value);
    }
    if (syncVersion.present) {
      map['sync_version'] = Variable<int>(syncVersion.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('VolunteersCompanion(')
          ..write('id: $id, ')
          ..write('userId: $userId, ')
          ..write('fullName: $fullName, ')
          ..write('phone: $phone, ')
          ..write('email: $email, ')
          ..write('birthDate: $birthDate, ')
          ..write('gender: $gender, ')
          ..write('bloodType: $bloodType, ')
          ..write('regency: $regency, ')
          ..write('district: $district, ')
          ..write('village: $village, ')
          ..write('detailAddress: $detailAddress, ')
          ..write('latitude: $latitude, ')
          ..write('longitude: $longitude, ')
          ..write('medicalHistory: $medicalHistory, ')
          ..write('expertise: $expertise, ')
          ..write('experience: $experience, ')
          ..write('status: $status, ')
          ..write('cachedAt: $cachedAt, ')
          ..write('ttlSeconds: $ttlSeconds, ')
          ..write('syncVersion: $syncVersion, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $SheltersTable extends Shelters with TableInfo<$SheltersTable, Shelter> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SheltersTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _incidentIdMeta =
      const VerificationMeta('incidentId');
  @override
  late final GeneratedColumn<int> incidentId = GeneratedColumn<int>(
      'incident_id', aliasedName, true,
      type: DriftSqlType.int, requiredDuringInsert: false);
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
      'name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _regionMeta = const VerificationMeta('region');
  @override
  late final GeneratedColumn<String> region = GeneratedColumn<String>(
      'region', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _addressMeta =
      const VerificationMeta('address');
  @override
  late final GeneratedColumn<String> address = GeneratedColumn<String>(
      'address', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _latitudeMeta =
      const VerificationMeta('latitude');
  @override
  late final GeneratedColumn<double> latitude = GeneratedColumn<double>(
      'latitude', aliasedName, true,
      type: DriftSqlType.double, requiredDuringInsert: false);
  static const VerificationMeta _longitudeMeta =
      const VerificationMeta('longitude');
  @override
  late final GeneratedColumn<double> longitude = GeneratedColumn<double>(
      'longitude', aliasedName, true,
      type: DriftSqlType.double, requiredDuringInsert: false);
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
      'status', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('AKTIF'));
  static const VerificationMeta _scoreMeta = const VerificationMeta('score');
  @override
  late final GeneratedColumn<int> score = GeneratedColumn<int>(
      'score', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(100));
  static const VerificationMeta _refugeeCountMeta =
      const VerificationMeta('refugeeCount');
  @override
  late final GeneratedColumn<int> refugeeCount = GeneratedColumn<int>(
      'refugee_count', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(0));
  static const VerificationMeta _stockStatusMeta =
      const VerificationMeta('stockStatus');
  @override
  late final GeneratedColumn<String> stockStatus = GeneratedColumn<String>(
      'stock_status', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('AMAN'));
  static const VerificationMeta _contactPersonMeta =
      const VerificationMeta('contactPerson');
  @override
  late final GeneratedColumn<String> contactPerson = GeneratedColumn<String>(
      'contact_person', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _contactPhoneMeta =
      const VerificationMeta('contactPhone');
  @override
  late final GeneratedColumn<String> contactPhone = GeneratedColumn<String>(
      'contact_phone', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _cachedAtMeta =
      const VerificationMeta('cachedAt');
  @override
  late final GeneratedColumn<DateTime> cachedAt = GeneratedColumn<DateTime>(
      'cached_at', aliasedName, true,
      type: DriftSqlType.dateTime, requiredDuringInsert: false);
  static const VerificationMeta _ttlSecondsMeta =
      const VerificationMeta('ttlSeconds');
  @override
  late final GeneratedColumn<int> ttlSeconds = GeneratedColumn<int>(
      'ttl_seconds', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(600));
  static const VerificationMeta _syncVersionMeta =
      const VerificationMeta('syncVersion');
  @override
  late final GeneratedColumn<int> syncVersion = GeneratedColumn<int>(
      'sync_version', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(1));
  @override
  List<GeneratedColumn> get $columns => [
        id,
        incidentId,
        name,
        region,
        address,
        latitude,
        longitude,
        status,
        score,
        refugeeCount,
        stockStatus,
        contactPerson,
        contactPhone,
        cachedAt,
        ttlSeconds,
        syncVersion
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'shelters';
  @override
  VerificationContext validateIntegrity(Insertable<Shelter> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('incident_id')) {
      context.handle(
          _incidentIdMeta,
          incidentId.isAcceptableOrUnknown(
              data['incident_id']!, _incidentIdMeta));
    }
    if (data.containsKey('name')) {
      context.handle(
          _nameMeta, name.isAcceptableOrUnknown(data['name']!, _nameMeta));
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('region')) {
      context.handle(_regionMeta,
          region.isAcceptableOrUnknown(data['region']!, _regionMeta));
    }
    if (data.containsKey('address')) {
      context.handle(_addressMeta,
          address.isAcceptableOrUnknown(data['address']!, _addressMeta));
    }
    if (data.containsKey('latitude')) {
      context.handle(_latitudeMeta,
          latitude.isAcceptableOrUnknown(data['latitude']!, _latitudeMeta));
    }
    if (data.containsKey('longitude')) {
      context.handle(_longitudeMeta,
          longitude.isAcceptableOrUnknown(data['longitude']!, _longitudeMeta));
    }
    if (data.containsKey('status')) {
      context.handle(_statusMeta,
          status.isAcceptableOrUnknown(data['status']!, _statusMeta));
    }
    if (data.containsKey('score')) {
      context.handle(
          _scoreMeta, score.isAcceptableOrUnknown(data['score']!, _scoreMeta));
    }
    if (data.containsKey('refugee_count')) {
      context.handle(
          _refugeeCountMeta,
          refugeeCount.isAcceptableOrUnknown(
              data['refugee_count']!, _refugeeCountMeta));
    }
    if (data.containsKey('stock_status')) {
      context.handle(
          _stockStatusMeta,
          stockStatus.isAcceptableOrUnknown(
              data['stock_status']!, _stockStatusMeta));
    }
    if (data.containsKey('contact_person')) {
      context.handle(
          _contactPersonMeta,
          contactPerson.isAcceptableOrUnknown(
              data['contact_person']!, _contactPersonMeta));
    }
    if (data.containsKey('contact_phone')) {
      context.handle(
          _contactPhoneMeta,
          contactPhone.isAcceptableOrUnknown(
              data['contact_phone']!, _contactPhoneMeta));
    }
    if (data.containsKey('cached_at')) {
      context.handle(_cachedAtMeta,
          cachedAt.isAcceptableOrUnknown(data['cached_at']!, _cachedAtMeta));
    }
    if (data.containsKey('ttl_seconds')) {
      context.handle(
          _ttlSecondsMeta,
          ttlSeconds.isAcceptableOrUnknown(
              data['ttl_seconds']!, _ttlSecondsMeta));
    }
    if (data.containsKey('sync_version')) {
      context.handle(
          _syncVersionMeta,
          syncVersion.isAcceptableOrUnknown(
              data['sync_version']!, _syncVersionMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => const {};
  @override
  Shelter map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Shelter(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      incidentId: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}incident_id']),
      name: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}name'])!,
      region: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}region']),
      address: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}address']),
      latitude: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}latitude']),
      longitude: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}longitude']),
      status: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}status'])!,
      score: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}score'])!,
      refugeeCount: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}refugee_count'])!,
      stockStatus: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}stock_status'])!,
      contactPerson: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}contact_person']),
      contactPhone: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}contact_phone']),
      cachedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}cached_at']),
      ttlSeconds: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}ttl_seconds'])!,
      syncVersion: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}sync_version'])!,
    );
  }

  @override
  $SheltersTable createAlias(String alias) {
    return $SheltersTable(attachedDatabase, alias);
  }
}

class Shelter extends DataClass implements Insertable<Shelter> {
  final int id;
  final int? incidentId;
  final String name;
  final String? region;
  final String? address;
  final double? latitude;
  final double? longitude;
  final String status;
  final int score;
  final int refugeeCount;
  final String stockStatus;
  final String? contactPerson;
  final String? contactPhone;
  final DateTime? cachedAt;
  final int ttlSeconds;
  final int syncVersion;
  const Shelter(
      {required this.id,
      this.incidentId,
      required this.name,
      this.region,
      this.address,
      this.latitude,
      this.longitude,
      required this.status,
      required this.score,
      required this.refugeeCount,
      required this.stockStatus,
      this.contactPerson,
      this.contactPhone,
      this.cachedAt,
      required this.ttlSeconds,
      required this.syncVersion});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    if (!nullToAbsent || incidentId != null) {
      map['incident_id'] = Variable<int>(incidentId);
    }
    map['name'] = Variable<String>(name);
    if (!nullToAbsent || region != null) {
      map['region'] = Variable<String>(region);
    }
    if (!nullToAbsent || address != null) {
      map['address'] = Variable<String>(address);
    }
    if (!nullToAbsent || latitude != null) {
      map['latitude'] = Variable<double>(latitude);
    }
    if (!nullToAbsent || longitude != null) {
      map['longitude'] = Variable<double>(longitude);
    }
    map['status'] = Variable<String>(status);
    map['score'] = Variable<int>(score);
    map['refugee_count'] = Variable<int>(refugeeCount);
    map['stock_status'] = Variable<String>(stockStatus);
    if (!nullToAbsent || contactPerson != null) {
      map['contact_person'] = Variable<String>(contactPerson);
    }
    if (!nullToAbsent || contactPhone != null) {
      map['contact_phone'] = Variable<String>(contactPhone);
    }
    if (!nullToAbsent || cachedAt != null) {
      map['cached_at'] = Variable<DateTime>(cachedAt);
    }
    map['ttl_seconds'] = Variable<int>(ttlSeconds);
    map['sync_version'] = Variable<int>(syncVersion);
    return map;
  }

  SheltersCompanion toCompanion(bool nullToAbsent) {
    return SheltersCompanion(
      id: Value(id),
      incidentId: incidentId == null && nullToAbsent
          ? const Value.absent()
          : Value(incidentId),
      name: Value(name),
      region:
          region == null && nullToAbsent ? const Value.absent() : Value(region),
      address: address == null && nullToAbsent
          ? const Value.absent()
          : Value(address),
      latitude: latitude == null && nullToAbsent
          ? const Value.absent()
          : Value(latitude),
      longitude: longitude == null && nullToAbsent
          ? const Value.absent()
          : Value(longitude),
      status: Value(status),
      score: Value(score),
      refugeeCount: Value(refugeeCount),
      stockStatus: Value(stockStatus),
      contactPerson: contactPerson == null && nullToAbsent
          ? const Value.absent()
          : Value(contactPerson),
      contactPhone: contactPhone == null && nullToAbsent
          ? const Value.absent()
          : Value(contactPhone),
      cachedAt: cachedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(cachedAt),
      ttlSeconds: Value(ttlSeconds),
      syncVersion: Value(syncVersion),
    );
  }

  factory Shelter.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Shelter(
      id: serializer.fromJson<int>(json['id']),
      incidentId: serializer.fromJson<int?>(json['incidentId']),
      name: serializer.fromJson<String>(json['name']),
      region: serializer.fromJson<String?>(json['region']),
      address: serializer.fromJson<String?>(json['address']),
      latitude: serializer.fromJson<double?>(json['latitude']),
      longitude: serializer.fromJson<double?>(json['longitude']),
      status: serializer.fromJson<String>(json['status']),
      score: serializer.fromJson<int>(json['score']),
      refugeeCount: serializer.fromJson<int>(json['refugeeCount']),
      stockStatus: serializer.fromJson<String>(json['stockStatus']),
      contactPerson: serializer.fromJson<String?>(json['contactPerson']),
      contactPhone: serializer.fromJson<String?>(json['contactPhone']),
      cachedAt: serializer.fromJson<DateTime?>(json['cachedAt']),
      ttlSeconds: serializer.fromJson<int>(json['ttlSeconds']),
      syncVersion: serializer.fromJson<int>(json['syncVersion']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'incidentId': serializer.toJson<int?>(incidentId),
      'name': serializer.toJson<String>(name),
      'region': serializer.toJson<String?>(region),
      'address': serializer.toJson<String?>(address),
      'latitude': serializer.toJson<double?>(latitude),
      'longitude': serializer.toJson<double?>(longitude),
      'status': serializer.toJson<String>(status),
      'score': serializer.toJson<int>(score),
      'refugeeCount': serializer.toJson<int>(refugeeCount),
      'stockStatus': serializer.toJson<String>(stockStatus),
      'contactPerson': serializer.toJson<String?>(contactPerson),
      'contactPhone': serializer.toJson<String?>(contactPhone),
      'cachedAt': serializer.toJson<DateTime?>(cachedAt),
      'ttlSeconds': serializer.toJson<int>(ttlSeconds),
      'syncVersion': serializer.toJson<int>(syncVersion),
    };
  }

  Shelter copyWith(
          {int? id,
          Value<int?> incidentId = const Value.absent(),
          String? name,
          Value<String?> region = const Value.absent(),
          Value<String?> address = const Value.absent(),
          Value<double?> latitude = const Value.absent(),
          Value<double?> longitude = const Value.absent(),
          String? status,
          int? score,
          int? refugeeCount,
          String? stockStatus,
          Value<String?> contactPerson = const Value.absent(),
          Value<String?> contactPhone = const Value.absent(),
          Value<DateTime?> cachedAt = const Value.absent(),
          int? ttlSeconds,
          int? syncVersion}) =>
      Shelter(
        id: id ?? this.id,
        incidentId: incidentId.present ? incidentId.value : this.incidentId,
        name: name ?? this.name,
        region: region.present ? region.value : this.region,
        address: address.present ? address.value : this.address,
        latitude: latitude.present ? latitude.value : this.latitude,
        longitude: longitude.present ? longitude.value : this.longitude,
        status: status ?? this.status,
        score: score ?? this.score,
        refugeeCount: refugeeCount ?? this.refugeeCount,
        stockStatus: stockStatus ?? this.stockStatus,
        contactPerson:
            contactPerson.present ? contactPerson.value : this.contactPerson,
        contactPhone:
            contactPhone.present ? contactPhone.value : this.contactPhone,
        cachedAt: cachedAt.present ? cachedAt.value : this.cachedAt,
        ttlSeconds: ttlSeconds ?? this.ttlSeconds,
        syncVersion: syncVersion ?? this.syncVersion,
      );
  Shelter copyWithCompanion(SheltersCompanion data) {
    return Shelter(
      id: data.id.present ? data.id.value : this.id,
      incidentId:
          data.incidentId.present ? data.incidentId.value : this.incidentId,
      name: data.name.present ? data.name.value : this.name,
      region: data.region.present ? data.region.value : this.region,
      address: data.address.present ? data.address.value : this.address,
      latitude: data.latitude.present ? data.latitude.value : this.latitude,
      longitude: data.longitude.present ? data.longitude.value : this.longitude,
      status: data.status.present ? data.status.value : this.status,
      score: data.score.present ? data.score.value : this.score,
      refugeeCount: data.refugeeCount.present
          ? data.refugeeCount.value
          : this.refugeeCount,
      stockStatus:
          data.stockStatus.present ? data.stockStatus.value : this.stockStatus,
      contactPerson: data.contactPerson.present
          ? data.contactPerson.value
          : this.contactPerson,
      contactPhone: data.contactPhone.present
          ? data.contactPhone.value
          : this.contactPhone,
      cachedAt: data.cachedAt.present ? data.cachedAt.value : this.cachedAt,
      ttlSeconds:
          data.ttlSeconds.present ? data.ttlSeconds.value : this.ttlSeconds,
      syncVersion:
          data.syncVersion.present ? data.syncVersion.value : this.syncVersion,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Shelter(')
          ..write('id: $id, ')
          ..write('incidentId: $incidentId, ')
          ..write('name: $name, ')
          ..write('region: $region, ')
          ..write('address: $address, ')
          ..write('latitude: $latitude, ')
          ..write('longitude: $longitude, ')
          ..write('status: $status, ')
          ..write('score: $score, ')
          ..write('refugeeCount: $refugeeCount, ')
          ..write('stockStatus: $stockStatus, ')
          ..write('contactPerson: $contactPerson, ')
          ..write('contactPhone: $contactPhone, ')
          ..write('cachedAt: $cachedAt, ')
          ..write('ttlSeconds: $ttlSeconds, ')
          ..write('syncVersion: $syncVersion')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      id,
      incidentId,
      name,
      region,
      address,
      latitude,
      longitude,
      status,
      score,
      refugeeCount,
      stockStatus,
      contactPerson,
      contactPhone,
      cachedAt,
      ttlSeconds,
      syncVersion);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Shelter &&
          other.id == this.id &&
          other.incidentId == this.incidentId &&
          other.name == this.name &&
          other.region == this.region &&
          other.address == this.address &&
          other.latitude == this.latitude &&
          other.longitude == this.longitude &&
          other.status == this.status &&
          other.score == this.score &&
          other.refugeeCount == this.refugeeCount &&
          other.stockStatus == this.stockStatus &&
          other.contactPerson == this.contactPerson &&
          other.contactPhone == this.contactPhone &&
          other.cachedAt == this.cachedAt &&
          other.ttlSeconds == this.ttlSeconds &&
          other.syncVersion == this.syncVersion);
}

class SheltersCompanion extends UpdateCompanion<Shelter> {
  final Value<int> id;
  final Value<int?> incidentId;
  final Value<String> name;
  final Value<String?> region;
  final Value<String?> address;
  final Value<double?> latitude;
  final Value<double?> longitude;
  final Value<String> status;
  final Value<int> score;
  final Value<int> refugeeCount;
  final Value<String> stockStatus;
  final Value<String?> contactPerson;
  final Value<String?> contactPhone;
  final Value<DateTime?> cachedAt;
  final Value<int> ttlSeconds;
  final Value<int> syncVersion;
  final Value<int> rowid;
  const SheltersCompanion({
    this.id = const Value.absent(),
    this.incidentId = const Value.absent(),
    this.name = const Value.absent(),
    this.region = const Value.absent(),
    this.address = const Value.absent(),
    this.latitude = const Value.absent(),
    this.longitude = const Value.absent(),
    this.status = const Value.absent(),
    this.score = const Value.absent(),
    this.refugeeCount = const Value.absent(),
    this.stockStatus = const Value.absent(),
    this.contactPerson = const Value.absent(),
    this.contactPhone = const Value.absent(),
    this.cachedAt = const Value.absent(),
    this.ttlSeconds = const Value.absent(),
    this.syncVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  SheltersCompanion.insert({
    required int id,
    this.incidentId = const Value.absent(),
    required String name,
    this.region = const Value.absent(),
    this.address = const Value.absent(),
    this.latitude = const Value.absent(),
    this.longitude = const Value.absent(),
    this.status = const Value.absent(),
    this.score = const Value.absent(),
    this.refugeeCount = const Value.absent(),
    this.stockStatus = const Value.absent(),
    this.contactPerson = const Value.absent(),
    this.contactPhone = const Value.absent(),
    this.cachedAt = const Value.absent(),
    this.ttlSeconds = const Value.absent(),
    this.syncVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        name = Value(name);
  static Insertable<Shelter> custom({
    Expression<int>? id,
    Expression<int>? incidentId,
    Expression<String>? name,
    Expression<String>? region,
    Expression<String>? address,
    Expression<double>? latitude,
    Expression<double>? longitude,
    Expression<String>? status,
    Expression<int>? score,
    Expression<int>? refugeeCount,
    Expression<String>? stockStatus,
    Expression<String>? contactPerson,
    Expression<String>? contactPhone,
    Expression<DateTime>? cachedAt,
    Expression<int>? ttlSeconds,
    Expression<int>? syncVersion,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (incidentId != null) 'incident_id': incidentId,
      if (name != null) 'name': name,
      if (region != null) 'region': region,
      if (address != null) 'address': address,
      if (latitude != null) 'latitude': latitude,
      if (longitude != null) 'longitude': longitude,
      if (status != null) 'status': status,
      if (score != null) 'score': score,
      if (refugeeCount != null) 'refugee_count': refugeeCount,
      if (stockStatus != null) 'stock_status': stockStatus,
      if (contactPerson != null) 'contact_person': contactPerson,
      if (contactPhone != null) 'contact_phone': contactPhone,
      if (cachedAt != null) 'cached_at': cachedAt,
      if (ttlSeconds != null) 'ttl_seconds': ttlSeconds,
      if (syncVersion != null) 'sync_version': syncVersion,
      if (rowid != null) 'rowid': rowid,
    });
  }

  SheltersCompanion copyWith(
      {Value<int>? id,
      Value<int?>? incidentId,
      Value<String>? name,
      Value<String?>? region,
      Value<String?>? address,
      Value<double?>? latitude,
      Value<double?>? longitude,
      Value<String>? status,
      Value<int>? score,
      Value<int>? refugeeCount,
      Value<String>? stockStatus,
      Value<String?>? contactPerson,
      Value<String?>? contactPhone,
      Value<DateTime?>? cachedAt,
      Value<int>? ttlSeconds,
      Value<int>? syncVersion,
      Value<int>? rowid}) {
    return SheltersCompanion(
      id: id ?? this.id,
      incidentId: incidentId ?? this.incidentId,
      name: name ?? this.name,
      region: region ?? this.region,
      address: address ?? this.address,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      status: status ?? this.status,
      score: score ?? this.score,
      refugeeCount: refugeeCount ?? this.refugeeCount,
      stockStatus: stockStatus ?? this.stockStatus,
      contactPerson: contactPerson ?? this.contactPerson,
      contactPhone: contactPhone ?? this.contactPhone,
      cachedAt: cachedAt ?? this.cachedAt,
      ttlSeconds: ttlSeconds ?? this.ttlSeconds,
      syncVersion: syncVersion ?? this.syncVersion,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (incidentId.present) {
      map['incident_id'] = Variable<int>(incidentId.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (region.present) {
      map['region'] = Variable<String>(region.value);
    }
    if (address.present) {
      map['address'] = Variable<String>(address.value);
    }
    if (latitude.present) {
      map['latitude'] = Variable<double>(latitude.value);
    }
    if (longitude.present) {
      map['longitude'] = Variable<double>(longitude.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (score.present) {
      map['score'] = Variable<int>(score.value);
    }
    if (refugeeCount.present) {
      map['refugee_count'] = Variable<int>(refugeeCount.value);
    }
    if (stockStatus.present) {
      map['stock_status'] = Variable<String>(stockStatus.value);
    }
    if (contactPerson.present) {
      map['contact_person'] = Variable<String>(contactPerson.value);
    }
    if (contactPhone.present) {
      map['contact_phone'] = Variable<String>(contactPhone.value);
    }
    if (cachedAt.present) {
      map['cached_at'] = Variable<DateTime>(cachedAt.value);
    }
    if (ttlSeconds.present) {
      map['ttl_seconds'] = Variable<int>(ttlSeconds.value);
    }
    if (syncVersion.present) {
      map['sync_version'] = Variable<int>(syncVersion.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('SheltersCompanion(')
          ..write('id: $id, ')
          ..write('incidentId: $incidentId, ')
          ..write('name: $name, ')
          ..write('region: $region, ')
          ..write('address: $address, ')
          ..write('latitude: $latitude, ')
          ..write('longitude: $longitude, ')
          ..write('status: $status, ')
          ..write('score: $score, ')
          ..write('refugeeCount: $refugeeCount, ')
          ..write('stockStatus: $stockStatus, ')
          ..write('contactPerson: $contactPerson, ')
          ..write('contactPhone: $contactPhone, ')
          ..write('cachedAt: $cachedAt, ')
          ..write('ttlSeconds: $ttlSeconds, ')
          ..write('syncVersion: $syncVersion, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $PendingChangesTable extends PendingChanges
    with TableInfo<$PendingChangesTable, PendingChange> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $PendingChangesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _entityTypeMeta =
      const VerificationMeta('entityType');
  @override
  late final GeneratedColumn<String> entityType = GeneratedColumn<String>(
      'entity_type', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _entityIdMeta =
      const VerificationMeta('entityId');
  @override
  late final GeneratedColumn<int> entityId = GeneratedColumn<int>(
      'entity_id', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _operationMeta =
      const VerificationMeta('operation');
  @override
  late final GeneratedColumn<String> operation = GeneratedColumn<String>(
      'operation', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _payloadMeta =
      const VerificationMeta('payload');
  @override
  late final GeneratedColumn<String> payload = GeneratedColumn<String>(
      'payload', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _retryCountMeta =
      const VerificationMeta('retryCount');
  @override
  late final GeneratedColumn<int> retryCount = GeneratedColumn<int>(
      'retry_count', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(0));
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, true,
      type: DriftSqlType.dateTime, requiredDuringInsert: false);
  static const VerificationMeta _errorMessageMeta =
      const VerificationMeta('errorMessage');
  @override
  late final GeneratedColumn<String> errorMessage = GeneratedColumn<String>(
      'error_message', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        entityType,
        entityId,
        operation,
        payload,
        retryCount,
        createdAt,
        errorMessage
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'pending_changes';
  @override
  VerificationContext validateIntegrity(Insertable<PendingChange> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('entity_type')) {
      context.handle(
          _entityTypeMeta,
          entityType.isAcceptableOrUnknown(
              data['entity_type']!, _entityTypeMeta));
    } else if (isInserting) {
      context.missing(_entityTypeMeta);
    }
    if (data.containsKey('entity_id')) {
      context.handle(_entityIdMeta,
          entityId.isAcceptableOrUnknown(data['entity_id']!, _entityIdMeta));
    } else if (isInserting) {
      context.missing(_entityIdMeta);
    }
    if (data.containsKey('operation')) {
      context.handle(_operationMeta,
          operation.isAcceptableOrUnknown(data['operation']!, _operationMeta));
    } else if (isInserting) {
      context.missing(_operationMeta);
    }
    if (data.containsKey('payload')) {
      context.handle(_payloadMeta,
          payload.isAcceptableOrUnknown(data['payload']!, _payloadMeta));
    } else if (isInserting) {
      context.missing(_payloadMeta);
    }
    if (data.containsKey('retry_count')) {
      context.handle(
          _retryCountMeta,
          retryCount.isAcceptableOrUnknown(
              data['retry_count']!, _retryCountMeta));
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    }
    if (data.containsKey('error_message')) {
      context.handle(
          _errorMessageMeta,
          errorMessage.isAcceptableOrUnknown(
              data['error_message']!, _errorMessageMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  PendingChange map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return PendingChange(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      entityType: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}entity_type'])!,
      entityId: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}entity_id'])!,
      operation: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}operation'])!,
      payload: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}payload'])!,
      retryCount: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}retry_count'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at']),
      errorMessage: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}error_message']),
    );
  }

  @override
  $PendingChangesTable createAlias(String alias) {
    return $PendingChangesTable(attachedDatabase, alias);
  }
}

class PendingChange extends DataClass implements Insertable<PendingChange> {
  final int id;
  final String entityType;
  final int entityId;
  final String operation;
  final String payload;
  final int retryCount;
  final DateTime? createdAt;
  final String? errorMessage;
  const PendingChange(
      {required this.id,
      required this.entityType,
      required this.entityId,
      required this.operation,
      required this.payload,
      required this.retryCount,
      this.createdAt,
      this.errorMessage});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['entity_type'] = Variable<String>(entityType);
    map['entity_id'] = Variable<int>(entityId);
    map['operation'] = Variable<String>(operation);
    map['payload'] = Variable<String>(payload);
    map['retry_count'] = Variable<int>(retryCount);
    if (!nullToAbsent || createdAt != null) {
      map['created_at'] = Variable<DateTime>(createdAt);
    }
    if (!nullToAbsent || errorMessage != null) {
      map['error_message'] = Variable<String>(errorMessage);
    }
    return map;
  }

  PendingChangesCompanion toCompanion(bool nullToAbsent) {
    return PendingChangesCompanion(
      id: Value(id),
      entityType: Value(entityType),
      entityId: Value(entityId),
      operation: Value(operation),
      payload: Value(payload),
      retryCount: Value(retryCount),
      createdAt: createdAt == null && nullToAbsent
          ? const Value.absent()
          : Value(createdAt),
      errorMessage: errorMessage == null && nullToAbsent
          ? const Value.absent()
          : Value(errorMessage),
    );
  }

  factory PendingChange.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return PendingChange(
      id: serializer.fromJson<int>(json['id']),
      entityType: serializer.fromJson<String>(json['entityType']),
      entityId: serializer.fromJson<int>(json['entityId']),
      operation: serializer.fromJson<String>(json['operation']),
      payload: serializer.fromJson<String>(json['payload']),
      retryCount: serializer.fromJson<int>(json['retryCount']),
      createdAt: serializer.fromJson<DateTime?>(json['createdAt']),
      errorMessage: serializer.fromJson<String?>(json['errorMessage']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'entityType': serializer.toJson<String>(entityType),
      'entityId': serializer.toJson<int>(entityId),
      'operation': serializer.toJson<String>(operation),
      'payload': serializer.toJson<String>(payload),
      'retryCount': serializer.toJson<int>(retryCount),
      'createdAt': serializer.toJson<DateTime?>(createdAt),
      'errorMessage': serializer.toJson<String?>(errorMessage),
    };
  }

  PendingChange copyWith(
          {int? id,
          String? entityType,
          int? entityId,
          String? operation,
          String? payload,
          int? retryCount,
          Value<DateTime?> createdAt = const Value.absent(),
          Value<String?> errorMessage = const Value.absent()}) =>
      PendingChange(
        id: id ?? this.id,
        entityType: entityType ?? this.entityType,
        entityId: entityId ?? this.entityId,
        operation: operation ?? this.operation,
        payload: payload ?? this.payload,
        retryCount: retryCount ?? this.retryCount,
        createdAt: createdAt.present ? createdAt.value : this.createdAt,
        errorMessage:
            errorMessage.present ? errorMessage.value : this.errorMessage,
      );
  PendingChange copyWithCompanion(PendingChangesCompanion data) {
    return PendingChange(
      id: data.id.present ? data.id.value : this.id,
      entityType:
          data.entityType.present ? data.entityType.value : this.entityType,
      entityId: data.entityId.present ? data.entityId.value : this.entityId,
      operation: data.operation.present ? data.operation.value : this.operation,
      payload: data.payload.present ? data.payload.value : this.payload,
      retryCount:
          data.retryCount.present ? data.retryCount.value : this.retryCount,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      errorMessage: data.errorMessage.present
          ? data.errorMessage.value
          : this.errorMessage,
    );
  }

  @override
  String toString() {
    return (StringBuffer('PendingChange(')
          ..write('id: $id, ')
          ..write('entityType: $entityType, ')
          ..write('entityId: $entityId, ')
          ..write('operation: $operation, ')
          ..write('payload: $payload, ')
          ..write('retryCount: $retryCount, ')
          ..write('createdAt: $createdAt, ')
          ..write('errorMessage: $errorMessage')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, entityType, entityId, operation, payload,
      retryCount, createdAt, errorMessage);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is PendingChange &&
          other.id == this.id &&
          other.entityType == this.entityType &&
          other.entityId == this.entityId &&
          other.operation == this.operation &&
          other.payload == this.payload &&
          other.retryCount == this.retryCount &&
          other.createdAt == this.createdAt &&
          other.errorMessage == this.errorMessage);
}

class PendingChangesCompanion extends UpdateCompanion<PendingChange> {
  final Value<int> id;
  final Value<String> entityType;
  final Value<int> entityId;
  final Value<String> operation;
  final Value<String> payload;
  final Value<int> retryCount;
  final Value<DateTime?> createdAt;
  final Value<String?> errorMessage;
  const PendingChangesCompanion({
    this.id = const Value.absent(),
    this.entityType = const Value.absent(),
    this.entityId = const Value.absent(),
    this.operation = const Value.absent(),
    this.payload = const Value.absent(),
    this.retryCount = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.errorMessage = const Value.absent(),
  });
  PendingChangesCompanion.insert({
    this.id = const Value.absent(),
    required String entityType,
    required int entityId,
    required String operation,
    required String payload,
    this.retryCount = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.errorMessage = const Value.absent(),
  })  : entityType = Value(entityType),
        entityId = Value(entityId),
        operation = Value(operation),
        payload = Value(payload);
  static Insertable<PendingChange> custom({
    Expression<int>? id,
    Expression<String>? entityType,
    Expression<int>? entityId,
    Expression<String>? operation,
    Expression<String>? payload,
    Expression<int>? retryCount,
    Expression<DateTime>? createdAt,
    Expression<String>? errorMessage,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (entityType != null) 'entity_type': entityType,
      if (entityId != null) 'entity_id': entityId,
      if (operation != null) 'operation': operation,
      if (payload != null) 'payload': payload,
      if (retryCount != null) 'retry_count': retryCount,
      if (createdAt != null) 'created_at': createdAt,
      if (errorMessage != null) 'error_message': errorMessage,
    });
  }

  PendingChangesCompanion copyWith(
      {Value<int>? id,
      Value<String>? entityType,
      Value<int>? entityId,
      Value<String>? operation,
      Value<String>? payload,
      Value<int>? retryCount,
      Value<DateTime?>? createdAt,
      Value<String?>? errorMessage}) {
    return PendingChangesCompanion(
      id: id ?? this.id,
      entityType: entityType ?? this.entityType,
      entityId: entityId ?? this.entityId,
      operation: operation ?? this.operation,
      payload: payload ?? this.payload,
      retryCount: retryCount ?? this.retryCount,
      createdAt: createdAt ?? this.createdAt,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (entityType.present) {
      map['entity_type'] = Variable<String>(entityType.value);
    }
    if (entityId.present) {
      map['entity_id'] = Variable<int>(entityId.value);
    }
    if (operation.present) {
      map['operation'] = Variable<String>(operation.value);
    }
    if (payload.present) {
      map['payload'] = Variable<String>(payload.value);
    }
    if (retryCount.present) {
      map['retry_count'] = Variable<int>(retryCount.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (errorMessage.present) {
      map['error_message'] = Variable<String>(errorMessage.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('PendingChangesCompanion(')
          ..write('id: $id, ')
          ..write('entityType: $entityType, ')
          ..write('entityId: $entityId, ')
          ..write('operation: $operation, ')
          ..write('payload: $payload, ')
          ..write('retryCount: $retryCount, ')
          ..write('createdAt: $createdAt, ')
          ..write('errorMessage: $errorMessage')
          ..write(')'))
        .toString();
  }
}

class $HistoricalDisastersTable extends HistoricalDisasters
    with TableInfo<$HistoricalDisastersTable, HistoricalDisaster> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $HistoricalDisastersTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _regionMeta = const VerificationMeta('region');
  @override
  late final GeneratedColumn<String> region = GeneratedColumn<String>(
      'region', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _disasterTypeMeta =
      const VerificationMeta('disasterType');
  @override
  late final GeneratedColumn<String> disasterType = GeneratedColumn<String>(
      'disaster_type', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _eventDateMeta =
      const VerificationMeta('eventDate');
  @override
  late final GeneratedColumn<DateTime> eventDate = GeneratedColumn<DateTime>(
      'event_date', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  static const VerificationMeta _latitudeMeta =
      const VerificationMeta('latitude');
  @override
  late final GeneratedColumn<double> latitude = GeneratedColumn<double>(
      'latitude', aliasedName, true,
      type: DriftSqlType.double, requiredDuringInsert: false);
  static const VerificationMeta _longitudeMeta =
      const VerificationMeta('longitude');
  @override
  late final GeneratedColumn<double> longitude = GeneratedColumn<double>(
      'longitude', aliasedName, true,
      type: DriftSqlType.double, requiredDuringInsert: false);
  static const VerificationMeta _timeMeta = const VerificationMeta('time');
  @override
  late final GeneratedColumn<String> time = GeneratedColumn<String>(
      'time', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _cachedAtMeta =
      const VerificationMeta('cachedAt');
  @override
  late final GeneratedColumn<DateTime> cachedAt = GeneratedColumn<DateTime>(
      'cached_at', aliasedName, true,
      type: DriftSqlType.dateTime, requiredDuringInsert: false);
  static const VerificationMeta _ttlSecondsMeta =
      const VerificationMeta('ttlSeconds');
  @override
  late final GeneratedColumn<int> ttlSeconds = GeneratedColumn<int>(
      'ttl_seconds', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(86400));
  static const VerificationMeta _syncVersionMeta =
      const VerificationMeta('syncVersion');
  @override
  late final GeneratedColumn<int> syncVersion = GeneratedColumn<int>(
      'sync_version', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(1));
  @override
  List<GeneratedColumn> get $columns => [
        id,
        region,
        disasterType,
        eventDate,
        latitude,
        longitude,
        time,
        cachedAt,
        ttlSeconds,
        syncVersion
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'historical_disasters';
  @override
  VerificationContext validateIntegrity(Insertable<HistoricalDisaster> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('region')) {
      context.handle(_regionMeta,
          region.isAcceptableOrUnknown(data['region']!, _regionMeta));
    } else if (isInserting) {
      context.missing(_regionMeta);
    }
    if (data.containsKey('disaster_type')) {
      context.handle(
          _disasterTypeMeta,
          disasterType.isAcceptableOrUnknown(
              data['disaster_type']!, _disasterTypeMeta));
    } else if (isInserting) {
      context.missing(_disasterTypeMeta);
    }
    if (data.containsKey('event_date')) {
      context.handle(_eventDateMeta,
          eventDate.isAcceptableOrUnknown(data['event_date']!, _eventDateMeta));
    } else if (isInserting) {
      context.missing(_eventDateMeta);
    }
    if (data.containsKey('latitude')) {
      context.handle(_latitudeMeta,
          latitude.isAcceptableOrUnknown(data['latitude']!, _latitudeMeta));
    }
    if (data.containsKey('longitude')) {
      context.handle(_longitudeMeta,
          longitude.isAcceptableOrUnknown(data['longitude']!, _longitudeMeta));
    }
    if (data.containsKey('time')) {
      context.handle(
          _timeMeta, time.isAcceptableOrUnknown(data['time']!, _timeMeta));
    }
    if (data.containsKey('cached_at')) {
      context.handle(_cachedAtMeta,
          cachedAt.isAcceptableOrUnknown(data['cached_at']!, _cachedAtMeta));
    }
    if (data.containsKey('ttl_seconds')) {
      context.handle(
          _ttlSecondsMeta,
          ttlSeconds.isAcceptableOrUnknown(
              data['ttl_seconds']!, _ttlSecondsMeta));
    }
    if (data.containsKey('sync_version')) {
      context.handle(
          _syncVersionMeta,
          syncVersion.isAcceptableOrUnknown(
              data['sync_version']!, _syncVersionMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => const {};
  @override
  HistoricalDisaster map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return HistoricalDisaster(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      region: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}region'])!,
      disasterType: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}disaster_type'])!,
      eventDate: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}event_date'])!,
      latitude: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}latitude']),
      longitude: attachedDatabase.typeMapping
          .read(DriftSqlType.double, data['${effectivePrefix}longitude']),
      time: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}time']),
      cachedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}cached_at']),
      ttlSeconds: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}ttl_seconds'])!,
      syncVersion: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}sync_version'])!,
    );
  }

  @override
  $HistoricalDisastersTable createAlias(String alias) {
    return $HistoricalDisastersTable(attachedDatabase, alias);
  }
}

class HistoricalDisaster extends DataClass
    implements Insertable<HistoricalDisaster> {
  final int id;
  final String region;
  final String disasterType;
  final DateTime eventDate;
  final double? latitude;
  final double? longitude;
  final String? time;
  final DateTime? cachedAt;
  final int ttlSeconds;
  final int syncVersion;
  const HistoricalDisaster(
      {required this.id,
      required this.region,
      required this.disasterType,
      required this.eventDate,
      this.latitude,
      this.longitude,
      this.time,
      this.cachedAt,
      required this.ttlSeconds,
      required this.syncVersion});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['region'] = Variable<String>(region);
    map['disaster_type'] = Variable<String>(disasterType);
    map['event_date'] = Variable<DateTime>(eventDate);
    if (!nullToAbsent || latitude != null) {
      map['latitude'] = Variable<double>(latitude);
    }
    if (!nullToAbsent || longitude != null) {
      map['longitude'] = Variable<double>(longitude);
    }
    if (!nullToAbsent || time != null) {
      map['time'] = Variable<String>(time);
    }
    if (!nullToAbsent || cachedAt != null) {
      map['cached_at'] = Variable<DateTime>(cachedAt);
    }
    map['ttl_seconds'] = Variable<int>(ttlSeconds);
    map['sync_version'] = Variable<int>(syncVersion);
    return map;
  }

  HistoricalDisastersCompanion toCompanion(bool nullToAbsent) {
    return HistoricalDisastersCompanion(
      id: Value(id),
      region: Value(region),
      disasterType: Value(disasterType),
      eventDate: Value(eventDate),
      latitude: latitude == null && nullToAbsent
          ? const Value.absent()
          : Value(latitude),
      longitude: longitude == null && nullToAbsent
          ? const Value.absent()
          : Value(longitude),
      time: time == null && nullToAbsent ? const Value.absent() : Value(time),
      cachedAt: cachedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(cachedAt),
      ttlSeconds: Value(ttlSeconds),
      syncVersion: Value(syncVersion),
    );
  }

  factory HistoricalDisaster.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return HistoricalDisaster(
      id: serializer.fromJson<int>(json['id']),
      region: serializer.fromJson<String>(json['region']),
      disasterType: serializer.fromJson<String>(json['disasterType']),
      eventDate: serializer.fromJson<DateTime>(json['eventDate']),
      latitude: serializer.fromJson<double?>(json['latitude']),
      longitude: serializer.fromJson<double?>(json['longitude']),
      time: serializer.fromJson<String?>(json['time']),
      cachedAt: serializer.fromJson<DateTime?>(json['cachedAt']),
      ttlSeconds: serializer.fromJson<int>(json['ttlSeconds']),
      syncVersion: serializer.fromJson<int>(json['syncVersion']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'region': serializer.toJson<String>(region),
      'disasterType': serializer.toJson<String>(disasterType),
      'eventDate': serializer.toJson<DateTime>(eventDate),
      'latitude': serializer.toJson<double?>(latitude),
      'longitude': serializer.toJson<double?>(longitude),
      'time': serializer.toJson<String?>(time),
      'cachedAt': serializer.toJson<DateTime?>(cachedAt),
      'ttlSeconds': serializer.toJson<int>(ttlSeconds),
      'syncVersion': serializer.toJson<int>(syncVersion),
    };
  }

  HistoricalDisaster copyWith(
          {int? id,
          String? region,
          String? disasterType,
          DateTime? eventDate,
          Value<double?> latitude = const Value.absent(),
          Value<double?> longitude = const Value.absent(),
          Value<String?> time = const Value.absent(),
          Value<DateTime?> cachedAt = const Value.absent(),
          int? ttlSeconds,
          int? syncVersion}) =>
      HistoricalDisaster(
        id: id ?? this.id,
        region: region ?? this.region,
        disasterType: disasterType ?? this.disasterType,
        eventDate: eventDate ?? this.eventDate,
        latitude: latitude.present ? latitude.value : this.latitude,
        longitude: longitude.present ? longitude.value : this.longitude,
        time: time.present ? time.value : this.time,
        cachedAt: cachedAt.present ? cachedAt.value : this.cachedAt,
        ttlSeconds: ttlSeconds ?? this.ttlSeconds,
        syncVersion: syncVersion ?? this.syncVersion,
      );
  HistoricalDisaster copyWithCompanion(HistoricalDisastersCompanion data) {
    return HistoricalDisaster(
      id: data.id.present ? data.id.value : this.id,
      region: data.region.present ? data.region.value : this.region,
      disasterType: data.disasterType.present
          ? data.disasterType.value
          : this.disasterType,
      eventDate: data.eventDate.present ? data.eventDate.value : this.eventDate,
      latitude: data.latitude.present ? data.latitude.value : this.latitude,
      longitude: data.longitude.present ? data.longitude.value : this.longitude,
      time: data.time.present ? data.time.value : this.time,
      cachedAt: data.cachedAt.present ? data.cachedAt.value : this.cachedAt,
      ttlSeconds:
          data.ttlSeconds.present ? data.ttlSeconds.value : this.ttlSeconds,
      syncVersion:
          data.syncVersion.present ? data.syncVersion.value : this.syncVersion,
    );
  }

  @override
  String toString() {
    return (StringBuffer('HistoricalDisaster(')
          ..write('id: $id, ')
          ..write('region: $region, ')
          ..write('disasterType: $disasterType, ')
          ..write('eventDate: $eventDate, ')
          ..write('latitude: $latitude, ')
          ..write('longitude: $longitude, ')
          ..write('time: $time, ')
          ..write('cachedAt: $cachedAt, ')
          ..write('ttlSeconds: $ttlSeconds, ')
          ..write('syncVersion: $syncVersion')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, region, disasterType, eventDate, latitude,
      longitude, time, cachedAt, ttlSeconds, syncVersion);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is HistoricalDisaster &&
          other.id == this.id &&
          other.region == this.region &&
          other.disasterType == this.disasterType &&
          other.eventDate == this.eventDate &&
          other.latitude == this.latitude &&
          other.longitude == this.longitude &&
          other.time == this.time &&
          other.cachedAt == this.cachedAt &&
          other.ttlSeconds == this.ttlSeconds &&
          other.syncVersion == this.syncVersion);
}

class HistoricalDisastersCompanion extends UpdateCompanion<HistoricalDisaster> {
  final Value<int> id;
  final Value<String> region;
  final Value<String> disasterType;
  final Value<DateTime> eventDate;
  final Value<double?> latitude;
  final Value<double?> longitude;
  final Value<String?> time;
  final Value<DateTime?> cachedAt;
  final Value<int> ttlSeconds;
  final Value<int> syncVersion;
  final Value<int> rowid;
  const HistoricalDisastersCompanion({
    this.id = const Value.absent(),
    this.region = const Value.absent(),
    this.disasterType = const Value.absent(),
    this.eventDate = const Value.absent(),
    this.latitude = const Value.absent(),
    this.longitude = const Value.absent(),
    this.time = const Value.absent(),
    this.cachedAt = const Value.absent(),
    this.ttlSeconds = const Value.absent(),
    this.syncVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  HistoricalDisastersCompanion.insert({
    required int id,
    required String region,
    required String disasterType,
    required DateTime eventDate,
    this.latitude = const Value.absent(),
    this.longitude = const Value.absent(),
    this.time = const Value.absent(),
    this.cachedAt = const Value.absent(),
    this.ttlSeconds = const Value.absent(),
    this.syncVersion = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        region = Value(region),
        disasterType = Value(disasterType),
        eventDate = Value(eventDate);
  static Insertable<HistoricalDisaster> custom({
    Expression<int>? id,
    Expression<String>? region,
    Expression<String>? disasterType,
    Expression<DateTime>? eventDate,
    Expression<double>? latitude,
    Expression<double>? longitude,
    Expression<String>? time,
    Expression<DateTime>? cachedAt,
    Expression<int>? ttlSeconds,
    Expression<int>? syncVersion,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (region != null) 'region': region,
      if (disasterType != null) 'disaster_type': disasterType,
      if (eventDate != null) 'event_date': eventDate,
      if (latitude != null) 'latitude': latitude,
      if (longitude != null) 'longitude': longitude,
      if (time != null) 'time': time,
      if (cachedAt != null) 'cached_at': cachedAt,
      if (ttlSeconds != null) 'ttl_seconds': ttlSeconds,
      if (syncVersion != null) 'sync_version': syncVersion,
      if (rowid != null) 'rowid': rowid,
    });
  }

  HistoricalDisastersCompanion copyWith(
      {Value<int>? id,
      Value<String>? region,
      Value<String>? disasterType,
      Value<DateTime>? eventDate,
      Value<double?>? latitude,
      Value<double?>? longitude,
      Value<String?>? time,
      Value<DateTime?>? cachedAt,
      Value<int>? ttlSeconds,
      Value<int>? syncVersion,
      Value<int>? rowid}) {
    return HistoricalDisastersCompanion(
      id: id ?? this.id,
      region: region ?? this.region,
      disasterType: disasterType ?? this.disasterType,
      eventDate: eventDate ?? this.eventDate,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      time: time ?? this.time,
      cachedAt: cachedAt ?? this.cachedAt,
      ttlSeconds: ttlSeconds ?? this.ttlSeconds,
      syncVersion: syncVersion ?? this.syncVersion,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (region.present) {
      map['region'] = Variable<String>(region.value);
    }
    if (disasterType.present) {
      map['disaster_type'] = Variable<String>(disasterType.value);
    }
    if (eventDate.present) {
      map['event_date'] = Variable<DateTime>(eventDate.value);
    }
    if (latitude.present) {
      map['latitude'] = Variable<double>(latitude.value);
    }
    if (longitude.present) {
      map['longitude'] = Variable<double>(longitude.value);
    }
    if (time.present) {
      map['time'] = Variable<String>(time.value);
    }
    if (cachedAt.present) {
      map['cached_at'] = Variable<DateTime>(cachedAt.value);
    }
    if (ttlSeconds.present) {
      map['ttl_seconds'] = Variable<int>(ttlSeconds.value);
    }
    if (syncVersion.present) {
      map['sync_version'] = Variable<int>(syncVersion.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('HistoricalDisastersCompanion(')
          ..write('id: $id, ')
          ..write('region: $region, ')
          ..write('disasterType: $disasterType, ')
          ..write('eventDate: $eventDate, ')
          ..write('latitude: $latitude, ')
          ..write('longitude: $longitude, ')
          ..write('time: $time, ')
          ..write('cachedAt: $cachedAt, ')
          ..write('ttlSeconds: $ttlSeconds, ')
          ..write('syncVersion: $syncVersion, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

abstract class _$AppDatabase extends GeneratedDatabase {
  _$AppDatabase(QueryExecutor e) : super(e);
  $AppDatabaseManager get managers => $AppDatabaseManager(this);
  late final $IncidentsTable incidents = $IncidentsTable(this);
  late final $MissionsTable missions = $MissionsTable(this);
  late final $VolunteersTable volunteers = $VolunteersTable(this);
  late final $SheltersTable shelters = $SheltersTable(this);
  late final $PendingChangesTable pendingChanges = $PendingChangesTable(this);
  late final $HistoricalDisastersTable historicalDisasters =
      $HistoricalDisastersTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [
        incidents,
        missions,
        volunteers,
        shelters,
        pendingChanges,
        historicalDisasters
      ];
}

typedef $$IncidentsTableCreateCompanionBuilder = IncidentsCompanion Function({
  required int id,
  required String title,
  Value<String?> description,
  required String disasterType,
  Value<String> status,
  required double latitude,
  required double longitude,
  Value<String?> address,
  Value<String?> region,
  Value<String?> kecamatan,
  Value<String?> desa,
  Value<int> affectedPeople,
  Value<int?> casualties,
  Value<int?> evacuated,
  Value<String?> reportedBy,
  Value<DateTime?> reportedAt,
  Value<DateTime?> verifiedAt,
  Value<DateTime?> updatedAt,
  Value<int> priorityScore,
  Value<String> priorityLevel,
  Value<bool> isAiGenerated,
  Value<String?> sourceUrl,
  Value<String?> photoData,
  Value<DateTime?> cachedAt,
  Value<int> ttlSeconds,
  Value<int> syncVersion,
  Value<int> rowid,
});
typedef $$IncidentsTableUpdateCompanionBuilder = IncidentsCompanion Function({
  Value<int> id,
  Value<String> title,
  Value<String?> description,
  Value<String> disasterType,
  Value<String> status,
  Value<double> latitude,
  Value<double> longitude,
  Value<String?> address,
  Value<String?> region,
  Value<String?> kecamatan,
  Value<String?> desa,
  Value<int> affectedPeople,
  Value<int?> casualties,
  Value<int?> evacuated,
  Value<String?> reportedBy,
  Value<DateTime?> reportedAt,
  Value<DateTime?> verifiedAt,
  Value<DateTime?> updatedAt,
  Value<int> priorityScore,
  Value<String> priorityLevel,
  Value<bool> isAiGenerated,
  Value<String?> sourceUrl,
  Value<String?> photoData,
  Value<DateTime?> cachedAt,
  Value<int> ttlSeconds,
  Value<int> syncVersion,
  Value<int> rowid,
});

class $$IncidentsTableFilterComposer
    extends Composer<_$AppDatabase, $IncidentsTable> {
  $$IncidentsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get title => $composableBuilder(
      column: $table.title, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get description => $composableBuilder(
      column: $table.description, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get disasterType => $composableBuilder(
      column: $table.disasterType, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get latitude => $composableBuilder(
      column: $table.latitude, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get longitude => $composableBuilder(
      column: $table.longitude, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get address => $composableBuilder(
      column: $table.address, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get region => $composableBuilder(
      column: $table.region, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get kecamatan => $composableBuilder(
      column: $table.kecamatan, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get desa => $composableBuilder(
      column: $table.desa, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get affectedPeople => $composableBuilder(
      column: $table.affectedPeople,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get casualties => $composableBuilder(
      column: $table.casualties, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get evacuated => $composableBuilder(
      column: $table.evacuated, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get reportedBy => $composableBuilder(
      column: $table.reportedBy, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get reportedAt => $composableBuilder(
      column: $table.reportedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get verifiedAt => $composableBuilder(
      column: $table.verifiedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get priorityScore => $composableBuilder(
      column: $table.priorityScore, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get priorityLevel => $composableBuilder(
      column: $table.priorityLevel, builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get isAiGenerated => $composableBuilder(
      column: $table.isAiGenerated, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get sourceUrl => $composableBuilder(
      column: $table.sourceUrl, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get photoData => $composableBuilder(
      column: $table.photoData, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get cachedAt => $composableBuilder(
      column: $table.cachedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get ttlSeconds => $composableBuilder(
      column: $table.ttlSeconds, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get syncVersion => $composableBuilder(
      column: $table.syncVersion, builder: (column) => ColumnFilters(column));
}

class $$IncidentsTableOrderingComposer
    extends Composer<_$AppDatabase, $IncidentsTable> {
  $$IncidentsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get title => $composableBuilder(
      column: $table.title, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get description => $composableBuilder(
      column: $table.description, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get disasterType => $composableBuilder(
      column: $table.disasterType,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get latitude => $composableBuilder(
      column: $table.latitude, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get longitude => $composableBuilder(
      column: $table.longitude, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get address => $composableBuilder(
      column: $table.address, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get region => $composableBuilder(
      column: $table.region, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get kecamatan => $composableBuilder(
      column: $table.kecamatan, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get desa => $composableBuilder(
      column: $table.desa, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get affectedPeople => $composableBuilder(
      column: $table.affectedPeople,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get casualties => $composableBuilder(
      column: $table.casualties, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get evacuated => $composableBuilder(
      column: $table.evacuated, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get reportedBy => $composableBuilder(
      column: $table.reportedBy, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get reportedAt => $composableBuilder(
      column: $table.reportedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get verifiedAt => $composableBuilder(
      column: $table.verifiedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get priorityScore => $composableBuilder(
      column: $table.priorityScore,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get priorityLevel => $composableBuilder(
      column: $table.priorityLevel,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get isAiGenerated => $composableBuilder(
      column: $table.isAiGenerated,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get sourceUrl => $composableBuilder(
      column: $table.sourceUrl, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get photoData => $composableBuilder(
      column: $table.photoData, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get cachedAt => $composableBuilder(
      column: $table.cachedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get ttlSeconds => $composableBuilder(
      column: $table.ttlSeconds, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get syncVersion => $composableBuilder(
      column: $table.syncVersion, builder: (column) => ColumnOrderings(column));
}

class $$IncidentsTableAnnotationComposer
    extends Composer<_$AppDatabase, $IncidentsTable> {
  $$IncidentsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get title =>
      $composableBuilder(column: $table.title, builder: (column) => column);

  GeneratedColumn<String> get description => $composableBuilder(
      column: $table.description, builder: (column) => column);

  GeneratedColumn<String> get disasterType => $composableBuilder(
      column: $table.disasterType, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<double> get latitude =>
      $composableBuilder(column: $table.latitude, builder: (column) => column);

  GeneratedColumn<double> get longitude =>
      $composableBuilder(column: $table.longitude, builder: (column) => column);

  GeneratedColumn<String> get address =>
      $composableBuilder(column: $table.address, builder: (column) => column);

  GeneratedColumn<String> get region =>
      $composableBuilder(column: $table.region, builder: (column) => column);

  GeneratedColumn<String> get kecamatan =>
      $composableBuilder(column: $table.kecamatan, builder: (column) => column);

  GeneratedColumn<String> get desa =>
      $composableBuilder(column: $table.desa, builder: (column) => column);

  GeneratedColumn<int> get affectedPeople => $composableBuilder(
      column: $table.affectedPeople, builder: (column) => column);

  GeneratedColumn<int> get casualties => $composableBuilder(
      column: $table.casualties, builder: (column) => column);

  GeneratedColumn<int> get evacuated =>
      $composableBuilder(column: $table.evacuated, builder: (column) => column);

  GeneratedColumn<String> get reportedBy => $composableBuilder(
      column: $table.reportedBy, builder: (column) => column);

  GeneratedColumn<DateTime> get reportedAt => $composableBuilder(
      column: $table.reportedAt, builder: (column) => column);

  GeneratedColumn<DateTime> get verifiedAt => $composableBuilder(
      column: $table.verifiedAt, builder: (column) => column);

  GeneratedColumn<DateTime> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);

  GeneratedColumn<int> get priorityScore => $composableBuilder(
      column: $table.priorityScore, builder: (column) => column);

  GeneratedColumn<String> get priorityLevel => $composableBuilder(
      column: $table.priorityLevel, builder: (column) => column);

  GeneratedColumn<bool> get isAiGenerated => $composableBuilder(
      column: $table.isAiGenerated, builder: (column) => column);

  GeneratedColumn<String> get sourceUrl =>
      $composableBuilder(column: $table.sourceUrl, builder: (column) => column);

  GeneratedColumn<String> get photoData =>
      $composableBuilder(column: $table.photoData, builder: (column) => column);

  GeneratedColumn<DateTime> get cachedAt =>
      $composableBuilder(column: $table.cachedAt, builder: (column) => column);

  GeneratedColumn<int> get ttlSeconds => $composableBuilder(
      column: $table.ttlSeconds, builder: (column) => column);

  GeneratedColumn<int> get syncVersion => $composableBuilder(
      column: $table.syncVersion, builder: (column) => column);
}

class $$IncidentsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $IncidentsTable,
    Incident,
    $$IncidentsTableFilterComposer,
    $$IncidentsTableOrderingComposer,
    $$IncidentsTableAnnotationComposer,
    $$IncidentsTableCreateCompanionBuilder,
    $$IncidentsTableUpdateCompanionBuilder,
    (Incident, BaseReferences<_$AppDatabase, $IncidentsTable, Incident>),
    Incident,
    PrefetchHooks Function()> {
  $$IncidentsTableTableManager(_$AppDatabase db, $IncidentsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$IncidentsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$IncidentsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$IncidentsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<String> title = const Value.absent(),
            Value<String?> description = const Value.absent(),
            Value<String> disasterType = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<double> latitude = const Value.absent(),
            Value<double> longitude = const Value.absent(),
            Value<String?> address = const Value.absent(),
            Value<String?> region = const Value.absent(),
            Value<String?> kecamatan = const Value.absent(),
            Value<String?> desa = const Value.absent(),
            Value<int> affectedPeople = const Value.absent(),
            Value<int?> casualties = const Value.absent(),
            Value<int?> evacuated = const Value.absent(),
            Value<String?> reportedBy = const Value.absent(),
            Value<DateTime?> reportedAt = const Value.absent(),
            Value<DateTime?> verifiedAt = const Value.absent(),
            Value<DateTime?> updatedAt = const Value.absent(),
            Value<int> priorityScore = const Value.absent(),
            Value<String> priorityLevel = const Value.absent(),
            Value<bool> isAiGenerated = const Value.absent(),
            Value<String?> sourceUrl = const Value.absent(),
            Value<String?> photoData = const Value.absent(),
            Value<DateTime?> cachedAt = const Value.absent(),
            Value<int> ttlSeconds = const Value.absent(),
            Value<int> syncVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              IncidentsCompanion(
            id: id,
            title: title,
            description: description,
            disasterType: disasterType,
            status: status,
            latitude: latitude,
            longitude: longitude,
            address: address,
            region: region,
            kecamatan: kecamatan,
            desa: desa,
            affectedPeople: affectedPeople,
            casualties: casualties,
            evacuated: evacuated,
            reportedBy: reportedBy,
            reportedAt: reportedAt,
            verifiedAt: verifiedAt,
            updatedAt: updatedAt,
            priorityScore: priorityScore,
            priorityLevel: priorityLevel,
            isAiGenerated: isAiGenerated,
            sourceUrl: sourceUrl,
            photoData: photoData,
            cachedAt: cachedAt,
            ttlSeconds: ttlSeconds,
            syncVersion: syncVersion,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required int id,
            required String title,
            Value<String?> description = const Value.absent(),
            required String disasterType,
            Value<String> status = const Value.absent(),
            required double latitude,
            required double longitude,
            Value<String?> address = const Value.absent(),
            Value<String?> region = const Value.absent(),
            Value<String?> kecamatan = const Value.absent(),
            Value<String?> desa = const Value.absent(),
            Value<int> affectedPeople = const Value.absent(),
            Value<int?> casualties = const Value.absent(),
            Value<int?> evacuated = const Value.absent(),
            Value<String?> reportedBy = const Value.absent(),
            Value<DateTime?> reportedAt = const Value.absent(),
            Value<DateTime?> verifiedAt = const Value.absent(),
            Value<DateTime?> updatedAt = const Value.absent(),
            Value<int> priorityScore = const Value.absent(),
            Value<String> priorityLevel = const Value.absent(),
            Value<bool> isAiGenerated = const Value.absent(),
            Value<String?> sourceUrl = const Value.absent(),
            Value<String?> photoData = const Value.absent(),
            Value<DateTime?> cachedAt = const Value.absent(),
            Value<int> ttlSeconds = const Value.absent(),
            Value<int> syncVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              IncidentsCompanion.insert(
            id: id,
            title: title,
            description: description,
            disasterType: disasterType,
            status: status,
            latitude: latitude,
            longitude: longitude,
            address: address,
            region: region,
            kecamatan: kecamatan,
            desa: desa,
            affectedPeople: affectedPeople,
            casualties: casualties,
            evacuated: evacuated,
            reportedBy: reportedBy,
            reportedAt: reportedAt,
            verifiedAt: verifiedAt,
            updatedAt: updatedAt,
            priorityScore: priorityScore,
            priorityLevel: priorityLevel,
            isAiGenerated: isAiGenerated,
            sourceUrl: sourceUrl,
            photoData: photoData,
            cachedAt: cachedAt,
            ttlSeconds: ttlSeconds,
            syncVersion: syncVersion,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$IncidentsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $IncidentsTable,
    Incident,
    $$IncidentsTableFilterComposer,
    $$IncidentsTableOrderingComposer,
    $$IncidentsTableAnnotationComposer,
    $$IncidentsTableCreateCompanionBuilder,
    $$IncidentsTableUpdateCompanionBuilder,
    (Incident, BaseReferences<_$AppDatabase, $IncidentsTable, Incident>),
    Incident,
    PrefetchHooks Function()>;
typedef $$MissionsTableCreateCompanionBuilder = MissionsCompanion Function({
  required int id,
  required String title,
  Value<String?> description,
  required String disasterType,
  Value<String> status,
  required double latitude,
  required double longitude,
  Value<String?> address,
  Value<String?> region,
  Value<String?> kecamatan,
  Value<String?> desa,
  Value<int> affectedPeople,
  Value<String?> assignedTeam,
  Value<String?> commanderName,
  Value<DateTime?> missionStart,
  Value<DateTime?> missionEnd,
  Value<String?> notes,
  Value<DateTime?> cachedAt,
  Value<int> ttlSeconds,
  Value<int> syncVersion,
  Value<int> rowid,
});
typedef $$MissionsTableUpdateCompanionBuilder = MissionsCompanion Function({
  Value<int> id,
  Value<String> title,
  Value<String?> description,
  Value<String> disasterType,
  Value<String> status,
  Value<double> latitude,
  Value<double> longitude,
  Value<String?> address,
  Value<String?> region,
  Value<String?> kecamatan,
  Value<String?> desa,
  Value<int> affectedPeople,
  Value<String?> assignedTeam,
  Value<String?> commanderName,
  Value<DateTime?> missionStart,
  Value<DateTime?> missionEnd,
  Value<String?> notes,
  Value<DateTime?> cachedAt,
  Value<int> ttlSeconds,
  Value<int> syncVersion,
  Value<int> rowid,
});

class $$MissionsTableFilterComposer
    extends Composer<_$AppDatabase, $MissionsTable> {
  $$MissionsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get title => $composableBuilder(
      column: $table.title, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get description => $composableBuilder(
      column: $table.description, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get disasterType => $composableBuilder(
      column: $table.disasterType, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get latitude => $composableBuilder(
      column: $table.latitude, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get longitude => $composableBuilder(
      column: $table.longitude, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get address => $composableBuilder(
      column: $table.address, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get region => $composableBuilder(
      column: $table.region, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get kecamatan => $composableBuilder(
      column: $table.kecamatan, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get desa => $composableBuilder(
      column: $table.desa, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get affectedPeople => $composableBuilder(
      column: $table.affectedPeople,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get assignedTeam => $composableBuilder(
      column: $table.assignedTeam, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get commanderName => $composableBuilder(
      column: $table.commanderName, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get missionStart => $composableBuilder(
      column: $table.missionStart, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get missionEnd => $composableBuilder(
      column: $table.missionEnd, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get notes => $composableBuilder(
      column: $table.notes, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get cachedAt => $composableBuilder(
      column: $table.cachedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get ttlSeconds => $composableBuilder(
      column: $table.ttlSeconds, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get syncVersion => $composableBuilder(
      column: $table.syncVersion, builder: (column) => ColumnFilters(column));
}

class $$MissionsTableOrderingComposer
    extends Composer<_$AppDatabase, $MissionsTable> {
  $$MissionsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get title => $composableBuilder(
      column: $table.title, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get description => $composableBuilder(
      column: $table.description, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get disasterType => $composableBuilder(
      column: $table.disasterType,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get latitude => $composableBuilder(
      column: $table.latitude, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get longitude => $composableBuilder(
      column: $table.longitude, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get address => $composableBuilder(
      column: $table.address, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get region => $composableBuilder(
      column: $table.region, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get kecamatan => $composableBuilder(
      column: $table.kecamatan, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get desa => $composableBuilder(
      column: $table.desa, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get affectedPeople => $composableBuilder(
      column: $table.affectedPeople,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get assignedTeam => $composableBuilder(
      column: $table.assignedTeam,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get commanderName => $composableBuilder(
      column: $table.commanderName,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get missionStart => $composableBuilder(
      column: $table.missionStart,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get missionEnd => $composableBuilder(
      column: $table.missionEnd, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get notes => $composableBuilder(
      column: $table.notes, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get cachedAt => $composableBuilder(
      column: $table.cachedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get ttlSeconds => $composableBuilder(
      column: $table.ttlSeconds, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get syncVersion => $composableBuilder(
      column: $table.syncVersion, builder: (column) => ColumnOrderings(column));
}

class $$MissionsTableAnnotationComposer
    extends Composer<_$AppDatabase, $MissionsTable> {
  $$MissionsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get title =>
      $composableBuilder(column: $table.title, builder: (column) => column);

  GeneratedColumn<String> get description => $composableBuilder(
      column: $table.description, builder: (column) => column);

  GeneratedColumn<String> get disasterType => $composableBuilder(
      column: $table.disasterType, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<double> get latitude =>
      $composableBuilder(column: $table.latitude, builder: (column) => column);

  GeneratedColumn<double> get longitude =>
      $composableBuilder(column: $table.longitude, builder: (column) => column);

  GeneratedColumn<String> get address =>
      $composableBuilder(column: $table.address, builder: (column) => column);

  GeneratedColumn<String> get region =>
      $composableBuilder(column: $table.region, builder: (column) => column);

  GeneratedColumn<String> get kecamatan =>
      $composableBuilder(column: $table.kecamatan, builder: (column) => column);

  GeneratedColumn<String> get desa =>
      $composableBuilder(column: $table.desa, builder: (column) => column);

  GeneratedColumn<int> get affectedPeople => $composableBuilder(
      column: $table.affectedPeople, builder: (column) => column);

  GeneratedColumn<String> get assignedTeam => $composableBuilder(
      column: $table.assignedTeam, builder: (column) => column);

  GeneratedColumn<String> get commanderName => $composableBuilder(
      column: $table.commanderName, builder: (column) => column);

  GeneratedColumn<DateTime> get missionStart => $composableBuilder(
      column: $table.missionStart, builder: (column) => column);

  GeneratedColumn<DateTime> get missionEnd => $composableBuilder(
      column: $table.missionEnd, builder: (column) => column);

  GeneratedColumn<String> get notes =>
      $composableBuilder(column: $table.notes, builder: (column) => column);

  GeneratedColumn<DateTime> get cachedAt =>
      $composableBuilder(column: $table.cachedAt, builder: (column) => column);

  GeneratedColumn<int> get ttlSeconds => $composableBuilder(
      column: $table.ttlSeconds, builder: (column) => column);

  GeneratedColumn<int> get syncVersion => $composableBuilder(
      column: $table.syncVersion, builder: (column) => column);
}

class $$MissionsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $MissionsTable,
    Mission,
    $$MissionsTableFilterComposer,
    $$MissionsTableOrderingComposer,
    $$MissionsTableAnnotationComposer,
    $$MissionsTableCreateCompanionBuilder,
    $$MissionsTableUpdateCompanionBuilder,
    (Mission, BaseReferences<_$AppDatabase, $MissionsTable, Mission>),
    Mission,
    PrefetchHooks Function()> {
  $$MissionsTableTableManager(_$AppDatabase db, $MissionsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$MissionsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$MissionsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$MissionsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<String> title = const Value.absent(),
            Value<String?> description = const Value.absent(),
            Value<String> disasterType = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<double> latitude = const Value.absent(),
            Value<double> longitude = const Value.absent(),
            Value<String?> address = const Value.absent(),
            Value<String?> region = const Value.absent(),
            Value<String?> kecamatan = const Value.absent(),
            Value<String?> desa = const Value.absent(),
            Value<int> affectedPeople = const Value.absent(),
            Value<String?> assignedTeam = const Value.absent(),
            Value<String?> commanderName = const Value.absent(),
            Value<DateTime?> missionStart = const Value.absent(),
            Value<DateTime?> missionEnd = const Value.absent(),
            Value<String?> notes = const Value.absent(),
            Value<DateTime?> cachedAt = const Value.absent(),
            Value<int> ttlSeconds = const Value.absent(),
            Value<int> syncVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              MissionsCompanion(
            id: id,
            title: title,
            description: description,
            disasterType: disasterType,
            status: status,
            latitude: latitude,
            longitude: longitude,
            address: address,
            region: region,
            kecamatan: kecamatan,
            desa: desa,
            affectedPeople: affectedPeople,
            assignedTeam: assignedTeam,
            commanderName: commanderName,
            missionStart: missionStart,
            missionEnd: missionEnd,
            notes: notes,
            cachedAt: cachedAt,
            ttlSeconds: ttlSeconds,
            syncVersion: syncVersion,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required int id,
            required String title,
            Value<String?> description = const Value.absent(),
            required String disasterType,
            Value<String> status = const Value.absent(),
            required double latitude,
            required double longitude,
            Value<String?> address = const Value.absent(),
            Value<String?> region = const Value.absent(),
            Value<String?> kecamatan = const Value.absent(),
            Value<String?> desa = const Value.absent(),
            Value<int> affectedPeople = const Value.absent(),
            Value<String?> assignedTeam = const Value.absent(),
            Value<String?> commanderName = const Value.absent(),
            Value<DateTime?> missionStart = const Value.absent(),
            Value<DateTime?> missionEnd = const Value.absent(),
            Value<String?> notes = const Value.absent(),
            Value<DateTime?> cachedAt = const Value.absent(),
            Value<int> ttlSeconds = const Value.absent(),
            Value<int> syncVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              MissionsCompanion.insert(
            id: id,
            title: title,
            description: description,
            disasterType: disasterType,
            status: status,
            latitude: latitude,
            longitude: longitude,
            address: address,
            region: region,
            kecamatan: kecamatan,
            desa: desa,
            affectedPeople: affectedPeople,
            assignedTeam: assignedTeam,
            commanderName: commanderName,
            missionStart: missionStart,
            missionEnd: missionEnd,
            notes: notes,
            cachedAt: cachedAt,
            ttlSeconds: ttlSeconds,
            syncVersion: syncVersion,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$MissionsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $MissionsTable,
    Mission,
    $$MissionsTableFilterComposer,
    $$MissionsTableOrderingComposer,
    $$MissionsTableAnnotationComposer,
    $$MissionsTableCreateCompanionBuilder,
    $$MissionsTableUpdateCompanionBuilder,
    (Mission, BaseReferences<_$AppDatabase, $MissionsTable, Mission>),
    Mission,
    PrefetchHooks Function()>;
typedef $$VolunteersTableCreateCompanionBuilder = VolunteersCompanion Function({
  required int id,
  Value<int?> userId,
  required String fullName,
  Value<String?> phone,
  Value<String?> email,
  Value<DateTime?> birthDate,
  Value<String?> gender,
  Value<String?> bloodType,
  Value<String?> regency,
  Value<String?> district,
  Value<String?> village,
  Value<String?> detailAddress,
  Value<double?> latitude,
  Value<double?> longitude,
  Value<String?> medicalHistory,
  Value<String?> expertise,
  Value<String?> experience,
  Value<String> status,
  Value<DateTime?> cachedAt,
  Value<int> ttlSeconds,
  Value<int> syncVersion,
  Value<int> rowid,
});
typedef $$VolunteersTableUpdateCompanionBuilder = VolunteersCompanion Function({
  Value<int> id,
  Value<int?> userId,
  Value<String> fullName,
  Value<String?> phone,
  Value<String?> email,
  Value<DateTime?> birthDate,
  Value<String?> gender,
  Value<String?> bloodType,
  Value<String?> regency,
  Value<String?> district,
  Value<String?> village,
  Value<String?> detailAddress,
  Value<double?> latitude,
  Value<double?> longitude,
  Value<String?> medicalHistory,
  Value<String?> expertise,
  Value<String?> experience,
  Value<String> status,
  Value<DateTime?> cachedAt,
  Value<int> ttlSeconds,
  Value<int> syncVersion,
  Value<int> rowid,
});

class $$VolunteersTableFilterComposer
    extends Composer<_$AppDatabase, $VolunteersTable> {
  $$VolunteersTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get userId => $composableBuilder(
      column: $table.userId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get fullName => $composableBuilder(
      column: $table.fullName, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get phone => $composableBuilder(
      column: $table.phone, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get email => $composableBuilder(
      column: $table.email, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get birthDate => $composableBuilder(
      column: $table.birthDate, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get gender => $composableBuilder(
      column: $table.gender, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get bloodType => $composableBuilder(
      column: $table.bloodType, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get regency => $composableBuilder(
      column: $table.regency, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get district => $composableBuilder(
      column: $table.district, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get village => $composableBuilder(
      column: $table.village, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get detailAddress => $composableBuilder(
      column: $table.detailAddress, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get latitude => $composableBuilder(
      column: $table.latitude, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get longitude => $composableBuilder(
      column: $table.longitude, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get medicalHistory => $composableBuilder(
      column: $table.medicalHistory,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get expertise => $composableBuilder(
      column: $table.expertise, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get experience => $composableBuilder(
      column: $table.experience, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get cachedAt => $composableBuilder(
      column: $table.cachedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get ttlSeconds => $composableBuilder(
      column: $table.ttlSeconds, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get syncVersion => $composableBuilder(
      column: $table.syncVersion, builder: (column) => ColumnFilters(column));
}

class $$VolunteersTableOrderingComposer
    extends Composer<_$AppDatabase, $VolunteersTable> {
  $$VolunteersTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get userId => $composableBuilder(
      column: $table.userId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get fullName => $composableBuilder(
      column: $table.fullName, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get phone => $composableBuilder(
      column: $table.phone, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get email => $composableBuilder(
      column: $table.email, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get birthDate => $composableBuilder(
      column: $table.birthDate, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get gender => $composableBuilder(
      column: $table.gender, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get bloodType => $composableBuilder(
      column: $table.bloodType, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get regency => $composableBuilder(
      column: $table.regency, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get district => $composableBuilder(
      column: $table.district, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get village => $composableBuilder(
      column: $table.village, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get detailAddress => $composableBuilder(
      column: $table.detailAddress,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get latitude => $composableBuilder(
      column: $table.latitude, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get longitude => $composableBuilder(
      column: $table.longitude, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get medicalHistory => $composableBuilder(
      column: $table.medicalHistory,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get expertise => $composableBuilder(
      column: $table.expertise, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get experience => $composableBuilder(
      column: $table.experience, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get cachedAt => $composableBuilder(
      column: $table.cachedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get ttlSeconds => $composableBuilder(
      column: $table.ttlSeconds, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get syncVersion => $composableBuilder(
      column: $table.syncVersion, builder: (column) => ColumnOrderings(column));
}

class $$VolunteersTableAnnotationComposer
    extends Composer<_$AppDatabase, $VolunteersTable> {
  $$VolunteersTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<int> get userId =>
      $composableBuilder(column: $table.userId, builder: (column) => column);

  GeneratedColumn<String> get fullName =>
      $composableBuilder(column: $table.fullName, builder: (column) => column);

  GeneratedColumn<String> get phone =>
      $composableBuilder(column: $table.phone, builder: (column) => column);

  GeneratedColumn<String> get email =>
      $composableBuilder(column: $table.email, builder: (column) => column);

  GeneratedColumn<DateTime> get birthDate =>
      $composableBuilder(column: $table.birthDate, builder: (column) => column);

  GeneratedColumn<String> get gender =>
      $composableBuilder(column: $table.gender, builder: (column) => column);

  GeneratedColumn<String> get bloodType =>
      $composableBuilder(column: $table.bloodType, builder: (column) => column);

  GeneratedColumn<String> get regency =>
      $composableBuilder(column: $table.regency, builder: (column) => column);

  GeneratedColumn<String> get district =>
      $composableBuilder(column: $table.district, builder: (column) => column);

  GeneratedColumn<String> get village =>
      $composableBuilder(column: $table.village, builder: (column) => column);

  GeneratedColumn<String> get detailAddress => $composableBuilder(
      column: $table.detailAddress, builder: (column) => column);

  GeneratedColumn<double> get latitude =>
      $composableBuilder(column: $table.latitude, builder: (column) => column);

  GeneratedColumn<double> get longitude =>
      $composableBuilder(column: $table.longitude, builder: (column) => column);

  GeneratedColumn<String> get medicalHistory => $composableBuilder(
      column: $table.medicalHistory, builder: (column) => column);

  GeneratedColumn<String> get expertise =>
      $composableBuilder(column: $table.expertise, builder: (column) => column);

  GeneratedColumn<String> get experience => $composableBuilder(
      column: $table.experience, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<DateTime> get cachedAt =>
      $composableBuilder(column: $table.cachedAt, builder: (column) => column);

  GeneratedColumn<int> get ttlSeconds => $composableBuilder(
      column: $table.ttlSeconds, builder: (column) => column);

  GeneratedColumn<int> get syncVersion => $composableBuilder(
      column: $table.syncVersion, builder: (column) => column);
}

class $$VolunteersTableTableManager extends RootTableManager<
    _$AppDatabase,
    $VolunteersTable,
    Volunteer,
    $$VolunteersTableFilterComposer,
    $$VolunteersTableOrderingComposer,
    $$VolunteersTableAnnotationComposer,
    $$VolunteersTableCreateCompanionBuilder,
    $$VolunteersTableUpdateCompanionBuilder,
    (Volunteer, BaseReferences<_$AppDatabase, $VolunteersTable, Volunteer>),
    Volunteer,
    PrefetchHooks Function()> {
  $$VolunteersTableTableManager(_$AppDatabase db, $VolunteersTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$VolunteersTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$VolunteersTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$VolunteersTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<int?> userId = const Value.absent(),
            Value<String> fullName = const Value.absent(),
            Value<String?> phone = const Value.absent(),
            Value<String?> email = const Value.absent(),
            Value<DateTime?> birthDate = const Value.absent(),
            Value<String?> gender = const Value.absent(),
            Value<String?> bloodType = const Value.absent(),
            Value<String?> regency = const Value.absent(),
            Value<String?> district = const Value.absent(),
            Value<String?> village = const Value.absent(),
            Value<String?> detailAddress = const Value.absent(),
            Value<double?> latitude = const Value.absent(),
            Value<double?> longitude = const Value.absent(),
            Value<String?> medicalHistory = const Value.absent(),
            Value<String?> expertise = const Value.absent(),
            Value<String?> experience = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<DateTime?> cachedAt = const Value.absent(),
            Value<int> ttlSeconds = const Value.absent(),
            Value<int> syncVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              VolunteersCompanion(
            id: id,
            userId: userId,
            fullName: fullName,
            phone: phone,
            email: email,
            birthDate: birthDate,
            gender: gender,
            bloodType: bloodType,
            regency: regency,
            district: district,
            village: village,
            detailAddress: detailAddress,
            latitude: latitude,
            longitude: longitude,
            medicalHistory: medicalHistory,
            expertise: expertise,
            experience: experience,
            status: status,
            cachedAt: cachedAt,
            ttlSeconds: ttlSeconds,
            syncVersion: syncVersion,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required int id,
            Value<int?> userId = const Value.absent(),
            required String fullName,
            Value<String?> phone = const Value.absent(),
            Value<String?> email = const Value.absent(),
            Value<DateTime?> birthDate = const Value.absent(),
            Value<String?> gender = const Value.absent(),
            Value<String?> bloodType = const Value.absent(),
            Value<String?> regency = const Value.absent(),
            Value<String?> district = const Value.absent(),
            Value<String?> village = const Value.absent(),
            Value<String?> detailAddress = const Value.absent(),
            Value<double?> latitude = const Value.absent(),
            Value<double?> longitude = const Value.absent(),
            Value<String?> medicalHistory = const Value.absent(),
            Value<String?> expertise = const Value.absent(),
            Value<String?> experience = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<DateTime?> cachedAt = const Value.absent(),
            Value<int> ttlSeconds = const Value.absent(),
            Value<int> syncVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              VolunteersCompanion.insert(
            id: id,
            userId: userId,
            fullName: fullName,
            phone: phone,
            email: email,
            birthDate: birthDate,
            gender: gender,
            bloodType: bloodType,
            regency: regency,
            district: district,
            village: village,
            detailAddress: detailAddress,
            latitude: latitude,
            longitude: longitude,
            medicalHistory: medicalHistory,
            expertise: expertise,
            experience: experience,
            status: status,
            cachedAt: cachedAt,
            ttlSeconds: ttlSeconds,
            syncVersion: syncVersion,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$VolunteersTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $VolunteersTable,
    Volunteer,
    $$VolunteersTableFilterComposer,
    $$VolunteersTableOrderingComposer,
    $$VolunteersTableAnnotationComposer,
    $$VolunteersTableCreateCompanionBuilder,
    $$VolunteersTableUpdateCompanionBuilder,
    (Volunteer, BaseReferences<_$AppDatabase, $VolunteersTable, Volunteer>),
    Volunteer,
    PrefetchHooks Function()>;
typedef $$SheltersTableCreateCompanionBuilder = SheltersCompanion Function({
  required int id,
  Value<int?> incidentId,
  required String name,
  Value<String?> region,
  Value<String?> address,
  Value<double?> latitude,
  Value<double?> longitude,
  Value<String> status,
  Value<int> score,
  Value<int> refugeeCount,
  Value<String> stockStatus,
  Value<String?> contactPerson,
  Value<String?> contactPhone,
  Value<DateTime?> cachedAt,
  Value<int> ttlSeconds,
  Value<int> syncVersion,
  Value<int> rowid,
});
typedef $$SheltersTableUpdateCompanionBuilder = SheltersCompanion Function({
  Value<int> id,
  Value<int?> incidentId,
  Value<String> name,
  Value<String?> region,
  Value<String?> address,
  Value<double?> latitude,
  Value<double?> longitude,
  Value<String> status,
  Value<int> score,
  Value<int> refugeeCount,
  Value<String> stockStatus,
  Value<String?> contactPerson,
  Value<String?> contactPhone,
  Value<DateTime?> cachedAt,
  Value<int> ttlSeconds,
  Value<int> syncVersion,
  Value<int> rowid,
});

class $$SheltersTableFilterComposer
    extends Composer<_$AppDatabase, $SheltersTable> {
  $$SheltersTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get incidentId => $composableBuilder(
      column: $table.incidentId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get name => $composableBuilder(
      column: $table.name, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get region => $composableBuilder(
      column: $table.region, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get address => $composableBuilder(
      column: $table.address, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get latitude => $composableBuilder(
      column: $table.latitude, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get longitude => $composableBuilder(
      column: $table.longitude, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get score => $composableBuilder(
      column: $table.score, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get refugeeCount => $composableBuilder(
      column: $table.refugeeCount, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get stockStatus => $composableBuilder(
      column: $table.stockStatus, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get contactPerson => $composableBuilder(
      column: $table.contactPerson, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get contactPhone => $composableBuilder(
      column: $table.contactPhone, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get cachedAt => $composableBuilder(
      column: $table.cachedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get ttlSeconds => $composableBuilder(
      column: $table.ttlSeconds, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get syncVersion => $composableBuilder(
      column: $table.syncVersion, builder: (column) => ColumnFilters(column));
}

class $$SheltersTableOrderingComposer
    extends Composer<_$AppDatabase, $SheltersTable> {
  $$SheltersTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get incidentId => $composableBuilder(
      column: $table.incidentId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get name => $composableBuilder(
      column: $table.name, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get region => $composableBuilder(
      column: $table.region, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get address => $composableBuilder(
      column: $table.address, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get latitude => $composableBuilder(
      column: $table.latitude, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get longitude => $composableBuilder(
      column: $table.longitude, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get score => $composableBuilder(
      column: $table.score, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get refugeeCount => $composableBuilder(
      column: $table.refugeeCount,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get stockStatus => $composableBuilder(
      column: $table.stockStatus, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get contactPerson => $composableBuilder(
      column: $table.contactPerson,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get contactPhone => $composableBuilder(
      column: $table.contactPhone,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get cachedAt => $composableBuilder(
      column: $table.cachedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get ttlSeconds => $composableBuilder(
      column: $table.ttlSeconds, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get syncVersion => $composableBuilder(
      column: $table.syncVersion, builder: (column) => ColumnOrderings(column));
}

class $$SheltersTableAnnotationComposer
    extends Composer<_$AppDatabase, $SheltersTable> {
  $$SheltersTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<int> get incidentId => $composableBuilder(
      column: $table.incidentId, builder: (column) => column);

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<String> get region =>
      $composableBuilder(column: $table.region, builder: (column) => column);

  GeneratedColumn<String> get address =>
      $composableBuilder(column: $table.address, builder: (column) => column);

  GeneratedColumn<double> get latitude =>
      $composableBuilder(column: $table.latitude, builder: (column) => column);

  GeneratedColumn<double> get longitude =>
      $composableBuilder(column: $table.longitude, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<int> get score =>
      $composableBuilder(column: $table.score, builder: (column) => column);

  GeneratedColumn<int> get refugeeCount => $composableBuilder(
      column: $table.refugeeCount, builder: (column) => column);

  GeneratedColumn<String> get stockStatus => $composableBuilder(
      column: $table.stockStatus, builder: (column) => column);

  GeneratedColumn<String> get contactPerson => $composableBuilder(
      column: $table.contactPerson, builder: (column) => column);

  GeneratedColumn<String> get contactPhone => $composableBuilder(
      column: $table.contactPhone, builder: (column) => column);

  GeneratedColumn<DateTime> get cachedAt =>
      $composableBuilder(column: $table.cachedAt, builder: (column) => column);

  GeneratedColumn<int> get ttlSeconds => $composableBuilder(
      column: $table.ttlSeconds, builder: (column) => column);

  GeneratedColumn<int> get syncVersion => $composableBuilder(
      column: $table.syncVersion, builder: (column) => column);
}

class $$SheltersTableTableManager extends RootTableManager<
    _$AppDatabase,
    $SheltersTable,
    Shelter,
    $$SheltersTableFilterComposer,
    $$SheltersTableOrderingComposer,
    $$SheltersTableAnnotationComposer,
    $$SheltersTableCreateCompanionBuilder,
    $$SheltersTableUpdateCompanionBuilder,
    (Shelter, BaseReferences<_$AppDatabase, $SheltersTable, Shelter>),
    Shelter,
    PrefetchHooks Function()> {
  $$SheltersTableTableManager(_$AppDatabase db, $SheltersTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$SheltersTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$SheltersTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$SheltersTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<int?> incidentId = const Value.absent(),
            Value<String> name = const Value.absent(),
            Value<String?> region = const Value.absent(),
            Value<String?> address = const Value.absent(),
            Value<double?> latitude = const Value.absent(),
            Value<double?> longitude = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<int> score = const Value.absent(),
            Value<int> refugeeCount = const Value.absent(),
            Value<String> stockStatus = const Value.absent(),
            Value<String?> contactPerson = const Value.absent(),
            Value<String?> contactPhone = const Value.absent(),
            Value<DateTime?> cachedAt = const Value.absent(),
            Value<int> ttlSeconds = const Value.absent(),
            Value<int> syncVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              SheltersCompanion(
            id: id,
            incidentId: incidentId,
            name: name,
            region: region,
            address: address,
            latitude: latitude,
            longitude: longitude,
            status: status,
            score: score,
            refugeeCount: refugeeCount,
            stockStatus: stockStatus,
            contactPerson: contactPerson,
            contactPhone: contactPhone,
            cachedAt: cachedAt,
            ttlSeconds: ttlSeconds,
            syncVersion: syncVersion,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required int id,
            Value<int?> incidentId = const Value.absent(),
            required String name,
            Value<String?> region = const Value.absent(),
            Value<String?> address = const Value.absent(),
            Value<double?> latitude = const Value.absent(),
            Value<double?> longitude = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<int> score = const Value.absent(),
            Value<int> refugeeCount = const Value.absent(),
            Value<String> stockStatus = const Value.absent(),
            Value<String?> contactPerson = const Value.absent(),
            Value<String?> contactPhone = const Value.absent(),
            Value<DateTime?> cachedAt = const Value.absent(),
            Value<int> ttlSeconds = const Value.absent(),
            Value<int> syncVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              SheltersCompanion.insert(
            id: id,
            incidentId: incidentId,
            name: name,
            region: region,
            address: address,
            latitude: latitude,
            longitude: longitude,
            status: status,
            score: score,
            refugeeCount: refugeeCount,
            stockStatus: stockStatus,
            contactPerson: contactPerson,
            contactPhone: contactPhone,
            cachedAt: cachedAt,
            ttlSeconds: ttlSeconds,
            syncVersion: syncVersion,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$SheltersTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $SheltersTable,
    Shelter,
    $$SheltersTableFilterComposer,
    $$SheltersTableOrderingComposer,
    $$SheltersTableAnnotationComposer,
    $$SheltersTableCreateCompanionBuilder,
    $$SheltersTableUpdateCompanionBuilder,
    (Shelter, BaseReferences<_$AppDatabase, $SheltersTable, Shelter>),
    Shelter,
    PrefetchHooks Function()>;
typedef $$PendingChangesTableCreateCompanionBuilder = PendingChangesCompanion
    Function({
  Value<int> id,
  required String entityType,
  required int entityId,
  required String operation,
  required String payload,
  Value<int> retryCount,
  Value<DateTime?> createdAt,
  Value<String?> errorMessage,
});
typedef $$PendingChangesTableUpdateCompanionBuilder = PendingChangesCompanion
    Function({
  Value<int> id,
  Value<String> entityType,
  Value<int> entityId,
  Value<String> operation,
  Value<String> payload,
  Value<int> retryCount,
  Value<DateTime?> createdAt,
  Value<String?> errorMessage,
});

class $$PendingChangesTableFilterComposer
    extends Composer<_$AppDatabase, $PendingChangesTable> {
  $$PendingChangesTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get entityType => $composableBuilder(
      column: $table.entityType, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get entityId => $composableBuilder(
      column: $table.entityId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get operation => $composableBuilder(
      column: $table.operation, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get payload => $composableBuilder(
      column: $table.payload, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get retryCount => $composableBuilder(
      column: $table.retryCount, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get errorMessage => $composableBuilder(
      column: $table.errorMessage, builder: (column) => ColumnFilters(column));
}

class $$PendingChangesTableOrderingComposer
    extends Composer<_$AppDatabase, $PendingChangesTable> {
  $$PendingChangesTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get entityType => $composableBuilder(
      column: $table.entityType, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get entityId => $composableBuilder(
      column: $table.entityId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get operation => $composableBuilder(
      column: $table.operation, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get payload => $composableBuilder(
      column: $table.payload, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get retryCount => $composableBuilder(
      column: $table.retryCount, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get errorMessage => $composableBuilder(
      column: $table.errorMessage,
      builder: (column) => ColumnOrderings(column));
}

class $$PendingChangesTableAnnotationComposer
    extends Composer<_$AppDatabase, $PendingChangesTable> {
  $$PendingChangesTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get entityType => $composableBuilder(
      column: $table.entityType, builder: (column) => column);

  GeneratedColumn<int> get entityId =>
      $composableBuilder(column: $table.entityId, builder: (column) => column);

  GeneratedColumn<String> get operation =>
      $composableBuilder(column: $table.operation, builder: (column) => column);

  GeneratedColumn<String> get payload =>
      $composableBuilder(column: $table.payload, builder: (column) => column);

  GeneratedColumn<int> get retryCount => $composableBuilder(
      column: $table.retryCount, builder: (column) => column);

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<String> get errorMessage => $composableBuilder(
      column: $table.errorMessage, builder: (column) => column);
}

class $$PendingChangesTableTableManager extends RootTableManager<
    _$AppDatabase,
    $PendingChangesTable,
    PendingChange,
    $$PendingChangesTableFilterComposer,
    $$PendingChangesTableOrderingComposer,
    $$PendingChangesTableAnnotationComposer,
    $$PendingChangesTableCreateCompanionBuilder,
    $$PendingChangesTableUpdateCompanionBuilder,
    (
      PendingChange,
      BaseReferences<_$AppDatabase, $PendingChangesTable, PendingChange>
    ),
    PendingChange,
    PrefetchHooks Function()> {
  $$PendingChangesTableTableManager(
      _$AppDatabase db, $PendingChangesTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$PendingChangesTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$PendingChangesTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$PendingChangesTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<String> entityType = const Value.absent(),
            Value<int> entityId = const Value.absent(),
            Value<String> operation = const Value.absent(),
            Value<String> payload = const Value.absent(),
            Value<int> retryCount = const Value.absent(),
            Value<DateTime?> createdAt = const Value.absent(),
            Value<String?> errorMessage = const Value.absent(),
          }) =>
              PendingChangesCompanion(
            id: id,
            entityType: entityType,
            entityId: entityId,
            operation: operation,
            payload: payload,
            retryCount: retryCount,
            createdAt: createdAt,
            errorMessage: errorMessage,
          ),
          createCompanionCallback: ({
            Value<int> id = const Value.absent(),
            required String entityType,
            required int entityId,
            required String operation,
            required String payload,
            Value<int> retryCount = const Value.absent(),
            Value<DateTime?> createdAt = const Value.absent(),
            Value<String?> errorMessage = const Value.absent(),
          }) =>
              PendingChangesCompanion.insert(
            id: id,
            entityType: entityType,
            entityId: entityId,
            operation: operation,
            payload: payload,
            retryCount: retryCount,
            createdAt: createdAt,
            errorMessage: errorMessage,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$PendingChangesTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $PendingChangesTable,
    PendingChange,
    $$PendingChangesTableFilterComposer,
    $$PendingChangesTableOrderingComposer,
    $$PendingChangesTableAnnotationComposer,
    $$PendingChangesTableCreateCompanionBuilder,
    $$PendingChangesTableUpdateCompanionBuilder,
    (
      PendingChange,
      BaseReferences<_$AppDatabase, $PendingChangesTable, PendingChange>
    ),
    PendingChange,
    PrefetchHooks Function()>;
typedef $$HistoricalDisastersTableCreateCompanionBuilder
    = HistoricalDisastersCompanion Function({
  required int id,
  required String region,
  required String disasterType,
  required DateTime eventDate,
  Value<double?> latitude,
  Value<double?> longitude,
  Value<String?> time,
  Value<DateTime?> cachedAt,
  Value<int> ttlSeconds,
  Value<int> syncVersion,
  Value<int> rowid,
});
typedef $$HistoricalDisastersTableUpdateCompanionBuilder
    = HistoricalDisastersCompanion Function({
  Value<int> id,
  Value<String> region,
  Value<String> disasterType,
  Value<DateTime> eventDate,
  Value<double?> latitude,
  Value<double?> longitude,
  Value<String?> time,
  Value<DateTime?> cachedAt,
  Value<int> ttlSeconds,
  Value<int> syncVersion,
  Value<int> rowid,
});

class $$HistoricalDisastersTableFilterComposer
    extends Composer<_$AppDatabase, $HistoricalDisastersTable> {
  $$HistoricalDisastersTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get region => $composableBuilder(
      column: $table.region, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get disasterType => $composableBuilder(
      column: $table.disasterType, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get eventDate => $composableBuilder(
      column: $table.eventDate, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get latitude => $composableBuilder(
      column: $table.latitude, builder: (column) => ColumnFilters(column));

  ColumnFilters<double> get longitude => $composableBuilder(
      column: $table.longitude, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get time => $composableBuilder(
      column: $table.time, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get cachedAt => $composableBuilder(
      column: $table.cachedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get ttlSeconds => $composableBuilder(
      column: $table.ttlSeconds, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get syncVersion => $composableBuilder(
      column: $table.syncVersion, builder: (column) => ColumnFilters(column));
}

class $$HistoricalDisastersTableOrderingComposer
    extends Composer<_$AppDatabase, $HistoricalDisastersTable> {
  $$HistoricalDisastersTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get region => $composableBuilder(
      column: $table.region, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get disasterType => $composableBuilder(
      column: $table.disasterType,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get eventDate => $composableBuilder(
      column: $table.eventDate, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get latitude => $composableBuilder(
      column: $table.latitude, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<double> get longitude => $composableBuilder(
      column: $table.longitude, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get time => $composableBuilder(
      column: $table.time, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get cachedAt => $composableBuilder(
      column: $table.cachedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get ttlSeconds => $composableBuilder(
      column: $table.ttlSeconds, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get syncVersion => $composableBuilder(
      column: $table.syncVersion, builder: (column) => ColumnOrderings(column));
}

class $$HistoricalDisastersTableAnnotationComposer
    extends Composer<_$AppDatabase, $HistoricalDisastersTable> {
  $$HistoricalDisastersTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get region =>
      $composableBuilder(column: $table.region, builder: (column) => column);

  GeneratedColumn<String> get disasterType => $composableBuilder(
      column: $table.disasterType, builder: (column) => column);

  GeneratedColumn<DateTime> get eventDate =>
      $composableBuilder(column: $table.eventDate, builder: (column) => column);

  GeneratedColumn<double> get latitude =>
      $composableBuilder(column: $table.latitude, builder: (column) => column);

  GeneratedColumn<double> get longitude =>
      $composableBuilder(column: $table.longitude, builder: (column) => column);

  GeneratedColumn<String> get time =>
      $composableBuilder(column: $table.time, builder: (column) => column);

  GeneratedColumn<DateTime> get cachedAt =>
      $composableBuilder(column: $table.cachedAt, builder: (column) => column);

  GeneratedColumn<int> get ttlSeconds => $composableBuilder(
      column: $table.ttlSeconds, builder: (column) => column);

  GeneratedColumn<int> get syncVersion => $composableBuilder(
      column: $table.syncVersion, builder: (column) => column);
}

class $$HistoricalDisastersTableTableManager extends RootTableManager<
    _$AppDatabase,
    $HistoricalDisastersTable,
    HistoricalDisaster,
    $$HistoricalDisastersTableFilterComposer,
    $$HistoricalDisastersTableOrderingComposer,
    $$HistoricalDisastersTableAnnotationComposer,
    $$HistoricalDisastersTableCreateCompanionBuilder,
    $$HistoricalDisastersTableUpdateCompanionBuilder,
    (
      HistoricalDisaster,
      BaseReferences<_$AppDatabase, $HistoricalDisastersTable,
          HistoricalDisaster>
    ),
    HistoricalDisaster,
    PrefetchHooks Function()> {
  $$HistoricalDisastersTableTableManager(
      _$AppDatabase db, $HistoricalDisastersTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$HistoricalDisastersTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$HistoricalDisastersTableOrderingComposer(
                  $db: db, $table: table),
          createComputedFieldComposer: () =>
              $$HistoricalDisastersTableAnnotationComposer(
                  $db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<String> region = const Value.absent(),
            Value<String> disasterType = const Value.absent(),
            Value<DateTime> eventDate = const Value.absent(),
            Value<double?> latitude = const Value.absent(),
            Value<double?> longitude = const Value.absent(),
            Value<String?> time = const Value.absent(),
            Value<DateTime?> cachedAt = const Value.absent(),
            Value<int> ttlSeconds = const Value.absent(),
            Value<int> syncVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              HistoricalDisastersCompanion(
            id: id,
            region: region,
            disasterType: disasterType,
            eventDate: eventDate,
            latitude: latitude,
            longitude: longitude,
            time: time,
            cachedAt: cachedAt,
            ttlSeconds: ttlSeconds,
            syncVersion: syncVersion,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required int id,
            required String region,
            required String disasterType,
            required DateTime eventDate,
            Value<double?> latitude = const Value.absent(),
            Value<double?> longitude = const Value.absent(),
            Value<String?> time = const Value.absent(),
            Value<DateTime?> cachedAt = const Value.absent(),
            Value<int> ttlSeconds = const Value.absent(),
            Value<int> syncVersion = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              HistoricalDisastersCompanion.insert(
            id: id,
            region: region,
            disasterType: disasterType,
            eventDate: eventDate,
            latitude: latitude,
            longitude: longitude,
            time: time,
            cachedAt: cachedAt,
            ttlSeconds: ttlSeconds,
            syncVersion: syncVersion,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$HistoricalDisastersTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $HistoricalDisastersTable,
    HistoricalDisaster,
    $$HistoricalDisastersTableFilterComposer,
    $$HistoricalDisastersTableOrderingComposer,
    $$HistoricalDisastersTableAnnotationComposer,
    $$HistoricalDisastersTableCreateCompanionBuilder,
    $$HistoricalDisastersTableUpdateCompanionBuilder,
    (
      HistoricalDisaster,
      BaseReferences<_$AppDatabase, $HistoricalDisastersTable,
          HistoricalDisaster>
    ),
    HistoricalDisaster,
    PrefetchHooks Function()>;

class $AppDatabaseManager {
  final _$AppDatabase _db;
  $AppDatabaseManager(this._db);
  $$IncidentsTableTableManager get incidents =>
      $$IncidentsTableTableManager(_db, _db.incidents);
  $$MissionsTableTableManager get missions =>
      $$MissionsTableTableManager(_db, _db.missions);
  $$VolunteersTableTableManager get volunteers =>
      $$VolunteersTableTableManager(_db, _db.volunteers);
  $$SheltersTableTableManager get shelters =>
      $$SheltersTableTableManager(_db, _db.shelters);
  $$PendingChangesTableTableManager get pendingChanges =>
      $$PendingChangesTableTableManager(_db, _db.pendingChanges);
  $$HistoricalDisastersTableTableManager get historicalDisasters =>
      $$HistoricalDisastersTableTableManager(_db, _db.historicalDisasters);
}
