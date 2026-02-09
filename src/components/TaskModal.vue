<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ isEditing ? '编辑任务' : '添加任务' }}</h2>
        <button class="close-btn" @click="closeModal">
          ×
        </button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="saveTask">
          <!-- 1. 任务标题 -->
          <div class="form-group">
            <label for="title">任务标题 *</label>
            <input 
              type="text" 
              id="title" 
              v-model="formData.title" 
              required 
              placeholder="请输入任务标题"
            >
          </div>

          <!-- 2. 选择重复次数 -->
          <div class="form-group">
            <label>重复次数 *</label>
            <div class="radio-group">
              <label>
                <input 
                  type="radio" 
                  v-model="formData.recurrence" 
                  value="none"
                >
                一次
              </label>
              <label>
                <input 
                  type="radio" 
                  v-model="formData.recurrence" 
                  value="daily"
                >
                每天
              </label>
              <label>
                <input 
                  type="radio" 
                  v-model="formData.recurrence" 
                  value="weekly"
                >
                每周
              </label>
              <label>
                <input 
                  type="radio" 
                  v-model="formData.recurrence" 
                  value="monthly"
                >
                每月
              </label>
              <label>
                <input 
                  type="radio" 
                  v-model="formData.recurrence" 
                  value="yearly"
                >
                每年
              </label>
            </div>
          </div>

          <!-- 3. 选择日历类型 -->
          <div class="form-group">
            <label>日历类型 *</label>
            <div class="radio-group">
              <label>
                <input 
                  type="radio" 
                  v-model="formData.calendarType" 
                  value="gregorian"
                >
                公历
              </label>
              <label>
                <input 
                  type="radio" 
                  v-model="formData.calendarType" 
                  value="lunar"
                >
                农历
              </label>
            </div>
          </div>

          <!-- 4. 时间选择 -->
          <div class="form-group">
            <label>{{ timeRangeLabel }} *</label>
            <div class="time-range-inputs">
              <div class="time-input">
                <label for="startDate">{{ startDateLabel }}</label>
                <input
                  v-if="formData.calendarType === 'gregorian'"
                  type="datetime-local"
                  id="startDate"
                  v-model="formData.startDate"
                  required
                >
                <LunarDatePicker
                  v-if="formData.calendarType === 'lunar'"
                  v-model="formData.startDate"
                />
              </div>
              <div class="time-input">
                <label for="endDate">{{ endDateLabel }}</label>
                <input
                  v-if="formData.calendarType === 'gregorian'"
                  type="datetime-local"
                  id="endDate"
                  v-model="formData.endDate"
                  required
                >
                <LunarDatePicker
                  v-if="formData.calendarType === 'lunar'"
                  v-model="formData.endDate"
                />
              </div>
            </div>
            <div v-if="formData.recurrence !== 'none'" class="time-hint">
              提示：开始时间和结束时间表示重复周期的范围
            </div>
          </div>

          <!-- 每周重复时的星期选择 -->
          <div v-if="formData.recurrence === 'weekly'" class="form-group">
            <label>选择星期 *</label>
            <div class="weekdays-selector">
              <label v-for="(day, index) in weekdays" :key="index">
                <input
                  type="checkbox"
                  :value="index"
                  v-model="selectedWeekdays"
                >
                {{ day }}
              </label>
            </div>
            <div class="time-hint">
              提示：选择的星期几是任务实际发生的时间
            </div>
          </div>

          <!-- 每月重复时的日期选择 -->
          <div v-if="formData.recurrence === 'monthly'" class="form-group">
            <label>选择日期 *</label>
            <div class="date-selector">
              <select v-model="formData.monthlyDay" required>
                <option value="" disabled>选择日期</option>
                <option v-for="day in (formData.calendarType === 'lunar' ? lunarDays : 31)" :key="day" :value="day">
                  {{ formData.calendarType === 'lunar' ? getLunarDayLabel(day) : `${day}日` }}
                </option>
              </select>
            </div>
          </div>

          <!-- 每年重复时的月份和日期选择 -->
          <div v-if="formData.recurrence === 'yearly'" class="form-group">
            <label>选择月份和日期 *</label>
            <div class="date-selector">
              <select v-model="formData.yearlyMonth" required>
                <option value="" disabled>选择月份</option>
                <option v-for="month in 12" :key="month" :value="month">
                  {{ formData.calendarType === 'lunar' ? getLunarMonthLabel(month) : `${month}月` }}
                </option>
              </select>
              <select v-model="formData.yearlyDay" required>
                <option value="" disabled>选择日期</option>
                <option v-for="day in (formData.calendarType === 'lunar' ? lunarDays : 31)" :key="day" :value="day">
                  {{ formData.calendarType === 'lunar' ? getLunarDayLabel(day) : `${day}日` }}
                </option>
              </select>
            </div>
          </div>

          <!-- 5. 紧急程度和重要程度 -->
          <div class="form-group">
            <label>紧急程度</label>
            <div class="radio-group">
              <label>
                <input 
                  type="radio" 
                  v-model="formData.urgency" 
                  value="urgent"
                >
                紧急
              </label>
              <label>
                <input 
                  type="radio" 
                  v-model="formData.urgency" 
                  value="not_urgent"
                >
                不紧急
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>重要程度</label>
            <div class="radio-group">
              <label>
                <input 
                  type="radio" 
                  v-model="formData.importance" 
                  value="important"
                >
                重要
              </label>
              <label>
                <input 
                  type="radio" 
                  v-model="formData.importance" 
                  value="not_important"
                >
                不重要
              </label>
            </div>
          </div>

          <!-- 6. 提醒时间 -->
          <div class="form-group">
            <label>提醒时间</label>
            <div class="reminder-input">
              <input 
                type="number" 
                v-model="formData.reminderDays" 
                min="0"
                placeholder="0"
              >
              <span>天前</span>
            </div>
          </div>

          <!-- 任务描述 -->
          <div class="form-group">
            <label for="description">任务描述</label>
            <textarea 
              id="description" 
              v-model="formData.description" 
              placeholder="请输入任务描述"
              rows="3"
            ></textarea>
          </div>

          <!-- 操作按钮 -->
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn cancel-btn" 
              @click="closeModal"
            >
              取消
            </button>
            <button 
              type="button" 
              v-if="isEditing" 
              class="btn delete-btn" 
              @click="deleteTask"
            >
              删除
            </button>
            <button type="submit" class="btn save-btn">
              {{ isEditing ? '保存' : '添加' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { UrgencyLevel, ImportanceLevel, CalendarType, RecurrenceType } from '../types';
import store from '../store';
import LunarDatePicker from './LunarDatePicker.vue';

// 计算属性：模态框是否打开
const isOpen = computed(() => store.getters.isTaskModalOpen.value);

// 计算属性：是否正在编辑任务
const isEditing = computed(() => store.getters.selectedTask.value !== null);

// 计算属性：当前选中的任务
const selectedTask = computed(() => store.getters.selectedTask.value);

// 计算属性：时间范围标签
const timeRangeLabel = computed(() => {
  return formData.value.recurrence === 'none' ? '时间范围' : '重复周期范围';
});

// 计算属性：开始时间标签
const startDateLabel = computed(() => {
  return formData.value.recurrence === 'none' ? '开始时间' : '周期开始时间';
});

// 计算属性：结束时间标签
const endDateLabel = computed(() => {
  return formData.value.recurrence === 'none' ? '结束时间' : '周期结束时间';
});

// 星期几选项
const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

// 选中的星期几
const selectedWeekdays = ref<number[]>([]);

// 农历日期数量（最多30天）
const lunarDays = 30;

// 获取农历日期标签
const getLunarDayLabel = (day: number): string => {
  const dayLabels = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
                     '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
                     '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
  return dayLabels[day - 1] || `${day}`;
};

// 获取农历月份标签
const getLunarMonthLabel = (month: number): string => {
  const monthLabels = ['正月', '二月', '三月', '四月', '五月', '六月',
                       '七月', '八月', '九月', '十月', '冬月', '腊月'];
  return monthLabels[month - 1] || `${month}月`;
};

// 将 ISO 字符串转换为 datetime-local 格式
const formatDateTimeLocal = (isoString: string): string => {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// 表单数据
const formData = ref({
  title: '',
  description: '',
  startDate: formatDateTimeLocal(new Date().toISOString()),
  endDate: formatDateTimeLocal(new Date(Date.now() + 60 * 60 * 1000).toISOString()),
  urgency: 'not_urgent' as UrgencyLevel,
  importance: 'not_important' as ImportanceLevel,
  categoryId: '',
  reminderDays: 0 as number,
  calendarType: 'gregorian' as CalendarType,
  recurrence: 'none' as RecurrenceType,
  lunarMonth: null as number | null,
  lunarDay: null as number | null,
  weekdays: [] as number[],
  monthlyDay: null as number | null,
  yearlyMonth: null as number | null,
  yearlyDay: null as number | null,
});

// 监听选中任务的变化，更新表单数据
watch(selectedTask, (newTask) => {
  if (newTask) {
    formData.value = {
      title: newTask.title || '',
      description: newTask.description || '',
      startDate: formatDateTimeLocal(newTask.startDate),
      endDate: formatDateTimeLocal(newTask.endDate),
      urgency: newTask.urgency || 'not_urgent',
      importance: newTask.importance || 'not_important',
      categoryId: newTask.categoryId || '',
      reminderDays: newTask.reminderDays || 0,
      calendarType: newTask.calendarType || 'gregorian',
      recurrence: newTask.recurrence || 'none',
      lunarMonth: newTask.lunarMonth || null,
      lunarDay: newTask.lunarDay || null,
      weekdays: newTask.weekdays || [],
      monthlyDay: newTask.monthlyDay || null,
      yearlyMonth: newTask.yearlyMonth || null,
      yearlyDay: newTask.yearlyDay || null,
    };
    selectedWeekdays.value = newTask.weekdays || [];
  } else {
    // 重置表单
    formData.value = {
      title: '',
      description: '',
      startDate: formatDateTimeLocal(new Date().toISOString()),
      endDate: formatDateTimeLocal(new Date(Date.now() + 60 * 60 * 1000).toISOString()),
      urgency: 'not_urgent',
      importance: 'not_important',
      categoryId: '',
      reminderDays: 0,
      calendarType: 'gregorian',
      recurrence: 'none',
      lunarMonth: null,
      lunarDay: null,
      weekdays: [],
      monthlyDay: null,
      yearlyMonth: null,
      yearlyDay: null,
    };
    selectedWeekdays.value = [];
  }
}, { immediate: true });

// 监听选中的星期几变化
watch(selectedWeekdays, (newWeekdays) => {
  formData.value.weekdays = newWeekdays;
});

// 保存任务
const saveTask = () => {
  // 转换日期格式
  const formattedStartDate = new Date(formData.value.startDate).toISOString();
  const formattedEndDate = new Date(formData.value.endDate).toISOString();
  
  // 计算提醒时间
  const reminder = formData.value.reminderDays > 0 
    ? new Date(new Date(formattedStartDate).getTime() - formData.value.reminderDays * 24 * 60 * 60 * 1000).toISOString()
    : null;

  if (isEditing.value && selectedTask.value) {
    // 编辑任务
    store.actions.updateTask(selectedTask.value.id, {
      title: formData.value.title,
      description: formData.value.description,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      urgency: formData.value.urgency,
      importance: formData.value.importance,
      categoryId: formData.value.categoryId || null,
      reminder: reminder,
      reminderDays: formData.value.reminderDays,
      calendarType: formData.value.calendarType,
      recurrence: formData.value.recurrence,
      lunarMonth: formData.value.lunarMonth,
      lunarDay: formData.value.lunarDay,
      weekdays: formData.value.weekdays,
      monthlyDay: formData.value.monthlyDay,
      yearlyMonth: formData.value.yearlyMonth,
      yearlyDay: formData.value.yearlyDay,
    });
  } else {
    // 添加任务
    store.actions.addTask({
      title: formData.value.title,
      description: formData.value.description,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      urgency: formData.value.urgency,
      importance: formData.value.importance,
      categoryId: formData.value.categoryId || null,
      reminder: reminder,
      reminderDays: formData.value.reminderDays,
      calendarType: formData.value.calendarType,
      recurrence: formData.value.recurrence,
      lunarMonth: formData.value.lunarMonth,
      lunarDay: formData.value.lunarDay,
      weekdays: formData.value.weekdays,
      monthlyDay: formData.value.monthlyDay,
      yearlyMonth: formData.value.yearlyMonth,
      yearlyDay: formData.value.yearlyDay,
    });
  }

  closeModal();
};

// 删除任务
const deleteTask = () => {
  if (isEditing.value && selectedTask.value) {
    if (confirm('确定要删除这个任务吗？')) {
      store.actions.deleteTask(selectedTask.value.id);
      closeModal();
    }
  }
};

// 关闭模态框
const closeModal = () => {
  store.actions.closeTaskModal();
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #f0f0f0;
  color: #333;
}

.modal-body {
  padding: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.radio-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: normal;
  cursor: pointer;
}

.time-range-inputs {
  display: flex;
  gap: 12px;
}

.time-input {
  flex: 1;
}

.time-input label {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  font-weight: normal;
  color: #666;
}

.weekdays-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.weekdays-selector label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: normal;
  cursor: pointer;
}

.date-selector {
  display: flex;
  gap: 12px;
}

.date-selector select {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.reminder-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reminder-input input {
  width: 80px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.reminder-input span {
  color: #666;
  font-size: 14px;
}

.time-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #3498db;
  font-style: italic;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.cancel-btn {
  background-color: #f0f0f0;
  color: #333;
}

.cancel-btn:hover {
  background-color: #e0e0e0;
}

.delete-btn {
  background-color: #e74c3c;
  color: white;
}

.delete-btn:hover {
  background-color: #c0392b;
}

.save-btn {
  background-color: #2ecc71;
  color: white;
}

.save-btn:hover {
  background-color: #27ae60;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 20px;
  }
  
  .modal-header h2 {
    font-size: 18px;
  }
  
  .form-group input,
  .form-group textarea,
  .form-group select {
    font-size: 16px;
  }
  
  .radio-group {
    flex-direction: column;
    gap: 8px;
  }
  
  .weekdays-selector {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .time-range-inputs,
  .date-selector {
    flex-direction: column;
  }
  
  .modal-footer {
    flex-wrap: wrap;
  }
  
  .btn {
    flex: 1;
    min-width: 100px;
  }
}
</style>
