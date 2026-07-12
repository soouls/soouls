# Mobile App Development Guidelines (Expo)

## Project Context
This is the Soouls mobile application built with React Native and Expo. It uses a TypeScript template.

## Tech Stack
- Framework: Expo
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

## Development Rules
1. **Use Expo Tools**: Prefer Expo's built-in SDK features over direct bare React Native libraries where possible to ensure maximum compatibility.
2. **TypeScript**: Enforce strict TypeScript typing.
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
