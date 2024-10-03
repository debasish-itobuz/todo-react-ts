import React, { useEffect, useState } from "react";
import Select from "react-select";
import axiosInstance from "../axiosConfig";
import { Video } from "./List";
import { fetchData } from "../fetchdata";

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
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedVideos, setSelectedVideos] = useState<any[]>([]);

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
        videoId: selectedVideoIds,
      });

      setIsCreate(!!response.data);
      setTodoText("");
      setSelectedVideoIds([]); // Clear selected video IDs
      setSelectedVideos([]); // Clear selected videos in the Select component
      setErrors("");
      fetchData(token || "", () => setIsCreate(false), setErrors);
    } catch (error) {
      console.error("Error posting data:", error);
      setErrors("Error posting data: " + error);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTodoText(event.target.value);
    setErrors("");
  };

  const handleVideoSelection = (selectedOptions: any) => {
    const selectedIds = selectedOptions.map((option: any) => option.value); // Collect video IDs
    setSelectedVideoIds(selectedIds); // Update selectedVideoIds state
    setSelectedVideos(selectedOptions); // Update selected videos for the Select component
  };

  const videoOptions = videoList?.map((video: any) => ({
    label: video?.title,
    value: video?._id, // Use video ID as the value
  }));

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

          <Select
            isMulti
            options={videoOptions}
            onChange={handleVideoSelection}
            value={selectedVideos} // Control the value of the Select component
            placeholder="Choose videos..."
            className="w-[21rem]"
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
