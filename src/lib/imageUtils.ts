/**
 * Compresses an image file to reduce its size
 * @param file The image file to compress
 * @param maxSizeInMB Maximum size in MB (default: 10MB)
 * @param quality Compression quality (0-1, default: 0.8)
 * @returns A Promise that resolves to a compressed image as a Blob
 */
export const compressImage = async (
  file: File,
  maxSizeInMB: number = 10,
  quality: number = 0.8
): Promise<Blob> => {
  if (file.size / 1024 / 1024 < maxSizeInMB) {
    return file;
  }

  const img = document.createElement('img');

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  return new Promise<Blob>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      if (!event.target?.result) {
        reject(new Error('Failed to read file'));
        return;
      }

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        const MAX_DIMENSION = 1920;

        if (width > height && width > MAX_DIMENSION) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else if (height > MAX_DIMENSION) {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            if (blob.size / 1024 / 1024 > maxSizeInMB && quality > 0.3) {
              compressImage(file, maxSizeInMB, quality - 0.1)
                .then(resolve)
                .catch(reject);
            } else {
              resolve(blob);
            }
          },
          file.type,
          quality
        );
      };

      img.src = event.target.result as string;
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Converts a Blob to a base64 string
 * @param blob The Blob to convert
 * @returns A Promise that resolves to a base64 string
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
