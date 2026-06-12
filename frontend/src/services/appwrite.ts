import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';

const client = new Client();

client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '69c3aeb5001e29bce67a');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export { ID, Query };

export const APPWRITE_CONFIG = {
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || 'saltedhash_db',
    collections: {
        posts: import.meta.env.VITE_APPWRITE_POSTS_COLLECTION_ID || 'posts',
        comments: import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID || 'comments',
        businesses: import.meta.env.VITE_APPWRITE_BUSINESSES_COLLECTION_ID || 'businesses',
        circles: import.meta.env.VITE_APPWRITE_CIRCLES_COLLECTION_ID || 'circles',
        channels: import.meta.env.VITE_APPWRITE_CHANNELS_COLLECTION_ID || 'channels',
        messages: import.meta.env.VITE_APPWRITE_MESSAGES_COLLECTION_ID || 'messages'
    },
    bucketId: import.meta.env.VITE_APPWRITE_BUCKET_ID || 'media'
};
