import { reactive, computed } from 'vue';
import type { Task, Category, ViewType, QuadrantArea, UrgencyLevel, ImportanceLevel } from '../types';

// 初始分类标签
const initialCategories: Category[] = [
  { id: '1', name: '工作', color: '#3498db' },
  { id: '2', name: '生活', color: '#2ecc71' },
  { id: '3', name: '学习', color: '#f39c12' },
  { id: '4', name: '其他', color: '#95a5a6' },
];

// 初始日程（示例数据）
const initialTasks: Task[] = [
  {
    id: '1',
    title: '项目会议',
    description: '讨论项目进展和下一步计划',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    urgency: 'not_urgent',
    importance: 'not_important',
    categoryId: '1',
    reminder: null,
    reminderDays: 0,
    calendarType: 'gregorian',
    recurrence: 'none',
    lunarMonth: null,
    lunarDay: null,
    weekdays: [],
    monthlyDay: null,
    yearlyMonth: null,
    yearlyDay: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: '购物',
    description: '购买日常用品',
    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
    urgency: 'not_urgent',
    importance: 'not_important',
    categoryId: '2',
    reminder: null,
    reminderDays: 0,
    calendarType: 'gregorian',
    recurrence: 'none',
    lunarMonth: null,
    lunarDay: null,
    weekdays: [],
    monthlyDay: null,
    yearlyMonth: null,
    yearlyDay: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
 {
    "id": "3",
    "title": "生日",
    "description": "",
    "startDate": "2000-01-27T02:38:00.000Z",
    "endDate": "2002-02-09T03:38:00.000Z",
    "urgency": "not_urgent",
    "importance": "not_important",
    "categoryId": null,
    "reminder": null,
    "reminderDays": 0,
    "calendarType": "gregorian",
    "recurrence": "yearly",
    "lunarMonth": null,
    "lunarDay": null,
    "weekdays": [],
    "monthlyDay": null,
    "yearlyMonth": 1,
    "yearlyDay": 27,
    "createdAt": "2026-02-09T03:04:32.645Z",
    "updatedAt": "2026-02-09T03:49:50.278Z"
  },
];

// 应用状态
const state = reactive({
  tasks: initialTasks,
  categories: initialCategories,
  currentView: 'month' as ViewType,
  currentDate: new Date().toISOString(),
  selectedTask: null as Task | null,
  isTaskModalOpen: false,
});

// 计算属性
const getters = {
  // 获取所有任务
  allTasks: computed(() => state.tasks),
  
  // 获取所有分类
  allCategories: computed(() => state.categories),
  
  // 根据四象限区域获取任务
  getTasksByQuadrant: computed(() => {
    return {
      important_urgent: state.tasks.filter((task: Task) => task.urgency === 'urgent' && task.importance === 'important'),
      important_not_urgent: state.tasks.filter((task: Task) => task.urgency === 'not_urgent' && task.importance === 'important'),
      not_important_urgent: state.tasks.filter((task: Task) => task.urgency === 'urgent' && task.importance === 'not_important'),
      not_important_not_urgent: state.tasks.filter((task: Task) => task.urgency === 'not_urgent' && task.importance === 'not_important'),
    };
  }),
  
  // 根据分类获取任务
  getTasksByCategory: (categoryId: string) => {
    return state.tasks.filter((task: Task) => task.categoryId === categoryId);
  },
  
  // 获取当前视图
  currentView: computed(() => state.currentView),
  
  // 获取当前日期
  currentDate: computed(() => state.currentDate),
  
  // 获取选中的任务
  selectedTask: computed(() => state.selectedTask),
  
  // 获取任务模态框状态
  isTaskModalOpen: computed(() => state.isTaskModalOpen),
};

// 操作方法
const actions = {
  // 添加任务
  addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    state.tasks.push(newTask);
    actions.saveToLocalStorage();
  },
  
  // 更新任务
  updateTask(id: string, updates: Partial<Task>) {
    const index = state.tasks.findIndex(task => task.id === id);
    if (index !== -1) {
      state.tasks[index] = {
        ...state.tasks[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      actions.saveToLocalStorage();
    }
  },
  
  // 删除任务
  deleteTask(id: string) {
    state.tasks = state.tasks.filter(task => task.id !== id);
    actions.saveToLocalStorage();
  },
  
  // 移动任务到四象限其他区域
  moveTaskToQuadrant(id: string, quadrant: QuadrantArea) {
    const urgencyMap: Record<QuadrantArea, UrgencyLevel> = {
      important_urgent: 'urgent',
      important_not_urgent: 'not_urgent',
      not_important_urgent: 'urgent',
      not_important_not_urgent: 'not_urgent',
    };
    
    const importanceMap: Record<QuadrantArea, ImportanceLevel> = {
      important_urgent: 'important',
      important_not_urgent: 'important',
      not_important_urgent: 'not_important',
      not_important_not_urgent: 'not_important',
    };
    
    actions.updateTask(id, {
      urgency: urgencyMap[quadrant],
      importance: importanceMap[quadrant],
    });
  },
  
  // 添加分类
  addCategory(category: Omit<Category, 'id'>) {
    const newCategory: Category = {
      ...category,
      id: crypto.randomUUID(),
    };
    state.categories.push(newCategory);
    actions.saveToLocalStorage();
  },
  
  // 更新分类
  updateCategory(id: string, updates: Partial<Category>) {
    const index = state.categories.findIndex(category => category.id === id);
    if (index !== -1) {
      state.categories[index] = {
        ...state.categories[index],
        ...updates,
      };
      actions.saveToLocalStorage();
    }
  },
  
  // 删除分类
  deleteCategory(id: string) {
    // 将使用该分类的任务的categoryId设置为null
    state.tasks = state.tasks.map(task => 
      task.categoryId === id ? { ...task, categoryId: null } : task
    );
    state.categories = state.categories.filter(category => category.id !== id);
    actions.saveToLocalStorage();
  },
  
  // 设置当前视图
  setCurrentView(view: ViewType) {
    state.currentView = view;
  },
  
  // 设置当前日期
  setCurrentDate(date: string) {
    state.currentDate = date;
  },
  
  // 打开任务模态框
  openTaskModal(task: Task | null = null) {
    state.selectedTask = task;
    state.isTaskModalOpen = true;
  },
  
  // 关闭任务模态框
  closeTaskModal() {
    state.selectedTask = null;
    state.isTaskModalOpen = false;
  },
  
  // 保存数据到本地存储
  saveToLocalStorage() {
    localStorage.setItem('daily-manager-tasks', JSON.stringify(state.tasks));
    localStorage.setItem('daily-manager-categories', JSON.stringify(state.categories));
  },
  
  // 从本地存储加载数据
  loadFromLocalStorage() {
    const savedTasks = localStorage.getItem('daily-manager-tasks');
    const savedCategories = localStorage.getItem('daily-manager-categories');
    
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        // 验证任务数据结构
        if (Array.isArray(parsedTasks)) {
          state.tasks = parsedTasks.map(task => ({
            id: task.id || crypto.randomUUID(),
            title: task.title || '',
            description: task.description || '',
            startDate: task.startDate || new Date().toISOString(),
            endDate: task.endDate || new Date().toISOString(),
            urgency: task.urgency || 'not_urgent',
            importance: task.importance || 'not_important',
            categoryId: task.categoryId || null,
            reminder: task.reminder || null,
            reminderDays: task.reminderDays || 0,
            calendarType: task.calendarType || 'gregorian',
            recurrence: task.recurrence || 'none',
            lunarMonth: task.lunarMonth || null,
            lunarDay: task.lunarDay || null,
            weekdays: task.weekdays || [],
            monthlyDay: task.monthlyDay || null,
            yearlyMonth: task.yearlyMonth || null,
            yearlyDay: task.yearlyDay || null,
            createdAt: task.createdAt || new Date().toISOString(),
            updatedAt: task.updatedAt || new Date().toISOString(),
          }));
        }
      } catch (error) {
        console.error('Failed to load tasks from localStorage:', error);
        // 加载失败时使用初始数据
        state.tasks = initialTasks;
      }
    }
    
    if (savedCategories) {
      try {
        const parsedCategories = JSON.parse(savedCategories);
        // 验证分类数据结构
        if (Array.isArray(parsedCategories)) {
          state.categories = parsedCategories.map(category => ({
            id: category.id || crypto.randomUUID(),
            name: category.name || '未命名',
            color: category.color || '#95a5a6',
          }));
        }
      } catch (error) {
        console.error('Failed to load categories from localStorage:', error);
        // 加载失败时使用初始数据
        state.categories = initialCategories;
      }
    }
  },
  
  // 获取周期性任务的实例
  getRecurrenceInstances(task: Task, viewStartDate: Date, viewEndDate: Date): Task[] {
    const instances: Task[] = [];
    const taskStartDate = new Date(task.startDate);

    // 如果不是周期性任务，只返回原始任务
    if (task.recurrence === 'none') {
      if (taskStartDate >= viewStartDate && taskStartDate <= viewEndDate) {
        instances.push(task);
      }
      return instances;
    }

    // 周期任务：在视图范围内生成实例（不受 endDate 限制，无限重复）
    const hours = taskStartDate.getHours();
    const minutes = taskStartDate.getMinutes();

    if (task.recurrence === 'daily') {
      let cur = new Date(viewStartDate);
      cur.setHours(hours, minutes, 0, 0);
      if (cur < taskStartDate) cur = new Date(taskStartDate);
      while (cur <= viewEndDate) {
        instances.push({
          ...task,
          id: `${task.id}_${cur.toISOString()}`,
          startDate: cur.toISOString(),
          endDate: cur.toISOString(),
        });
        cur = new Date(cur);
        cur.setDate(cur.getDate() + 1);
      }
    } else if (task.recurrence === 'weekly') {
      if (!task.weekdays || task.weekdays.length === 0) return instances;
      let cur = new Date(viewStartDate);
      cur.setHours(hours, minutes, 0, 0);
      if (cur < taskStartDate) cur = new Date(taskStartDate);
      while (cur <= viewEndDate) {
        if (task.weekdays.includes(cur.getDay())) {
          instances.push({
            ...task,
            id: `${task.id}_${cur.toISOString()}`,
            startDate: cur.toISOString(),
            endDate: cur.toISOString(),
          });
        }
        cur = new Date(cur);
        cur.setDate(cur.getDate() + 1);
      }
    } else if (task.recurrence === 'monthly') {
      const day = task.monthlyDay || taskStartDate.getDate();
      let year = viewStartDate.getFullYear();
      let month = viewStartDate.getMonth();
      // 从视图开始月份遍历到视图结束月份
      while (true) {
        const d = new Date(year, month, day, hours, minutes, 0, 0);
        if (d > viewEndDate) break;
        if (d >= viewStartDate && d >= taskStartDate) {
          instances.push({
            ...task,
            id: `${task.id}_${d.toISOString()}`,
            startDate: d.toISOString(),
            endDate: d.toISOString(),
          });
        }
        month++;
        if (month > 11) { month = 0; year++; }
      }
    } else if (task.recurrence === 'yearly') {
      const m = task.yearlyMonth || (taskStartDate.getMonth() + 1);
      const d = task.yearlyDay || taskStartDate.getDate();
      let year = viewStartDate.getFullYear();
      if (year < taskStartDate.getFullYear()) year = taskStartDate.getFullYear();
      while (true) {
        const date = new Date(year, m - 1, d, hours, minutes, 0, 0);
        if (date > viewEndDate) break;
        if (date >= viewStartDate && date >= taskStartDate) {
          instances.push({
            ...task,
            id: `${task.id}_${date.toISOString()}`,
            startDate: date.toISOString(),
            endDate: date.toISOString(),
          });
        }
        year++;
      }
    }

    return instances;
  },
  
  // 导出数据
  exportData() {
    const data = {
      tasks: state.tasks,
      categories: state.categories,
      exportDate: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `daily-manager-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  },
  
  // 导入数据
  importData(data: { tasks: Task[]; categories: Category[] }) {
    if (data.tasks && Array.isArray(data.tasks)) {
      state.tasks = data.tasks;
    }
    
    if (data.categories && Array.isArray(data.categories)) {
      state.categories = data.categories;
    }
    
    actions.saveToLocalStorage();
  },
};

// 初始化时从本地存储加载数据
actions.loadFromLocalStorage();

export default {
  state,
  getters,
  actions,
};
