import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import Form from "./Form";
import Select from "react-select";

enum Status {
  todo = "ToDo",
  completed = "Completed",
}

export type Video = {
  title: string;
  url: string;
  thumbnail: string;
};

export type TodoItem = {
  _id: string;
  title: string;
  status: Status;
  checked: boolean;
  videos?: Video[];
};

const List: React.FC = () => {
  const token = localStorage.getItem("token");
  const [error, setError] = useState("");
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editId, setEditId] = useState("");
  const [isCreate, setIsCreate] = useState(false);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string>("");
  const [filter, setFilter] = useState<string>("all");
  const [availableVideos, setAvailableVideos] = useState<Video[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<Video[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const userDetails = localStorage.getItem("userDetails");
    if (userDetails) {
      const parsedDetails = JSON.parse(userDetails);
      setUserId(parsedDetails?.data?._id || null);
    }
  }, []);

  async function fetchData() {
    try {
      if (!token) {
        setError("Authorization token is missing.");
        return;
      }

      const response = await axios.get("http://localhost:4001/todo/get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response && response.data && response.data.data) {
        const initialTodos: TodoItem[] = response.data.data.map(
          (item: any) => ({
            ...item,
            checked: item.status === Status.completed,
          })
        );
        setTodos(initialTodos);
      }
    } catch (error) {
      console.error("Error fetching todos:", error);
      setError("Error fetching todos: " + error);
    }
  }

  const fetchAvailableVideos = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4001/user/get-videos/?id=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAvailableVideos(response.data.videos || []);
    } catch (error) {
      setError("Error fetching videos: " + error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchData();
      fetchAvailableVideos();
    }
  }, [isCreate, token, userId]);

  const handleEdit = (id: string, title: string, videos?: Video[]) => {
    const task = todos.find((todo) => todo._id === id);
    if (task && task.status !== Status.completed) {
      setEditMode(!editMode);
      setEditId(id);
      setEditTitle(title);
      setSelectedVideos(videos || []);
    }
  };

  const handleUpdate = async (id: string, title: string, checked: boolean) => {
    try {
      if (!token) {
        setError("Authorization token is missing.");
        return;
      }

      const response = await axios.put(
        `http://localhost:4001/todo/update?id=${id}`,
        {
          title: title,
          status: checked ? Status.completed : Status.todo,
          videos: selectedVideos,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setEditMode(false);
        setEditId("");
        setEditTitle("");
        fetchData();
      }
    } catch (error) {
      console.error("Error updating todo:", error);
      setError("Error updating todo: " + error);
    }
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

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditId("");
    setEditTitle("");
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmationId(id);
  };

  const handleConfirmDelete = async (id: string) => {
    try {
      if (!token) {
        setError("Authorization token is missing.");
        return;
      }

      const response = await axios.delete(
        `http://localhost:4001/todo/delete?id=${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        fetchData();
        setDeleteConfirmationId("");
      }
    } catch (error) {
      console.error("Error deleting todo:", error);
      setError("Error deleting todo: " + error);
    }
  };

  return (
    <div className="todo-list">
      <Form setIsCreate={setIsCreate} errors={error} setErrors={setError} />
      <ul className="todos mt-4">
        {todos.map((item) => (
          <li key={item._id} className="todo-item mb-2 flex flex-col">
            {editMode && editId === item._id ? (
              <>
                <input
                  type="text"
                  className="border rounded p-1 w-56"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <Select
                  isMulti
                  options={videoOptions}
                  onChange={handleVideoSelection}
                  value={selectedVideos.map((video) => ({
                    label: video.title,
                    value: video.url,
                  }))}
                  className="w-[21rem]"
                  placeholder="Choose videos..."
                />
                <button
                  className="text-sm bg-green-500 text-white py-1 px-2 rounded mt-2"
                  onClick={() =>
                    handleUpdate(item._id, editTitle, item.checked)
                  }
                >
                  Update
                </button>
                <button
                  className="text-sm bg-gray-400 text-white py-1 px-2 rounded mt-2"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </>
            ) : (
              <div
                className={`${
                  item.status === Status.completed ? " line-through" : ""
                }`}
              >
                {item.title}
              </div>
            )}
            <div className="flex gap-2">
              {item.videos?.map((video, idx) => (
                <div key={idx} className="video-thumbnail">
                  <a href={video.url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-12 h-12"
                    />
                  </a>
                </div>
              ))}
            </div>
            <div className="todo-actions flex gap-2 mt-2">
              <FaRegEdit
                className="text-blue-500 cursor-pointer"
                onClick={() =>
                  handleEdit(item._id, item.title, item.videos || [])
                }
              />
              <MdDeleteOutline
                className="text-red-500 cursor-pointer"
                onClick={() => handleDeleteClick(item._id)}
              />
              {deleteConfirmationId === item._id && (
                <button
                  className="bg-red-600 text-white px-2 py-1 rounded"
                  onClick={() => handleConfirmDelete(item._id)}
                >
                  Confirm Delete
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className="error mt-2">{error && <p>{error}</p>}</div>
    </div>
  );
};

export default List;
