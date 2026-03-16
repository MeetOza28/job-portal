import express from "express";
import {
  authRegister,
  authEmailVerification,
  authLogin,
  authForgot,
  authReset,
  authLogout,
  authSendEmailAfterExpire,
} from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", authRegister);
router.post("/login", authLogin);
router.post("/forgot-password", authForgot);
router.post("/reset-password", authReset);
router.get("/email-verify", authEmailVerification);
router.post("/logout", authMiddleware, authLogout);
router.post("/send-email", authSendEmailAfterExpire);

export default router;
