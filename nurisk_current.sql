-- NURisk Database Schema
-- Exported: 2026-05-15
-- Database: pusdatin_nu (PostgreSQL)

-- ============================================
-- CORE TABLES
-- ============================================

-- Users (Authentication)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR,
    username VARCHAR NOT NULL,
    password VARCHAR NOT NULL,
    role VARCHAR,
    region VARCHAR,
    created_at TIMESTAMP
);

-- Volunteers
CREATE TABLE volunteers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    full_name VARCHAR,
    phone VARCHAR,
    birth_date DATE,
    gender VARCHAR,
    blood_type VARCHAR,
    regency VARCHAR,
    district VARCHAR,
    village VARCHAR,
    detail_address TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    medical_history TEXT,
    expertise TEXT,
    experience TEXT,
    status VARCHAR,
    created_at TIMESTAMP,
    status_tugas VARCHAR
);

-- Incidents
CREATE TABLE incidents (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    disaster_type VARCHAR NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    region VARCHAR,
    priority_level VARCHAR,
    status VARCHAR,
    description TEXT,
    createdAt TIMESTAMP,
    is_ai_generated BOOLEAN,
    source_url TEXT,
    priority_score INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    kecamatan VARCHAR,
    desa VARCHAR,
    alamat_spesifik TEXT,
    kondisi_mutakhir TEXT,
    dampak_manusia JSONB,
    dampak_rumah JSONB,
    dampak_fasum JSONB,
    dampak_vital JSONB,
    dampak_lingkungan JSONB,
    needs_numeric JSONB,
    documentation_photo TEXT,
    damage_score INTEGER,
    needs_score INTEGER,
    has_shelter BOOLEAN,
    reporter_name VARCHAR,
    whatsapp_number VARCHAR,
    event_date TIMESTAMP,
    photo_data TEXT,
    probability_score NUMERIC,
    ai_features JSONB
);

-- Shelters
CREATE TABLE shelters (
    id SERIAL PRIMARY KEY,
    incident_id INTEGER,
    name VARCHAR NOT NULL,
    latitude NUMERIC,
    longitude NUMERIC,
    capacity INTEGER,
    water_stock_liters NUMERIC,
    toilet_count INTEGER,
    status_kelayakan VARCHAR,
    created_at TIMESTAMP,
    region VARCHAR,
    status VARCHAR,
    stock_status VARCHAR
);

-- Warehouses
CREATE TABLE warehouses (
    id SERIAL PRIMARY KEY,
    name VARCHAR,
    latitude NUMERIC,
    longitude NUMERIC,
    address TEXT,
    capacity INTEGER,
    manager VARCHAR,
    phone VARCHAR
);

-- Assets/Inventory
CREATE TABLE asset_inventories (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    category VARCHAR,
    quantity INTEGER,
    unit VARCHAR,
    location VARCHAR,
    warehouse_id INTEGER,
    qr_code VARCHAR,
    status VARCHAR,
    created_at TIMESTAMP,
    description TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    region VARCHAR,
    updated_at TIMESTAMP,
    purchase_date DATE,
    purchase_price NUMERIC,
    supplier VARCHAR,
    notes TEXT
);

-- Asset Transactions
CREATE TABLE asset_transactions (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER,
    incident_id INTEGER,
    volunteer_id INTEGER,
    quantity INTEGER,
    type VARCHAR,
    status VARCHAR,
    notes TEXT,
    to_warehouse_id INTEGER,
    to_region VARCHAR,
    created_at TIMESTAMP
);

-- Logistics Requests
CREATE TABLE logistics_requests (
    id SERIAL PRIMARY KEY,
    incident_id INTEGER,
    inventory_id INTEGER,
    requester_region VARCHAR,
    item_name VARCHAR,
    quantity_requested INTEGER,
    status VARCHAR,
    admin_note TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Volunteer Deployments
CREATE TABLE volunteer_deployments (
    id SERIAL PRIMARY KEY,
    incident_id INTEGER,
    volunteer_id INTEGER,
    available_from TIMESTAMP,
    available_until TIMESTAMP,
    status VARCHAR,
    note TEXT,
    created_at TIMESTAMP
);

-- Volunteer Schedules
CREATE TABLE volunteer_schedules (
    id SERIAL PRIMARY KEY,
    volunteer_id INTEGER,
    date DATE NOT NULL,
    shift_start TIME,
    shift_end TIME,
    status VARCHAR,
    created_at TIMESTAMP
);

-- Volunteer Performance
CREATE TABLE volunteer_performance (
    id SERIAL PRIMARY KEY,
    volunteer_id INTEGER,
    incident_id INTEGER,
    hours_worked NUMERIC,
    missions_completed INTEGER,
    rating NUMERIC,
    notes TEXT,
    created_at TIMESTAMP
);

-- Volunteer Devices
CREATE TABLE volunteer_devices (
    id SERIAL PRIMARY KEY,
    volunteer_id INTEGER,
    token VARCHAR NOT NULL,
    platform VARCHAR,
    last_active TIMESTAMP,
    created_at TIMESTAMP
);

-- Volunteer Locations
CREATE TABLE volunteer_locations (
    id SERIAL PRIMARY KEY,
    volunteer_id INTEGER,
    latitude NUMERIC NOT NULL,
    longitude NUMERIC NOT NULL,
    updated_at TIMESTAMP
);

-- Certifications
CREATE TABLE certifications (
    id SERIAL PRIMARY KEY,
    volunteer_id INTEGER,
    name VARCHAR,
    issued_date DATE,
    expiry_date DATE,
    certificate_number VARCHAR,
    document_url TEXT,
    status VARCHAR,
    created_at TIMESTAMP
);

-- ============================================
-- INCIDENT SUPPORT TABLES
-- ============================================

-- Incident Actions
CREATE TABLE incident_actions (
    id SERIAL PRIMARY KEY,
    incident_id INTEGER,
    kluster VARCHAR,
    nama_kegiatang TEXT,
    jumlah_paket VARCHAR,
    penerima_manfaat VARCHAR,
    created_at TIMESTAMP,
    targets_met JSONB
);

-- Incident Instructions
CREATE TABLE incident_instructions (
    id SERIAL PRIMARY KEY,
    incident_id INTEGER,
    nomor_sp VARCHAR,
    pj_nama VARCHAR,
    pic_lapangan VARCHAR,
    tim_anggota TEXT,
    armada_detail TEXT,
    peralatan_detail TEXT,
    status_sp VARCHAR,
    created_at TIMESTAMP
);

-- Incident Logs
CREATE TABLE incident_logs (
    id SERIAL PRIMARY KEY,
    incident_id INTEGER,
    previous_status VARCHAR,
    new_status VARCHAR,
    note TEXT,
    updated_by VARCHAR,
    created_at TIMESTAMP
);

-- Incident Media
CREATE TABLE incident_media (
    id SERIAL PRIMARY KEY,
    incident_id INTEGER,
    file_path VARCHAR,
    file_name VARCHAR,
    file_type VARCHAR,
    mime_type VARCHAR,
    size INTEGER,
    description TEXT,
    uploaded_by INTEGER,
    created_at TIMESTAMP
);

-- Incident Resources
CREATE TABLE incident_resources (
    id SERIAL PRIMARY KEY,
    incident_id INTEGER,
    inventory_id INTEGER,
    volunteer_id INTEGER,
    quantity_deployed INTEGER,
    dispatched_at TIMESTAMP
);

-- Incident Skill Requirements
CREATE TABLE incident_skill_requirements (
    id SERIAL PRIMARY KEY,
    incident_id INTEGER,
    expertise_required VARCHAR,
    quantity_needed INTEGER,
    quantity_fulfilled INTEGER,
    status VARCHAR
);

-- Assessments
CREATE TABLE assessments (
    id SERIAL PRIMARY KEY,
    incident_id INTEGER,
    assessor_id INTEGER,
    damage_level TEXT,
    victims_dead INTEGER,
    victims_injured INTEGER,
    victims_displaced INTEGER,
    houses_destroyed INTEGER,
    houses_damaged INTEGER,
    notes TEXT,
    created_at TIMESTAMP
);

-- Building Assessments
CREATE TABLE building_assessments (
    id SERIAL PRIMARY KEY,
    nama_gedung VARCHAR,
    fungsi VARCHAR,
    fungsi_lain VARCHAR,
    alamat TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    imb VARCHAR,
    slf VARCHAR,
    odnk INTEGER,
    ibu_hamil INTEGER,
    lansia INTEGER,
    balita INTEGER,
    anak_anak INTEGER,
    dewasa_sehat INTEGER,
    pernah_terjadi BOOLEAN,
    ancaman JSONB,
    riwayat_desa TEXT,
    struktur VARCHAR,
    non_struktural VARCHAR,
    fasilitas JSONB,
    peralatan JSONB,
    dana_darurat VARCHAR,
    anggaran VARCHAR,
    asuransi VARCHAR,
    kerjasama TEXT,
    peduli VARCHAR,
    konflik BOOLEAN,
    section INTEGER,
    total_score INTEGER,
    completed BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    region VARCHAR
);

-- ============================================
-- COMMUNICATION TABLES
-- ============================================

-- Notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR,
    body TEXT,
    target_role VARCHAR,
    target_region VARCHAR,
    incident_id INTEGER,
    type VARCHAR,
    status VARCHAR,
    sent_at TIMESTAMP,
    created_at TIMESTAMP
);

-- Chat Conversations
CREATE TABLE chat_conversations (
    id SERIAL PRIMARY KEY,
    incident_id INTEGER,
    type VARCHAR,
    created_at TIMESTAMP
);

-- Chat Messages
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER,
    sender_id INTEGER,
    message TEXT,
    read_by ARRAY,
    created_at TIMESTAMP
);

-- Team Messages
CREATE TABLE team_messages (
    id SERIAL PRIMARY KEY,
    region VARCHAR,
    sender_id INTEGER,
    sender_name VARCHAR,
    message TEXT,
    created_at TIMESTAMP
);

-- ============================================
-- REPORTING TABLES
-- ============================================

-- Reports (Public)
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    report_code TEXT,
    reporter_name TEXT,
    reporter_phone TEXT,
    disaster_type VARCHAR,
    description TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    province TEXT,
    city TEXT,
    district TEXT,
    village TEXT,
    status VARCHAR,
    created_at TIMESTAMP
);

-- Intel News
CREATE TABLE intel_news (
    id SERIAL PRIMARY KEY,
    source VARCHAR,
    title TEXT,
    content TEXT,
    url TEXT,
    category VARCHAR,
    severity VARCHAR,
    ai_confidence DOUBLE PRECISION,
    created_at TIMESTAMP,
    region VARCHAR
);

-- Master Incidents
CREATE TABLE master_incidents (
    id SERIAL PRIMARY KEY,
    incident_code VARCHAR,
    title VARCHAR,
    disaster_type VARCHAR,
    region VARCHAR,
    latitude NUMERIC,
    longitude NUMERIC,
    status VARCHAR,
    master_summary TEXT,
    severity_score INTEGER,
    ai_validation_status VARCHAR,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Historical Disasters
CREATE TABLE historical_disasters (
    id SERIAL PRIMARY KEY,
    region VARCHAR NOT NULL,
    disaster_type VARCHAR NOT NULL,
    event_date DATE NOT NULL,
    latitude NUMERIC,
    longitude NUMERIC,
    time VARCHAR
);

-- Disaster Learning
CREATE TABLE disaster_learning (
    id SERIAL PRIMARY KEY,
    region VARCHAR NOT NULL,
    disaster_type VARCHAR NOT NULL,
    occurrence_count INTEGER,
    total_incidents_in_region INTEGER,
    avg_severity_score NUMERIC,
    last_incident_date TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- ============================================
-- AUDIT & TRACKING
-- ============================================

-- Audit Logs
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR,
    entity_type TEXT,
    entity_id INTEGER,
    created_at TIMESTAMP,
    actor_id INTEGER,
    payload JSONB
);

-- Actions
CREATE TABLE actions (
    id SERIAL PRIMARY KEY,
    incident_id INTEGER,
    action_type TEXT,
    description TEXT,
    status VARCHAR,
    created_by INTEGER,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_at TIMESTAMP
);

-- Deployments
CREATE TABLE deployments (
    id SERIAL PRIMARY KEY,
    incident_id INTEGER,
    volunteer_id INTEGER,
    role TEXT,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    status VARCHAR,
    created_at TIMESTAMP
);

-- Organizations
CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type VARCHAR NOT NULL,
    province TEXT,
    city TEXT,
    district TEXT,
    parent_id INTEGER,
    created_at TIMESTAMP
);

-- Command Posts
CREATE TABLE command_posts (
    id SERIAL PRIMARY KEY,
    name VARCHAR,
    latitude NUMERIC,
    longitude NUMERIC
);

-- News
CREATE TABLE news (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    source VARCHAR,
    category VARCHAR,
    date TIMESTAMP
);

-- Attachments
CREATE TABLE attachments (
    id SERIAL PRIMARY KEY,
    incident_id INTEGER,
    file_url TEXT,
    file_type VARCHAR,
    uploaded_by INTEGER,
    created_at TIMESTAMP
);

-- Incident Evidence
CREATE TABLE incident_evidence (
    id SERIAL PRIMARY KEY,
    master_id INTEGER,
    source_type VARCHAR,
    source_url TEXT,
    raw_content TEXT,
    created_at TIMESTAMP
);

-- Volunteer Details
CREATE TABLE volunteer_details (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    full_name VARCHAR,
    phone VARCHAR,
    birth_date DATE,
    gender VARCHAR,
    blood_type VARCHAR,
    regency VARCHAR,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    expertise ARRAY,
    experience TEXT,
    created_at TIMESTAMP
);

-- Inventory (Legacy)
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    type VARCHAR,
    quantity INTEGER,
    available_quantity INTEGER,
    unit VARCHAR,
    location_lat NUMERIC,
    location_lng NUMERIC,
    created_at TIMESTAMP
);