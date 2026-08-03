import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadPlantPhoto(userId: string, plantId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const storageRef = ref(storage, `plants/${userId}/${plantId}/${Date.now()}.${ext}`);
  await new Promise<void>((resolve, reject) => {
    const tid = setTimeout(() => reject(new Error("Upload de foto excedeu 20s. Verifique as regras do Firebase Storage.")), 20000);
    uploadBytes(storageRef, file)
      .then(() => { clearTimeout(tid); resolve(); })
      .catch(err => { clearTimeout(tid); reject(err); });
  });
  return getDownloadURL(storageRef);
}

export async function deletePlantPhotoByUrl(url: string): Promise<void> {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch { /* ignore if already deleted */ }
}
