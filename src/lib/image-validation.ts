export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export function getImageValidationError(file: File): string | null {
  if (!IMAGE_ACCEPT.split(',').includes(file.type)) {
    return 'Choose a JPG, PNG, WebP, or GIF image.';
  }
  if (file.size === 0) return 'This image is empty. Choose another file.';
  if (file.size > MAX_IMAGE_SIZE) return 'Choose an image smaller than 10 MB.';
  return null;
}
