import multer from "multer";
import crypto from "crypto";
import path from "path";



// Multer storage setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/temp');
    },
    filename: function (req, file, cb) {
      const randomBytes = crypto.randomBytes(12).toString('hex');
      const filename = randomBytes + path.extname(file.originalname);
      cb(null, filename);
    }
  });

  const upload = multer({ storage: storage });

  export default upload;