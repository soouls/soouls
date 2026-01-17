import { createClerkClient } from '@clerk/backend';
import type { Request } from 'express';

export async function createTrpcContext(req: Request) {
  const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY || '',
  });

  // Get the auth token from the request
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  let userId: string | undefined;

  if (token) {
    try {
      const session = await clerkClient.verifyToken(token);
      userId = session.sub;
    } catch (error) {
      // Token is invalid, user is not authenticated
      console.error('Invalid token:', error);
    }
  }

  return {
    userId,
    authToken: token,
  };
}
