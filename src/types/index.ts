// 日程紧急程度
export type UrgencyLevel = 'urgent' | 'not_urgent';

// 日程重要程度
export type ImportanceLevel = 'important' | 'not_important';

// 日历类型
export type CalendarType = 'gregorian' | 'lunar';

// 周期性类型
export type RecurrenceType = 'none' | 'daily' | 'yearly' | 'monthly' | 'weekly';

// 日程分类标签
export interface Category {
  id: string;
  name: string;
  color: string;
}

// 日程
export interface Task {
  id: string;
  title: string;
  description: string;
  startDate: string; // ISO 8601 格式
  endDate: string;   // ISO 8601 格式
  urgency: UrgencyLevel;
  importance: ImportanceLevel;
  categoryId: string | null;
  reminder: string | null; // 提醒时间，ISO 8601 格式
  reminderDays: number; // 提醒天数（例如：2表示2天前提醒）
  calendarType: CalendarType; // 日历类型：公历或农历
  recurrence: RecurrenceType; // 周期性类型
  lunarMonth: number | null; // 农历月份（用于农历日程）
  lunarDay: number | null;   // 农历日期（用于农历日程）
  weekdays: number[]; // 每周重复的星期几（0-6，0表示周日）
  monthlyDay: number | null; // 每月重复的日期（1-31）
  yearlyMonth: number | null; // 每年重复的月份（1-12）
  yearlyDay: number | null; // 每年重复的日期（1-31）
  createdAt: string; // 创建时间
  updatedAt: string; // 更新时间
}

// 视图类型
export type ViewType = 'month' | 'week' | 'day' | 'quadrant';

// 四象限区域
export type QuadrantArea = 'important_urgent' | 'important_not_urgent' | 'not_important_urgent' | 'not_important_not_urgent';

// 周期性任务配置
export interface RecurrenceConfig {
  type: RecurrenceType;
  interval?: number; // 重复间隔
  endDate?: string | null; // 结束日期
  weekdays?: number[]; // 星期几重复（0-6）
  monthDays?: number[]; // 每月哪几天
}
