import { verifyToken } from '@clerk/backend';
import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const secretKey = process.env.CLERK_SECRET_KEY;

    if (!secretKey) {
      throw new UnauthorizedException('Auth configuration error');
    }

    try {
      const session = await verifyToken(token, { secretKey });
      // Attach the Clerk user ID to the request
      (request as any).user = { id: session.sub };
      return true;
    } catch (_error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
