import { Injectable } from '@nestjs/common';
import { clerkClient } from '@clerk/backend';
import { db, eq } from '@soulcanvas/database/client';
import { users } from '@soulcanvas/database/schema';

@Injectable()
export class UsersService {
    async ensureUser(clerkId: string): Promise<string> {
        // 1. Check if user exists in DB
        const [existingUser] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.clerkId, clerkId))
            .limit(1);

        if (existingUser) {
            return existingUser.id;
        }

        // 2. Fetch user details from Clerk
        // Note: clerkClient is auto-configured via CLERK_SECRET_KEY env var
        const clerkUser = await clerkClient.users.getUser(clerkId);

        // Get primary email
        const primaryEmailId = clerkUser.primaryEmailAddressId;
        const emailObj = clerkUser.emailAddresses.find(e => e.id === primaryEmailId);
        const email = emailObj?.emailAddress || '';
        const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Anonymous';

        if (!email) {
            throw new Error(`User ${clerkId} has no primary email address.`);
        }

        // 3. Create user in DB
        const [newUser] = await db
            .insert(users)
            .values({
                clerkId,
                email,
                name,
            })
            .returning({ id: users.id });

        return newUser.id;
    }
}
