/*
  # Row Level Security Policies

  ## Security Model
  
  ### User Data Tables (profiles, entitlements, scans, favorites)
  - Users can only SELECT and UPDATE their own data
  - User data is tied to auth.uid()
  - INSERT operations create user-owned records
  
  ### Public Content (monographs, citations)
  - All authenticated users can SELECT
  - Only service_role can INSERT, UPDATE, DELETE
  - Public read access for educational content
  
  ### Audit Logs
  - Only service_role can write
  - Admin users can read their own logs
  
  ## Policies by Table
  
  ### profiles
  1. Users can view their own profile
  2. Users can update their own profile
  3. New users can insert their own profile
  
  ### entitlements
  1. Users can view their own entitlement status
  2. Service role manages entitlement updates (via webhook)
  
  ### scans
  1. Users can insert their own scans
  2. Users can view their own scan history
  
  ### favorites
  1. Users can view their own favorites
  2. Users can add favorites
  3. Users can remove their own favorites
  
  ### monographs
  1. All authenticated users can read monographs
  2. Public read access (for SEO/sharing)
  
  ### citations
  1. All authenticated users can read citations
  2. Public read access
  
  ### audit_logs
  1. No direct user access (service_role only)
*/

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Entitlements policies
CREATE POLICY "Users can view own entitlement"
  ON entitlements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Scans policies
CREATE POLICY "Users can insert own scans"
  ON scans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own scans"
  ON scans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Favorites policies
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Monographs policies (public read, authenticated users)
CREATE POLICY "Authenticated users can view monographs"
  ON monographs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public can view monographs"
  ON monographs FOR SELECT
  TO anon
  USING (true);

-- Citations policies (public read)
CREATE POLICY "Authenticated users can view citations"
  ON citations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public can view citations"
  ON citations FOR SELECT
  TO anon
  USING (true);

-- Audit logs policies (no user access, service role only handles writes)
CREATE POLICY "Service role full access to audit logs"
  ON audit_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
