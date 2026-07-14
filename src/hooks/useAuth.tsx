
import { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { clearContactsCache } from '@/services/contactsService';

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  status?: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  userRole: 'admin' | 'user' | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (userId: string) => {
    // supabase-js 不会抛出异常，必须显式检查返回的 error
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('获取用户资料失败:', error);
      setUserProfile(null);
      return;
    }

    // 前端强制账号暂停：被暂停的用户立即登出（数据库 RLS 已不再阻止其登录）。
    if (profile?.status === 'suspended') {
      toast({
        title: '账号已被暂停',
        description: '你的账号已被管理员暂停，如有疑问请联系管理员',
        variant: 'destructive',
      });
      clearContactsCache();
      await supabase.auth.signOut();
      setUserProfile(null);
      return;
    }

    setUserProfile(profile);
  }, []);

  const fetchUserRole = useCallback(async (userId: string) => {
    const { data: roles, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('获取用户角色失败:', error);
      setUserRole(null);
      return;
    }

    // 没有角色记录时默认普通用户
    setUserRole(roles?.role ?? 'user');
  }, []);

  useEffect(() => {
    // 设置认证状态监听器
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // 延迟获取用户资料和角色，避免阻塞主线程
          setTimeout(() => {
            fetchUserProfile(session.user.id);
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setUserProfile(null);
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    // 检查现有会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserProfile, fetchUserRole]);

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName || ''
        }
      }
    });

    return { error };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    return { error };
  }, []);

  const signOut = useCallback(async () => {
    // 清除按用户缓存的紧急联系人，避免共享设备上下一位用户看到上一位的联系人。
    clearContactsCache();
    await supabase.auth.signOut();
  }, []);

  // 缓存 context value，避免每次渲染都让所有消费组件重新渲染
  const value = useMemo(() => ({
    user,
    session,
    userProfile,
    userRole,
    loading,
    signUp,
    signIn,
    signOut
  }), [user, session, userProfile, userRole, loading, signUp, signIn, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
