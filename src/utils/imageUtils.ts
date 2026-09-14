/**
 * Utility functions for mobile & web image processing and compression
 * Ensures fast uploads, mobile memory efficiency, and Firestore-safe payload sizes.
 */

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  secondaryQuality?: number;
  maxSizeInBytes?: number;
}

export interface CompressedImageResult {
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  originalSizeStr: string;
  compressedSizeStr: string;
  width: number;
  height: number;
}

/**
 * Validates if the file is an image
 */
export function isImageFile(file: File): boolean {
  if (!file) return false;
  return (
    file.type.startsWith("image/") ||
    /\.(jpe?g|png|webp|gif|bmp|heic|heif)$/i.test(file.name)
  );
}

/**
 * Format bytes to readable string (KB / MB)
 */
export function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0KB";
  const kb = Math.round(bytes / 1024);
  if (kb > 1024) {
    return `${(kb / 1024).toFixed(1)}MB`;
  }
  return `${kb}KB`;
}

/**
 * Compresses an image File using HTML Canvas
 * Supports dual-pass quality step-down to stay under target payload budget
 */
export async function compressImage(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<CompressedImageResult> {
  const {
    maxWidth = 1200,
    maxHeight = 800,
    quality = 0.82,
    secondaryQuality = 0.68,
    maxSizeInBytes = 400000,
  } = options;

  return new Promise((resolve, reject) => {
    let objectUrl = "";
    try {
      objectUrl = URL.createObjectURL(file);
    } catch {
      objectUrl = "";
    }

    const img = new Image();

    const cleanup = () => {
      if (objectUrl) {
        try {
          URL.revokeObjectURL(objectUrl);
        } catch {
          // ignore
        }
      }
    };

    img.onload = () => {
      cleanup();
      try {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          let dataUrl = canvas.toDataURL("image/jpeg", quality);

          // If payload is still larger than budget, perform second pass
          if (dataUrl.length > maxSizeInBytes) {
            dataUrl = canvas.toDataURL("image/jpeg", secondaryQuality);
          }

          const approxCompBytes = Math.round(dataUrl.length * 0.75);
          const ratio = Math.max(
            0,
            Math.round(((file.size - approxCompBytes) / file.size) * 100)
          );

          resolve({
            dataUrl,
            originalSize: file.size,
            compressedSize: approxCompBytes,
            compressionRatio: ratio,
            originalSizeStr: formatBytes(file.size),
            compressedSizeStr: formatBytes(approxCompBytes),
            width,
            height,
          });
          return;
        }
      } catch (err) {
        console.warn("Canvas compression failed, falling back to FileReader:", err);
      }

      // Fallback to FileReader
      const reader = new FileReader();
      reader.onload = (e) => {
        const raw = (e.target?.result as string) || "";
        const approxBytes = Math.round(raw.length * 0.75);
        resolve({
          dataUrl: raw,
          originalSize: file.size,
          compressedSize: approxBytes,
          compressionRatio: 0,
          originalSizeStr: formatBytes(file.size),
          compressedSizeStr: formatBytes(approxBytes),
          width: img.width || 0,
          height: img.height || 0,
        });
      };
      reader.onerror = () => reject(new Error("사진을 읽어오지 못했습니다."));
      reader.readAsDataURL(file);
    };

    img.onerror = () => {
      cleanup();
      // Final fallback to FileReader
      const reader = new FileReader();
      reader.onload = (e) => {
        const raw = (e.target?.result as string) || "";
        const approxBytes = Math.round(raw.length * 0.75);
        resolve({
          dataUrl: raw,
          originalSize: file.size,
          compressedSize: approxBytes,
          compressionRatio: 0,
          originalSizeStr: formatBytes(file.size),
          compressedSizeStr: formatBytes(approxBytes),
          width: 0,
          height: 0,
        });
      };
      reader.onerror = () => reject(new Error("사진 형식을 해석할 수 없습니다."));
      reader.readAsDataURL(file);
    };

    if (objectUrl) {
      img.src = objectUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = (e.target?.result as string) || "";
      };
      reader.onerror = () => reject(new Error("사진 파일을 읽는 도중 오류가 발생했습니다."));
      reader.readAsDataURL(file);
    }
  });
}
