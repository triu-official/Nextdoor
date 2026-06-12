<template>
  <div class="space-y-6">
    <div class="bg-indigo-600 rounded-xl p-6 text-white shadow-md">
      <h2 class="text-2xl font-bold">Community Circles</h2>
      <p class="text-indigo-100 mt-1">Connect with your circles</p>
    </div>

    <div v-if="loading" class="flex justify-center p-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>

    <div v-else-if="error" class="text-center py-10 bg-white shadow rounded-xl border border-gray-100">
      <p class="text-sm text-red-600 mb-2">Failed to load circles.</p>
      <button @click="fetchCircles" class="text-indigo-600 text-sm font-medium hover:underline">Retry</button>
    </div>

    <div v-else class="space-y-6">
      <!-- Circles List -->
      <div v-if="!selectedCircle" class="grid grid-cols-1 gap-4">
        <h3 class="text-lg font-medium text-gray-900 px-1">Your Circles</h3>
        <div v-for="circle in circles" :key="circle.$id" @click="selectCircle(circle)" class="bg-white rounded-xl shadow border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer p-5 flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-gray-900">{{ circle.name }}</h3>
            <p class="text-sm text-gray-500">{{ circle.description }}</p>
          </div>
          <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>

        <div v-if="circles.length === 0" class="text-center py-10 bg-white shadow rounded-xl border border-gray-100">
          <p class="text-sm text-gray-500">No circles found.</p>
        </div>
      </div>

      <!-- Channels List -->
      <div v-else class="space-y-4">
        <button @click="selectedCircle = null" class="text-indigo-600 flex items-center space-x-1 hover:text-indigo-800 text-sm font-medium">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
          <span>Back to Circles</span>
        </button>

        <h3 class="text-xl font-bold text-gray-900 px-1">{{ selectedCircle.name }} Channels</h3>

        <div v-if="channelsLoading" class="text-xs text-gray-400 my-2">Loading channels...</div>

        <div v-for="channel in channels" :key="channel.$id" class="bg-white rounded-xl shadow border border-gray-100 overflow-hidden p-5">
           <div class="flex justify-between items-center mb-4 cursor-pointer hover:text-indigo-600 transition-colors" @click="toggleChannel(channel.$id)">
             <h4 class="text-md font-bold text-gray-800 flex items-center">
               <span class="text-gray-400 mr-2">#</span> {{ channel.name }}
             </h4>
             <svg class="h-5 w-5 text-gray-400" :class="{'transform rotate-180': activeChannels[channel.$id]}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
           </div>

           <!-- Messages -->
           <div v-if="activeChannels[channel.$id]" class="mt-4 pt-4 border-t border-gray-100">
             <div v-if="messagesLoading[channel.$id]" class="text-xs text-gray-400 my-2">Loading messages...</div>
             <div v-else class="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
               <div v-for="msg in channelMessages[channel.$id] || []" :key="msg.$id" class="bg-gray-50 p-3 rounded-lg text-sm border border-gray-100">
                 <div class="font-medium text-gray-800 mb-1 flex justify-between">
                   <span>{{ msg.authorName }}</span>
                   <span class="text-xs text-gray-400 font-normal">{{ new Date(msg.$createdAt).toLocaleTimeString() }}</span>
                 </div>
                 <p class="text-gray-600">{{ msg.content }}</p>
               </div>
               <p v-if="!(channelMessages[channel.$id] || []).length" class="text-xs text-gray-400 italic text-center py-2">No messages yet. Say hello!</p>
             </div>

             <div class="flex items-center space-x-2">
               <input v-model="newMessage[channel.$id]" type="text" placeholder="Message..." class="flex-1 rounded-full border-gray-300 bg-gray-50 text-sm px-4 py-2 border focus:ring-indigo-500 focus:border-indigo-500" @keyup.enter="postMessage(channel.$id)">
               <button @click="postMessage(channel.$id)" :disabled="!newMessage[channel.$id]" class="bg-indigo-600 text-white rounded-full p-2 text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex-shrink-0">
                 <svg class="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
               </button>
             </div>
           </div>
        </div>

        <div v-if="!channelsLoading && channels.length === 0" class="text-center py-10 bg-white shadow rounded-xl border border-gray-100">
          <p class="text-sm text-gray-500">No channels found for this circle.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { databases, APPWRITE_CONFIG, ID, Query } from '../services/appwrite'

const authStore = useAuthStore()
const circles = ref<any[]>([])
const channels = ref<any[]>([])
const selectedCircle = ref<any | null>(null)
const loading = ref(true)
const error = ref(false)
const channelsLoading = ref(false)

const activeChannels = ref<Record<string, boolean>>({})
const channelMessages = ref<Record<string, any[]>>({})
const messagesLoading = ref<Record<string, boolean>>({})
const newMessage = ref<Record<string, string>>({})

const fetchCircles = async () => {
  loading.value = true
  error.value = false
  try {
    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.circles
    )
    circles.value = response.documents
  } catch (err) {
    console.error('Failed to fetch circles', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

const selectCircle = async (circle: any) => {
  selectedCircle.value = circle
  channelsLoading.value = true
  try {
    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.channels,
      [Query.equal('circleId', circle.$id)]
    )
    channels.value = response.documents
  } catch (err) {
    console.error('Failed to fetch channels', err)
  } finally {
    channelsLoading.value = false
  }
}

const fetchMessages = async (channelId: string) => {
  messagesLoading.value[channelId] = true
  try {
    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.messages,
      [
        Query.equal('channelId', channelId),
        Query.orderAsc('$createdAt')
      ]
    )
    channelMessages.value[channelId] = response.documents
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
    await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.messages,
      ID.unique(),
      {
        content,
        channelId,
        userId: authStore.user.$id,
        authorName: authStore.user.name
      }
    )
    newMessage.value[channelId] = ''
    await fetchMessages(channelId)
  } catch (err) {
    console.error('Failed to post message', err)
  }
}

onMounted(() => {
  fetchCircles()
})
</script>
