import express from "express";
import slugify from "../utils/slugify.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  createJob,
  deleteJob,
  getJobBySlug,
  getMyJob,
  listPublicJob,
  updateJob,
  searchPublicJobs
} from "../controllers/jobController.js";
import isVerify from "../middlewares/isVerifyMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, isVerify, createJob);
router.put("/:id", authMiddleware, isVerify, updateJob);
router.delete("/:id", authMiddleware, isVerify, deleteJob);
router.get("/get-my-job", authMiddleware, getMyJob);

router.get("/public", listPublicJob);
router.get("/public/search", searchPublicJobs);
router.get("/public/:slug", getJobBySlug);

export default router;
