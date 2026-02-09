<template>
  <div class="lunar-date-picker">
    <div class="lunar-date-inputs">
      <div class="lunar-date-field">
        <label>农历年份</label>
        <select v-model="lunarYear" @change="emitChange">
          <option v-for="year in years" :key="year" :value="year">
            {{ year }}年
          </option>
        </select>
      </div>
      <div class="lunar-date-field">
        <label>农历月份</label>
        <select v-model="selectedMonthKey" @change="handleMonthChange">
          <option value="" disabled>选择月份</option>
          <option v-for="(month, index) in lunarMonths" :key="index" :value="index">
            {{ month.label }}
          </option>
        </select>
      </div>
      <div class="lunar-date-field">
        <label>农历日期</label>
        <select v-model="lunarDay" @change="emitChange">
          <option value="" disabled>选择日期</option>
          <option v-for="day in maxLunarDay" :key="day" :value="day">
            {{ day }}日
          </option>
        </select>
      </div>
    </div>
    <div class="gregorian-hint" v-if="gregorianDate">
      公历日期：{{ gregorianDate }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { lunarToGregorian, gregorianToLunar, getLunarMonthsOfYear, getLunarMonthDays } from '../utils/lunarCalendar';

const props = defineProps<{
  modelValue?: string | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string | null];
}>();

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => currentYear - 50 + i);

const lunarYear = ref(currentYear);
const lunarMonth = ref<number | null>(null);
const lunarDay = ref<number | null>(null);
const isLeapMonth = ref(false);

// 使用工具函数获取真实的农历月份（包括闰月）
const lunarMonths = computed(() => {
  if (!lunarYear.value) {
    return [];
  }
  return getLunarMonthsOfYear(lunarYear.value);
});

// 选中的月份索引（用于区分普通月和闰月）
const selectedMonthKey = ref<number | null>(null);

// 监听选中的月份索引变化，更新实际的月份和闰月标志
watch(selectedMonthKey, (newKey) => {
  if (newKey !== null && lunarMonths.value[newKey]) {
    const selectedMonth = lunarMonths.value[newKey];
    lunarMonth.value = selectedMonth.value;
    isLeapMonth.value = selectedMonth.isLeap;
  }
});

const maxLunarDay = computed(() => {
  if (!lunarYear.value || !lunarMonth.value) {
    return 30;
  }
  return getLunarMonthDays(lunarYear.value, lunarMonth.value, isLeapMonth.value);
});

const gregorianDate = computed(() => {
  if (!lunarYear.value || !lunarMonth.value || !lunarDay.value) {
    return '';
  }
  
  try {
    const date = lunarToGregorian(lunarYear.value, lunarMonth.value, lunarDay.value, isLeapMonth.value);
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch (error) {
    return '';
  }
});

function handleMonthChange() {
  emitChange();
}

const emitChange = () => {
  if (lunarYear.value && lunarMonth.value && lunarDay.value) {
    try {
      const date = lunarToGregorian(lunarYear.value, lunarMonth.value, lunarDay.value, isLeapMonth.value);
      const hours = new Date().getHours();
      const minutes = new Date().getMinutes();
      date.setHours(hours, minutes);
      emit('update:modelValue', date.toISOString());
    } catch (error) {
      emit('update:modelValue', null);
    }
  } else {
    emit('update:modelValue', null);
  }
};

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    const date = new Date(newValue);
    const lunar = gregorianToLunar(date);
    lunarYear.value = lunar.year;
    lunarMonth.value = lunar.month;
    lunarDay.value = lunar.day;
    isLeapMonth.value = lunar.isLeapMonth;

    // 找到对应的月份索引
    const months = getLunarMonthsOfYear(lunar.year);
    const monthIndex = months.findIndex(m =>
      m.value === lunar.month && m.isLeap === lunar.isLeapMonth
    );
    selectedMonthKey.value = monthIndex >= 0 ? monthIndex : null;
  }
}, { immediate: true });
</script>

<style scoped>
.lunar-date-picker {
  width: 100%;
}

.lunar-date-inputs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.lunar-date-field {
  flex: 1;
  min-width: 120px;
}

.lunar-date-field label {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  font-weight: normal;
  color: #666;
}

.lunar-date-field select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.gregorian-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
  font-style: italic;
}

@media (max-width: 768px) {
  .lunar-date-inputs {
    flex-direction: column;
  }
  
  .lunar-date-field {
    min-width: 100%;
  }
}
</style>
