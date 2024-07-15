import * as fs from 'fs';

export const deleteImage = (imagePath: string) => {
    if (imagePath) {
        try {
          fs.unlinkSync(imagePath);
        } catch (err) {
          console.error('Error deleting image:', err);
        }
      } 
}