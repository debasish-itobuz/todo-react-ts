import React, { useEffect, useState } from "react";
import VideoSelect from "./VideoSelect";
import axiosInstance from "../axiosConfig";

export type Video = {
  _id: string; // Include _id to represent the videoId
  title: string;
  url: string;
  thumbnail: string;
};

export default function Form({
  setIsCreate,
  setErrors,
  errors,
  videoList,
}: {
  setIsCreate: React.Dispatch<React.SetStateAction<boolean>>;
  setErrors: React.Dispatch<React.SetStateAction<string>>;
  errors: string;
  videoList: Video[];
}) {
  const [todoText, setTodoText] = useState("");
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]); // Store only video IDs
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const userDetails = localStorage.getItem("userDetails");
    if (userDetails) {
      const parsedDetails = JSON.parse(userDetails);
      setUserId(parsedDetails?.data?._id || null);
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!todoText.trim()) {
      setErrors("Todo text cannot be empty");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setErrors("Authorization token is missing.");
        return;
      }

      const response = await axiosInstance.post("/todo/create", {
        title: todoText,
        videoId: selectedVideoIds, // Send only the video IDs
      });

      setIsCreate(!!response.data);
      setTodoText("");
      setSelectedVideoIds([]); // Clear selected videos after submission
      setErrors("");
    } catch (error) {
      console.error("Error posting data:", error);
      setErrors("Error posting data: " + error);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTodoText(event.target.value);
    setErrors("");
  };

  // Handle video selection and store only video IDs
  const handleVideoSelect = (selectedOptions: any) => {
    const selected = selectedOptions.map((option: any) => ({
      _id: option.value, // Assuming the value is the _id of the video
      title: option.label,
      url: option.url,
      thumbnail: option.thumbnail,
    }));
    VideoSelect(selected);
  };

  return (
    <form
      className="form mt-36 mb-2 flex flex-col items-center gap-3"
      onSubmit={handleSubmit}
    >
      <div className="flex gap-5">
        <label>
          <h3 className="text-lg font-semibold mb-2">Task</h3>
          <input
            type="text"
            name="todo"
            id="todo"
            placeholder="Write your next task"
            className="border p-2 h-10 rounded w-[21rem] focus:outline-none"
            value={todoText}
            onChange={handleChange}
          />
        </label>
        <div className="">
          <h3 className="text-lg font-semibold mb-2">Select Videos</h3>
          <VideoSelect
            videoList={videoList}
            selectedVideos={videoList.filter((video) =>
              selectedVideoIds.includes(video._id)
            )}
            onVideoSelect={handleVideoSelect} // This function should return an array of Video objects, including the _id
          />
        </div>
        <button
          type="submit"
          className="p-2 h-10 w-16 mt-8 bg-green-600 rounded text-white ms-4"
        >
          Add
        </button>
      </div>

      <div className="min-h-7">
        {errors && <p className="text-red-500 text-start">{errors}</p>}
      </div>
    </form>
  );
}
