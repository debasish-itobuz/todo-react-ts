import { Request, Response } from "express";
import videoModel from "../models/videoModel";
import userModel from "../models/userModel";
import { catchBlock } from "../helper/commonCode";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs/promises";
import fsRegular from "fs";
import path from "path";
import { CustomRequest } from "../middlewares/tokenVerify";

// Upload Video
const uploadVideo = async (req: Request, res: Response) => {
  try {
    const userId = (req as CustomRequest).userId;

    const video = req.file;

    if (!video) {
      return res.status(400).send({ message: "Video not received" });
    }

    if (!userId) {
      return res.status(400).send({ message: "User ID is required" });
    }

    const thumbnailPath = path.join(
      "thumbnail",
      `${path.parse(video.filename).name}.png`
    );

    await new Promise<void>((resolve, reject) => {
      ffmpeg(video.path)
        .on("end", () => resolve())
        .on("error", (err) => reject(err))
        .screenshots({
          timestamps: ["50%"], // Capture a frame at 50% of the video duration
          filename: path.basename(thumbnailPath),
          folder: path.dirname(thumbnailPath),
        });
    });

    const newVideo = await videoModel.create({
      userId,
      title: video.filename,
      url: video.path,
      thumbnail: thumbnailPath,
    });

    await userModel.findByIdAndUpdate(
      userId,
      { $push: { videos: newVideo.id } },
      { new: true }
    );

    return res.status(200).send({
      data: newVideo,
      message: "Video uploaded successfully",
    });
  } catch (error) {
    console.error("Error in uploadVideo:", error);
    return catchBlock(error, res, "Video not uploaded");
  }
};

const deleteVideo = async (req: Request, res: Response) => {
  try {
    const userId = (req as CustomRequest).userId;
    const videoId = req.query.videoId as string;

    if (!videoId) {
      return res.status(400).send({ message: "Video ID is required" });
    }

    if (!userId) {
      return res.status(400).send({ message: "User ID is required" });
    }

    const video = await videoModel.findById(videoId);

    if (!video) {
      return res.status(404).send({ message: "Video not found" });
    }

    // Ensure the video belongs to the user making the request
    if (video.userId.toString() !== userId) {
      return res
        .status(403)
        .send({ message: "Unauthorized to delete this video" });
    }

    // Remove video file
    await fs.unlink(video.url);
    if (video.thumbnail) {
      await fs.unlink(video.thumbnail);
    }

    await videoModel.findByIdAndDelete(videoId);
    await userModel.updateOne(
      { _id: video.userId },
      { $pull: { videos: videoId } }
    );

    return res.status(200).send({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Error in deleteVideo:", error);
    return catchBlock(error, res, "Video not deleted");
  }
};

// Get Videos by User ID
const getUserVideos = async (req: Request, res: Response) => {
  try {
    const userId = (req as CustomRequest).userId;

    if (!userId) {
      return res.status(400).send({ message: "User ID is required" });
    }

    const videos = await videoModel.find({ userId });
    return res.status(200).send({
      videos,
      message: "Videos retrieved successfully",
    });
  } catch (error) {
    console.error("Error in getUserVideos:", error);
    return catchBlock(error, res, "Failed to retrieve videos");
  }
};

// Download Video
// const downloadVideo = async (req: Request, res: Response) => {
//   try {
//     const videoId = req.query.videoId as string;

//     if (!videoId) {
//       return res.status(400).send({ message: "Video ID is required" });
//     }

//     const video = await videoModel.findById(videoId);

//     if (!video) {
//       return res.status(404).send({ message: "Video not found" });
//     }

//     const filePath = video.url; // Path to the video file

//     res.setHeader("Content-Disposition", `attachment; filename=${video.title}`);
//     res.setHeader("Content-Type", "video/mp4"); // Set appropriate content type for videos
//     const stream = await fs.readFile(filePath); // Read the file as a stream

//     res.send(stream); // Send the video file for download
//   } catch (error) {
//     console.error("Error in downloadVideo:", error);
//     return catchBlock(error, res, "Failed to download video");
//   }
// };

const downloadVideo = async (req: Request, res: Response) => {
  try {
    const videoId = req.query.videoId as string;

    if (!videoId) {
      return res.status(400).send({ message: "Video ID is required" });
    }

    const video = await videoModel.findById(videoId);

    if (!video) {
      return res.status(404).send({ message: "Video not found" });
    }

    const filePath = video.url;

    // Use fs.promises.access for checking if the file exists asynchronously
    await fs.access(filePath);

    // Set headers for file download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${path.basename(video.title)}"`
    );
    res.setHeader("Content-Type", "video/mp4"); // Set appropriate content type for videos

    // Stream the video file using createReadStream from the regular fs module
    const videoStream = fsRegular.createReadStream(filePath);

    videoStream.pipe(res);

    videoStream.on("error", (err) => {
      console.error("Error streaming video:", err);
      return res.status(500).send({ message: "Error streaming video" });
    });
  } catch (error) {
    console.error("Error in downloadVideo:", error);
    return catchBlock(error, res, "Failed to download video");
  }
};

export { uploadVideo, deleteVideo, getUserVideos, downloadVideo };
