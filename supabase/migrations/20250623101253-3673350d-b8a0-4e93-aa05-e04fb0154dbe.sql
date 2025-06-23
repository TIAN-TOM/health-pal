
-- 修复 user_preferences 表的性别字段约束
-- 删除现有的约束并重新创建，包含所有有效的性别选项
ALTER TABLE user_preferences DROP CONSTRAINT IF EXISTS user_preferences_gender_check;

-- 添加新的约束，包含所有有效选项
ALTER TABLE user_preferences ADD CONSTRAINT user_preferences_gender_check 
CHECK (gender IS NULL OR gender IN ('male', 'female', 'other', 'prefer_not_to_say'));
