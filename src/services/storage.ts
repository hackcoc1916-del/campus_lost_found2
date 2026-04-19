import { api } from './api';

export const uploadImage = (
  file: File,
  onProgress?: (progress: number) => void,
): Promise<string> => {
  return api.uploadFile('/api/upload', file, onProgress).then((result) => result.imageUrl);
};

export const deleteImage = async (_imageUrl: string) => {
  // Image deletion is handled server-side when the item is deleted
};
