/*
  # HerbSense Database Schema

  ## Overview
  Complete schema for HerbSense plant identification and herbal monograph platform.
  Implements secure RLS policies, user profiles, scan tracking, favorites, and comprehensive monograph data.

  ## New Tables Created
  
  ### 1. profiles
  - `id` (uuid, pk, references auth.users) - User ID from Supabase Auth
  - `created_at` (timestamptz) - Account creation timestamp
  - `plan` (text) - Subscription plan ('free' or 'pro')
  - `updated_at` (timestamptz) - Last profile update
  
  ### 2. entitlements
  - `user_id` (uuid, pk, references profiles) - User reference
  - `is_pro` (boolean) - Pro subscription status
  - `period_end` (timestamptz) - Subscription period end date
  - `stripe_customer_id` (text) - Stripe customer reference
  - `stripe_subscription_id` (text) - Stripe subscription reference
  - `updated_at` (timestamptz) - Last entitlement update

  ### 3. scans
  - `id` (uuid, pk) - Unique scan identifier
  - `user_id` (uuid) - User who performed the scan
  - `created_at` (timestamptz) - Scan timestamp
  - `top_species` (text) - Top identified species name
  - `top_common_name` (text) - Common name of top result
  - `confidence` (numeric) - Confidence score (0-1)
  - `thumbnail_url` (text) - URL to result thumbnail
  - `raw_json` (jsonb) - Full provider response data

  ### 4. favorites
  - `id` (uuid, pk) - Unique favorite identifier
  - `user_id` (uuid) - User reference
  - `species` (text) - Species scientific name
  - `common_name` (text) - Species common name
  - `thumbnail_url` (text) - Thumbnail URL
  - `created_at` (timestamptz) - When favorited

  ### 5. monographs
  - `id` (uuid, pk) - Unique monograph identifier
  - `species` (text, unique) - Scientific species name
  - `common_name` (text) - Common name
  - `taxonomy` (jsonb) - Taxonomic classification data
  - `overview` (text) - General description
  - `medicinal_properties` (jsonb) - Array of medicinal uses with evidence
  - `preparations` (jsonb) - Array of preparation methods
  - `dosage_guidance` (text) - Conservative dosage recommendations
  - `contraindications` (jsonb) - Array of contraindication strings
  - `interactions` (jsonb) - Array of drug/herb interactions
  - `toxicity` (text) - Toxicity information
  - `evidence_level` (text) - Overall evidence grade (A/B/C/D)
  - `safety_notes` (jsonb) - Array of safety warnings
  - `region_notes` (jsonb) - Array of regional information
  - `created_at`, `updated_at` (timestamptz) - Timestamps

  ### 6. citations
  - `id` (uuid, pk) - Unique citation identifier
  - `monograph_id` (uuid) - References monograph
  - `source_name` (text) - Citation source title
  - `authors` (text) - Author names
  - `year` (text) - Publication year
  - `url` (text) - Link to source
  - `publisher` (text) - Publishing organization
  - `pages` (text) - Page numbers
  - `note` (text) - Additional citation notes
  - `created_at` (timestamptz) - Citation creation time

  ### 7. audit_logs
  - `id` (uuid, pk) - Unique log identifier
  - `actor` (uuid) - User who performed action
  - `action` (text) - Action type (create/update/delete)
  - `entity` (text) - Entity type (monograph/citation)
  - `entity_id` (uuid) - ID of affected entity
  - `created_at` (timestamptz) - Action timestamp
  - `meta` (jsonb) - Additional action metadata

  ## Security
  - All tables have RLS enabled
  - Users can only access their own data (profiles, entitlements, scans, favorites)
  - Monographs and citations are publicly readable
  - Only service_role can write to monographs, citations, and audit_logs
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  plan text DEFAULT 'free' NOT NULL CHECK (plan IN ('free', 'pro')),
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Entitlements table
CREATE TABLE IF NOT EXISTS entitlements (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  is_pro boolean DEFAULT false NOT NULL,
  period_end timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;

-- Scans table
CREATE TABLE IF NOT EXISTS scans (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  top_species text,
  top_common_name text,
  confidence numeric CHECK (confidence >= 0 AND confidence <= 1),
  thumbnail_url text,
  raw_json jsonb
);

CREATE INDEX IF NOT EXISTS scans_user_id_created_at_idx ON scans(user_id, created_at DESC);

ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  species text NOT NULL,
  common_name text,
  thumbnail_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, species)
);

CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON favorites(user_id);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Monographs table
CREATE TABLE IF NOT EXISTS monographs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  species text UNIQUE NOT NULL,
  common_name text NOT NULL,
  taxonomy jsonb DEFAULT '{}',
  overview text,
  medicinal_properties jsonb DEFAULT '[]',
  preparations jsonb DEFAULT '[]',
  dosage_guidance text,
  contraindications jsonb DEFAULT '[]',
  interactions jsonb DEFAULT '[]',
  toxicity text,
  evidence_level text CHECK (evidence_level IN ('A', 'B', 'C', 'D')),
  safety_notes jsonb DEFAULT '[]',
  region_notes jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS monographs_species_idx ON monographs(species);

ALTER TABLE monographs ENABLE ROW LEVEL SECURITY;

-- Citations table
CREATE TABLE IF NOT EXISTS citations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  monograph_id uuid REFERENCES monographs(id) ON DELETE CASCADE NOT NULL,
  source_name text NOT NULL,
  authors text,
  year text,
  url text,
  publisher text,
  pages text,
  note text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS citations_monograph_id_idx ON citations(monograph_id);

ALTER TABLE citations ENABLE ROW LEVEL SECURITY;

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id uuid,
  created_at timestamptz DEFAULT now() NOT NULL,
  meta jsonb DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_entity_idx ON audit_logs(entity, entity_id);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entitlements_updated_at
  BEFORE UPDATE ON entitlements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monographs_updated_at
  BEFORE UPDATE ON monographs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
