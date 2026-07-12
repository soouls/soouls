import { trpc } from '../utils/trpc';

export function useImageUploader() {
  const getUploadUrl = trpc.private.entries.getUploadUrl.useMutation();
  const updateMediaUrl = trpc.private.entries.updateMediaUrl.useMutation();

  const uploadImage = async (uri: string, mimeType: string, entryId: string) => {
    try {
      // 1. Get presigned URL
      const { uploadUrl, publicUrl } = await getUploadUrl.mutateAsync({
        entryId,
        contentType: mimeType,
      });

      // 2. Fetch the local file as blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // 3. PUT to presigned URL
      await fetch(uploadUrl, {
        method: 'PUT',
        body: blob,
        headers: {
          'Content-Type': mimeType,
        },
      });

      // 4. Update the DB with the final URL
      await updateMediaUrl.mutateAsync({
        entryId,
        mediaUrl: publicUrl,
      });

      return publicUrl;
    } catch (err) {
      console.error('Upload failed:', err);
      throw err;
    }
  };

  return { uploadImage, isUploading: getUploadUrl.isPending || updateMediaUrl.isPending };
}
