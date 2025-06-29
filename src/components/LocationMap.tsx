
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, Search } from 'lucide-react';

const LocationMap = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapProvider, setMapProvider] = useState<'baidu' | 'amap' | 'tencent'>('baidu');

  // 获取用户位置
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('获取位置失败:', error);
        }
      );
    }
  };

  // 地图提供商选择
  const mapProviders = [
    { id: 'baidu', name: '百度地图', url: 'https://api.map.baidu.com' },
    { id: 'amap', name: '高德地图', url: 'https://webapi.amap.com' },
    { id: 'tencent', name: '腾讯地图', url: 'https://apis.map.qq.com' }
  ];

  // 根据坐标获取地址（示例）
  const getAddressFromCoords = async (lat: number, lng: number) => {
    try {
      // 这里应该调用相应的地图API进行逆地理编码
      // 为了演示，我们使用模拟数据
      setAddress(`纬度: ${lat.toFixed(6)}, 经度: ${lng.toFixed(6)}`);
    } catch (error) {
      console.error('获取地址失败:', error);
    }
  };

  useEffect(() => {
    if (location) {
      getAddressFromCoords(location.lat, location.lng);
    }
  }, [location]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          位置服务（中国大陆适配）
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 地图提供商选择 */}
        <div>
          <label className="block text-sm font-medium mb-2">选择地图服务商：</label>
          <div className="flex space-x-2">
            {mapProviders.map(provider => (
              <Button
                key={provider.id}
                variant={mapProvider === provider.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMapProvider(provider.id as any)}
              >
                {provider.name}
              </Button>
            ))}
          </div>
        </div>

        {/* 位置获取 */}
        <div>
          <Button
            onClick={getCurrentLocation}
            className="w-full"
            variant="outline"
          >
            <Navigation className="h-4 w-4 mr-2" />
            获取当前位置
          </Button>
        </div>

        {/* 地址搜索 */}
        <div>
          <label className="block text-sm font-medium mb-2">搜索地址：</label>
          <div className="flex space-x-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="输入地址或关键词"
              className="flex-1"
            />
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 位置显示 */}
        {location && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">当前位置信息：</h4>
            <p className="text-sm text-blue-700">
              坐标: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </p>
            <p className="text-sm text-blue-700">
              地址: {address}
            </p>
          </div>
        )}

        {/* 地图嵌入区域 */}
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <MapPin className="h-8 w-8 mx-auto mb-2" />
            <p>地图显示区域</p>
            <p className="text-sm">
              使用{mapProviders.find(p => p.id === mapProvider)?.name}服务
            </p>
            <p className="text-xs mt-2">
              注意：实际使用时需要申请相应的API密钥
            </p>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">中国大陆地图服务说明：</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• <strong>百度地图</strong>：国内使用广泛，API丰富</li>
            <li>• <strong>高德地图</strong>：精度高，服务稳定</li>
            <li>• <strong>腾讯地图</strong>：微信生态集成好</li>
            <li>• 需要在相应平台申请API密钥才能正常使用</li>
            <li>• 建议根据用户IP自动选择最优服务商</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationMap;
