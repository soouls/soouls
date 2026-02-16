import { All, Controller, Inject, Next, Req, Res } from '@nestjs/common';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import type { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';
import { createTrpcContext } from './trpc.context';
import { TrpcRouter } from './trpc.router';

@Controller('trpc')
export class TrpcController {
  private readonly middleware: ReturnType<typeof createExpressMiddleware>;

  constructor(@Inject(TrpcRouter) private readonly trpcRouter: TrpcRouter) {
    this.middleware = createExpressMiddleware({
      router: this.trpcRouter.appRouter,
      createContext: async ({ req }) => createTrpcContext(req),
    });
  }

  @All('*')
  handler(@Req() req: ExpressRequest, @Res() res: ExpressResponse, @Next() next: NextFunction) {
    return this.middleware(req, res, next);
  }
}
