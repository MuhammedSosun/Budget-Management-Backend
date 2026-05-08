import multer from "multer";
import { AppError } from "../../exceptions/AppError";

const storage = multer.memoryStorage();

export const uploadAvatar = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new AppError(
          "Sadece JPEG, PNG veya WEBP formatı yükleyebilirsiniz.",
          400,
        ),
      );
    }

    cb(null, true);
  },
});
