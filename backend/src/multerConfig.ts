import multer from "multer";

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, "./upload");
  },

  filename(req, file, callback) {
    console.log(file);
    callback(null, `${Date.now() + "-"}${file.originalname}`);
  },
});

const upload = multer({ storage });
export default upload;
