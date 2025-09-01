-- Add last_birthday_wish_year field to user_preferences table
ALTER TABLE public.user_preferences 
ADD COLUMN last_birthday_wish_year integer;

-- Add comment for the new column
COMMENT ON COLUMN public.user_preferences.last_birthday_wish_year IS 'Year when user last received birthday wish to prevent duplicate wishes';