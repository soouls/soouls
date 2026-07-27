import { trpc } from '../utils/trpc';

export function useEntries(limit = 20) {
  return trpc.private.entries.getAll.useQuery({ limit });
}

export function useEntry(id: string) {
  return trpc.private.entries.getOne.useQuery({ id }, {
    enabled: !!id && id !== 'draft'
  });
}

export function useUpsertSync() {
  const utils = trpc.useUtils();
  return trpc.private.entries.upsertSync.useMutation({
    onSuccess: () => {
      utils.private.entries.getAll.invalidate();
      utils.private.home.getClusters.invalidate();
      utils.private.home.getInsights.invalidate();
      utils.private.home.getAccount.invalidate();
    }
  });
}

export function useCreateEntry() {
  const utils = trpc.useUtils();
  return trpc.private.entries.create.useMutation({
    onSuccess: () => {
      utils.private.entries.getAll.invalidate();
      utils.private.home.getClusters.invalidate();
      utils.private.home.getInsights.invalidate();
      utils.private.home.getAccount.invalidate();
    }
  });
}

export function useDeleteEntry() {
  const utils = trpc.useUtils();
  return trpc.private.entries.delete.useMutation({
    onSuccess: () => {
      utils.private.entries.getAll.invalidate();
      utils.private.home.getClusters.invalidate();
      utils.private.home.getInsights.invalidate();
      utils.private.home.getAccount.invalidate();
    }
  });
}
