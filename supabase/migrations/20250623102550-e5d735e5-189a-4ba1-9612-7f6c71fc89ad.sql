
-- 修复 user_preferences 表的唯一约束问题
-- 删除可能存在的重复记录，只保留最新的一条
DELETE FROM user_preferences 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id 
  FROM user_preferences 
  ORDER BY user_id, updated_at DESC
);

-- 确保唯一约束存在
ALTER TABLE user_preferences 
DROP CONSTRAINT IF EXISTS user_preferences_user_id_key;

ALTER TABLE user_preferences 
ADD CONSTRAINT user_preferences_user_id_key UNIQUE (user_id);

-- 添加更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
