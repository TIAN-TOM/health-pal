-- Add birthday and family_medical_history to user_preferences table
ALTER TABLE public.user_preferences 
ADD COLUMN birthday date,
ADD COLUMN family_medical_history text[];