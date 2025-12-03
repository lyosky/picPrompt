-- 插入一级分类
INSERT INTO categories (name, description) VALUES 
('人物写真', '包括人像摄影、Cosplay、街拍等'),
('风景建筑', '自然风光、城市建筑、室内设计等'),
('二次元/动漫', '日系动漫、插画、游戏角色等'),
('艺术风格', '油画、水彩、赛博朋克、超现实主义等'),
('Logo/图标', '标志设计、App图标、矢量图等'),
('产品设计', '工业设计、包装设计、3D渲染等');

-- 插入二级分类 (需要根据一级分类ID插入，这里使用子查询动态获取ID)
-- 人物写真子分类
INSERT INTO categories (name, parent_id, description) 
SELECT '写实人像', id, '逼真的照片级人像' FROM categories WHERE name = '人物写真';

INSERT INTO categories (name, parent_id, description) 
SELECT '古风汉服', id, '中国传统服饰风格' FROM categories WHERE name = '人物写真';

-- 风景建筑子分类
INSERT INTO categories (name, parent_id, description) 
SELECT '赛博朋克城市', id, '未来科幻风格城市' FROM categories WHERE name = '风景建筑';

INSERT INTO categories (name, parent_id, description) 
SELECT '自然风光', id, '山川湖海、森林等' FROM categories WHERE name = '风景建筑';

-- 二次元子分类
INSERT INTO categories (name, parent_id, description) 
SELECT '日系动漫', id, '典型日本动画风格' FROM categories WHERE name = '二次元/动漫';

INSERT INTO categories (name, parent_id, description) 
SELECT '游戏原画', id, '高质量游戏角色与场景' FROM categories WHERE name = '二次元/动漫';

-- 艺术风格子分类
INSERT INTO categories (name, parent_id, description) 
SELECT '油画风格', id, '经典油画质感' FROM categories WHERE name = '艺术风格';

INSERT INTO categories (name, parent_id, description) 
SELECT '水彩画', id, '清新水彩风格' FROM categories WHERE name = '艺术风格';
