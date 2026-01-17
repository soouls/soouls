# 🔐 Clerk Authentication Setup

Clerk has been successfully integrated to replace NextAuth.js across the entire monorepo.

## ✅ Changes Made

### 1. Dependencies Updated

**Frontend (`apps/frontend/package.json`):**
- ❌ Removed: `next-auth`
- ✅ Added: `@clerk/nextjs`

**Backend (`apps/backend/package.json`):**
- ❌ Removed: `next-auth`, `@auth/core`
- ✅ Added: `@clerk/backend`

### 2. Frontend Integration

**Middleware (`apps/frontend/middleware.ts`):**
- Created Clerk middleware to protect routes
- Public routes: `/`, `/sign-in`, `/sign-up`, `/api/webhooks`
- All other routes require authentication

**Layout (`apps/frontend/app/layout.tsx`):**
- Wrapped app with `<ClerkProvider>`
- Provides Clerk context to all components

**tRPC Client (`apps/frontend/src/utils/trpc.ts`):**
- Updated to include Clerk auth token in requests
- Automatically adds `Authorization: Bearer <token>` header

**tRPC Provider (`apps/frontend/src/providers/trpc-provider.tsx`):**
- Uses `useAuth()` hook from Clerk
- Gets token and passes to tRPC client

**Auth Pages:**
- Created `/sign-in/[[...sign-in]]/page.tsx`
- Created `/sign-up/[[...sign-up]]/page.tsx`

### 3. Backend Integration

**tRPC Context (`apps/backend/src/trpc/trpc.context.ts`):**
- Created Clerk client using `CLERK_SECRET_KEY`
- Verifies JWT tokens from Authorization header
- Extracts `userId` from token and adds to context

**tRPC Controller (`apps/backend/src/trpc/trpc.controller.ts`):**
- Updated to use `createTrpcContext()` function
- Passes authenticated user context to tRPC procedures

**tRPC Router (`packages/api/src/router.ts`):**
- Updated context type to include `userId` and `authToken`
- Added `protectedProcedure` for authenticated routes
- Throws error if user is not authenticated

### 4. Environment Variables

Required environment variables (add to `.env`):

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-publishable-key
CLERK_SECRET_KEY=sk_test_your-secret-key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## 🚀 Usage

### Getting Clerk Keys

1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Copy your Publishable Key and Secret Key
4. Add them to your `.env` file

### Using Authentication in Components

```tsx
import { useUser, useAuth } from '@clerk/nextjs';

export function MyComponent() {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();

  if (!isLoaded) return <div>Loading...</div>;
  if (!user) return <div>Not signed in</div>;

  return (
    <div>
      <p>Hello, {user.firstName}!</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

### Using Protected tRPC Procedures

```typescript
// In packages/api/src/router.ts
export const appRouter = router({
  // Public procedure (no auth required)
  hello: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return { greeting: `Hello ${input.name}!` };
    }),

  // Protected procedure (requires auth)
  getMyEntries: protectedProcedure
    .query(async ({ ctx }) => {
      // ctx.userId is guaranteed to be defined
      return await getEntriesForUser(ctx.userId);
    }),
});
```

### Using tRPC in Frontend

```tsx
'use client';

import { trpc } from '@/utils/trpc';

export function MyComponent() {
  // This automatically includes auth token
  const { data, isLoading } = trpc.getMyEntries.useQuery();

  if (isLoading) return <div>Loading...</div>;

  return <div>{/* Your entries */}</div>;
}
```

## 🔒 Security Features

1. **JWT Verification**: All tokens are verified server-side using Clerk's secret key
2. **Type Safety**: tRPC ensures type safety for authenticated user context
3. **Route Protection**: Middleware automatically protects routes
4. **Token Injection**: Auth tokens are automatically included in tRPC requests

## 📝 Next Steps

1. Set up your Clerk account and get API keys
2. Add keys to `.env` file
3. Test authentication flow:
   - Visit `/sign-up` to create an account
   - Visit `/sign-in` to sign in
   - Protected routes will automatically redirect if not authenticated

## 🐛 Troubleshooting

**"Invalid token" errors:**
- Make sure `CLERK_SECRET_KEY` is set correctly
- Verify the token is being sent in the Authorization header
- Check that Clerk keys match between frontend and backend

**"Unauthorized" errors:**
- Ensure you're using `protectedProcedure` for authenticated routes
- Check that the user is signed in (use `useUser()` hook)
- Verify middleware is protecting the correct routes
