import { beforeEach, describe, expect, it, jest, mock } from 'bun:test';
import crypto from 'node:crypto';

// Setup basic mocks for DB
const mockDb = {
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest
    .fn()
    .mockReturnValue([
      { id: 'user_123', email: 'test@example.com', razorpayCustomerId: 'cust_mock123' },
    ]),
  insert: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  onConflictDoNothing: jest.fn().mockReturnThis(),
  onConflictDoUpdate: jest.fn().mockReturnThis(),
  returning: jest.fn().mockReturnValue([{ id: 'wh_123' }]),
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
};

// Mock the database client completely before importing service
mock.module('@soouls/database/client', () => ({
  db: mockDb,
  eq: (_a: any, _b: any) => true,
}));

mock.module('@soouls/database/schema', () => ({
  payments: { id: 'payments' },
  subscriptions: { id: 'subscriptions', providerSubscriptionId: 'providerSubscriptionId' },
  users: { id: 'users', clerkId: 'clerkId', razorpayCustomerId: 'razorpayCustomerId' },
  razorpayWebhooks: { id: 'razorpayWebhooks' },
}));

// Mock Razorpay
const mockCustomersCreate = jest.fn().mockResolvedValue({ id: 'cust_mock123' });
const mockSubscriptionsCreate = jest.fn().mockResolvedValue({ id: 'sub_mock123' });
const mockSubscriptionsFetch = jest
  .fn()
  .mockResolvedValue({ current_start: 1000, current_end: 2000 });
const mockSubscriptionsCancel = jest
  .fn()
  .mockResolvedValue({ id: 'sub_mock123', status: 'cancelled' });
const mockOrdersCreate = jest
  .fn()
  .mockResolvedValue({ id: 'order_mock123', amount: 39900, currency: 'USD' });

mock.module('razorpay', () => {
  return {
    default: class MockRazorpay {
      customers = { create: mockCustomersCreate };
      subscriptions = {
        create: mockSubscriptionsCreate,
        fetch: mockSubscriptionsFetch,
        cancel: mockSubscriptionsCancel,
      };
      orders = { create: mockOrdersCreate };
    },
  };
});

import { HttpException, HttpStatus } from '@nestjs/common';
import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(() => {
    process.env.RAZORPAY_KEY_ID = 'test_key';
    process.env.RAZORPAY_KEY_SECRET = 'test_secret';
    process.env.RAZORPAY_WEBHOOK_SECRET = 'test_webhook_secret';

    // Clear mocks
    jest.clearAllMocks();
    mockDb.where.mockReturnValue([
      { id: 'user_123', email: 'test@example.com', razorpayCustomerId: 'cust_mock123' },
    ]);

    service = new PaymentsService();
  });

  describe('constructor', () => {
    it('should initialize Razorpay if keys are present', () => {
      const s = new PaymentsService();
      expect((s as any).razorpay).toBeDefined();
    });

    it('should log warning if keys are missing', () => {
      process.env.RAZORPAY_KEY_ID = undefined;
      const s = new PaymentsService();
      expect((s as any).razorpay).toBeUndefined();
    });
  });

  describe('createSubscription', () => {
    it('should throw if Razorpay not configured', async () => {
      process.env.RAZORPAY_KEY_ID = undefined;
      const s = new PaymentsService();
      await expect(s.createSubscription('user_123', 'plan_123')).rejects.toThrow(
        new HttpException('Payment gateway not configured', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });

    it('should throw if user not found', async () => {
      mockDb.where.mockReturnValueOnce([]);
      await expect(service.createSubscription('user_123', 'plan_123')).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should create customer if user does not have razorpayCustomerId', async () => {
      mockDb.where.mockReturnValueOnce([{ id: 'user_123', email: 'test@example.com' }]);
      const sub = await service.createSubscription('user_123', 'plan_123');
      expect(mockCustomersCreate).toHaveBeenCalled();
      expect(mockSubscriptionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({ plan_id: 'plan_123', customer_id: 'cust_mock123' }),
      );
      expect(sub.id).toBe('sub_mock123');
    });

    it('should use existing customerId if present', async () => {
      mockDb.where.mockReturnValueOnce([
        { id: 'user_123', email: 'test@example.com', razorpayCustomerId: 'cust_existing123' },
      ]);
      await service.createSubscription('user_123', 'plan_123');
      expect(mockCustomersCreate).not.toHaveBeenCalled();
      expect(mockSubscriptionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({ plan_id: 'plan_123', customer_id: 'cust_existing123' }),
      );
    });

    it('should handle clerkId (user_) correctly', async () => {
      mockDb.where.mockReturnValueOnce([
        { id: 'db_123', email: 'test@example.com', razorpayCustomerId: 'cust_existing123' },
      ]);
      await service.createSubscription('user_clerk_123', 'plan_123');
      expect(mockSubscriptionsCreate).toHaveBeenCalled();
    });
  });

  describe('createOrder', () => {
    it('should throw if Razorpay not configured', async () => {
      process.env.RAZORPAY_KEY_ID = undefined;
      const s = new PaymentsService();
      await expect(s.createOrder('user_123', 'USD', 3.99)).rejects.toThrow(
        new HttpException('Payment gateway not configured', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });

    it('should throw if user not found', async () => {
      mockDb.where.mockReturnValueOnce([]);
      await expect(service.createOrder('user_123', 'USD', 3.99)).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should convert amount to paise and create order', async () => {
      const order = await service.createOrder('user_123', 'USD', 3.99);
      expect(mockOrdersCreate).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 399, currency: 'USD' }),
      );
      expect(order.id).toBe('order_mock123');
    });
  });

  describe('verifySubscription', () => {
    it('should throw if signature is invalid', async () => {
      await expect(
        service.verifySubscription('user_123', {
          razorpay_payment_id: 'pay_123',
          razorpay_subscription_id: 'sub_123',
          razorpay_signature: 'invalid_sig',
        }),
      ).rejects.toThrow(new HttpException('Invalid signature', HttpStatus.BAD_REQUEST));
    });

    it('should throw if razorpay secret is missing', async () => {
      process.env.RAZORPAY_KEY_SECRET = undefined;
      await expect(
        service.verifySubscription('user_123', {
          razorpay_payment_id: 'pay_123',
          razorpay_subscription_id: 'sub_123',
          razorpay_signature: 'invalid_sig',
        }),
      ).rejects.toThrow('Razorpay secret not configured');
    });

    it('should throw if user not found', async () => {
      const sig = crypto
        .createHmac('sha256', 'test_secret')
        .update('pay_123|sub_123')
        .digest('hex');
      mockDb.where.mockReturnValueOnce([]);

      await expect(
        service.verifySubscription('user_123', {
          razorpay_payment_id: 'pay_123',
          razorpay_subscription_id: 'sub_123',
          razorpay_signature: sig,
        }),
      ).rejects.toThrow(new HttpException('User not found', HttpStatus.NOT_FOUND));
    });

    it('should verify signature and update database successfully', async () => {
      const sig = crypto
        .createHmac('sha256', 'test_secret')
        .update('pay_123|sub_123')
        .digest('hex');

      const res = await service.verifySubscription('user_123', {
        razorpay_payment_id: 'pay_123',
        razorpay_subscription_id: 'sub_123',
        razorpay_signature: sig,
      });

      expect(res.success).toBe(true);
      expect(mockSubscriptionsFetch).toHaveBeenCalledWith('sub_123');
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe('verifyWebhook', () => {
    it('should throw if secret is missing', async () => {
      process.env.RAZORPAY_WEBHOOK_SECRET = undefined;
      await expect(service.verifyWebhook('sig', 'body')).rejects.toThrow(
        'Razorpay webhook secret not configured',
      );
    });

    it('should throw if signature is invalid', async () => {
      await expect(service.verifyWebhook('invalid_sig', 'body')).rejects.toThrow(
        new HttpException('Invalid signature', HttpStatus.BAD_REQUEST),
      );
    });

    it('should return true for valid signature', async () => {
      const sig = crypto.createHmac('sha256', 'test_webhook_secret').update('body').digest('hex');
      const res = await service.verifyWebhook(sig, 'body');
      expect(res).toBe(true);
    });
  });

  describe('cancelSubscription', () => {
    it('should throw if user not found', async () => {
      mockDb.where.mockReturnValueOnce([]);
      await expect(service.cancelSubscription('user_123')).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should throw if no active subscription found', async () => {
      mockDb.where.mockReturnValueOnce([{ id: 'user_123' }]); // User query
      mockDb.where.mockReturnValueOnce([]); // Sub query

      await expect(service.cancelSubscription('user_123')).rejects.toThrow(
        new HttpException('No active subscription found', HttpStatus.NOT_FOUND),
      );
    });

    it('should cancel subscription using Razorpay', async () => {
      mockDb.where.mockReturnValueOnce([{ id: 'user_123' }]); // User query
      mockDb.where.mockReturnValueOnce([{ providerSubscriptionId: 'sub_123' }]); // Sub query

      const res = await service.cancelSubscription('user_123');
      expect(res.success).toBe(true);
      expect(mockSubscriptionsCancel).toHaveBeenCalledWith('sub_123', false);
    });
  });

  describe('handleWebhook', () => {
    it('should abort if no event id', async () => {
      const res = await service.handleWebhook({});
      expect(res).toBeUndefined();
    });

    it('should abort if event is already processed', async () => {
      mockDb.returning.mockReturnValueOnce([]);
      await service.handleWebhook({ id: 'evt_123', event: 'subscription.activated' });
      expect(mockDb.update).not.toHaveBeenCalled();
    });

    it('should handle subscription.activated', async () => {
      mockDb.returning.mockReturnValueOnce([{ id: 'wh_123' }]);
      mockDb.where.mockReturnValue([{ id: 'user_123' }]);

      await service.handleWebhook({
        id: 'evt_123',
        event: 'subscription.activated',
        payload: {
          subscription: {
            entity: {
              id: 'sub_123',
              customer_id: 'cust_123',
              current_start: 1,
              current_end: 2,
              notes: { userId: 'user_123' },
            },
          },
        },
      });

      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.update).toHaveBeenCalled();
    });

    it('should handle subscription.charged with payment details', async () => {
      mockDb.returning.mockReturnValueOnce([{ id: 'wh_123' }]);

      await service.handleWebhook({
        id: 'evt_123',
        event: 'subscription.charged',
        payload: {
          subscription: {
            entity: {
              id: 'sub_123',
              customer_id: 'cust_123',
              current_start: 1,
              current_end: 2,
              notes: { userId: 'user_123' },
            },
          },
          payment: { entity: { id: 'pay_123', amount: 100, currency: 'INR', status: 'captured' } },
        },
      });

      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should handle subscription.cancelled', async () => {
      mockDb.returning.mockReturnValueOnce([{ id: 'wh_123' }]);
      mockDb.where.mockReturnValue([{ userId: 'user_123' }]);

      await service.handleWebhook({
        id: 'evt_123',
        event: 'subscription.cancelled',
        payload: {
          subscription: { entity: { id: 'sub_123' } },
        },
      });

      expect(mockDb.update).toHaveBeenCalled();
    });
  });
});
