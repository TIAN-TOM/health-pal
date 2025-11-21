-- 添加天气城市偏好字段到 user_preferences 表
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS preferred_weather_city text,
ADD COLUMN IF NOT EXISTS preferred_weather_city2 text;

-- 添加注释
COMMENT ON COLUMN public.user_preferences.preferred_weather_city IS '用户首选天气城市';
COMMENT ON COLUMN public.user_preferences.preferred_weather_city2 IS '用户第二选天气城市（对比用）';