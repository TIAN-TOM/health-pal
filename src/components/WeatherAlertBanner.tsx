import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  getUserWeatherAlerts,
  markAlertAsRead,
  deleteWeatherAlert,
  type WeatherAlert,
} from '@/services/weatherAlertService';

const WeatherAlertBanner = () => {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
    
    // 每5分钟检查一次新预警
    const interval = setInterval(loadAlerts, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await getUserWeatherAlerts();
      // 只显示未读的预警
      setAlerts(data.filter(alert => !alert.is_read));
    } catch (error) {
      console.error('加载天气预警失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (alertId: string) => {
    await markAlertAsRead(alertId);
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  const handleDelete = async (alertId: string) => {
    await deleteWeatherAlert(alertId);
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  if (loading || alerts.length === 0) {
    return null;
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'typhoon':
      case 'thunderstorm':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'heavy_rain':
        return 'bg-orange-50 border-orange-200 text-orange-900';
      case 'high_temp':
        return 'bg-amber-50 border-amber-200 text-amber-900';
      case 'low_temp':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      default:
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
    }
  };

  return (
    <div className="space-y-2 mb-4">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          className={`${getAlertColor(alert.alert_type)} animate-in slide-in-from-top-2`}
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="flex items-center justify-between">
            <span className="font-bold">天气预警 - {alert.city_name}</span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleDismiss(alert.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertTitle>
          <AlertDescription className="mt-2">
            {alert.alert_message}
            <div className="text-xs mt-1 opacity-70">
              {new Date(alert.created_at).toLocaleString('zh-CN')}
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

export default WeatherAlertBanner;