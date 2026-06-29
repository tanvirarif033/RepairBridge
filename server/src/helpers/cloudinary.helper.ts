import cloudinary from "../config/cloudinary";
import { Readable } from "stream";

export const uploadImage = async (
  file: Express.Multer.File,
  folder: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (!result) {
          reject(new Error("Image upload failed"));
        } else {
          resolve(result.secure_url);
        }
      }
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });
};

export const uploadMultipleImages = async (
  files: Express.Multer.File[],
  folder: string
): Promise<string[]> => {
  const imageUrls: string[] = [];

  for (const file of files) {
    const imageUrl = await uploadImage(file, folder);

    imageUrls.push(imageUrl);
  }

  return imageUrls;
};