import { Request, Response } from "express";
import videoModel from "../models/videoModel";
import userModel from "../models/userModel";
import { catchBlock } from "../helper/commonCode";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs/promises";
import path from "path";

// Upload Video
const uploadVideo = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
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
      { $push: { videos: newVideo._id } },
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

// Delete Video
const deleteVideo = async (req: Request, res: Response) => {
  try {
    const videoId = req.query.videoId as string;

    if (!videoId) {
      return res.status(400).send({ message: "Video ID is required" });
    }

    const video = await videoModel.findById(videoId);
    if (!video) {
      return res.status(404).send({ message: "Video not found" });
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
    const userId = req.query.userId as string;

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

export { uploadVideo, deleteVideo, getUserVideos };
