import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const originalName = path.basename(file.originalname, ext); // Get the original file name without extension

    cb(null, `${originalName}` + "-" + Date.now() + `${ext}`); // Use original file name with extension
  },
});

const upload = multer({ storage });

export default upload;
