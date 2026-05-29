<template>
  <div class="flex flex-col items-center justify-center min-h-[70vh]">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <h2 class="text-3xl font-extrabold text-gray-900 text-center mb-8">Welcome Back</h2>
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">Name <span class="text-gray-400 font-normal">(if registering)</span></label>
          <input id="name" v-model="name" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border" placeholder="John Doe" />
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email Address</label>
          <input id="email" v-model="email" type="email" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border" placeholder="you@example.com" />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input id="password" v-model="password" type="password" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border" placeholder="••••••••" />
        </div>

        <button type="submit" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
          Continue
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

const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')

const handleSubmit = async () => {
  error.value = ''
  try {
    let url = '/api/auth/login'
    let body: any = { email: email.value, password: password.value }

    if (name.value) {
      url = '/api/auth/register'
      body.name = name.value
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Failed to authenticate')
    }

    authStore.login(data.user, data.token)
    router.push('/')
  } catch (err: any) {
    error.value = err.message
  }
}
</script>
