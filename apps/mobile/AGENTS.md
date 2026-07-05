# Soouls Mobile App Agent Instructions

## Overview
This file contains instructions for AI agents working on the Soouls mobile application (located in `apps/mobile`).

## Guidelines
1. **Framework Awareness**: Understand that this project uses React Native with the Expo framework. Only suggest or use packages that are compatible with Expo.
2. **Typescript First**: All new files should be `.ts` or `.tsx` and follow strict typing.
3. **No Bare React Native Modules**: Do not suggest `react-native link` or adding native code directly unless absolutely necessary. Rely on Expo modules (e.g., `expo-camera`, `expo-location`).
4. **Architecture**: Adhere to the directory structure defined in `README.md`. Place new components in `src/components`, screens in `src/screens`, etc.
5. **Backend Integration**: Use the existing `@soouls/api` tRPC client for all API interactions.
6. **Error Handling**: Implement proper UI error boundaries and loading states for async actions.

## Context
Always check the `CLAUDE.md` and `README.md` files for additional context before starting work in this directory.
