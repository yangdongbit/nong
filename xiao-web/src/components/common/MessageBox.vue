<template>
  <transition name="fade">
    <div v-if="visible" class="message-box" :class="type">
      <span class="message-icon">
        {{ icon }}
      </span>
      <span class="message-content">{{ message }}</span>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'info'
  },
  duration: {
    type: Number,
    default: 2000
  }
});

const visible = ref(false);

const icon = computed(() => {
  switch (props.type) {
    case 'success':
      return '✓';
    case 'error':
      return '✕';
    case 'warning':
      return '!';
    default:
      return 'i';
  }
});

onMounted(() => {
  visible.value = true;
  setTimeout(() => {
    visible.value = false;
  }, props.duration);
});
</script>

<style scoped>
.message-box {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 9999;
}

.message-icon {
  font-weight: bold;
  font-size: 16px;
}

.message-content {
  font-size: 14px;
}

.success {
  background-color: #f0f9eb;
  color: #67c23a;
  border: 1px solid #c2e7b0;
}

.error {
  background-color: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fbc4c4;
}

.warning {
  background-color: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #f5dab1;
}

.info {
  background-color: #f4f4f5;
  color: #909399;
  border: 1px solid #d3d4d6;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style> 