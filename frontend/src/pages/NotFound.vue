<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
    <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full">
      <h1 class="text-6xl font-extrabold text-indigo-600 mb-4">404</h1>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
      <p class="text-gray-500 mb-6">The page you are looking for doesn't exist or has been moved.</p>
      <router-link to="/" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
        Back to Home
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
