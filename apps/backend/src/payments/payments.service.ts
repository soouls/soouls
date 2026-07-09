import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { db } from '@soouls/database/client';
import { users, subscriptions, razorpayWebhooks, payments } from '@soouls/database/schema';
import { eq } from 'drizzle-orm';
import Razorpay from 'razorpay';
import crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private razorpay: any;

  constructor() {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      this.razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
    } else {
      this.logger.warn('RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set in environment.');
    }
  }

  async createSubscription(userId: string, planId: string) {
    if (!this.razorpay) {
      throw new HttpException('Payment gateway not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // 1. Get User
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    // 2. Create customer if not exists
    let customerId = user.razorpayCustomerId;
    if (!customerId) {
      const customer = await this.razorpay.customers.create({
        name: user.name || 'Soouls User',
        email: user.email,
        contact: user.phoneNumber || undefined,
        notes: { userId: user.id },
      });
      customerId = customer.id;
      
      // Update DB
      await db.update(users).set({ razorpayCustomerId: customerId }).where(eq(users.id, userId));
    }

    // 3. Create Subscription
    const subscription = await this.razorpay.subscriptions.create({
      plan_id: planId,
      customer_id: customerId,
      total_count: 120, // max 10 years of monthly
      customer_notify: 1, // Razorpay handles email notifications
      notes: { userId: user.id },
    });

    return subscription;
  }

  async verifyWebhook(signature: string, body: any) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) throw new Error('Razorpay webhook secret not configured');

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(body))
      .digest('hex');

    if (expectedSignature !== signature) {
      this.logger.error('Invalid Razorpay signature');
      throw new HttpException('Invalid signature', HttpStatus.BAD_REQUEST);
    }

    return true;
  }

  async cancelSubscription(userId: string) {
    if (!this.razorpay) throw new HttpException('Payment gateway not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
    if (!sub || !sub.providerSubscriptionId) {
      throw new HttpException('No active subscription found', HttpStatus.NOT_FOUND);
    }

    try {
      // Cancel at end of cycle or immediately depending on preference, Razorpay defaults to immediate if cancel_at_cycle_end is false.
      await this.razorpay.subscriptions.cancel(sub.providerSubscriptionId, false);
      return { success: true };
    } catch (e) {
      this.logger.error('Failed to cancel subscription', e);
      throw new HttpException('Failed to cancel subscription', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async handleWebhook(event: any) {
    this.logger.log(`Received Razorpay webhook: ${event.event}`);

    // Log the event
    await db.insert(razorpayWebhooks).values({
      razorpayEventId: event.account_id || Date.now().toString(), // Use event id if present, otherwise fallback
      eventType: event.event,
      payload: event,
    }).onConflictDoNothing();

    try {
      if (event.event === 'subscription.activated' || event.event === 'subscription.charged') {
        const subId = event.payload.subscription.entity.id;
        const customerId = event.payload.subscription.entity.customer_id;
        const notes = event.payload.subscription.entity.notes || {};
        
        let userId = notes.userId;
        if (!userId) {
          const [u] = await db.select().from(users).where(eq(users.razorpayCustomerId, customerId));
          if (u) userId = u.id;
        }

        if (userId) {
          // Calculate trial period logic, etc.
          // Upsert subscription
          await db.insert(subscriptions).values({
            userId,
            providerSubscriptionId: subId,
            provider: 'razorpay',
            status: 'active',
            planType: 'premium',
            currentPeriodStart: new Date(event.payload.subscription.entity.current_start * 1000),
            currentPeriodEnd: new Date(event.payload.subscription.entity.current_end * 1000),
          }).onConflictDoUpdate({
            target: [subscriptions.providerSubscriptionId],
            set: {
              status: 'active',
              currentPeriodStart: new Date(event.payload.subscription.entity.current_start * 1000),
              currentPeriodEnd: new Date(event.payload.subscription.entity.current_end * 1000),
              updatedAt: new Date(),
            }
          });

          // Update user status
          await db.update(users).set({
            subscriptionStatus: 'active',
            planType: 'premium',
            currentPeriodEnd: new Date(event.payload.subscription.entity.current_end * 1000),
            paymentProvider: 'razorpay',
          }).where(eq(users.id, userId));
        }
      } else if (event.event === 'subscription.halted' || event.event === 'subscription.cancelled') {
        const subId = event.payload.subscription.entity.id;
        await db.update(subscriptions)
          .set({ status: 'canceled', canceledAt: new Date(), updatedAt: new Date() })
          .where(eq(subscriptions.providerSubscriptionId, subId));
          
        const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.providerSubscriptionId, subId));
        if (sub) {
          await db.update(users).set({ subscriptionStatus: 'canceled', planType: 'free' }).where(eq(users.id, sub.userId));
        }
      }
    } catch (e) {
      this.logger.error('Error processing webhook', e);
    }
  }
}
