<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
    <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full">
      <svg class="mx-auto h-16 w-16 text-indigo-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
      </svg>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">You're Offline</h2>
      <p class="text-gray-500 mb-6">It looks like you've lost your connection. We've cached some content for you, or you can try reconnecting.</p>
      <div class="space-y-3">
        <button @click="retry" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
          Try Again
        </button>
        <router-link to="/" class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
          View Cached Feed
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const retry = () => {
  if (navigator.onLine) {
    router.go(-1)
  } else {
    alert('Still offline. Please check your connection.')
  }
}
</script>
