import multer from "multer";
import crypto from "crypto";
import path from "path";
import fs from "fs";

// Ensure temp directory exists
const tempDir = path.resolve("./public/temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
  console.log(`Created temp directory at: ${tempDir}`);
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const randomBytes = crypto.randomBytes(12).toString("hex");
    const filename = randomBytes + path.extname(file.originalname);
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

export default upload;
