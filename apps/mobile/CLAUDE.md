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
You can use either npm or bun to run the project locally.

### Using npm (default)
Execute `npx expo start` in the `apps/mobile` directory.

### Using Bun (optional)
Execute `bun run start` in the `apps/mobile` directory.

## Testing
Always test on both iOS and Android platforms via the Expo Go app or simulator.
