
import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, RefreshCw, Calculator, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { exchangeRateService, type ExchangeRateData } from '@/services/exchangeRateService';

interface ExchangeRateProps {
  onBack: () => void;
}

const ExchangeRate = ({ onBack }: ExchangeRateProps) => {
  const [rateData, setRateData] = useState<ExchangeRateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [audAmount, setAudAmount] = useState<string>('');
  const [cnyAmount, setCnyAmount] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadRateData();
  }, []);

  // 自动刷新
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      loadRateData();
    }, 30000); // 每30秒刷新一次

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadRateData = async () => {
    try {
      setLoading(true);
      const data = await exchangeRateService.getAUDtoCNYRate();
      setRateData(data);
    } catch (error) {
      console.error('加载汇率数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAudChange = (value: string) => {
    setAudAmount(value);
    if (value && rateData) {
      const result = exchangeRateService.convertAUDtoCNY(parseFloat(value), rateData.rate);
      setCnyAmount(result.toString());
    } else {
      setCnyAmount('');
    }
  };

  const handleCnyChange = (value: string) => {
    setCnyAmount(value);
    if (value && rateData) {
      const result = exchangeRateService.convertCNYtoAUD(parseFloat(value), rateData.rate);
      setAudAmount(result.toString());
    } else {
      setAudAmount('');
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
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
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? 'bg-green-50 text-green-600' : ''}
            >
              {autoRefresh ? '自动刷新' : '手动刷新'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={loadRateData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* 汇率显示卡片 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              澳币 → 人民币
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-gray-500">获取汇率中...</p>
              </div>
            ) : rateData ? (
              <div className="space-y-4">
                {/* 主要汇率显示 */}
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    ¥{rateData.rate}
                  </div>
                  <div className="text-gray-600">1 AUD = {rateData.rate} CNY</div>
                </div>

                {/* 变化信息 */}
                <div className="flex items-center justify-center space-x-4">
                  <div className={`flex items-center space-x-1 ${getTrendColor(rateData.trend)}`}>
                    {getTrendIcon(rateData.trend)}
                    <span className="font-medium">
                      {rateData.change > 0 ? '+' : ''}{rateData.change}
                    </span>
                  </div>
                  <div className={`text-sm ${getTrendColor(rateData.trend)}`}>
                    ({rateData.changePercent > 0 ? '+' : ''}{rateData.changePercent}%)
                  </div>
                </div>

                {/* 更新时间 */}
                <div className="text-center text-sm text-gray-500">
                  更新时间: {formatTime(rateData.lastUpdated)}
                </div>

                {/* 趋势说明 */}
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-sm text-gray-600">
                    {rateData.trend === 'up' && '澳币兑人民币汇率上涨'}
                    {rateData.trend === 'down' && '澳币兑人民币汇率下跌'}
                    {rateData.trend === 'stable' && '澳币兑人民币汇率稳定'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-red-500">
                获取汇率数据失败
              </div>
            )}
          </CardContent>
        </Card>

        {/* 汇率计算器 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              汇率计算器
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="aud-amount">澳币金额 (AUD)</Label>
                <Input
                  id="aud-amount"
                  type="number"
                  value={audAmount}
                  onChange={(e) => handleAudChange(e.target.value)}
                  placeholder="请输入澳币金额"
                  step="0.01"
                />
              </div>
              
              <div className="text-center">
                <div className="text-gray-400">⇅</div>
              </div>
              
              <div>
                <Label htmlFor="cny-amount">人民币金额 (CNY)</Label>
                <Input
                  id="cny-amount"
                  type="number"
                  value={cnyAmount}
                  onChange={(e) => handleCnyChange(e.target.value)}
                  placeholder="请输入人民币金额"
                  step="0.01"
                />
              </div>
              
              {rateData && (audAmount || cnyAmount) && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm text-blue-600 text-center">
                    {audAmount && (
                      <div>
                        {audAmount} AUD = ¥{exchangeRateService.convertAUDtoCNY(parseFloat(audAmount), rateData.rate)}
                      </div>
                    )}
                    {cnyAmount && (
                      <div>
                        ¥{cnyAmount} = {exchangeRateService.convertCNYtoAUD(parseFloat(cnyAmount), rateData.rate)} AUD
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 说明信息 */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>汇率数据仅供参考，实际交易请以银行汇率为准</p>
          <p className="mt-1">
            {autoRefresh ? '每30秒自动更新' : '点击刷新按钮手动更新'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExchangeRate;
