<template>
  <div class="calendar-view">
    <!-- 日期导航 -->
    <div class="calendar-header">
      <div class="date-nav">
        <button @click="navigate(-1)">
          &lt;
        </button>
        <h2>{{ currentDateDisplay }}</h2>
        <button @click="navigate(1)">
          &gt;
        </button>
        <button class="today-btn" @click="goToToday">
          今天
        </button>
        <button class="jump-btn" @click="toggleDatePicker">
          跳转
        </button>
      </div>
      <!-- 日期跳转选择器 -->
      <div v-if="showDatePicker" class="date-picker-popup">
        <input
          type="date"
          v-model="jumpToDate"
          @change="handleDateJump"
        >
      </div>
    </div>

    <!-- 月视图 -->
    <div v-if="currentSubView === 'month'" class="month-view">
      <!-- 星期标题 -->
      <div class="weekdays">
        <div v-for="day in weekdays" :key="day" class="weekday">
          {{ day }}
        </div>
      </div>
      <!-- 日期网格 -->
      <div class="days-grid">
        <div 
          v-for="(day, index) in monthDays" 
          :key="index"
          :class="{
            'day-cell': true,
            'other-month': !day.isCurrentMonth,
            'today': day.isToday,
            'has-task': day.hasTask
          }"
          @click="selectDay(day.date)"
        >
          <span class="day-number">{{ day.day }}</span>
          <!-- 显示当天的任务 -->
          <div class="day-tasks" v-if="day.tasks.length > 0">
            <div 
              v-for="task in day.tasks.slice(0, 2)" 
              :key="task.id"
              class="task-item"
              :style="{ borderLeftColor: getCategoryColor(task.categoryId) }"
              @click.stop="openTaskModal(task)"
            >
              {{ task.title }}
            </div>
            <div v-if="day.tasks.length > 2" class="more-tasks">
              +{{ day.tasks.length - 2 }} 更多
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 周视图 -->
    <div v-else-if="currentSubView === 'week'" class="week-view">
      <div class="week-grid">
        <div 
          v-for="(day, index) in weekDays" 
          :key="index"
          :class="{
            'week-day': true,
            'today': day.isToday
          }"
        >
          <div class="day-header">
            <div class="day-name">{{ day.dayName }}</div>
            <div class="day-date">{{ day.dateString }}</div>
          </div>
          <div class="day-events">
            <div 
              v-for="task in day.tasks" 
              :key="task.id"
              class="task-item"
              :style="{ borderLeftColor: getCategoryColor(task.categoryId) }"
              @click="openTaskModal(task)"
            >
              <div class="task-time">{{ formatTime(task.startDate) }}</div>
              <div class="task-title">{{ task.title }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 日视图 -->
    <div v-else-if="currentSubView === 'day'" class="day-view">
      <div class="day-header">
        <h3>{{ selectedDateDisplay }}</h3>
      </div>
      <div class="day-events">
        <div 
          v-for="task in dayTasks" 
          :key="task.id"
          class="task-item"
          :style="{ borderLeftColor: getCategoryColor(task.categoryId) }"
          @click="openTaskModal(task)"
        >
          <div class="task-time">
            {{ formatTime(task.startDate) }} - {{ formatTime(task.endDate) }}
          </div>
          <div class="task-content">
            <h4>{{ task.title }}</h4>
            <p v-if="task.description">{{ task.description }}</p>
          </div>
        </div>
        <div v-if="dayTasks.length === 0" class="no-tasks">
          当天没有任务
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import type { Task } from '../types';
import store from '../store';

// 接收父组件传递的视图类型
const props = defineProps<{
  viewType: 'month' | 'week' | 'day';
}>();

// 当前子视图（月/周/日）
const currentSubView = ref<'month' | 'week' | 'day'>(props.viewType);
// 当前显示的日期
const currentDate = ref(new Date());

// 监听视图类型变化
watch(() => props.viewType, (newView) => {
  currentSubView.value = newView;
});

// 星期标题
const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

// 计算当前日期显示
const currentDateDisplay = computed(() => {
  if (currentSubView.value === 'month') {
    return currentDate.value.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
  } else if (currentSubView.value === 'week') {
    const startOfWeek = getStartOfWeek(currentDate.value);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return `${startOfWeek.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}`;
  } else {
    return currentDate.value.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  }
});

// 计算选中日期显示
const selectedDateDisplay = computed(() => {
  return currentDate.value.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
});

// 导航到上一个/下一个周期
const navigate = (direction: number) => {
  const newDate = new Date(currentDate.value);
  if (currentSubView.value === 'month') {
    newDate.setMonth(newDate.getMonth() + direction);
  } else if (currentSubView.value === 'week') {
    newDate.setDate(newDate.getDate() + direction * 7);
  } else {
    newDate.setDate(newDate.getDate() + direction);
  }
  currentDate.value = newDate;
};

// 回到今天
const goToToday = () => {
  currentDate.value = new Date();
};

// 日期跳转相关
const showDatePicker = ref(false);
const jumpToDate = ref('');

// 切换日期选择器显示
const toggleDatePicker = () => {
  showDatePicker.value = !showDatePicker.value;
  if (showDatePicker.value) {
    // 初始化为当前日期
    const today = currentDate.value;
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    jumpToDate.value = `${year}-${month}-${day}`;
  }
};

// 处理日期跳转
const handleDateJump = () => {
  if (jumpToDate.value) {
    currentDate.value = new Date(jumpToDate.value);
    showDatePicker.value = false;
  }
};

// 获取周的开始日期
const getStartOfWeek = (date: Date) => {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day;
  return new Date(start.setDate(diff));
};

// 判断任务是否应该在指定日期显示
const shouldShowTaskOnDate = (task: Task, date: Date): boolean => {
  const taskStart = new Date(task.startDate);
  const taskEnd = new Date(task.endDate);

  // 一次性任务：检查日期是否在开始和结束时间范围内
  if (task.recurrence === 'none') {
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const startOnly = new Date(taskStart.getFullYear(), taskStart.getMonth(), taskStart.getDate());
    const endOnly = new Date(taskEnd.getFullYear(), taskEnd.getMonth(), taskEnd.getDate());
    return dateOnly >= startOnly && dateOnly <= endOnly;
  }

  // 重复任务：检查日期是否在重复周期范围内
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const startOnly = new Date(taskStart.getFullYear(), taskStart.getMonth(), taskStart.getDate());
  const endOnly = new Date(taskEnd.getFullYear(), taskEnd.getMonth(), taskEnd.getDate());

  if (dateOnly < startOnly || dateOnly > endOnly) {
    return false;
  }

  // 每天重复
  if (task.recurrence === 'daily') {
    return true;
  }

  // 每周重复：检查星期几
  if (task.recurrence === 'weekly') {
    const dayOfWeek = date.getDay();
    return task.weekdays && task.weekdays.includes(dayOfWeek);
  }

  // 每月重复：检查日期
  if (task.recurrence === 'monthly') {
    return task.monthlyDay === date.getDate();
  }

  // 每年重复：检查月份和日期
  if (task.recurrence === 'yearly') {
    return task.yearlyMonth === (date.getMonth() + 1) && task.yearlyDay === date.getDate();
  }

  return false;
};

// 生成月视图的日期数据
const monthDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - firstDay.getDay());
  
  const days = [];
  for (let i = 0; i < 42; i++) { // 6行7列
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const allTasks = store.getters.allTasks.value;
    const dayTasks = allTasks.filter((task: Task) => {
      return shouldShowTaskOnDate(task, date);
    });
    
    days.push({
      date: date.toISOString(),
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: date.toDateString() === new Date().toDateString(),
      hasTask: dayTasks.length > 0,
      tasks: dayTasks
    });
  }
  return days;
});

// 生成周视图的日期数据
const weekDays = computed(() => {
  const startOfWeek = getStartOfWeek(currentDate.value);
  const days = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const allTasks = store.getters.allTasks.value;
    const dayTasks = allTasks.filter((task: Task) => {
      return shouldShowTaskOnDate(task, date);
    });
    
    days.push({
      date: date,
      dayName: weekdays[i],
      dateString: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      isToday: date.toDateString() === new Date().toDateString(),
      tasks: dayTasks
    });
  }
  return days;
});

// 生成日视图的任务数据
const dayTasks = computed(() => {
  const allTasks = store.getters.allTasks.value;
  return allTasks.filter((task: Task) => {
    return shouldShowTaskOnDate(task, currentDate.value);
  }).sort((a: Task, b: Task) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
});

// 选择日期
const selectDay = (dateString: string) => {
  currentDate.value = new Date(dateString);
  currentSubView.value = 'day';
};

// 打开任务模态框
const openTaskModal = (task: Task) => {
  store.actions.openTaskModal(task);
};

// 格式化时间
const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

// 获取分类颜色
const getCategoryColor = (categoryId: string | null) => {
  if (!categoryId) return '#95a5a6';
  const allCategories = store.getters.allCategories.value;
  const category = allCategories.find((c: any) => c.id === categoryId);
  return category ? category.color : '#95a5a6';
};

// 组件挂载时初始化
onMounted(() => {
  currentDate.value = new Date();
});
</script>

<style scoped>
.calendar-view {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 16px;
}

/* 日历头部 */
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.date-nav {
  display: flex;
  align-items: center;
  gap: 12px;
}

.date-nav h2 {
  font-size: 18px;
  margin: 0;
}

.date-nav button {
  padding: 6px 10px;
  background-color: #f0f0f0;
  border-radius: 4px;
}

.today-btn {
  background-color: #2ecc71 !important;
  color: white;
}

.jump-btn {
  background-color: #3498db !important;
  color: white;
}

.calendar-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: flex-start;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.date-picker-popup {
  width: 100%;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.date-picker-popup input[type="date"] {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
}

/* 月视图 */
.month-view {
  margin-top: 20px;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #eee;
  margin-bottom: 1px;
}

.weekday {
  background-color: white;
  padding: 10px;
  text-align: center;
  font-weight: bold;
  color: #666;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #eee;
}

.day-cell {
  background-color: white;
  min-height: 100px;
  padding: 8px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s;
}

.day-cell:hover {
  background-color: #f5f5f5;
}

.day-cell.other-month {
  background-color: #f9f9f9;
  color: #ccc;
}

.day-cell.today {
  background-color: #e3f2fd;
}

.day-cell.has-task {
  border-left: 3px solid #3498db;
}

.day-number {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  display: block;
}

.day-tasks {
  font-size: 12px;
  line-height: 1.4;
}

.task-item {
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 4px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-left: 3px solid #95a5a6;
}

.more-tasks {
  color: #666;
  font-style: italic;
  margin-top: 4px;
}

/* 周视图 */
.week-view {
  margin-top: 20px;
}

.week-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #eee;
}

.week-day {
  background-color: white;
  min-height: 300px;
  display: flex;
  flex-direction: column;
}

.day-header {
  padding: 10px;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.day-name {
  font-weight: bold;
  color: #666;
}

.day-date {
  font-size: 14px;
  margin-top: 4px;
}

.day-events {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
}

/* 日视图 */
.day-view {
  margin-top: 20px;
}

.day-view .day-events {
  min-height: 400px;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
}

.day-view .task-item {
  background-color: white;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.day-view .task-time {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.day-view .task-content h4 {
  margin: 0 0 8px 0;
  color: #333;
}

.day-view .task-content p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.no-tasks {
  text-align: center;
  color: #999;
  padding: 40px;
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .calendar-header {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
  
  .date-nav {
    justify-content: center;
  }
  
  .week-grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(7, 1fr);
  }
  
  .week-day {
    min-height: 150px;
  }
  
  .days-grid {
    font-size: 14px;
  }
  
  .day-cell {
    min-height: 80px;
  }
}
</style>