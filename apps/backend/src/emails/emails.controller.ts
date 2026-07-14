import { Controller, Headers, Post, Req, Res } from '@nestjs/common';
import { Queue } from 'bullmq';
import type { Request, Response } from 'express';
import { Webhook } from 'svix';

@Controller('emails')
export class EmailsController {
  private emailQueue: Queue;

  constructor() {
    this.emailQueue = new Queue('email', {
      connection: {
        url: process.env.REDIS_URL,
      },
    });
  }

  @Post('webhooks/resend')
  async handleResendWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('svix-id') svixId: string,
    @Headers('svix-signature') svixSignature: string,
    @Headers('svix-timestamp') svixTimestamp: string,
  ) {
    const secret = process.env.RESEND_WEBHOOK_SECRET;

    if (!secret) {
      console.error('[EmailsController] Missing RESEND_WEBHOOK_SECRET');
      return res.status(500).send();
    }

    if (!svixId || !svixSignature || !svixTimestamp) {
      return res.status(401).send();
    }

    const wh = new Webhook(secret);

    try {
      // Validate webhook signature
      const payload = wh.verify(JSON.stringify(req.body), {
        'svix-id': svixId,
        'svix-signature': svixSignature,
        'svix-timestamp': svixTimestamp,
      });

      // Enqueue the event for background processing, return 200 immediately
      await this.emailQueue.add('process-email-event', payload);
      return res.status(200).send();
    } catch (err) {
      console.error('[EmailsController] Webhook verification failed:', err);
      return res.status(401).send();
    }
  }
}
