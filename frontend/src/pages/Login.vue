<template>
  <div class="flex flex-col items-center justify-center min-h-[70vh]">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <h2 class="text-3xl font-extrabold text-gray-900 text-center mb-8">Welcome</h2>
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="flex items-center justify-center space-x-4 mb-4">
          <button type="button" @click="isRegistering = false" :class="['px-4 py-2 text-sm font-medium rounded-md', !isRegistering ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-50']">Login</button>
          <button type="button" @click="isRegistering = true" :class="['px-4 py-2 text-sm font-medium rounded-md', isRegistering ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-50']">Register</button>
        </div>

        <div v-if="isRegistering">
          <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
          <input id="name" v-model="name" type="text" :required="isRegistering" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border" placeholder="John Doe" />
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email Address</label>
          <input id="email" v-model="email" type="email" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border" placeholder="you@example.com" />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input id="password" v-model="password" type="password" required minlength="8" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border" placeholder="••••••••" />
        </div>

        <button type="submit" :disabled="loading" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50">
          {{ loading ? 'Processing...' : (isRegistering ? 'Register' : 'Login') }}
        </button>
        <p v-if="error" class="mt-2 text-center text-sm text-red-600">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { account, ID } from '../services/appwrite'

const router = useRouter()
const authStore = useAuthStore()

const isRegistering = ref(false)
const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  error.value = ''
  loading.value = true
  try {
    if (isRegistering.value) {
      try {
        await account.create(ID.unique(), email.value, password.value, name.value)
      } catch (e: any) {
         if (e.code === 409) {
           console.log('User already exists, attempting to login')
         } else {
           throw e
         }
      }
    }

    // Clean old session
    try {
        await account.deleteSession('current')
    } catch(e) {}

    await account.createEmailPasswordSession(email.value, password.value)
    await authStore.checkAuth()
    router.push('/')
  } catch (err: any) {
    error.value = err.message || 'Authentication failed'
  } finally {
    loading.value = false
  }
}
</script>
