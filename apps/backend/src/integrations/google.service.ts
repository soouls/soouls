import { createClerkClient } from '@clerk/backend';
import { Injectable, Logger } from '@nestjs/common';
import { db, eq } from '@soouls/database/client';
import { users } from '@soouls/database/schema';

@Injectable()
export class GoogleIntegrationService {
  private readonly logger = new Logger(GoogleIntegrationService.name);

  /**
   * Fetches the Google OAuth access token for a user from Clerk.
   */
  async getGoogleAccessToken(userId: string): Promise<string | null> {
    try {
      const secretKey = process.env.CLERK_SECRET_KEY;
      if (!secretKey) {
        this.logger.error('CLERK_SECRET_KEY is not configured');
        return null;
      }
      const clerk = createClerkClient({ secretKey });
      const response = await clerk.users.getUserOauthAccessToken(userId, 'oauth_google');

      // Clerk returns an array of tokens (in case of multiple Google connections)
      const tokenObj = response.data?.[0] || response[0];
      if (!tokenObj || !tokenObj.token) {
        this.logger.warn(`No Google OAuth token found for user ${userId}`);
        return null;
      }

      return tokenObj.token;
    } catch (error) {
      this.logger.error(`Failed to fetch Google OAuth token for user ${userId}`, error);
      return null;
    }
  }

  /**
   * Fetches the user's phone number from the Google People API.
   * Requires the 'https://www.googleapis.com/auth/user.phonenumbers.read' scope.
   */
  async extractPhoneNumber(accessToken: string): Promise<string | null> {
    try {
      const response = await fetch(
        'https://people.googleapis.com/v1/people/me?personFields=phoneNumbers',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
        },
      );

      if (!response.ok) {
        this.logger.error(`Google People API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = (await response.json()) as any;
      const phoneNumbers = data.phoneNumbers || [];

      // Try to find a verified or primary phone number
      if (phoneNumbers.length > 0) {
        const primary = phoneNumbers.find((p: any) => p.metadata?.primary) || phoneNumbers[0];
        return primary.canonicalForm || primary.value || null;
      }

      return null;
    } catch (error) {
      this.logger.error('Failed to extract phone number from Google', error);
      return null;
    }
  }

  /**
   * Orchestrates the extraction and database update during signup/signin.
   */
  async syncGoogleProfileData(userId: string, clerkId: string) {
    this.logger.log(`Attempting to sync Google profile data for user ${userId}`);

    const accessToken = await this.getGoogleAccessToken(clerkId);
    if (!accessToken) {
      return { success: false, reason: 'no_token' };
    }

    const phoneNumber = await this.extractPhoneNumber(accessToken);

    if (phoneNumber) {
      this.logger.log(`Found phone number for user ${userId}`);

      // Update database
      await db
        .update(users)
        .set({
          phoneNumber,
          marketingWhatsappOptIn: true,
          transactionalWhatsappOptIn: true,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      return { success: true, phoneNumber };
    }

    return { success: false, reason: 'no_phone_found' };
  }
}
