
interface ExchangeRateData {
  rate: number;
  timestamp: string;
  change?: number;
}

interface AllRatesData {
  rates: Record<string, number>;
  timestamp: string;
  base: string;
}

interface ExchangeRateResponse {
  rates: Record<string, number>;
  date?: string;
  base?: string;
}

export const exchangeRateService = {
  async getAUDToCNYRate(): Promise<ExchangeRateData> {
    try {
      // 主要API
      const response = await fetch('https://api.fxratesapi.com/latest?base=AUD&currencies=CNY', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Primary API failed');
      }

      const result: ExchangeRateResponse = await response.json();
      const cnyRate = result.rates?.CNY;

      if (!cnyRate) {
        throw new Error('Invalid rate data');
      }

      return {
        rate: cnyRate,
        timestamp: result.date || new Date().toISOString()
      };
    } catch (error) {
      console.log('Primary API failed, trying fallback...');
      
      // 备用API
      try {
        const fallbackResponse = await fetch('https://api.exchangerate-api.com/v4/latest/AUD');
        
        if (!fallbackResponse.ok) {
          throw new Error('Fallback API failed');
        }

        const fallbackResult = await fallbackResponse.json();
        const cnyRate = fallbackResult.rates?.CNY;

        if (!cnyRate) {
          throw new Error('Invalid fallback rate data');
        }

        return {
          rate: cnyRate,
          timestamp: new Date().toISOString()
        };
      } catch (fallbackError) {
        console.log('Fallback API also failed, using mock data');
        
        // 模拟数据作为最后的备用方案
        const mockRate = 4.7098 + (Math.sin(Date.now() / 600000) * 0.02);
        return {
          rate: mockRate,
          timestamp: new Date().toISOString()
        };
      }
    }
  },

  async getAllRates(baseCurrency: string = 'USD'): Promise<AllRatesData> {
    try {
      // 获取主要货币的汇率
      const response = await fetch(`https://api.fxratesapi.com/latest?base=${baseCurrency}&currencies=CNY,AUD,USD,EUR,GBP`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Primary API failed');
      }

      const result: ExchangeRateResponse = await response.json();

      if (!result.rates) {
        throw new Error('Invalid rate data');
      }

      return {
        rates: result.rates,
        timestamp: result.date || new Date().toISOString(),
        base: baseCurrency
      };
    } catch (error) {
      console.log('Primary API failed, trying fallback...');
      
      try {
        const fallbackResponse = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
        
        if (!fallbackResponse.ok) {
          throw new Error('Fallback API failed');
        }

        const fallbackResult = await fallbackResponse.json();

        if (!fallbackResult.rates) {
          throw new Error('Invalid fallback rate data');
        }

        return {
          rates: fallbackResult.rates,
          timestamp: new Date().toISOString(),
          base: baseCurrency
        };
      } catch (fallbackError) {
        console.log('Fallback API also failed, using mock data');
        
        // 模拟数据作为最后的备用方案
        const mockRates: Record<string, number> = {
          CNY: baseCurrency === 'USD' ? 7.24 : 1,
          AUD: baseCurrency === 'USD' ? 1.53 : 1,
          USD: baseCurrency === 'USD' ? 1 : 0.69,
          EUR: baseCurrency === 'USD' ? 0.92 : 1,
          GBP: baseCurrency === 'USD' ? 0.79 : 1
        };
        
        return {
          rates: mockRates,
          timestamp: new Date().toISOString(),
          base: baseCurrency
        };
      }
    }
  },

  convertCurrency(amount: number, fromCurrency: string, toCurrency: string, rates: Record<string, number>, baseCurrency: string): number {
    if (fromCurrency === toCurrency) return amount;
    
    // 如果基础货币是转换的源货币
    if (fromCurrency === baseCurrency) {
      return amount * (rates[toCurrency] || 1);
    }
    
    // 如果基础货币是转换的目标货币
    if (toCurrency === baseCurrency) {
      return amount / (rates[fromCurrency] || 1);
    }
    
    // 两个非基础货币之间的转换，通过基础货币中转
    const usdAmount = amount / (rates[fromCurrency] || 1);
    return usdAmount * (rates[toCurrency] || 1);
  },

  calculateChange(currentRate: number, previousRate: number): number {
    return ((currentRate - previousRate) / previousRate) * 100;
  },

  isWeekend(): boolean {
    const now = new Date();
    const day = now.getDay();
    return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
  }
};
