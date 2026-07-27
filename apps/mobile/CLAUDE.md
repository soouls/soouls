# Mobile App Development Guidelines (Expo)

## Project Context
This is the Soouls mobile application built with React Native and Expo. It uses a TypeScript template and connects to the `@soouls/api` tRPC backend and PostgreSQL database via Clerk authentication.

## Tech Stack
- Framework: Expo (SDK 52/53)
- Language: TypeScript
- Navigation: React Navigation (Bottom Tabs + Native Stack)
- State Management: Zustand / React Query
- API Client: tRPC (`@soouls/api`)
- Authentication: Clerk (`@clerk/clerk-expo`)

## Project Structure & Features
- `src/components/`: Reusable UI components and block renderers
- `src/screens/`: App screens and views:
  - `dashboard/`: `DashboardScreen` (AI Insights, streaks, dominant theme via `home.getInsights`)
  - `journal/`: `EntryListScreen` (`entries.getAll`), `CreateEntryScreen` (`entries.upsertSync`), `EntryDetailScreen` (`entries.getOne`, `entries.delete`, `tasks.convertToTask`)
  - `clusters/`: `ClustersScreen` (`home.getClusters`, `home.recluster`), `ClusterDetailScreen` (`home.getClusterDetail`)
  - `account/`: `AccountScreen` (User stats, writing profile, core themes via `home.getAccount`, `home.exportAccountData`, `home.deleteAccount`)
  - `settings/`: `SettingsScreen` (User preferences via `home.getSettings`, `home.updateSettings`)
  - `auth/`: `LoginScreen`, `SignUpScreen` (Clerk Auth)
- `src/navigation/`: Navigation configuration (`AppNavigator.tsx` with Bottom Tabs & Stack Navigation)
- `src/providers/`: Context providers (`AuthProvider`, `TRPCProvider`)
- `src/hooks/`: Custom React hooks (`useEntries`, `usePersistedEntry`, etc.)
- `src/utils/`: Utility functions (`trpc.ts`, `entries.ts`, `tokenCache.ts`)

## Backend Integration & Environment
- **tRPC Route**: The API client connects to `${getBaseUrl()}/trpc`.
- **Android Emulator**: `getBaseUrl()` resolves to `http://10.0.2.2:3000` (pointing to the host backend on port 3000).
- **iOS Simulator / Device**: Resolves to `http://localhost:3000` or custom `EXPO_PUBLIC_API_URL`.
- **Authentication**: `TRPCProvider` automatically retrieves the Clerk JWT token via `useAuth().getToken()` and appends it to the `Authorization: Bearer <token>` header for protected tRPC procedures.
- **Backend Prerequisite**: Ensure the local backend server is running via `bun run dev` at the repository root before making API calls.

## Development Rules
1. **Use Expo Tools**: Prefer Expo's built-in SDK features over direct bare React Native libraries where possible to ensure maximum compatibility.
2. **TypeScript**: Enforce strict TypeScript typing across all screens and hooks.
3. **Component Design**: Build modular, reusable components. Keep state management predictable.
4. **API Integration**: All backend communication must flow through the `@soouls/api` tRPC client. No direct HTTP calls unless necessary.
5. **Styling**: Ensure components use modern UI aesthetics adhering to Soouls design guidelines. Be responsive to different screen sizes.

## Local Development
Since this project uses custom native C++ libraries (such as `react-native-worklets` and `react-native-reanimated` v4), it **cannot run inside the generic Expo Go app**. You must run it in a **Development Build** (using `expo-dev-client`).

### Running the Project
1. **First-time Native Build & Run:**
   To build the native Android or iOS client and install it on your device/emulator:
   * **Android:** `bun run android` (or `npx expo run:android`)
   * **iOS:** `bun run ios` (or `npx expo run:ios`)
   
2. **Subsequent JS Runs:**
   Once the custom development client is installed on your emulator/device, start the bundler without rebuilding the native app:
   `bun run start` (or `npx expo start`)

## Windows Build Considerations
Windows has a 260-character path limit (`MAX_PATH`). To build successfully on Windows:
* **Directory Redirection:** All subproject build outputs and CMake staging folders are redirected to `${project.rootDir}/build` to keep paths short (configured via `settings.gradle`).
* **Autolinking Patch:** A custom task in `app/build.gradle` dynamically modifies `Android-autolinking.cmake` to point to these short paths.
* **CMake Batched Compilation:** `UNITY_BUILD ON` is configured on the `reanimated` target to compile source files in combined units, preventing deeply nested directory creation in the build cache.
* **Cache Wiping:** If incremental package tasks fail (e.g. `IncrementalSplitterRunnable`), wipe the `build` directory manually:
  ```powershell
  Remove-Item -Recurse -Force apps/mobile/android/build
  ```

## Testing
Always test on both iOS and Android platforms using the **custom Development Build** installed on your emulator, simulator, or physical device. Do not use the default Expo Go app.
