import crypto from 'node:crypto';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { db, eq } from '@soouls/database/client';
import { payments, razorpayWebhooks, subscriptions, users } from '@soouls/database/schema';
import Razorpay from 'razorpay';

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

    // 1. Get User (can be database UUID or Clerk User ID)
    const isClerkId = userId.startsWith('user_');
    const [user] = await db
      .select()
      .from(users)
      .where(isClerkId ? eq(users.clerkId, userId) : eq(users.id, userId));

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
      await db.update(users).set({ razorpayCustomerId: customerId }).where(eq(users.id, user.id));
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

  async createOrder(userId: string, currency: string, amount: number) {
    if (!this.razorpay) {
      throw new HttpException('Payment gateway not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const isClerkId = userId.startsWith('user_');
    const [user] = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(isClerkId ? eq(users.clerkId, userId) : eq(users.id, userId));

    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const amountInPaise = Math.round(amount * 100);

    const order = await this.razorpay.orders.create({
      amount: amountInPaise,
      currency: currency,
      notes: { userId: user.id },
    });

    return order;
  }

  async verifySubscription(
    userId: string,
    params: {
      razorpay_payment_id: string;
      razorpay_subscription_id: string;
      razorpay_signature: string;
    },
  ) {
    if (!this.razorpay) {
      throw new HttpException('Payment gateway not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = params;

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error('Razorpay secret not configured');

    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      throw new HttpException('Invalid signature', HttpStatus.BAD_REQUEST);
    }

    const isClerkId = userId.startsWith('user_');
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(isClerkId ? eq(users.clerkId, userId) : eq(users.id, userId));

    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    // Update the DB to mark subscription as active (assuming webhook handles the detailed sync)
    // Here we can fetch the actual subscription details if needed, but for now we'll rely on webhook

    // We should create/update the subscription record directly here in case webhook is delayed
    try {
      const sub = await this.razorpay.subscriptions.fetch(razorpay_subscription_id);

      await db
        .insert(subscriptions)
        .values({
          userId: user.id,
          providerSubscriptionId: razorpay_subscription_id,
          provider: 'razorpay',
          status: 'active',
          planType: 'premium',
          currentPeriodStart: new Date(sub.current_start * 1000),
          currentPeriodEnd: new Date(sub.current_end * 1000),
        })
        .onConflictDoUpdate({
          target: [subscriptions.providerSubscriptionId],
          set: {
            status: 'active',
            currentPeriodStart: new Date(sub.current_start * 1000),
            currentPeriodEnd: new Date(sub.current_end * 1000),
            updatedAt: new Date(),
          },
        });

      await db
        .update(users)
        .set({
          subscriptionStatus: 'active',
          planType: 'premium',
        })
        .where(eq(users.id, user.id));
    } catch (e) {
      this.logger.error('Failed to sync subscription after verification', e);
    }

    return { success: true, message: 'Subscription verified' };
  }

  async verifyWebhook(signature: string, rawBody: string) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) throw new Error('Razorpay webhook secret not configured');

    const expectedSignature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    if (expectedSignature !== signature) {
      this.logger.error('Invalid Razorpay signature');
      throw new HttpException('Invalid signature', HttpStatus.BAD_REQUEST);
    }

    return true;
  }

  async cancelSubscription(userId: string) {
    if (!this.razorpay)
      throw new HttpException('Payment gateway not configured', HttpStatus.INTERNAL_SERVER_ERROR);

    const isClerkId = userId.startsWith('user_');
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(isClerkId ? eq(users.clerkId, userId) : eq(users.id, userId));

    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, user.id));
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

    const eventId = event.id;
    if (!eventId) {
      this.logger.error('Received Razorpay webhook without an event ID');
      return;
    }

    // Log the event and enforce idempotency by checking if it was inserted successfully
    const inserted = await db
      .insert(razorpayWebhooks)
      .values({
        razorpayEventId: eventId,
        eventType: event.event,
        payload: event,
      })
      .onConflictDoNothing()
      .returning({ id: razorpayWebhooks.id });

    if (inserted.length === 0) {
      this.logger.warn(`Razorpay event ${eventId} has already been processed. Skipping.`);
      return;
    }

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
          await db
            .insert(subscriptions)
            .values({
              userId,
              providerSubscriptionId: subId,
              provider: 'razorpay',
              status: 'active',
              planType: 'premium',
              currentPeriodStart: new Date(event.payload.subscription.entity.current_start * 1000),
              currentPeriodEnd: new Date(event.payload.subscription.entity.current_end * 1000),
            })
            .onConflictDoUpdate({
              target: [subscriptions.providerSubscriptionId],
              set: {
                status: 'active',
                currentPeriodStart: new Date(
                  event.payload.subscription.entity.current_start * 1000,
                ),
                currentPeriodEnd: new Date(event.payload.subscription.entity.current_end * 1000),
                updatedAt: new Date(),
              },
            });

          // Update user status
          await db
            .update(users)
            .set({
              subscriptionStatus: 'active',
              planType: 'premium',
              currentPeriodEnd: new Date(event.payload.subscription.entity.current_end * 1000),
              paymentProvider: 'razorpay',
            })
            .where(eq(users.id, userId));

          // Log payment details in DB if available
          const paymentEntity = event.payload.payment?.entity;
          if (paymentEntity) {
            const [dbSub] = await db
              .select({ id: subscriptions.id })
              .from(subscriptions)
              .where(eq(subscriptions.providerSubscriptionId, subId))
              .limit(1);

            await db
              .insert(payments)
              .values({
                userId,
                subscriptionId: dbSub?.id ?? null,
                providerPaymentId: paymentEntity.id,
                provider: 'razorpay',
                amount: paymentEntity.amount,
                currency: paymentEntity.currency,
                status:
                  paymentEntity.status === 'captured'
                    ? 'successful'
                    : paymentEntity.status || 'successful',
                receiptUrl: paymentEntity.notes?.receipt_url ?? null,
                metadata: paymentEntity,
              })
              .onConflictDoNothing();
          }
        }
      } else if (
        event.event === 'subscription.halted' ||
        event.event === 'subscription.cancelled'
      ) {
        const subId = event.payload.subscription.entity.id;
        await db
          .update(subscriptions)
          .set({ status: 'canceled', canceledAt: new Date(), updatedAt: new Date() })
          .where(eq(subscriptions.providerSubscriptionId, subId));

        const [sub] = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.providerSubscriptionId, subId));
        if (sub) {
          await db
            .update(users)
            .set({ subscriptionStatus: 'canceled', planType: 'free' })
            .where(eq(users.id, sub.userId));
        }
      }
    } catch (e) {
      this.logger.error('Error processing webhook', e);
    }
  }
}
