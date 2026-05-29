<template>
  <div class="space-y-6">
    <div class="bg-indigo-600 rounded-xl p-6 text-white shadow-md">
      <h2 class="text-2xl font-bold">Community Circles</h2>
      <p class="text-indigo-100 mt-1">Connect with your society</p>
    </div>

    <div v-if="loading" class="flex justify-center p-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>

    <div v-else class="space-y-6">
      <!-- Societies List -->
      <div v-if="!selectedSociety" class="grid grid-cols-1 gap-4">
        <h3 class="text-lg font-medium text-gray-900 px-1">Your Societies</h3>
        <div v-for="society in societies" :key="society.id" @click="selectSociety(society)" class="bg-white rounded-xl shadow border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer p-5 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-gray-900">{{ society.name }}</h3>
            <p class="text-sm text-gray-500">{{ society.locality }}, {{ society.city }}</p>
          </div>
          <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>

        <div v-if="societies.length === 0" class="text-center py-10 bg-white shadow rounded-xl border border-gray-100">
          <p class="text-sm text-gray-500">You haven't joined any societies yet.</p>
        </div>
      </div>

      <!-- Channels List -->
      <div v-else class="space-y-4">
        <button @click="selectedSociety = null" class="text-indigo-600 flex items-center space-x-1 hover:text-indigo-800 text-sm font-medium">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
          <span>Back to Societies</span>
        </button>

        <h3 class="text-xl font-bold text-gray-900 px-1">{{ selectedSociety.name }} Channels</h3>

        <div v-for="channel in channels" :key="channel.id" class="bg-white rounded-xl shadow border border-gray-100 overflow-hidden p-5">
           <div class="flex justify-between items-center mb-4 cursor-pointer hover:text-indigo-600 transition-colors" @click="toggleChannel(channel.id)">
             <h4 class="text-md font-bold text-gray-800 flex items-center">
               <span class="text-gray-400 mr-2">#</span> {{ channel.name }}
             </h4>
             <svg class="h-5 w-5 text-gray-400" :class="{'transform rotate-180': activeChannels[channel.id]}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
           </div>

           <!-- Messages -->
           <div v-if="activeChannels[channel.id]" class="mt-4 pt-4 border-t border-gray-100">
             <div v-if="messagesLoading[channel.id]" class="text-xs text-gray-400 my-2">Loading messages...</div>
             <div v-else class="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
               <div v-for="msg in channelMessages[channel.id] || []" :key="msg.id" class="bg-gray-50 p-3 rounded-lg text-sm border border-gray-100">
                 <div class="font-medium text-gray-800 mb-1 flex justify-between">
                   <span>{{ msg.authorName || msg.userId }}</span>
                   <span class="text-xs text-gray-400 font-normal">{{ new Date(msg.createdAt).toLocaleTimeString() }}</span>
                 </div>
                 <p class="text-gray-600">{{ msg.content }}</p>
               </div>
               <p v-if="!(channelMessages[channel.id] || []).length" class="text-xs text-gray-400 italic text-center py-2">No messages yet. Say hello!</p>
             </div>

             <div class="flex items-center space-x-2">
               <input v-model="newMessage[channel.id]" type="text" placeholder="Message..." class="flex-1 rounded-full border-gray-300 bg-gray-50 text-sm px-4 py-2 border focus:ring-indigo-500 focus:border-indigo-500" @keyup.enter="postMessage(channel.id)">
               <button @click="postMessage(channel.id)" :disabled="!newMessage[channel.id]" class="bg-indigo-600 text-white rounded-full p-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex-shrink-0">
                 <svg class="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
               </button>
             </div>
           </div>
        </div>

        <div v-if="channels.length === 0" class="text-center py-10 bg-white shadow rounded-xl border border-gray-100">
          <p class="text-sm text-gray-500">No channels found for this society.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const societies = ref<any[]>([])
const channels = ref<any[]>([])
const selectedSociety = ref<any | null>(null)
const loading = ref(true)

const activeChannels = ref<Record<string, boolean>>({})
const channelMessages = ref<Record<string, any[]>>({})
const messagesLoading = ref<Record<string, boolean>>({})
const newMessage = ref<Record<string, string>>({})

const fetchSocieties = async () => {
  try {
    const res = await fetch('/api/societies', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    const data = await res.json()
    if (res.ok) {
      societies.value = data.societies || []
    }
  } catch (err) {
    console.error('Failed to fetch societies', err)
  } finally {
    loading.value = false
  }
}

const selectSociety = async (society: any) => {
  selectedSociety.value = society
  try {
    const res = await fetch(`/api/channels/${society.id}`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    const data = await res.json()
    if (res.ok) {
      channels.value = data.channels || []
    }
  } catch (err) {
    console.error('Failed to fetch channels', err)
  }
}

const fetchMessages = async (channelId: string) => {
  messagesLoading.value[channelId] = true
  try {
    const res = await fetch(`/api/messages/${channelId}`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    const data = await res.json()
    if (res.ok) {
      channelMessages.value[channelId] = data.messages || []
    }
  } catch (err) {
    console.error('Failed to fetch messages', err)
  } finally {
    messagesLoading.value[channelId] = false
  }
}

const toggleChannel = async (channelId: string) => {
  activeChannels.value[channelId] = !activeChannels.value[channelId]
  if (activeChannels.value[channelId] && !channelMessages.value[channelId]) {
    await fetchMessages(channelId)
  }
}

const postMessage = async (channelId: string) => {
  const content = newMessage.value[channelId]
  if (!content) return

  try {
    const res = await fetch(`/api/messages/${channelId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({ content })
    })
    if (res.ok) {
      newMessage.value[channelId] = ''
      await fetchMessages(channelId)
    }
  } catch (err) {
    console.error('Failed to post message', err)
  }
}

onMounted(() => {
  fetchSocieties()
})
</script>
