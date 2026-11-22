import { getImageValidationError } from './image-validation';

export async function uploadToImgBB(file: File): Promise<string> {
  const validationError = getImageValidationError(file);
  if (validationError) throw new Error(validationError);
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('Image uploads are currently unavailable. Please contact support.');
  }

  const formData = new FormData();
  formData.append('image', file);

  let res: Response;
  try {
    res = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
      { method: 'POST', body: formData }
    );
  } catch {
    throw new Error('Could not upload the image. Check your connection and try again.');
  }

  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.success || typeof data.data?.url !== 'string' || !data.data.url) {
    throw new Error(data?.error?.message || 'Image upload failed. Please try again.');
  }

  return data.data.url as string;
}
