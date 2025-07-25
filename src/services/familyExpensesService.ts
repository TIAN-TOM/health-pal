import { supabase } from '@/integrations/supabase/client';

export interface FamilyExpense {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  payer: string;
  description?: string;
  expense_date: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseStats {
  totalToday: number;
  totalThisMonth: number;
  totalThisYear: number;
  categoryStats: { category: string; amount: number; count: number }[];
}

export const familyExpensesService = {
  // 获取支出记录
  async getFamilyExpenses(limit?: number): Promise<FamilyExpense[]> {
    let query = supabase
      .from('family_expenses')
      .select('*')
      .order('expense_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('获取家庭支出失败:', error);
      throw error;
    }

    return data || [];
  },

  // 添加支出记录
  async addFamilyExpense(expense: Omit<FamilyExpense, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<FamilyExpense> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('用户未登录');

    const { data, error } = await supabase
      .from('family_expenses')
      .insert([{ ...expense, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error('添加家庭支出失败:', error);
      throw error;
    }

    return data;
  },

  // 删除支出记录
  async deleteFamilyExpense(id: string): Promise<void> {
    const { error } = await supabase
      .from('family_expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('删除家庭支出失败:', error);
      throw error;
    }
  },

  // 获取支出统计
  async getExpenseStats(): Promise<ExpenseStats> {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().slice(0, 7);
    const thisYear = new Date().getFullYear().toString();

    // 获取今日支出
    const { data: todayData } = await supabase
      .from('family_expenses')
      .select('amount')
      .eq('expense_date', today);

    // 获取本月支出
    const { data: monthData } = await supabase
      .from('family_expenses')
      .select('amount')
      .gte('expense_date', thisMonth + '-01')
      .lt('expense_date', new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().split('T')[0]);

    // 获取本年支出
    const { data: yearData } = await supabase
      .from('family_expenses')
      .select('amount')
      .gte('expense_date', thisYear + '-01-01')
      .lt('expense_date', (parseInt(thisYear) + 1) + '-01-01');

    // 获取分类统计
    const { data: categoryData } = await supabase
      .from('family_expenses')
      .select('category, amount')
      .gte('expense_date', thisMonth + '-01');

    const totalToday = todayData?.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0) || 0;
    const totalThisMonth = monthData?.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0) || 0;
    const totalThisYear = yearData?.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0) || 0;

    // 计算分类统计
    const categoryMap = new Map<string, { amount: number; count: number }>();
    categoryData?.forEach(item => {
      const existing = categoryMap.get(item.category) || { amount: 0, count: 0 };
      categoryMap.set(item.category, {
        amount: existing.amount + parseFloat(item.amount.toString()),
        count: existing.count + 1
      });
    });

    const categoryStats = Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category,
      amount: stats.amount,
      count: stats.count
    }));

    return {
      totalToday,
      totalThisMonth,
      totalThisYear,
      categoryStats
    };
  },

  // 获取常用支出人员
  async getFrequentPayers(): Promise<string[]> {
    const { data, error } = await supabase
      .from('family_expenses')
      .select('payer')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('获取常用支出人员失败:', error);
      return [];
    }

    // 统计频次并返回前5个
    const payerCount = new Map<string, number>();
    data?.forEach(item => {
      payerCount.set(item.payer, (payerCount.get(item.payer) || 0) + 1);
    });

    return Array.from(payerCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([payer]) => payer);
  }
};

export const EXPENSE_CATEGORIES = [
  '餐饮', '交通', '购物', '娱乐', '医疗', '教育',
  '住房', '水电费', '通讯费', '保险', '投资', '其他'
];