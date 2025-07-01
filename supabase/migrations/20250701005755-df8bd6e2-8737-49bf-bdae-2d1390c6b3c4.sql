
-- 查看现有的 item_type 值
SELECT item_type, COUNT(*) 
FROM points_store_items 
GROUP BY item_type;

-- 查看所有商品的详细信息
SELECT id, item_name, item_type, price_points, is_available 
FROM points_store_items 
ORDER BY created_at;
