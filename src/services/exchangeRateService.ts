
// 汇率服务
export interface ExchangeRateData {
  rate: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
  trend: 'up' | 'down' | 'stable';
}

export const exchangeRateService = {
  // 获取澳币兑人民币汇率
  async getAUDtoCNYRate(): Promise<ExchangeRateData> {
    try {
      // 模拟API调用 - 在实际应用中，这里应该调用真实的汇率API
      // 例如：exchangerate-api.com, fixer.io, 或其他汇率服务
      
      // 模拟数据
      const mockRate = 4.85 + (Math.random() - 0.5) * 0.2; // 4.75 - 4.95 之间
      const mockChange = (Math.random() - 0.5) * 0.1; // -0.05 到 0.05
      const mockChangePercent = (mockChange / mockRate) * 100;
      
      return {
        rate: Number(mockRate.toFixed(4)),
        change: Number(mockChange.toFixed(4)),
        changePercent: Number(mockChangePercent.toFixed(2)),
        lastUpdated: new Date().toISOString(),
        trend: mockChange > 0.01 ? 'up' : mockChange < -0.01 ? 'down' : 'stable'
      };
    } catch (error) {
      console.error('获取汇率失败:', error);
      
      // 返回备用数据
      return {
        rate: 4.85,
        change: 0,
        changePercent: 0,
        lastUpdated: new Date().toISOString(),
        trend: 'stable'
      };
    }
  },

  // 计算汇率转换
  convertAUDtoCNY(audAmount: number, rate: number): number {
    return Number((audAmount * rate).toFixed(2));
  },

  convertCNYtoAUD(cnyAmount: number, rate: number): number {
    return Number((cnyAmount / rate).toFixed(2));
  }
};
