import {
  Body,
  Controller,
  Headers,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ClerkAuthGuard } from '../utils/auth.guard';
import type { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-subscription')
  @UseGuards(ClerkAuthGuard)
  async createSubscription(
    @Req() req: Request,
    @Body() body: { planId: string; hasTrial?: boolean },
  ) {
    const userId = (req as any).user?.id;
    const { planId, hasTrial } = body;

    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    if (!planId) {
      throw new HttpException('Missing planId', HttpStatus.BAD_REQUEST);
    }

    try {
      const subscription = await this.paymentsService.createSubscription(userId, planId);
      return {
        success: true,
        subscriptionId: subscription.id,
      };
    } catch (e: any) {
      if (e instanceof HttpException) throw e;
      throw new HttpException(
        e.message || 'Internal error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('create-order')
  @UseGuards(ClerkAuthGuard)
  async createOrder(@Req() req: Request, @Body() body: { currency: string }) {
    const userId = (req as any).user?.id;
    const { currency } = body;

    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    if (!currency) {
      throw new HttpException('Missing currency', HttpStatus.BAD_REQUEST);
    }

    const amount = currency === 'INR' ? 200 : 3.99;

    try {
      const order = await this.paymentsService.createOrder(userId, currency, amount);
      return {
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      };
    } catch (e: any) {
      if (e instanceof HttpException) throw e;
      throw new HttpException(
        e.message || 'Internal error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('verify-subscription')
  @UseGuards(ClerkAuthGuard)
  async verifySubscription(
    @Req() req: Request,
    @Body() body: {
      razorpay_payment_id: string;
      razorpay_subscription_id: string;
      razorpay_signature: string;
    },
  ) {
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    try {
      const result = await this.paymentsService.verifySubscription(userId, body);
      return result;
    } catch (e: any) {
      if (e instanceof HttpException) throw e;
      throw new HttpException(
        e.message || 'Subscription verification failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('cancel-subscription')
  @UseGuards(ClerkAuthGuard)
  async cancelSubscription(@Req() req: Request) {
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new HttpException('Missing userId', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.paymentsService.cancelSubscription(userId);
      return { success: true };
    } catch (e: any) {
      throw new HttpException(
        e.message || 'Internal error',
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('webhook/razorpay')
  async handleRazorpayWebhook(
    @Headers('x-razorpay-signature') signature: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!signature) {
      return res.status(HttpStatus.BAD_REQUEST).send('Missing signature');
    }

    try {
      const rawBody = (req as any).rawBody;
      if (!rawBody) {
        throw new HttpException('Missing raw body', HttpStatus.BAD_REQUEST);
      }
      // Use the raw body string for signature verification to prevent JSON stringify mismatches
      await this.paymentsService.verifyWebhook(signature, rawBody);

      // Handle the event asynchronously
      this.paymentsService.handleWebhook(req.body);

      return res.status(HttpStatus.OK).send({ status: 'ok' });
    } catch (e: any) {
      return res.status(HttpStatus.BAD_REQUEST).send(e.message);
    }
  }
}
