import prisma from "../../config/prisma";
import cloudinary from "../../config/cloudinary";
import { Readable } from "stream";
export const getMyProfile = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const updateMyProfile = async (
  userId: number,
  payload: {
    name?: string;
    phone?: string;
  }
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  
  if (payload.phone) {
    const existingPhone = await prisma.user.findFirst({
      where: {
        phone: payload.phone,
        NOT: {
          id: userId,
        },
      },
    });

    if (existingPhone) {
      throw new Error("Phone number already exists");
    }
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      name: payload.name,
      phone: payload.phone,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

export const uploadProfileImage = async (
  userId: number,
  file: Express.Multer.File
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

const imageUrl = await new Promise<string>((resolve, reject) => {
  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: "RepairBridge/profile-images",
      public_id: `user_${user.id}`,
      overwrite: true,
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
  // Update Database
  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      image: imageUrl,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      role: true,
      isActive: true,
    },
  });

  return updatedUser;
};