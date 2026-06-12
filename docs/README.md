# SALTEDHASH PWA - Deployment & Deliverables

## Summary of Changes
1. Removed `backend` and local `data` directories to clean up the workspace and make the app fully client-side PWA interacting with Appwrite.
2. Switched from custom Express backend to Appwrite Account SDK for auth, replacing local jwt and hash handling.
3. Repurposed `api.ts` into `offlineCache.ts` using IndexedDB. Offline drafts are fully synced upon reconnecting.
4. Refactored `Home.vue`, `Businesses.vue`, `Circles.vue` to fetch data and write to Appwrite Databases SDK.
5. Added fully styled `Login.vue` handling unified Appwrite registration and session creation.
6. Created `Offline.vue` and `NotFound.vue` to handle edge cases properly.
7. Fixed `vite.config.ts` to reflect PWA details, removed backend proxies. Added `ReloadPrompt.vue` to support the PWA update flow.
8. Kept `shared` directory to preserve global Types and Constants.

## Removed Files & Directories
- `backend/` directory
- `data/` directory
- `frontend/src/services/api.ts`

## New & Refactored Files
- `frontend/src/services/appwrite.ts` (New)
- `frontend/src/services/offlineCache.ts` (Refactored)
- `frontend/src/pages/Offline.vue` (New)
- `frontend/src/pages/NotFound.vue` (New)
- `frontend/src/components/pwa/ReloadPrompt.vue` (New)
- `frontend/src/pages/Login.vue` (Refactored)
- `frontend/src/pages/Home.vue` (Refactored)
- `frontend/src/pages/Businesses.vue` (Refactored)
- `frontend/src/pages/Circles.vue` (Refactored)
- `frontend/src/stores/auth.ts` (Refactored)
- `frontend/src/router/index.ts` (Refactored)
- `frontend/vite.config.ts` (Refactored)
- `frontend/src/App.vue` (Refactored)
- `shared/types/index.ts` (Refactored)
- `shared/constants/index.ts` (Refactored)

## Appwrite Console Setup Checklist
1. **Project:** Create a project. Platform must include a Web App with the hostname where you plan to deploy this PWA.
2. **Auth:** Ensure Email/Password Auth is enabled.
3. **Database Setup:**
   - Create Database `saltedhash_db`.
   - Collections to create: `posts`, `comments`, `businesses`, `circles`, `channels`, `messages`.
4. **Collection Schema:**
   - `posts`: `content` (string), `userId` (string), `authorName` (string)
   - `comments`: `content` (string), `postId` (string), `userId` (string), `authorName` (string)
   - `businesses`: `name` (string), `category` (string), `shortDescription` (string)
   - `circles`: `name` (string), `description` (string)
   - `channels`: `name` (string), `circleId` (string)
   - `messages`: `content` (string), `channelId` (string), `userId` (string), `authorName` (string)
5. **Permissions:** Ensure Role `users` (authenticated users) can Create, Read, Update, Delete for `posts`, `comments`, `messages`. For `businesses`, `circles`, `channels`, Read permission is required.
6. **Required Indexes:**
   - `comments` collection: Index on `postId` (Key, asc)
   - `channels` collection: Index on `circleId` (Key, asc)
   - `messages` collection: Index on `channelId` (Key, asc)
   - `posts` collection: Index on `$createdAt` (Key, desc)
7. **Storage Setup:** Create a bucket (e.g., `media`). Set read permission for all users, create for authenticated users.

## Environment Variables Needed
See `frontend/.env.example`. Replace with your specific IDs.

## Deployment on Appwrite Sites
- Build command: `npm run build`
- Output directory: `dist`
- Root directory: `frontend`
- Framework: `Vite`
- Add environment variables in Appwrite settings.
