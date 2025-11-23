-- 为倒数日表添加个性化字段
ALTER TABLE countdown_events
ADD COLUMN IF NOT EXISTS background_image TEXT,
ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT 'purple';

-- 添加注释说明
COMMENT ON COLUMN countdown_events.background_image IS '背景图片URL';
COMMENT ON COLUMN countdown_events.theme_color IS '主题颜色：purple, blue, pink, orange, green, red';

-- 创建天气预警表
CREATE TABLE IF NOT EXISTS weather_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  city_name TEXT NOT NULL,
  alert_type TEXT NOT NULL, -- 'heavy_rain', 'typhoon', 'high_temp', 'low_temp', 'thunderstorm'
  alert_message TEXT NOT NULL,
  weather_code INTEGER NOT NULL,
  temperature NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  is_read BOOLEAN DEFAULT false
);

-- 启用RLS
ALTER TABLE weather_alerts ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
CREATE POLICY "Users can view their own weather alerts"
ON weather_alerts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own weather alerts"
ON weather_alerts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can insert weather alerts"
ON weather_alerts FOR INSERT
WITH CHECK (true);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_weather_alerts_user_id ON weather_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_weather_alerts_created_at ON weather_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_weather_alerts_is_read ON weather_alerts(is_read);