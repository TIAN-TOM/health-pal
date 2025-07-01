
-- 首先删除所有购买记录（如果有的话）
DELETE FROM user_purchases;

-- 然后删除所有商品
DELETE FROM points_store_items;

-- 删除旧的检查约束（如果存在）
ALTER TABLE points_store_items DROP CONSTRAINT IF EXISTS points_store_items_item_type_check;

-- 创建新的检查约束，包含所有需要的类型
ALTER TABLE points_store_items ADD CONSTRAINT points_store_items_item_type_check 
CHECK (item_type IN ('game_skin', 'virtual_badge', 'unlock_feature', 'makeup_card'));

-- 添加新的商品
INSERT INTO points_store_items (item_name, item_description, item_type, price_points, stock_quantity, is_available) 
VALUES 
('五子棋经典皮肤', '为五子棋游戏启用经典木质纹理棋盘，提升游戏体验', 'game_skin', 200, -1, true),
('补签卡', '可以补签过去错过的打卡日期，保持连续打卡记录', 'makeup_card', 50, -1, true),
('打卡达人徽章', '专属徽章，彰显您的打卡毅力和坚持精神', 'virtual_badge', 100, -1, true),
('呼吸练习增强版', '解锁更多呼吸练习模式和个性化设置', 'unlock_feature', 150, -1, true),
('英语学习进阶', '解锁高难度英语学习内容和专属练习模式', 'unlock_feature', 300, -1, true);
