/**
 * Compress and convert any image (including HEIC from iOS) to JPEG using canvas.
 * Returns a File suitable for Firebase Storage upload.
 */
export async function compressImageToFile(
  source: File,
  maxDim = 1280,
  quality = 0.85
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(source);
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(objectUrl);
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error("Falha ao comprimir imagem")); return; }
          resolve(new File([blob], "photo.jpg", { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Não foi possível carregar a imagem"));
    };
    img.src = objectUrl;
  });
}

/**
 * Compress any image to JPEG and return base64 + data URL preview.
 * Used by AI diagnosis tools to send normalized JPEG to Gemini API.
 */
export async function compressImageToBase64(
  source: File,
  maxDim = 1280,
  quality = 0.85
): Promise<{ base64: string; preview: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(source);
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      URL.revokeObjectURL(objectUrl);
      resolve({ base64: dataUrl.split(",")[1], preview: dataUrl });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Não foi possível processar a imagem"));
    };
    img.src = objectUrl;
  });
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/") || file.type === "";
}
