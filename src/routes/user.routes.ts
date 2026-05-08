import { Router } from "express";
import { authMiddleware } from "../middlewares/Auth/AuthMiddleware";
import { uploadAvatar } from "../middlewares/Auth/upload.middleware";
import {
  updateAvatar,
  updateMe,
  updatePassword,
} from "../modules/user/user.controller";
import {
  UpdatePasswordSchema,
  UpdateProfileSchema,
} from "../modules/user/user.validation";
import { validate } from "../middlewares/validations/validate.middleware";

const router = Router();

router.patch(
  "/me/avatar",
  authMiddleware,
  uploadAvatar.single("avatar"),
  updateAvatar,
);

router.patch("/me", authMiddleware, validate(UpdateProfileSchema), updateMe);
router.patch(
  "/me/password",
  authMiddleware,
  validate(UpdatePasswordSchema),
  updatePassword,
);

export default router;
