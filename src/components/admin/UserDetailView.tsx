
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Calendar, Activity, FileText, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'admin' | 'user';

interface UserWithProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

interface CheckinRecord {
  id: string;
  checkin_date: string;
  mood_score: number;
  note: string | null;
  created_at: string;
}

interface MeniereRecord {
  id: string;
  type: string;
  timestamp: string;
  severity?: string;
  duration?: string;
  note?: string;
}

interface MedicalRecord {
  id: string;
  record_type: string;
  date: string;
  hospital?: string;
  doctor?: string;
  diagnosis?: string;
  created_at: string;
}

interface UserDetailViewProps {
  user: UserWithProfile;
  checkins: CheckinRecord[];
  onBack: () => void;
}

const UserDetailView = ({ user, checkins: initialCheckins, onBack }: UserDetailViewProps) => {
  const [checkins, setCheckins] = useState<CheckinRecord[]>(initialCheckins);
  const [meniereRecords, setMeniereRecords] = useState<MeniereRecord[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const formatBeijingTime = (dateString: string) => {
    try {
      if (!dateString) {
        return '未知时间';
      }
      
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return '时间格式错误';
      }
      
      return date.toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('日期格式化失败:', error, '原始日期:', dateString);
      return '时间格式错误';
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      // 加载打卡记录
      const { data: checkinsData } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('checkin_date', { ascending: false })
        .limit(30);

      // 加载梅尼埃记录
      const { data: meniereData } = await supabase
        .from('meniere_records')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(30);

      // 加载医疗记录
      const { data: medicalData } = await supabase
        .from('medical_records')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30);

      setCheckins(checkinsData || []);
      setMeniereRecords(meniereData || []);
      setMedicalRecords(medicalData || []);
    } catch (error) {
      console.error('加载用户数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [user.id]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 mr-1">
              <path fillRule="evenodd" d="M9.793 3.293a1 1 0 011.414 0l7 7a1 1 0 010 1.414l-7 7a1 1 0 01-1.414-1.414L15.586 11H3a1 1 0 110-2h12.586l-6.293-6.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            返回
          </Button>
          用户详情
        </h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadAllData}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          刷新数据
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            基本信息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-gray-600 text-sm">姓名</p>
              <p className="font-medium">{user.full_name || '未设置'}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">邮箱</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">角色</p>
              <p className="font-medium">{user.role}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">注册时间</p>
              <p className="font-medium">{formatBeijingTime(user.created_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            打卡记录 (最近30天) - {checkins.length} 条
          </CardTitle>
        </CardHeader>
        <CardContent>
          {checkins.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {checkins.map((checkin) => (
                <div key={checkin.id} className="border-l-4 border-l-green-500 pl-4 py-2 bg-green-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {checkin.checkin_date} - 心情评分: {checkin.mood_score}/5
                      </p>
                      {checkin.note && (
                        <p className="text-sm text-gray-600 mt-1">备注: {checkin.note}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatBeijingTime(checkin.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">暂无打卡记录</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            梅尼埃记录 (最近30天) - {meniereRecords.length} 条
          </CardTitle>
        </CardHeader>
        <CardContent>
          {meniereRecords.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {meniereRecords.map((record) => (
                <div key={record.id} className="border-l-4 border-l-blue-500 pl-4 py-2 bg-blue-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {record.type === 'dizziness' && '眩晕记录'}
                        {record.type === 'lifestyle' && '生活记录'}
                        {record.type === 'medication' && '用药记录'}
                        {record.type === 'voice' && '语音记录'}
                      </p>
                      {record.severity && (
                        <p className="text-sm text-gray-600">严重程度: {record.severity}</p>
                      )}
                      {record.duration && (
                        <p className="text-sm text-gray-600">持续时间: {record.duration}</p>
                      )}
                      {record.note && (
                        <p className="text-sm text-gray-600 mt-1">备注: {record.note}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatBeijingTime(record.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">暂无梅尼埃记录</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            医疗记录 (最近30天) - {medicalRecords.length} 条
          </CardTitle>
        </CardHeader>
        <CardContent>
          {medicalRecords.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {medicalRecords.map((record) => (
                <div key={record.id} className="border-l-4 border-l-purple-500 pl-4 py-2 bg-purple-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {record.record_type === 'visit' && '就诊记录'}
                        {record.record_type === 'diagnosis' && '诊断记录'}
                        {record.record_type === 'prescription' && '处方记录'}
                      </p>
                      {record.hospital && (
                        <p className="text-sm text-gray-600">医院: {record.hospital}</p>
                      )}
                      {record.doctor && (
                        <p className="text-sm text-gray-600">医生: {record.doctor}</p>
                      )}
                      {record.diagnosis && (
                        <p className="text-sm text-gray-600">诊断: {record.diagnosis}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500 block">
                        {record.date}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatBeijingTime(record.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">暂无医疗记录</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetailView;
