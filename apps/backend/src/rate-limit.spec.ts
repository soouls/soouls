import { beforeEach, describe, expect, it } from 'bun:test';
import {
  checkRateLimit,
  getRateLimitStats,
  initRateLimiter,
  resetRateLimiter,
} from '@soouls/api/rate-limit';

describe('Rate Limiter', () => {
  beforeEach(() => {
    resetRateLimiter();
  });

  it('should allow requests within limit', async () => {
    const config = { maxRequests: 5, windowMs: 1000 };
    for (let i = 0; i < 5; i++) {
      const res = await checkRateLimit('test-ip', 'test-route', config);
      expect(res.ok).toBe(true);
      expect(res.retryAfterMs).toBe(0);
    }
  });

  it('should block requests exceeding limit', async () => {
    const config = { maxRequests: 3, windowMs: 1000 };

    // First 3 requests should succeed
    for (let i = 0; i < 3; i++) {
      const res = await checkRateLimit('test-ip-2', 'test-route', config);
      expect(res.ok).toBe(true);
    }

    // 4th request should fail
    const resBlocked = await checkRateLimit('test-ip-2', 'test-route', config);
    expect(resBlocked.ok).toBe(false);
    expect(resBlocked.retryAfterMs).toBeGreaterThan(0);
  });

  it('should reset limit after window expires', async () => {
    const config = { maxRequests: 2, windowMs: 100 };

    await checkRateLimit('test-ip-3', 'test-route', config);
    await checkRateLimit('test-ip-3', 'test-route', config);

    // Third request immediately is blocked
    const resBlocked = await checkRateLimit('test-ip-3', 'test-route', config);
    expect(resBlocked.ok).toBe(false);

    // Wait for window to expire
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Request now should be allowed
    const resAllowed = await checkRateLimit('test-ip-3', 'test-route', config);
    expect(resAllowed.ok).toBe(true);
  });

  it('should isolate rate limits by IP and Route', async () => {
    const config = { maxRequests: 2, windowMs: 1000 };

    await checkRateLimit('ip-a', 'route-1', config);
    await checkRateLimit('ip-a', 'route-1', config);

    // ip-a on route-1 is blocked
    const resBlocked = await checkRateLimit('ip-a', 'route-1', config);
    expect(resBlocked.ok).toBe(false);

    // ip-b on route-1 should be allowed
    const resIpB = await checkRateLimit('ip-b', 'route-1', config);
    expect(resIpB.ok).toBe(true);

    // ip-a on route-2 should be allowed
    const resRoute2 = await checkRateLimit('ip-a', 'route-2', config);
    expect(resRoute2.ok).toBe(true);
  });

  it('should track violations and return stats', async () => {
    const config = { maxRequests: 2, windowMs: 1000 };

    await checkRateLimit('ip-violation', 'route', config);
    await checkRateLimit('ip-violation', 'route', config);
    await checkRateLimit('ip-violation', 'route', config); // Blocked, causes violation

    const stats = await getRateLimitStats();
    expect(stats.violations.length).toBeGreaterThan(0);
    expect(stats.violations[0].ip).toBe('ip-violation');
  });
});
