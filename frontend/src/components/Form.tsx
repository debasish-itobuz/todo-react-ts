import axios from "axios";
import React, { useEffect, useState } from "react";
import Select from "react-select";

export type Video = {
  title: string;
  url: string;
  thumbnail: string;
};

export default function Form({
  setIsCreate,
  setErrors,
  errors,
}: {
  setIsCreate: React.Dispatch<React.SetStateAction<boolean>>;
  setErrors: React.Dispatch<React.SetStateAction<string>>;
  errors: string;
}) {
  const [todoText, setTodoText] = useState("");
  const [availableVideos, setAvailableVideos] = useState<Video[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<Video[]>([]);

  const userDetails = localStorage.getItem("userDetails");
  const userId = userDetails ? JSON.parse(userDetails).data._id : null;

  console.log("userId", userId);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setErrors("Authorization token is missing.");
          return;
        }

        const response = await axios.get(
          `http://localhost:4001/user/get-videos/?userId=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setAvailableVideos(response.data.videos || []);
        console.log("Response for video:", response.data);
      } catch (error) {
        console.error("Error fetching videos:", error);
        setErrors("Error fetching videos:" + error);
      }
    };
    fetchVideos();
  }, [setErrors]);

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

      const response = await axios.post(
        "http://localhost:4001/todo/create",
        {
          title: todoText,
          status: "ToDo",
          videos: selectedVideos,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsCreate(!!response.data);
      console.log("Response from server:", response.data);

      setTodoText("");
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

  const handleVideoSelection = (selectedOptions: any) => {
    const selected = selectedOptions.map((option: any) => ({
      title: option.label,
      url: option.value,
      thumbnail: option.thumbnail,
    }));
    setSelectedVideos(selected);
  };

  const videoOptions = availableVideos.map((video) => ({
    label: video.title,
    value: video.url,
    thumbnail: video.thumbnail,  // You can use this for future customization
  }));

  return (
    <form
      className="form mt-36 mb-2 flex flex-col items-center gap-3"
      onSubmit={handleSubmit}
    >
      <div className="flex gap-5">
        <label>
          <input
            type="text"
            name="todo"
            id="todo"
            placeholder="Write your next task"
            className="border p-2 rounded w-[21rem] focus:outline-none"
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
            className="w-[21rem]"
            placeholder="Choose videos..."
          />
        </div>
        <button
          onClick={() => setIsCreate(false)}
          type="submit"
          className="p-2 bg-green-600 rounded text-white ms-4"
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
