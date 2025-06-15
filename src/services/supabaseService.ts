
interface MeniereRecord {
  id: string;
  type: 'dizziness' | 'lifestyle' | 'medication' | 'voice';
  timestamp: string;
  data: any;
  note?: string;
  severity?: string;
  sleep?: string;
  medications?: string[];
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
        const recordDate = new Date(record.timestamp);
        return recordDate >= startDate && recordDate <= endDate;
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

  async exportRecords(timeRange: 'week' | 'month'): Promise<{ json: string; text: string }> {
    const records = await this.getRecords();
    const now = new Date();
    const timeLimit = new Date();
    
    if (timeRange === 'week') {
      timeLimit.setDate(now.getDate() - 7);
    } else {
      timeLimit.setMonth(now.getMonth() - 1);
    }

    const filteredRecords = records.filter(record => 
      new Date(record.timestamp) >= timeLimit
    );

    const jsonData = JSON.stringify(filteredRecords, null, 2);
    const textData = this.formatRecordsAsText(filteredRecords);

    return { json: jsonData, text: textData };
  }

  private formatRecordsAsText(records: MeniereRecord[]): string {
    let text = `梅尼埃症记录报告\n生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;
    
    records.forEach((record, index) => {
      text += `${index + 1}. ${new Date(record.timestamp).toLocaleString('zh-CN')}\n`;
      text += `类型: ${this.getRecordTypeText(record.type)}\n`;
      
      if (record.type === 'dizziness') {
        text += `严重程度: ${record.severity}\n`;
      } else if (record.type === 'lifestyle') {
        text += `睡眠状况: ${record.sleep}\n`;
      } else if (record.type === 'medication') {
        text += `用药: ${record.medications?.join(', ') || '未记录'}\n`;
      } else if (record.type === 'voice' && record.note) {
        text += `备注: ${record.note}\n`;
      }
      
      text += '\n';
    });

    return text;
  }

  private getRecordTypeText(type: string): string {
    switch (type) {
      case 'dizziness': return '眩晕症状';
      case 'lifestyle': return '生活记录';
      case 'medication': return '用药记录';
      case 'voice': return '语音记事';
      default: return '未知类型';
    }
  }
}

export const supabaseService = new SupabaseService();
export type { MeniereRecord };
