<template>
  <div v-if="needRefresh" class="fixed bottom-4 right-4 bg-white border border-gray-200 shadow-xl rounded-xl p-4 z-50 animate-fade-in-up">
    <div class="flex items-start space-x-3">
      <div class="flex-shrink-0">
        <svg class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
      <div class="flex-1">
        <p class="text-sm font-medium text-gray-900">New content available!</p>
        <p class="text-xs text-gray-500 mt-1">Please refresh to update.</p>
        <div class="mt-3 flex space-x-3">
          <button @click="updateServiceWorker()" class="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 font-medium transition-colors">
            Reload
          </button>
          <button @click="close" class="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-200 font-medium transition-colors">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue'

const { needRefresh, updateServiceWorker } = useRegisterSW({
  onRegistered(r: any) {
    console.log('SW Registered: ', r)
  },
  onRegisterError(error: any) {
    console.log('SW registration error', error)
  }
})

const close = () => {
  needRefresh.value = false
}
</script>

<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out;
}
</style>
