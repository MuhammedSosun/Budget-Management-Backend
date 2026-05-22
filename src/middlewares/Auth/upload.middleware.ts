import multer from "multer";
import { AppError } from "../../exceptions/AppError";
import { ErrorCode } from "../../exceptions/ErrorCodes";

const storage = multer.memoryStorage();

export const uploadAvatar = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new AppError(ErrorCode.INVALID_IMAGE_FORMAT, 400));
    }

    cb(null, true);
  },
});
