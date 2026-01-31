-- Fix weather_alerts INSERT policy security vulnerability
-- Remove the overly permissive INSERT policy
DROP POLICY IF EXISTS "System can insert weather alerts" ON weather_alerts;

-- Create a secure INSERT policy that only allows users to insert their own alerts
CREATE POLICY "Users can insert their own weather alerts" 
ON weather_alerts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Also add DELETE policy so users can clean up their own alerts
CREATE POLICY "Users can delete their own weather alerts" 
ON weather_alerts 
FOR DELETE 
USING (auth.uid() = user_id);