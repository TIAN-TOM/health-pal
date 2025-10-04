import { z } from 'zod';

// Contact validation schema
export const contactSchema = z.object({
  name: z.string()
    .trim()
    .min(1, '姓名不能为空')
    .max(100, '姓名不能超过100个字符'),
  phone: z.string()
    .trim()
    .regex(/^[0-9+\-\s()]+$/, '电话号码格式不正确')
    .min(1, '电话号码不能为空')
    .max(20, '电话号码不能超过20个字符'),
  avatar: z.string()
    .max(10, '头像不能超过10个字符')
    .optional()
});

// Family member validation schema
export const familyMemberSchema = z.object({
  name: z.string()
    .trim()
    .min(1, '姓名不能为空')
    .max(100, '姓名不能超过100个字符'),
  relationship: z.string()
    .trim()
    .min(1, '关系不能为空')
    .max(50, '关系不能超过50个字符'),
  phone: z.string()
    .trim()
    .regex(/^[0-9+\-\s()]*$/, '电话号码格式不正确')
    .max(20, '电话号码不能超过20个字符')
    .optional(),
  birthday: z.string()
    .regex(/^\d{8}$/, '生日格式应为YYYYMMDD')
    .optional(),
  address: z.string()
    .trim()
    .max(200, '地址不能超过200个字符')
    .optional(),
  notes: z.string()
    .trim()
    .max(1000, '备注不能超过1000个字符')
    .optional(),
  avatar_url: z.string()
    .url('头像URL格式不正确')
    .optional()
    .or(z.literal(''))
});

// Medical record validation schema
export const medicalRecordSchema = z.object({
  record_type: z.enum(['visit', 'diagnosis', 'prescription'], {
    errorMap: () => ({ message: '记录类型必须是就诊、诊断或处方之一' })
  }),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式应为YYYY-MM-DD'),
  hospital: z.string()
    .trim()
    .max(100, '医院名称不能超过100个字符')
    .optional(),
  doctor: z.string()
    .trim()
    .max(100, '医生姓名不能超过100个字符')
    .optional(),
  department: z.string()
    .trim()
    .max(100, '科室名称不能超过100个字符')
    .optional(),
  diagnosis: z.string()
    .trim()
    .max(500, '诊断信息不能超过500个字符')
    .optional(),
  symptoms: z.string()
    .trim()
    .max(500, '症状描述不能超过500个字符')
    .optional(),
  prescribed_medications: z.array(z.string().max(100, '药品名称不能超过100个字符'))
    .max(50, '药品列表不能超过50项')
    .optional(),
  notes: z.string()
    .trim()
    .max(1000, '备注不能超过1000个字符')
    .optional(),
  next_appointment: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式应为YYYY-MM-DD')
    .optional()
});

// Generic text field validation
export const validateTextField = (value: string, maxLength: number = 500): boolean => {
  return value.trim().length > 0 && value.length <= maxLength;
};

// Phone number validation
export const validatePhone = (phone: string): boolean => {
  return /^[0-9+\-\s()]+$/.test(phone) && phone.length <= 20;
};

// Date validation (YYYY-MM-DD format)
export const validateDate = (date: string): boolean => {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
};

// UUID validation
export const validateUUID = (id: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
};
