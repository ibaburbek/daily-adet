export interface ProcessedImageResult {
  blob: Blob;
  previewUrl: string;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB max upload

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Тек JPG, PNG немесе WebP форматтарына қолдау көрсетіледі.',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'Файл көлемі 15 МБ-тан аспауы керек.',
    };
  }

  return { valid: true };
}

export function compressAndResizeImage(
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.85
): Promise<ProcessedImageResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Файлды оқу кезінде қате орын алды'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Суретті жүктеу сәтсіз аяқталды'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-preserving dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas контексті қолжетімді емес'));
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Determine output mime type (prefer webp, fallback to jpeg)
        const mimeType = 'image/webp';

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              // Fallback to jpeg if webp failed
              canvas.toBlob(
                (jpegBlob) => {
                  if (!jpegBlob) {
                    reject(new Error('Суретті қысу сәтсіз аяқталды'));
                    return;
                  }
                  resolve({
                    blob: jpegBlob,
                    previewUrl: URL.createObjectURL(jpegBlob),
                    width,
                    height,
                    originalSize: file.size,
                    compressedSize: jpegBlob.size,
                  });
                },
                'image/jpeg',
                quality
              );
              return;
            }

            resolve({
              blob,
              previewUrl: URL.createObjectURL(blob),
              width,
              height,
              originalSize: file.size,
              compressedSize: blob.size,
            });
          },
          mimeType,
          quality
        );
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
