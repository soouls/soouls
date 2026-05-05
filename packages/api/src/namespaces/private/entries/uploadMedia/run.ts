import type { ProtectedContext, Services } from '../../../../trpc.js';
import type { Input } from './constants.js';

export async function run(
  input: Input,
  ctx: ProtectedContext,
  services: Services,
): Promise<{
  publicUrl: string;
  storageKey: string;
  contentType: string;
  byteSize: number;
  sha256: string;
}> {
  return services.entries.uploadMediaDataUrl(
    ctx.userId,
    input.entryId,
    input.dataUrl,
    input.contentType,
  );
}
