-- CivicSolve V2 Normalized Database Schema
-- Compatible with both PostgreSQL 16 and SQLite 3

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('NEEDER', 'PROVIDER', 'ADMIN')),
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE TABLE IF NOT EXISTS user_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash TEXT UNIQUE NOT NULL,
  device_info TEXT,
  ip_address TEXT,
  is_revoked INTEGER NOT NULL DEFAULT 0,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_hash ON user_sessions(refresh_token_hash);

CREATE TABLE IF NOT EXISTS provider_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('INDIVIDUAL', 'FREELANCER', 'BUSINESS', 'STUDENT', 'FACULTY', 'TECH_CLUB')),
  business_name TEXT,
  professional_title TEXT NOT NULL,
  bio TEXT,
  experience_years REAL NOT NULL DEFAULT 0,
  service_mode TEXT NOT NULL CHECK (service_mode IN ('HOME_VISIT', 'SERVICE_CENTER', 'BOTH')),
  service_radius_km REAL NOT NULL DEFAULT 10.0 CHECK (service_radius_km > 0 AND service_radius_km <= 100),
  is_verified INTEGER NOT NULL DEFAULT 0,
  verification_badge TEXT,
  rating_avg REAL NOT NULL DEFAULT 5.00 CHECK (rating_avg >= 1.0 AND rating_avg <= 5.0),
  review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_provider_user ON provider_profiles(user_id);

CREATE TABLE IF NOT EXISTS provider_locations (
  id TEXT PRIMARY KEY,
  provider_id TEXT UNIQUE NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  address_line TEXT,
  area TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT,
  is_public INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_prov_loc_coords ON provider_locations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_prov_loc_city ON provider_locations(city);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  default_pricing_unit TEXT NOT NULL DEFAULT 'PER_SERVICE',
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);

CREATE TABLE IF NOT EXISTS service_aliases (
  id TEXT PRIMARY KEY,
  service_id TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  alias TEXT UNIQUE NOT NULL,
  weight REAL NOT NULL DEFAULT 1.0
);

CREATE INDEX IF NOT EXISTS idx_service_aliases_alias ON service_aliases(alias);

CREATE TABLE IF NOT EXISTS provider_services (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  custom_title TEXT,
  custom_description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  UNIQUE(provider_id, service_id)
);

CREATE INDEX IF NOT EXISTS idx_prov_services_provider ON provider_services(provider_id);
CREATE INDEX IF NOT EXISTS idx_prov_services_service ON provider_services(service_id);

CREATE TABLE IF NOT EXISTS service_pricing (
  id TEXT PRIMARY KEY,
  provider_service_id TEXT UNIQUE NOT NULL REFERENCES provider_services(id) ON DELETE CASCADE,
  starting_price REAL CHECK (starting_price >= 0),
  typical_min REAL CHECK (typical_min >= 0),
  typical_max REAL,
  pricing_unit TEXT NOT NULL CHECK (pricing_unit IN ('PER_SERVICE', 'PER_HOUR', 'PER_DAY', 'PER_SQFT', 'PER_ITEM', 'PER_KM', 'CUSTOM')),
  pricing_notes TEXT,
  CHECK (typical_min IS NULL OR typical_max IS NULL OR typical_min <= typical_max)
);

CREATE TABLE IF NOT EXISTS provider_availability (
  id TEXT PRIMARY KEY,
  provider_id TEXT UNIQUE NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'BUSY', 'OFFLINE')),
  status_note TEXT,
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX IF NOT EXISTS idx_prov_availability_status ON provider_availability(status);

CREATE TABLE IF NOT EXISTS service_requests (
  id TEXT PRIMARY KEY,
  request_number TEXT UNIQUE NOT NULL,
  needer_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  provider_id TEXT NOT NULL REFERENCES provider_profiles(id) ON DELETE RESTRICT,
  service_id TEXT NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  service_mode TEXT NOT NULL CHECK (service_mode IN ('HOME_VISIT', 'SERVICE_CENTER')),
  preferred_schedule TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED', 'REVIEWED')),
  estimated_price REAL,
  final_price REAL,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX IF NOT EXISTS idx_requests_needer ON service_requests(needer_id);
CREATE INDEX IF NOT EXISTS idx_requests_provider ON service_requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON service_requests(status);

CREATE TABLE IF NOT EXISTS request_locations (
  id TEXT PRIMARY KEY,
  request_id TEXT UNIQUE NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  address_line TEXT NOT NULL,
  area TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT
);

CREATE TABLE IF NOT EXISTS request_status_history (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  note TEXT,
  changed_by_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX IF NOT EXISTS idx_status_history_request ON request_status_history(request_id);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  request_id TEXT UNIQUE NOT NULL REFERENCES service_requests(id) ON DELETE RESTRICT,
  needer_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  provider_id TEXT NOT NULL REFERENCES provider_profiles(id) ON DELETE RESTRICT,
  problem_solved INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX IF NOT EXISTS idx_reviews_provider ON reviews(provider_id);

CREATE TABLE IF NOT EXISTS verification_attestations (
  id TEXT PRIMARY KEY,
  provider_id TEXT UNIQUE NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  attestation_type TEXT NOT NULL CHECK (attestation_type IN ('CAMPUS_EMAIL', 'BUSINESS_REG', 'PORTFOLIO_LINK')),
  reference_data TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED')),
  verified_by_admin_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  verified_at TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS matching_configuration (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  weight REAL NOT NULL CHECK (weight >= 0 AND weight <= 1.0),
  description TEXT,
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  ip_address TEXT,
  details_json TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);

CREATE TABLE IF NOT EXISTS unmet_requirements (
  id TEXT PRIMARY KEY,
  raw_query TEXT NOT NULL,
  detected_category TEXT,
  detected_service TEXT,
  needer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  city TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);
