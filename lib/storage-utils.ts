import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Uploads a file to Firebase Storage
 * @param file The file to upload
 * @param path The path in storage where the file should be saved
 * @returns Promise with the download URL of the uploaded file
 */
export async function uploadPhoto(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  return downloadURL;
}

/**
 * Uploads a file with progress tracking
 * @param file The file to upload
 * @param path The path in storage where the file should be saved
 * @param progressCallback Callback function that receives upload progress (0-100)
 * @returns Promise with the download URL of the uploaded file
 */
export function uploadPhotoWithProgress(
  file: File, 
  path: string,
  progressCallback?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (progressCallback) {
          progressCallback(progress);
        }
      },
      (error) => {
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}