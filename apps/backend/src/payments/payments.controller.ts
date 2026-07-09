import { Controller, Post, Body, Headers, Req, Res, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Request, Response } from 'express';
// Assuming there is a Clerk AuthGuard or similar
// import { ClerkAuthGuard } from '../auth/clerk-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-subscription')
  // @UseGuards(ClerkAuthGuard)
  async createSubscription(@Body() body: { planId: string, userId: string }) {
    // In a real app, extract userId from req.user (from Clerk Auth)
    // For now we accept it in body for simplicity or require it via headers
    const { planId, userId } = body;
    
    if (!planId || !userId) {
      throw new HttpException('Missing planId or userId', HttpStatus.BAD_REQUEST);
    }

    try {
      const subscription = await this.paymentsService.createSubscription(userId, planId);
      return {
        success: true,
        subscriptionId: subscription.id,
      };
    } catch (e) {
      throw new HttpException(e.message || 'Internal error', e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('cancel-subscription')
  async cancelSubscription(@Body() body: { userId: string }) {
    const { userId } = body;
    
    if (!userId) {
      throw new HttpException('Missing userId', HttpStatus.BAD_REQUEST);
    }
    
    try {
      await this.paymentsService.cancelSubscription(userId);
      return { success: true };
    } catch (e) {
      throw new HttpException(e.message || 'Internal error', e.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('webhook/razorpay')
  async handleRazorpayWebhook(@Headers('x-razorpay-signature') signature: string, @Req() req: Request, @Res() res: Response) {
    if (!signature) {
      return res.status(HttpStatus.BAD_REQUEST).send('Missing signature');
    }

    try {
      // The body needs to be the raw payload for signature verification, 
      // but Razorpay signature is based on the JSON string body.
      await this.paymentsService.verifyWebhook(signature, req.body);
      
      // Handle the event asynchronously
      this.paymentsService.handleWebhook(req.body);

      return res.status(HttpStatus.OK).send({ status: 'ok' });
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).send(e.message);
    }
  }
}
