import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    
    const ext = path.extname(file.originalname);
    // console.log("ext=",ext);
    const originalName = path.basename(file.originalname, ext); // Get the original file name without extension
    // console.log("originalName=",originalName);
    cb(null, `${originalName}${ext}`); // Use original file name with extension
  },
});

// console.log("storage=",storage());


const upload = multer({ storage });

export default upload;
