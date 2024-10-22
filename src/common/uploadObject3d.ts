import { getDownloadURL } from 'firebase/storage';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import * as fs from 'fs';

export const uploadToFirebase = async (file: Express.Multer.File) => {
  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: 'vudecorshop.firebaseapp.com',
    projectId: 'vudecorshop',
    storageBucket: 'vudecorshop.appspot.com',
    messagingSenderId: '503757097540',
    appId: '1:503757097540:web:fa74e404ac1132d79e8a11',
    measurementId: 'G-XV7PJ5H8X3',
  };

  const app = initializeApp(firebaseConfig);
  const storage = getStorage(app);

  if (!file) {
    throw new Error('Không tìm thấy file !');
  }

  try {
    // const fileBuffer = fs.readFileSync(file.path);
    // if (fileBuffer.length === 0) {
    //   throw new Error('Không tìm thấy file !');
    // }

    const storageRef = ref(storage,"upload/" + Date.now().toString() + file.originalname);

    await uploadBytes(storageRef, file.buffer);

    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    throw new Error(`Lỗi khi upload file lên firebase: ${error.message}`);
  }
};
