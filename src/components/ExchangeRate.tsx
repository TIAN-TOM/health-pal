
import { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, TrendingUp, TrendingDown, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { exchangeRateService } from '@/services/exchangeRateService';

interface ExchangeRateProps {
  onBack: () => void;
}

interface ExchangeRateData {
  rate: number;
  timestamp: string;
  change?: number;
}

const ExchangeRate = ({ onBack }: ExchangeRateProps) => {
  const [data, setData] = useState<ExchangeRateData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchExchangeRate = async () => {
    setLoading(true);
    setError(null);

    try {
      const newData = await exchangeRateService.getAUDToCNYRate();
      
      // 计算变化
      let change = undefined;
      if (data) {
        change = exchangeRateService.calculateChange(newData.rate, data.rate);
      }

      setData({
        ...newData,
        change
      });
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
      return <TrendingUp className="h-3 w-3" />;
    } else if (data.change < 0) {
      return <TrendingDown className="h-3 w-3" />;
    }
    return null;
  };

  const getTrendColor = () => {
    if (!data?.change) return 'secondary';
    return data.change > 0 ? 'default' : 'destructive';
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

        {/* 主汇率卡片 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Globe className="h-5 w-5 mr-2 text-blue-600" />
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
                    <Badge variant={getTrendColor()} className="flex items-center gap-1">
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

        {/* 计算器卡片 */}
        {data && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">汇率计算器</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">澳币</p>
                  <div className="text-2xl font-bold text-blue-600">100</div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">人民币</p>
                  <div className="text-2xl font-bold text-green-600">
                    {(100 * data.rate).toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">澳币</p>
                  <div className="text-xl font-semibold text-blue-600">1,000</div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">人民币</p>
                  <div className="text-xl font-semibold text-green-600">
                    {(1000 * data.rate).toFixed(2)}
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
