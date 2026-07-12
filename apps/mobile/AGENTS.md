# Soouls Mobile App Agent Instructions

## Overview
This file contains instructions for AI agents working on the Soouls mobile application (located in `apps/mobile`).

## Guidelines
1. **Framework Awareness**: Understand that this project uses React Native with the Expo framework. Only suggest or use packages that are compatible with Expo.
2. **Typescript First**: All new files should be `.ts` or `.tsx` and follow strict typing.
3. **Custom Native Modules**: The app relies on custom C++ native libraries (e.g. `react-native-worklets`, `react-native-reanimated` v4) and **must** be run using a **Development Build** (`expo-dev-client`) instead of the standard Expo Go app. 
4. **No Arbitrary Native Linking**: Do not suggest manual linking commands (`react-native link`) or arbitrary native changes. Let Expo autolinking handle integrations.
5. **Windows Build Safety**: Do not modify path mappings in `settings.gradle` or `app/build.gradle` that bypass Windows 260-character path limits (`MAX_PATH`) unless you understand the build output redirection to `${project.rootDir}/build/subprojects`.
6. **Architecture**: Adhere to the directory structure defined in `README.md`. Place new components in `src/components`, screens in `src/screens`, etc.
7. **Backend Integration**: Use the existing `@soouls/api` tRPC client for all API interactions.
8. **Error Handling**: Implement proper UI error boundaries and loading states for async actions.

## Context
Always check the `CLAUDE.md` and `README.md` files for build troubleshooting, native commands, and additional guidelines before starting work in this directory.
