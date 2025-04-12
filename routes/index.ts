const express = require("express");
const router = express.Router();
const { sendCustomEmail } = require("../controllers/emailController");
import { upload } from "../config/multer";
import {
  multipleFields,
  multipleUploads,
  singleUpload,
} from "../controllers/uploadController";

router.route("/").post(sendCustomEmail);
router.post("/single", upload.single("image"), singleUpload);

router.post("/multiple", upload.array("files", 5), multipleUploads);

const multipleUpload = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "gallery", maxCount: 5 },
]);
// router.post("/fields", multipleUpload, multipleFields);

module.exports = router;

module.exports = router;
