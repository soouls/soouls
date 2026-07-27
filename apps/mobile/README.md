# Soouls Mobile App

This is the mobile application for Soouls, built with Expo, React Native, and full integration with the `@soouls/api` tRPC backend.

## Tech Stack
- Framework: [Expo](https://expo.dev/) (SDK 52/53)
- Language: TypeScript
- Navigation: React Navigation (Bottom Tabs + Native Stack)
- State Management: React Query / Zustand
- API Client: tRPC (`@soouls/api`)
- Authentication: Clerk (`@clerk/clerk-expo`)

## Feature Overview & Backend Integration

The mobile application is fully connected to the PostgreSQL database via `@soouls/api` tRPC routes and Clerk authentication:

- **Dashboard / Home**: Real-time streak counters, total entry count, AI dominant theme, recent activity cards (`home.getInsights`, `home.refreshInsights`).
- **Journal / Entries**: Infinite entry list with search filtering (`entries.getAll`), block-based entry composition (`entries.create`, `entries.upsertSync`), entry viewer (`entries.getOne`), deletion (`entries.delete`), and task conversion (`tasks.convertToTask`).
- **Thought Clusters (AI)**: View AI-generated thought clusters (`home.getClusters`), trigger re-clustering (`home.recluster`), and detailed cluster narrative & key ideas breakdown (`home.getClusterDetail`).
- **User Account**: Activity stats (streak, total entries, days active, peak time), writing persona tags, core theme percentages (`home.getAccount`), JSON account data export (`home.exportAccountData`), and account deletion (`home.deleteAccount`).
- **Settings**: Dynamic user preferences sync (`home.getSettings`, `home.updateSettings`) for auto-clustering, AI suggestions, autosave, focus mode, and daily reminders.

---

## Project Structure
- `src/components/`: Reusable UI components & block renderers
- `src/screens/`: App screens (`dashboard`, `journal`, `clusters`, `account`, `settings`, `auth`)
- `src/navigation/`: Navigation configuration (`AppNavigator.tsx`)
- `src/providers/`: Context providers (`AuthProvider.tsx`, `TRPCProvider.tsx`)
- `src/hooks/`: Custom React hooks (`useEntries.ts`, `usePersistedEntry.ts`)
- `src/utils/`: Utility functions (`trpc.ts`, `entries.ts`, `tokenCache.ts`)

---

## Getting Started

### Prerequisites
Since this app uses custom native C++ libraries (such as `react-native-worklets` and `react-native-reanimated` v4), it **cannot run inside the generic Expo Go app**. You must run it in a **Development Build** (a custom Expo client containing these native modules).

### Running the App

#### 1. Setup Environment
Ensure your environment variables are configured. You will need your Clerk Publishable Key in a `.env` file at `apps/mobile/.env`.

#### 2. Start the Backend API Server
Before running the mobile app, start the local backend server from the monorepo root:
```bash
bun run dev
```
The NestJS backend will start on port `3000`. On the Android Emulator, `trpc.ts` connects via `http://10.0.2.2:3000/trpc`.

#### 3. Install Dependencies
Run `bun install` from the monorepo root to link workspace packages.

#### 4. Build & Run the Custom Development Client
To compile the native code and install the development client app on your emulator or physical device:
* **Android:**
  ```bash
  bun run android
  ```
* **iOS (macOS only):**
  ```bash
  bun run ios
  ```

#### 5. Run the Metro Bundler
Once the client is installed on your device, start the JavaScript bundler using:
```bash
bun run start
```
Open the custom development client app on your device (it will appear as **Soouls**, not Expo Go) and connect to the local bundler.

---

## Windows Build Considerations & Troubleshooting

On Windows, React Native builds can sometimes fail due to the **260-character path limit (MAX_PATH)** and CMake/Ninja limitations, especially with virtual stores like Bun (`node_modules/.bun/...`).

### What We Solved
We've pre-configured the Android build to bypass Windows path limitations:
1. **Redirection:** We redirect all subproject build directories and CMake staging folders to a shorter path (`apps/mobile/android/build`) in the workspace via `settings.gradle`.
2. **Autolinking Patch:** A custom task in `app/build.gradle` dynamically patches `Android-autolinking.cmake` during configuration to use the shorter workspace build paths.
3. **Unity Build:** CMake has `UNITY_BUILD ON` enabled for `reanimated` to compile source files in batches, preventing deeply nested file structures.

### Troubleshooting Packaging / Incremental Build Errors
If you change build configurations or encounter packaging errors (such as `IncrementalSplitterRunnable` failures), Gradle's cached incremental state may be corrupt. Wiping the cache and doing a clean build will resolve this:

```powershell
# In apps/mobile/android/
Remove-Item -Recurse -Force build
.\gradlew.bat clean
```
Then rerun `bun run android`.

---

## Development Workflow
Follow the guidelines in `CLAUDE.md` and `AGENTS.md` for specific rules regarding development and AI assistance.
