-- Fix checkin-photos storage bucket security vulnerability
-- Make the bucket private
UPDATE storage.buckets SET public = false WHERE id = 'checkin-photos';

-- Remove the overly permissive public access policy
DROP POLICY IF EXISTS "Public can view checkin photos" ON storage.objects;