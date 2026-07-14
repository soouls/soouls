import {
  Body,
  Controller,
  Headers as Header,
  HttpCode,
  Param,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Receiver } from '@upstash/qstash';
import type { Request } from 'express';
import { Resend } from 'resend';
// biome-ignore lint/style/useImportType: Nest uses this class as a runtime injection token.
import { NotificationDispatchService } from './notification-dispatch.service';
import { getBackendPublicUrl } from './notification.constants';
// biome-ignore lint/style/useImportType: Nest uses this class as a runtime injection token.
import { ResendProvider } from './resend.provider';

type RawBodyRequest = Request & {
  rawBody?: string;
  originalUrl?: string;
  protocol?: string;
  get?: (name: string) => string | undefined;
};

function rawBody(req: RawBodyRequest, body: unknown) {
  return req.rawBody ?? JSON.stringify(body ?? {});
}

function firstHeader(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function headerRecordToResendHeaders(headers: Record<string, string | string[] | undefined>) {
  return {
    'svix-id': firstHeader(headers['svix-id']) ?? '',
    'svix-timestamp': firstHeader(headers['svix-timestamp']) ?? '',
    'svix-signature': firstHeader(headers['svix-signature']) ?? '',
  };
}

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly dispatcher: NotificationDispatchService,
    private readonly resend: ResendProvider,
  ) {}

  @Post('jobs/:name')
  @HttpCode(200)
  async processJob(
    @Param('name') name: string,
    @Body() body: unknown,
    @Header('upstash-signature') signature: string | undefined,
    @Req() req: RawBodyRequest,
  ) {
    await this.verifyQstashRequest(name, signature, rawBody(req, body));
    await this.dispatcher.processJob(name, body);
    return { ok: true };
  }

  @Post('webhooks/resend')
  @HttpCode(200)
  async processResendWebhook(
    @Body() body: unknown,
    @Header() headers: Record<string, string | string[] | undefined>,
    @Req() req: RawBodyRequest,
  ) {
    const event = this.verifyResendWebhook(rawBody(req, body), headers, body);
    await this.dispatcher.processResendWebhook(
      event as Parameters<NotificationDispatchService['processResendWebhook']>[0],
    );
    return { received: true };
  }

  private async verifyQstashRequest(name: string, signature: string | undefined, body: string) {
    const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
    const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY;

    if (!currentSigningKey || !nextSigningKey) {
      if (process.env.NODE_ENV === 'production') {
        throw new UnauthorizedException('QStash signing keys are not configured.');
      }
      return;
    }

    if (!signature) {
      throw new UnauthorizedException('Missing QStash signature.');
    }

    const backendUrl = getBackendPublicUrl();
    const url = backendUrl
      ? new URL(`/notifications/jobs/${name}`, backendUrl).toString()
      : undefined;
    const receiver = new Receiver({ currentSigningKey, nextSigningKey });
    const verified = await receiver.verify({ signature, body, url });

    if (!verified) {
      throw new UnauthorizedException('Invalid QStash signature.');
    }
  }

  private verifyResendWebhook(
    payload: string,
    headers: Record<string, string | string[] | undefined>,
    fallbackBody: unknown,
  ) {
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

    if (!webhookSecret) {
      if (process.env.NODE_ENV === 'production') {
        throw new UnauthorizedException('Resend webhook secret is not configured.');
      }
      return fallbackBody;
    }

    // Use contacts instance which has full access, or fallback to sending instance
    const client = this.resend.contacts ?? this.resend.sending;
    if (!client) {
      throw new UnauthorizedException('Resend is not configured.');
    }

    return client.webhooks.verify({
      secret: webhookSecret,
      payload,
      headers: headerRecordToResendHeaders(headers) as any,
    } as any);
  }
}
