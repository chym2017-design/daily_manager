<template>
  <div class="quadrant-view">
    <div class="quadrant-header">
      <div>
        <h2>紧急重要视图</h2>
        <div class="time-range-selector">
          <button
            v-for="range in timeRanges"
            :key="range.value"
            :class="{ active: selectedTimeRange === range.value }"
            @click="changeTimeRange(range.value)"
          >
            {{ range.label }}
          </button>
          <button
            :class="{ active: selectedTimeRange === 'custom' }"
            @click="toggleCustomRange"
          >
            自定义
          </button>
        </div>
      </div>
      <!-- 自定义时间范围选择器 -->
      <div v-if="showCustomRange" class="custom-range-picker">
        <div class="custom-range-inputs">
          <input
            type="date"
            v-model="customStartDate"
            @change="applyCustomRange"
          >
          <span>-</span>
          <input
            type="date"
            v-model="customEndDate"
            @change="applyCustomRange"
          >
        </div>
      </div>
    </div>
    <div class="quadrant-grid">
      <!-- 第一象限：重要且紧急 -->
      <div 
        class="quadrant important-urgent"
        @drop="onDrop($event, 'important_urgent')"
        @dragover.prevent
      >
        <div class="quadrant-header">
          <h3>重要且紧急</h3>
        </div>
        <div class="quadrant-content">
          <div 
            v-for="task in quadrantTasks.important_urgent" 
            :key="task.id"
            class="task-card"
            :style="{ borderLeftColor: getCategoryColor(task.categoryId) }"
            draggable="true"
            @dragstart="onDragStart($event, task.id)"
            @click="openTaskModal(task)"
          >
            <h4>{{ task.title }}</h4>
            <p class="task-time">
              {{ formatDate(task.startDate) }}
              <span v-if="task.calendarType === 'lunar'" class="lunar-date">
                ({{ getLunarDate(task.startDate) }})
              </span>
            </p>
            <p v-if="task.recurrence !== 'none'" class="recurrence-tag">
              {{ getRecurrenceLabel(task.recurrence) }}
            </p>
            <p v-if="task.description" class="task-desc">{{ task.description }}</p>
          </div>
          <div v-if="quadrantTasks.important_urgent.length === 0" class="empty-quadrant">
            无任务
          </div>
        </div>
      </div>

      <!-- 第二象限：重要不紧急 -->
      <div 
        class="quadrant important-not-urgent"
        @drop="onDrop($event, 'important_not_urgent')"
        @dragover.prevent
      >
        <div class="quadrant-header">
          <h3>重要不紧急</h3>
        </div>
        <div class="quadrant-content">
          <div 
            v-for="task in quadrantTasks.important_not_urgent" 
            :key="task.id"
            class="task-card"
            :style="{ borderLeftColor: getCategoryColor(task.categoryId) }"
            draggable="true"
            @dragstart="onDragStart($event, task.id)"
            @click="openTaskModal(task)"
          >
            <h4>{{ task.title }}</h4>
            <p class="task-time">
              {{ formatDate(task.startDate) }}
              <span v-if="task.calendarType === 'lunar'" class="lunar-date">
                ({{ getLunarDate(task.startDate) }})
              </span>
            </p>
            <p v-if="task.recurrence !== 'none'" class="recurrence-tag">
              {{ getRecurrenceLabel(task.recurrence) }}
            </p>
            <p v-if="task.description" class="task-desc">{{ task.description }}</p>
          </div>
          <div v-if="quadrantTasks.important_not_urgent.length === 0" class="empty-quadrant">
            无任务
          </div>
        </div>
      </div>

      <!-- 第三象限：紧急不重要 -->
      <div 
        class="quadrant not-important-urgent"
        @drop="onDrop($event, 'not_important_urgent')"
        @dragover.prevent
      >
        <div class="quadrant-header">
          <h3>紧急不重要</h3>
        </div>
        <div class="quadrant-content">
          <div 
            v-for="task in quadrantTasks.not_important_urgent" 
            :key="task.id"
            class="task-card"
            :style="{ borderLeftColor: getCategoryColor(task.categoryId) }"
            draggable="true"
            @dragstart="onDragStart($event, task.id)"
            @click="openTaskModal(task)"
          >
            <h4>{{ task.title }}</h4>
            <p class="task-time">
              {{ formatDate(task.startDate) }}
              <span v-if="task.calendarType === 'lunar'" class="lunar-date">
                ({{ getLunarDate(task.startDate) }})
              </span>
            </p>
            <p v-if="task.recurrence !== 'none'" class="recurrence-tag">
              {{ getRecurrenceLabel(task.recurrence) }}
            </p>
            <p v-if="task.description" class="task-desc">{{ task.description }}</p>
          </div>
          <div v-if="quadrantTasks.not_important_urgent.length === 0" class="empty-quadrant">
            无任务
          </div>
        </div>
      </div>

      <!-- 第四象限：不紧急不重要 -->
      <div 
        class="quadrant not-important-not-urgent"
        @drop="onDrop($event, 'not_important_not_urgent')"
        @dragover.prevent
      >
        <div class="quadrant-header">
          <h3>不紧急不重要</h3>
        </div>
        <div class="quadrant-content">
          <div 
            v-for="task in quadrantTasks.not_important_not_urgent" 
            :key="task.id"
            class="task-card"
            :style="{ borderLeftColor: getCategoryColor(task.categoryId) }"
            draggable="true"
            @dragstart="onDragStart($event, task.id)"
            @click="openTaskModal(task)"
          >
            <h4>{{ task.title }}</h4>
            <p class="task-time">
              {{ formatDate(task.startDate) }}
              <span v-if="task.calendarType === 'lunar'" class="lunar-date">
                ({{ getLunarDate(task.startDate) }})
              </span>
            </p>
            <p v-if="task.recurrence !== 'none'" class="recurrence-tag">
              {{ getRecurrenceLabel(task.recurrence) }}
            </p>
            <p v-if="task.description" class="task-desc">{{ task.description }}</p>
          </div>
          <div v-if="quadrantTasks.not_important_not_urgent.length === 0" class="empty-quadrant">
            无任务
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Task, QuadrantArea } from '../types';
import store from '../store';
import { getLunarCalendarInfo } from '../utils/lunarCalendar';

// 当前拖拽的任务ID
let draggedTaskId: string | null = null;

// 时间范围选项
const timeRanges = [
  { label: '今天', value: 'today' },
  { label: '近一周', value: 'week' },
  { label: '近一个月', value: 'month' },
  { label: '全部', value: 'all' }
];

// 选中的时间范围
const selectedTimeRange = ref('week');

// 是否显示自定义时间范围选择器
const showCustomRange = ref(false);

// 自定义时间范围
const customStartDate = ref('');
const customEndDate = ref('');

// 改变时间范围
const changeTimeRange = (range: string) => {
  selectedTimeRange.value = range;
  showCustomRange.value = false;
};

// 切换自定义时间范围选择器
const toggleCustomRange = () => {
  showCustomRange.value = !showCustomRange.value;
  if (showCustomRange.value) {
    selectedTimeRange.value = 'custom';
    // 初始化为今天和一周后
    const today = new Date();
    const weekLater = new Date(today);
    weekLater.setDate(today.getDate() + 7);
    customStartDate.value = today.toISOString().split('T')[0];
    customEndDate.value = weekLater.toISOString().split('T')[0];
  }
};

// 应用自定义时间范围
const applyCustomRange = () => {
  if (customStartDate.value && customEndDate.value) {
    selectedTimeRange.value = 'custom';
  }
};

// 根据时间范围过滤任务（暂未使用，保留供未来功能扩展）
/*
const filteredTasks = computed(() => {
  const allTasks = store.getters.allTasks.value;
  const now = new Date();

  return allTasks.filter(task => {
    const taskDate = new Date(task.startDate);

    switch (selectedTimeRange.value) {
      case 'today':
        return taskDate.toDateString() === now.toDateString();
      case 'week':
        const weekLater = new Date(now);
        weekLater.setDate(now.getDate() + 7);
        weekLater.setHours(23, 59, 59, 999);
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const taskWeekDate = new Date(taskDate);
        taskWeekDate.setHours(0, 0, 0, 0);
        return taskWeekDate >= todayStart && taskWeekDate <= weekLater;
      case 'month':
        const monthLater = new Date(now);
        monthLater.setMonth(now.getMonth() + 1);
        monthLater.setHours(23, 59, 59, 999);
        const todayStart2 = new Date(now);
        todayStart2.setHours(0, 0, 0, 0);
        const taskMonthDate = new Date(taskDate);
        taskMonthDate.setHours(0, 0, 0, 0);
        return taskMonthDate >= todayStart2 && taskMonthDate <= monthLater;
      case 'custom':
        if (customStartDate.value && customEndDate.value) {
          const startDate = new Date(customStartDate.value);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(customEndDate.value);
          endDate.setHours(23, 59, 59, 999);
          const taskCustomDate = new Date(taskDate);
          taskCustomDate.setHours(0, 0, 0, 0);
          return taskCustomDate >= startDate && taskCustomDate <= endDate;
        }
        return true;
      case 'all':
      default:
        return true;
    }
  });
});
*/

// 获取四象限任务数据
const quadrantTasks = computed(() => {
  const now = new Date();
  const rangeStart = new Date(now);
  const rangeEnd = new Date(now);

  switch (selectedTimeRange.value) {
    case 'today':
      rangeStart.setHours(0, 0, 0, 0);
      rangeEnd.setHours(23, 59, 59, 999);
      break;
    case 'week':
      rangeStart.setHours(0, 0, 0, 0);
      rangeEnd.setDate(now.getDate() + 7);
      rangeEnd.setHours(23, 59, 59, 999);
      break;
    case 'month':
      rangeStart.setHours(0, 0, 0, 0);
      rangeEnd.setMonth(now.getMonth() + 1);
      rangeEnd.setHours(23, 59, 59, 999);
      break;
    case 'custom':
      if (customStartDate.value && customEndDate.value) {
        rangeStart.setTime(new Date(customStartDate.value).getTime());
        rangeStart.setHours(0, 0, 0, 0);
        rangeEnd.setTime(new Date(customEndDate.value).getTime());
        rangeEnd.setHours(23, 59, 59, 999);
      } else {
        rangeStart.setFullYear(1900);
        rangeEnd.setFullYear(2100);
      }
      break;
    case 'all':
    default:
      rangeStart.setFullYear(1900);
      rangeEnd.setFullYear(2100);
      break;
  }
  
  const instances: Task[] = [];
  const allTasks = store.getters.allTasks.value;
  allTasks.forEach(task => {
    if (task.recurrence !== 'none') {
      const taskInstances = store.actions.getRecurrenceInstances(task, rangeStart, rangeEnd);
      instances.push(...taskInstances);
    } else if (new Date(task.startDate) >= rangeStart && new Date(task.startDate) <= rangeEnd) {
      instances.push(task);
    }
  });
  
  return {
    important_urgent: instances.filter((task: Task) => task.urgency === 'urgent' && task.importance === 'important'),
    important_not_urgent: instances.filter((task: Task) => task.urgency === 'not_urgent' && task.importance === 'important'),
    not_important_urgent: instances.filter((task: Task) => task.urgency === 'urgent' && task.importance === 'not_important'),
    not_important_not_urgent: instances.filter((task: Task) => task.urgency === 'not_urgent' && task.importance === 'not_important'),
  };
});

// 从实例id中提取原始任务id
const getOriginalTaskId = (instanceId: string): string => {
  // 周期任务实例id格式: originalId_dateISO
  const task = store.getters.allTasks.value.find(t => instanceId === t.id || instanceId.startsWith(t.id + '_'));
  return task ? task.id : instanceId;
};

// 拖拽开始
const onDragStart = (_event: DragEvent, taskId: string) => {
  draggedTaskId = taskId;
};

// 拖拽结束，放置任务
const onDrop = (_event: DragEvent, quadrant: QuadrantArea) => {
  if (draggedTaskId) {
    // 提取原始任务ID（处理周期任务实例）
    const originalId = getOriginalTaskId(draggedTaskId);
    // 调用store的更新函数来移动任务到新象限
    store.actions.moveTaskToQuadrant(originalId, quadrant);
    draggedTaskId = null;
  }
};

// 打开任务模态框
const openTaskModal = (task: Task) => {
  // 如果是周期任务实例（id格式为 originalId_dateISO），提取原始任务
  const originalId = getOriginalTaskId(task.id);
  const originalTask = store.getters.allTasks.value.find(t => t.id === originalId);

  // 确保传入的是原始任务对象，而不是实例
  if (originalTask) {
    store.actions.openTaskModal(originalTask);
  } else {
    // 如果找不到原始任务，说明可能是非周期任务，直接传入
    store.actions.openTaskModal(task);
  }
};

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 获取分类颜色
const getCategoryColor = (categoryId: string | null) => {
  if (!categoryId) return '#95a5a6';
  const allCategories = store.getters.allCategories.value;
  const category = allCategories.find((c: any) => c.id === categoryId);
  return category ? category.color : '#95a5a6';
};

// 获取农历日期
const getLunarDate = (dateString: string) => {
  try {
    const lunarInfo = getLunarCalendarInfo(new Date(dateString));
    return lunarInfo.fullStr;
  } catch (error) {
    return '';
  }
};

// 获取周期性标签
const getRecurrenceLabel = (recurrence: string) => {
  const labels: Record<string, string> = {
    yearly: '每年',
    monthly: '每月',
    weekly: '每周',
  };
  return labels[recurrence] || '';
};
</script>

<style scoped>
.quadrant-view {
  margin-top: 20px;
}

.quadrant-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.quadrant-header > div:first-child {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.quadrant-header h2 {
  margin: 0;
  color: #333;
}

.time-range-selector {
  display: flex;
  gap: 8px;
}

.time-range-selector button {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.custom-range-picker {
  width: 100%;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.custom-range-inputs {
  display: flex;
  align-items: center;
  gap: 12px;
}

.custom-range-inputs input[type="date"] {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
}

.custom-range-inputs span {
  color: #666;
  font-weight: bold;
}

.time-range-selector button:hover {
  background-color: #f0f0f0;
}

.time-range-selector button.active {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

.quadrant-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 20px;
  height: 80vh;
}

.quadrant {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 0.2s;
}

.quadrant:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.quadrant-header {
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.quadrant-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
}

.quadrant-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 象限样式 */
.important-urgent {
  border-top: 4px solid #e74c3c;
}

.important-urgent .quadrant-header {
  background-color: rgba(231, 76, 60, 0.1);
}

.important-not-urgent {
  border-top: 4px solid #3498db;
}

.important-not-urgent .quadrant-header {
  background-color: rgba(52, 152, 219, 0.1);
}

.not-important-urgent {
  border-top: 4px solid #f39c12;
}

.not-important-urgent .quadrant-header {
  background-color: rgba(243, 156, 18, 0.1);
}

.not-important-not-urgent {
  border-top: 4px solid #95a5a6;
}

.not-important-not-urgent .quadrant-header {
  background-color: rgba(149, 165, 166, 0.1);
}

/* 任务卡片 */
.task-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-left: 4px solid #95a5a6;
}

.task-card:hover {
  background-color: #f0f0f0;
}

.task-card h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.task-time {
  font-size: 12px;
  color: #666;
  margin: 0 0 8px 0;
}

.lunar-date {
  color: #9b59b6;
  font-size: 11px;
  margin-left: 4px;
}

.recurrence-tag {
  display: inline-block;
  background-color: #3498db;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 3px;
  margin-right: 4px;
  margin-bottom: 4px;
}

.task-desc {
  font-size: 12px;
  color: #666;
  margin: 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 空象限 */
.empty-quadrant {
  text-align: center;
  color: #999;
  font-style: italic;
  margin-top: 40px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .quadrant-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .time-range-selector {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .quadrant-grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, 1fr);
    height: auto;
    min-height: 1200px;
  }
  
  .quadrant {
    min-height: 300px;
  }
}
</style>