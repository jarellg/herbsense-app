/*
  # Fix Security and Performance Issues

  1. Performance Improvements
    - Add missing index on audit_logs.actor foreign key
    - Optimize RLS policies to use subqueries for auth.uid()
    - Fix function search_path mutability
    
  2. Changes Made
    - Add index: audit_logs_actor_idx on audit_logs(actor)
    - Recreate all RLS policies with (select auth.uid()) pattern
    - Update update_updated_at_column function with stable search_path
    
  3. Security
    - All RLS policies now use optimized auth checks
    - Function has immutable search_path
    
  4. Notes
    - Unused indexes are kept (they may be used in future or in ways not detected)
    - Anonymous access warnings are intentional for public data like monographs
*/

-- Add missing index on audit_logs foreign key
CREATE INDEX IF NOT EXISTS audit_logs_actor_idx ON public.audit_logs(actor);

-- Drop existing RLS policies that need optimization
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own entitlement" ON public.entitlements;
DROP POLICY IF EXISTS "Users can insert own scans" ON public.scans;
DROP POLICY IF EXISTS "Users can view own scans" ON public.scans;
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can add favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;

-- Recreate profiles policies with optimized auth checks
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

-- Recreate entitlements policies with optimized auth checks
CREATE POLICY "Users can view own entitlement"
  ON public.entitlements
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Recreate scans policies with optimized auth checks
CREATE POLICY "Users can insert own scans"
  ON public.scans
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can view own scans"
  ON public.scans
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Recreate favorites policies with optimized auth checks
CREATE POLICY "Users can view own favorites"
  ON public.favorites
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can add favorites"
  ON public.favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own favorites"
  ON public.favorites
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Fix function search_path mutability
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers that were dropped with CASCADE
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_entitlements_updated_at
  BEFORE UPDATE ON public.entitlements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scans_updated_at
  BEFORE UPDATE ON public.scans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_monographs_updated_at
  BEFORE UPDATE ON public.monographs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();