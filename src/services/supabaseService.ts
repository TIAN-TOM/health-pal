
interface MeniereRecord {
  id: string;
  type: 'dizziness' | 'lifestyle' | 'medication' | 'voice';
  timestamp: string;
  data: any;
  note?: string;
  severity?: string;
  sleep?: string;
  stress?: string;
  diet?: string[];
  medications?: string[];
  dosage?: string;
  duration?: string;
  symptoms?: string[];
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

class SupabaseService {
  private isConnected = false;

  constructor() {
    // 检查是否连接到 Supabase
    this.checkConnection();
  }

  private checkConnection() {
    // 这里将来会检查 Supabase 连接状态
    // 目前先使用 localStorage 作为后备
    this.isConnected = false;
    console.log('Supabase 连接状态:', this.isConnected ? '已连接' : '未连接，使用本地存储');
  }

  async saveRecord(record: MeniereRecord): Promise<void> {
    try {
      if (this.isConnected) {
        // TODO: 实现 Supabase 保存逻辑
        console.log('保存到 Supabase:', record);
      } else {
        // 使用 localStorage 作为后备
        this.saveToLocalStorage(record);
      }
    } catch (error) {
      console.error('保存记录失败:', error);
      // 失败时保存到本地
      this.saveToLocalStorage(record);
    }
  }

  async getRecords(): Promise<MeniereRecord[]> {
    try {
      if (this.isConnected) {
        // TODO: 实现 Supabase 获取逻辑
        console.log('从 Supabase 获取记录');
        return [];
      } else {
        // 从 localStorage 获取
        return this.getFromLocalStorage();
      }
    } catch (error) {
      console.error('获取记录失败:', error);
      return this.getFromLocalStorage();
    }
  }

  async getRecordsByDateRange(startDate: Date, endDate: Date): Promise<MeniereRecord[]> {
    try {
      const allRecords = await this.getRecords();
      return allRecords.filter(record => {
        // 使用 timestamp 或 created_at 字段
        const recordDate = new Date(record.timestamp || record.created_at || '');
        return recordDate >= startDate && recordDate <= endDate;
      }).map(record => {
        // 确保返回的记录包含所有必要字段
        return {
          ...record,
          // 从 data 字段中提取信息到顶级字段
          severity: record.severity || record.data?.severity,
          duration: record.duration || record.data?.duration,
          symptoms: record.symptoms || record.data?.symptoms || [],
          diet: record.diet || record.data?.diet || [],
          sleep: record.sleep || record.data?.sleep,
          stress: record.stress || record.data?.stress,
          medications: record.medications || record.data?.medications || [],
          dosage: record.dosage || record.data?.dosage,
          note: record.note || record.data?.note || record.data?.manualInput
        };
      });
    } catch (error) {
      console.error('获取时间范围记录失败:', error);
      return [];
    }
  }

  private saveToLocalStorage(record: MeniereRecord): void {
    try {
      const existingRecords = this.getFromLocalStorage();
      const updatedRecords = [...existingRecords, record];
      localStorage.setItem('meniereRecords', JSON.stringify(updatedRecords));
      console.log('记录已保存到本地存储');
    } catch (error) {
      console.error('保存到本地存储失败:', error);
    }
  }

  private getFromLocalStorage(): MeniereRecord[] {
    try {
      const stored = localStorage.getItem('meniereRecords');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('从本地存储读取失败:', error);
      return [];
    }
  }
}

export const supabaseService = new SupabaseService();
export type { MeniereRecord };
