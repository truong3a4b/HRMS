import { Router } from "express";
import { z } from "zod";
import { authController } from "../controllers/auth.controller";
import { checkAccessToken } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

const setNewPasswordSchema = z.object({
  resetToken: z.string().min(1),
  newPassword: z.string().min(6),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

router.post("/register", validate(registerSchema), authController.register);
router.post("/verify-otp", validate(verifyOtpSchema), authController.verifyOtp);
router.post("/login", validate(loginSchema), authController.login);
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);
router.post(
  "/reset-password",
  validate(setNewPasswordSchema),
  authController.resetPassword,
);
router.post(
  "/verify-reset-otp",
  validate(resetPasswordSchema),
  authController.verifyPasswordResetOtp,
);
router.post(
  "/change-password",
  checkAccessToken,
  validate(changePasswordSchema),
  authController.changePassword,
);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", checkAccessToken, authController.getMe);
router.get(
  "/my-permissions",
  checkAccessToken,
  authController.getMyPermissions,
);

export default router;
