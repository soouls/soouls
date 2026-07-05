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

### Using Bun (recommended)
1. Install dependencies:
   ```bash
   bun install
   ```

2. Start the development server:
   ```bash
   bun run start
   ```

### Using npm (alternative)
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npx expo start
   ```

## Development Workflow
Follow the guidelines in `CLAUDE.md` and `AGENTS.md` for specific rules regarding development and AI assistance.
