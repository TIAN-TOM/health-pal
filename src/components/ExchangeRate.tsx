
import { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, TrendingUp, TrendingDown, Calculator, DollarSign, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { exchangeRateService } from '@/services/exchangeRateService';

interface ExchangeRateProps {
  onBack: () => void;
}

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

const ExchangeRate = ({ onBack }: ExchangeRateProps) => {
  const [data, setData] = useState<ExchangeRateData | null>(null);
  const [allRates, setAllRates] = useState<AllRatesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [calculatorAmount, setCalculatorAmount] = useState<string>('100');
  const [calculatorFrom, setCalculatorFrom] = useState<string>('AUD');
  const [calculatorTo, setCalculatorTo] = useState<string>('CNY');

  const fetchExchangeRate = async () => {
    setLoading(true);
    setError(null);

    try {
      // 获取AUD到CNY的汇率（主要显示）
      const newData = await exchangeRateService.getAUDToCNYRate();
      
      // 获取所有货币汇率（用于计算器）
      const allRatesData = await exchangeRateService.getAllRates('USD');
      
      // 计算变化
      let change = undefined;
      if (data) {
        change = exchangeRateService.calculateChange(newData.rate, data.rate);
      }

      setData({
        ...newData,
        change
      });
      setAllRates(allRatesData);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Exchange rate fetch error:', err);
      setError('无法获取实时汇率，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeRate();

    // 自动刷新每2分钟
    const interval = setInterval(fetchExchangeRate, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTrendIcon = () => {
    if (!data?.change) return null;

    if (data.change > 0) {
      return <TrendingUp className="h-3 w-3 text-green-600" />;
    } else if (data.change < 0) {
      return <TrendingDown className="h-3 w-3 text-red-600" />;
    }
    return null;
  };

  const getTrendColor = () => {
    if (!data?.change) return 'secondary';
    return data.change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const calculateResult = () => {
    if (!allRates || !calculatorAmount) return '0.00';
    
    const amount = parseFloat(calculatorAmount);
    if (isNaN(amount)) return '0.00';

    try {
      const result = exchangeRateService.convertCurrency(
        amount, 
        calculatorFrom, 
        calculatorTo, 
        allRates.rates, 
        allRates.base
      );
      return result.toFixed(2);
    } catch (error) {
      console.error('Currency conversion error:', error);
      return '0.00';
    }
  };

  const currencySymbols = {
    AUD: 'A$',
    CNY: '¥',
    USD: '$',
    EUR: '€',
    GBP: '£'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <h1 className="text-xl font-bold text-gray-800">实时汇率</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchExchangeRate}
            disabled={loading}
            className="text-gray-600 hover:text-gray-800"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* 周末提示 */}
        {exchangeRateService.isWeekend() && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              当前为周末时间，外汇市场休市，显示的汇率为上一个交易日的数据。
            </AlertDescription>
          </Alert>
        )}

        {/* 主汇率卡片 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
              澳币 → 人民币
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchExchangeRate} variant="outline">
                  重试
                </Button>
              </div>
            ) : loading && !data ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">获取汇率中...</p>
              </div>
            ) : data ? (
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800 mb-2">
                  1 AUD = {data.rate.toFixed(4)} CNY
                </div>
                
                {data.change !== undefined && (
                  <div className="flex justify-center mb-4">
                    <Badge className={`flex items-center gap-1 ${getTrendColor()}`}>
                      {getTrendIcon()}
                      {data.change > 0 ? '+' : ''}{data.change.toFixed(2)}%
                    </Badge>
                  </div>
                )}

                <p className="text-sm text-gray-600">
                  {lastUpdate ? `更新于 ${formatTime(lastUpdate)}` : '实时汇率'}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* 增强版计算器 */}
        {allRates && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Calculator className="h-5 w-5 mr-2 text-green-600" />
                汇率计算器
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">金额</label>
                  <Input
                    type="number"
                    value={calculatorAmount}
                    onChange={(e) => setCalculatorAmount(e.target.value)}
                    placeholder="输入金额"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">从</label>
                  <Select value={calculatorFrom} onValueChange={setCalculatorFrom}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AUD">澳币 (AUD)</SelectItem>
                      <SelectItem value="CNY">人民币 (CNY)</SelectItem>
                      <SelectItem value="USD">美元 (USD)</SelectItem>
                      <SelectItem value="EUR">欧元 (EUR)</SelectItem>
                      <SelectItem value="GBP">英镑 (GBP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">到</label>
                  <Select value={calculatorTo} onValueChange={setCalculatorTo}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CNY">人民币 (CNY)</SelectItem>
                      <SelectItem value="AUD">澳币 (AUD)</SelectItem>
                      <SelectItem value="USD">美元 (USD)</SelectItem>
                      <SelectItem value="EUR">欧元 (EUR)</SelectItem>
                      <SelectItem value="GBP">英镑 (GBP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">结果</label>
                  <div className="p-2 bg-gray-50 rounded border text-lg font-semibold">
                    {currencySymbols[calculatorTo as keyof typeof currencySymbols] || ''}{calculateResult()}
                  </div>
                </div>
              </div>

              <div className="text-center text-sm text-gray-500">
                {calculatorAmount} {calculatorFrom} = {calculateResult()} {calculatorTo}
              </div>
              
              {allRates.base !== 'USD' && (
                <div className="text-xs text-gray-400 text-center">
                  * 通过 {allRates.base} 基准汇率计算
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 快速换算 */}
        {data && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">快速换算</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">澳币</p>
                  <div className="text-2xl font-bold text-blue-600">A$100</div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">人民币</p>
                  <div className="text-2xl font-bold text-green-600">
                    ¥{(100 * data.rate).toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">澳币</p>
                  <div className="text-xl font-semibold text-blue-600">A$1,000</div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">人民币</p>
                  <div className="text-xl font-semibold text-green-600">
                    ¥{(1000 * data.rate).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">澳币</p>
                  <div className="text-lg font-medium text-blue-600">A$10,000</div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">人民币</p>
                  <div className="text-lg font-medium text-green-600">
                    ¥{(10000 * data.rate).toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 信息卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">汇率信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">数据来源</span>
                <span className="text-gray-800">实时汇率API</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">更新频率</span>
                <span className="text-gray-800">每2分钟</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">货币对</span>
                <span className="text-gray-800">AUD/CNY</span>
              </div>
              {lastUpdate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">最后更新</span>
                  <span className="text-gray-800">
                    {lastUpdate.toLocaleString('zh-CN')}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExchangeRate;
