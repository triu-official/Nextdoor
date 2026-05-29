<template>
  <div class="min-h-screen bg-gray-100 flex justify-center">
    <div class="w-full max-w-2xl bg-white shadow-lg min-h-screen flex flex-col relative">
      <!-- Top Navigation -->
      <header class="bg-indigo-600 text-white shadow-md z-10 p-4 flex justify-between items-center sticky top-0">
        <h1 class="text-xl font-extrabold tracking-tight">SALTEDHASH</h1>
        <div v-if="authStore.isAuthenticated" class="text-sm font-medium">
          {{ authStore.user?.name }}
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="flex-grow p-4 overflow-y-auto pb-24">
        <router-view></router-view>
      </main>

      <!-- Bottom Tab Bar -->
      <nav v-if="authStore.isAuthenticated" class="fixed bottom-0 w-full max-w-2xl bg-white border-t border-gray-200 flex justify-around p-3 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <router-link to="/" class="flex flex-col items-center text-gray-500 hover:text-indigo-600 transition-colors" exact-active-class="text-indigo-600">
          <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          <span class="text-xs font-medium">Feed</span>
        </router-link>

        <router-link to="/businesses" class="flex flex-col items-center text-gray-500 hover:text-indigo-600 transition-colors" exact-active-class="text-indigo-600">
          <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          <span class="text-xs font-medium">Local</span>
        </router-link>

        <router-link to="/circles" class="flex flex-col items-center text-gray-500 hover:text-indigo-600 transition-colors" exact-active-class="text-indigo-600">
          <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          <span class="text-xs font-medium">Circles</span>
        </router-link>

        <button @click="logout" class="flex flex-col items-center text-gray-500 hover:text-red-500 transition-colors">
          <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          <span class="text-xs font-medium">Logout</span>
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from './stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
