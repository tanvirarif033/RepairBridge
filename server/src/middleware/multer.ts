import multer from "multer";

// Memory Storage
const storage = multer.memoryStorage();

// File Filter
const fileFilter: multer.Options["fileFilter"] = (
  req,
  file,
  cb
) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, PNG and WEBP images are allowed"));
  }
};

// Multer Configuration
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter,
});

// Single Image Upload
export const uploadSingle = upload.single("image");

// Multiple Image Upload
export const uploadMultiple = upload.array("images", 5);

export default upload;