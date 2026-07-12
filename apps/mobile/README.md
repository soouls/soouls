# Soouls Mobile App

This is the mobile application for Soouls, built with Expo and React Native.

## Tech Stack
- Framework: [Expo](https://expo.dev/)
- Language: TypeScript
- Navigation: React Navigation
- State Management: Zustand / Jotai
- API Client: tRPC (@soouls/api)
- Authentication: Clerk

## Project Structure
- `src/components/`: Reusable UI components
- `src/screens/`: App screens and views
- `src/navigation/`: Navigation configuration
- `src/services/`: API and external service integrations
- `src/store/`: Global state management
- `src/hooks/`: Custom React hooks
- `src/utils/`: Utility functions and constants
- `src/assets/`: Images, fonts, and static assets
- `src/types/`: TypeScript type definitions

## Getting Started

### Prerequisites
Since this app uses custom native C++ libraries (such as `react-native-worklets` and `react-native-reanimated` v4), it **cannot run inside the generic Expo Go app**. You must run it in a **Development Build** (a custom Expo client containing these native modules).

### Running the App

#### 1. Setup Environment
Ensure your environment variables are configured. You will need your Clerk Publishable Key in a `.env` file at the root of `apps/mobile`.

#### 2. Install Dependencies
Run `bun install` from the monorepo root to link everything correctly.

#### 3. Build & Run the Custom Development Client
To compile the native code and install the development client app on your emulator or physical device:
* **Android:**
  ```bash
  bun run android
  ```
* **iOS (macOS only):**
  ```bash
  bun run ios
  ```

#### 4. Run the Metro Bundler
Once the client is installed on your device, you don't need to rebuild the native code every time. You can start the JavaScript bundler using:
```bash
bun run start
```
Open the custom development client app on your device (it will appear as **Soouls**, not the Expo Go app) and connect to the local bundler.

---

## Windows Build Considerations & Troubleshooting

On Windows, React Native builds can sometimes fail due to the **260-character path limit (MAX_PATH)** and CMake/Ninja limitations, especially with virtual stores like Bun (`node_modules/.bun/...`).

### What We Solved
We've pre-configured the Android build to bypass Windows path limitations:
1. **Redirection:** We redirect all subproject build directories and CMake staging folders to a shorter path (`E:\CODES\soouls\apps\mobile\android\build`) in the workspace via `settings.gradle`.
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
