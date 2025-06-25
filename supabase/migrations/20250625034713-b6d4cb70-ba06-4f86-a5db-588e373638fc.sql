
-- 创建糖尿病记录表
CREATE TABLE public.diabetes_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  blood_sugar DECIMAL(4,1) NOT NULL,
  measurement_time TEXT NOT NULL DEFAULT 'before_meal',
  insulin_dose TEXT,
  medication TEXT,
  diet TEXT,
  exercise TEXT,
  note TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 启用行级安全策略
ALTER TABLE public.diabetes_records ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看自己的记录
CREATE POLICY "Users can view their own diabetes records" 
  ON public.diabetes_records 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- 创建策略：用户只能创建自己的记录
CREATE POLICY "Users can create their own diabetes records" 
  ON public.diabetes_records 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 创建策略：用户只能更新自己的记录
CREATE POLICY "Users can update their own diabetes records" 
  ON public.diabetes_records 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- 创建策略：用户只能删除自己的记录
CREATE POLICY "Users can delete their own diabetes records" 
  ON public.diabetes_records 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- 创建更新触发器
CREATE TRIGGER update_diabetes_records_updated_at
    BEFORE UPDATE ON public.diabetes_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
