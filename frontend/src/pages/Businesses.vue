<template>
  <div class="space-y-6">
    <div class="bg-indigo-600 rounded-xl p-6 text-white shadow-md">
      <h2 class="text-2xl font-bold">Nearby Businesses</h2>
      <p class="text-indigo-100 mt-1">Discover new local favorites</p>
    </div>

    <div v-if="loading" class="flex justify-center p-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>

    <div v-else class="grid grid-cols-1 gap-4">
      <div v-for="biz in businesses" :key="biz.id" class="bg-white rounded-xl shadow border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        <div class="p-5">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-lg font-bold text-gray-900">{{ biz.name }}</h3>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              {{ biz.category }}
            </span>
          </div>
          <p class="text-gray-600 text-sm mt-2">{{ biz.shortDescription }}</p>
          <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            <span class="text-xs text-gray-500">Local Business</span>
            <button class="text-indigo-600 text-sm font-medium hover:text-indigo-800">View Details &rarr;</button>
          </div>
        </div>
      </div>

      <div v-if="businesses.length === 0" class="text-center py-10 bg-white shadow rounded-xl border border-gray-100">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No businesses yet</h3>
        <p class="mt-1 text-sm text-gray-500">Check back later for new local spots.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const businesses = ref<any[]>([])
const loading = ref(true)

const fetchBusinesses = async () => {
  try {
    const res = await fetch('/api/businesses', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    const data = await res.json()
    if (res.ok) {
      businesses.value = data.businesses || []
    }
  } catch (err) {
    console.error('Failed to fetch businesses', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchBusinesses()
})
</script>
