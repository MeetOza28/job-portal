import express from "express";

const router = express.Router();

import {
  getProfile,
  editProfile,
  changePassword,
  deleteAccount,
} from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import isVerify from "../middlewares/isVerifyMiddleware.js";

router.get("/me", authMiddleware, getProfile);
router.put("/edit-profile", authMiddleware, isVerify, editProfile);
router.put("/change-password", authMiddleware, isVerify, changePassword);
router.delete("/delete-account", authMiddleware, isVerify, deleteAccount);

export default router;
