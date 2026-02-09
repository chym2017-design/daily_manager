<template>
  <div class="app">
    <!-- 应用标题和操作栏 -->
    <header class="app-header">
      <h1>日程管理</h1>
      <div class="header-actions">
        <button class="add-task-btn" @click="openTaskModal">
          + 添加任务
        </button>
        <button class="export-btn" @click="exportData">
          导出数据
        </button>
        <input 
          type="file" 
          ref="fileInput" 
          style="display: none;" 
          accept=".json"
          @change="importData"
        >
        <button class="import-btn" @click="handleImportClick">
          导入数据
        </button>
      </div>
    </header>

    <!-- 视图切换导航 -->
    <nav class="view-nav">
      <button 
        v-for="view in views" 
        :key="view.value"
        :class="{ active: currentView === view.value }"
        @click="setCurrentView(view.value)"
      >
        {{ view.label }}
      </button>
    </nav>

    <!-- 主要内容区域 -->
    <main class="app-content">
      <!-- 日历视图 -->
      <CalendarView 
        v-if="currentView === 'month' || currentView === 'week' || currentView === 'day'" 
        :view-type="currentView" 
      />
      
      <!-- 四象限视图 -->
      <QuadrantView v-if="currentView === 'quadrant'" />
    </main>

    <!-- 任务模态框 -->
    <TaskModal />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import CalendarView from './components/CalendarView.vue';
import QuadrantView from './components/QuadrantView.vue';
import TaskModal from './components/TaskModal.vue';
import type { ViewType } from './types';
import store from './store';

// 视图配置
const views = [
  { label: '四象限视图', value: 'quadrant' as ViewType },
  { label: '月视图', value: 'month' as ViewType },
  { label: '周视图', value: 'week' as ViewType },
  { label: '日视图', value: 'day' as ViewType },
];

// 文件输入引用
const fileInput = ref<HTMLInputElement | null>(null);

// 计算属性：当前视图
const currentView = computed(() => store.getters.currentView.value);

// 设置当前视图
const setCurrentView = (view: ViewType) => {
  store.actions.setCurrentView(view);
};

// 打开任务模态框
const openTaskModal = () => {
  store.actions.openTaskModal(null);
};

// 导出数据
const exportData = () => {
  store.actions.exportData();
};

// 处理导入点击
const handleImportClick = () => {
  fileInput.value?.click();
};

// 导入数据
const importData = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        store.actions.importData(data);
        alert('数据导入成功！');
      } catch (error) {
        alert('数据导入失败，请确保文件格式正确。');
      }
    };
    reader.readAsText(file);
  }
  
  // 重置文件输入
  target.value = '';
};
</script>

<style scoped>
.app {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

/* 应用头部 */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.app-header h1 {
  color: #333;
  font-size: 24px;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.add-task-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.add-task-btn:hover {
  background-color: #2980b9;
}

.export-btn,
.import-btn {
  background-color: #f0f0f0;
  color: #333;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.export-btn:hover,
.import-btn:hover {
  background-color: #e0e0e0;
}

/* 视图导航 */
.view-nav {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.view-nav button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  flex: 1;
  text-align: center;
}

.view-nav button:hover {
  background-color: #e3f2fd;
}

.view-nav button.active {
  background-color: #3498db;
  color: white;
}

/* 应用内容 */
.app-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 20px;
  min-height: 600px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app {
    padding: 10px;
  }
  
  .app-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .view-nav {
    flex-direction: column;
  }
  
  .view-nav button {
    width: 100%;
  }
  
  .app-content {
    padding: 12px;
    min-height: 500px;
  }
}
</style>