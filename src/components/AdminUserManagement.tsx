
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Eye, Activity, Calendar, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type DailyCheckin = Tables<'daily_checkins'>;
type MeniereRecord = Tables<'meniere_records'>;

interface UserWithStats extends Profile {
  checkin_count: number;
  record_count: number;
  last_checkin: string | null;
  last_activity: string | null;
}

const AdminUserManagement = () => {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  const [userDetails, setUserDetails] = useState<{
    checkins: DailyCheckin[];
    records: MeniereRecord[];
  }>({ checkins: [], records: [] });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // 获取所有用户基本信息
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // 为每个用户获取统计信息
      const usersWithStats = await Promise.all(
        (profiles || []).map(async (profile) => {
          try {
            // 获取打卡统计
            const { count: checkinCount } = await supabase
              .from('daily_checkins')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', profile.id);

            // 获取记录统计
            const { count: recordCount } = await supabase
              .from('meniere_records')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', profile.id);

            // 获取最近打卡
            const { data: lastCheckin } = await supabase
              .from('daily_checkins')
              .select('checkin_date')
              .eq('user_id', profile.id)
              .order('checkin_date', { ascending: false })
              .limit(1)
              .single();

            // 获取最近活动
            const { data: lastRecord } = await supabase
              .from('meniere_records')
              .select('created_at')
              .eq('user_id', profile.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            return {
              ...profile,
              checkin_count: checkinCount || 0,
              record_count: recordCount || 0,
              last_checkin: lastCheckin?.checkin_date || null,
              last_activity: lastRecord?.created_at || null
            };
          } catch (error) {
            console.error(`获取用户 ${profile.id} 统计信息失败:`, error);
            return {
              ...profile,
              checkin_count: 0,
              record_count: 0,
              last_checkin: null,
              last_activity: null
            };
          }
        })
      );

      setUsers(usersWithStats);
    } catch (error: any) {
      toast({
        title: "加载失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserDetails = async (user: UserWithStats) => {
    try {
      setLoading(true);
      setSelectedUser(user);

      // 获取用户打卡记录
      const { data: checkins, error: checkinsError } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('checkin_date', { ascending: false })
        .limit(30);

      if (checkinsError) throw checkinsError;

      // 获取用户症状记录
      const { data: records, error: recordsError } = await supabase
        .from('meniere_records')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (recordsError) throw recordsError;

      setUserDetails({
        checkins: checkins || [],
        records: records || []
      });
    } catch (error: any) {
      toast({
        title: "加载用户详情失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (selectedUser) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">用户详情 - {selectedUser.full_name || selectedUser.email}</h2>
          <Button onClick={() => setSelectedUser(null)} variant="outline">
            返回用户列表
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">总打卡数</p>
                  <p className="text-xl font-bold">{selectedUser.checkin_count}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">记录总数</p>
                  <p className="text-xl font-bold">{selectedUser.record_count}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-gray-600">最近打卡</p>
                <p className="text-sm font-medium">
                  {selectedUser.last_checkin 
                    ? new Date(selectedUser.last_checkin).toLocaleDateString()
                    : '无记录'
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-gray-600">最近活动</p>
                <p className="text-sm font-medium">
                  {selectedUser.last_activity 
                    ? new Date(selectedUser.last_activity).toLocaleDateString()
                    : '无记录'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>最近打卡记录</CardTitle>
            </CardHeader>
            <CardContent>
              {userDetails.checkins.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {userDetails.checkins.map((checkin) => (
                    <div key={checkin.id} className="p-3 bg-gray-50 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{checkin.checkin_date}</p>
                          {checkin.mood_score && (
                            <p className="text-sm text-gray-600">心情: {checkin.mood_score}/5</p>
                          )}
                          {checkin.note && (
                            <p className="text-sm text-gray-700">{checkin.note}</p>
                          )}
                        </div>
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
              <CardTitle>最近症状记录</CardTitle>
            </CardHeader>
            <CardContent>
              {userDetails.records.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {userDetails.records.map((record) => (
                    <div key={record.id} className="p-3 bg-gray-50 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {record.type === 'dizziness' && '眩晕记录'}
                            {record.type === 'lifestyle' && '生活记录'}
                            {record.type === 'medication' && '用药记录'}
                            {record.type === 'voice' && '语音记录'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(record.created_at).toLocaleString()}
                          </p>
                          {record.severity && (
                            <p className="text-sm text-gray-700">严重程度: {record.severity}</p>
                          )}
                          {record.note && (
                            <p className="text-sm text-gray-700">{record.note}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">暂无症状记录</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center">
          <Users className="h-5 w-5 mr-2" />
          用户管理
        </h2>
        <Button onClick={loadUsers} variant="outline" disabled={loading}>
          刷新数据
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">加载中...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {users.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-medium">{user.full_name || '未设置姓名'}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">
                          注册时间: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="text-center">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{user.checkin_count}</span>
                      </div>
                      <p className="text-xs">打卡</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center space-x-1">
                        <Activity className="h-3 w-3" />
                        <span>{user.record_count}</span>
                      </div>
                      <p className="text-xs">记录</p>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => loadUserDetails(user)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      查看详情
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {users.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              暂无用户数据
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
