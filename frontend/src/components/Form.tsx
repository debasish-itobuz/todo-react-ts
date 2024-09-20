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
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch userId from localStorage after the component has mounted
    const userDetails = localStorage.getItem("userDetails");
    if (userDetails) {
      const parsedDetails = JSON.parse(userDetails);
      setUserId(parsedDetails?.data?._id || null);
    }
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setErrors("Authorization token is missing.");
          return;
        }

        if (userId) {
          const response = await axios.get(
            `http://localhost:4001/user/get-videos/?id=${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setAvailableVideos(response.data.videos || []);
        }
      } catch (error) {
        console.error("Error fetching videos:", error);
        setErrors("Error fetching videos: " + error);
      }
    };

    if (userId) {
      fetchVideos();
    }
  }, [userId, setErrors]);

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
          videos: selectedVideos,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsCreate(!!response.data);
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
    thumbnail: video.thumbnail,
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
            className="w-[21rem] "
            placeholder="Choose videos..."
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
