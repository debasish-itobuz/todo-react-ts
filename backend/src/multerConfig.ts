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



// const uploadVideo = async (req: Request, res: Response) => {
//   // console.log("...",req.file)
//   try {
//     if (req?.file?.path) {
//       const userId = req.query.id;
//       const videos = req.file;
//       // console.log("obj", videos)

//       //const allvideos = await userModel.findById(userId, 'videos');

      
//       if (!userId)
//         return res.status(400).send({ message: "User ID is required" });

//       const data = await userModel.findByIdAndUpdate(userId, {
//          $push: { videos: {title: videos.filename, url: videos.path}}
//       });

//       if (!data) return res.status(400).send({ message: "User not found" });

//       return res.status(200).send({
//         data: { ...data, videos },
//         message: "video uploaded successfully",
//       });
//     } else {
//       return res.status(400).send({ message: "Video path not recieved" });
//     }
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   } catch (e: any | ZodError) {
//     console.error("Error in uploadVideo:", e);
//     return catchBlock(e, res, "Video not uploaded");
//   }
// };