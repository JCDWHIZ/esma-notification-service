const express = require("express");
const router = express.Router();
// const { sendCustomEmail } = require("../controllers/emailController");
import { upload } from "../config/multer";
import {
  multipleFields,
  multipleUploads,
  singleUpload,
} from "../controllers/uploadController";

// router.route("/email").post(sendCustomEmail);

/**
 * @openapi
 * /api/upload/single:
 *   post:
 *     summary: Upload a single file
 *     tags:
 *       - File Handling
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Internal server error
 */
router.post("/upload/single", upload.single("file"), singleUpload);

/**
 * @openapi
 * /api/upload/multiple:
 *   post:
 *     summary: Upload multiple files (same field)
 *     tags:
 *       - File Handling
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 files:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.post("/upload/multiple", upload.array("files", 5), multipleUploads);

const multipleUpload = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "gallery", maxCount: 5 },
]);
/**
 * @openapi
 * /api/upload/multiple-fields:
 *   post:
 *     summary: Upload files from multiple fields
 *     tags:
 *       - File Handling
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               frontImage:
 *                 type: string
 *                 format: binary
 *               backImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 files:
 *                   type: object
 *                   properties:
 *                     frontImage:
 *                       type: array
 *                       items:
 *                         type: object
 *                     backImage:
 *                       type: array
 *                       items:
 *                         type: object
 */
// router.post("/fields", multipleUpload, multipleFields);

module.exports = router;
