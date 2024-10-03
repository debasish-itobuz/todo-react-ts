import React, { useContext, useEffect, useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import Form from "./Form";
import { GlobalContext } from "./UserContext";
import axiosInstance from "../axiosConfig";
import { fetchData } from "../fetchdata";

export type Video = {
  _id: string;
  title: string;
  url: string;
  thumbnail: string;
};

export type TodoItem = {
  _id: string;
  title: string;
  checked: boolean;
  status: "ToDo" | "Completed";
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

  const { userDetails } = useContext(GlobalContext);

  const fetchAvailableVideos = async () => {
    try {
      const response = await axiosInstance.get(`/user/get-videos/`);
      const videos = response.data.videos.map((video: any) => ({
        _id: video._id,
        title: video.title,
        url: video.url,
        thumbnail: video.thumbnail,
      }));
      setAvailableVideos(videos || []);
    } catch (error) {
      setError("Error fetching videos: " + error);
    }
  };

  useEffect(() => {
    if (userDetails) {
      fetchData(token || "", setTodos, setError);
      fetchAvailableVideos();
    }
  }, [isCreate, token, userDetails]);

  const handleEdit = (id: string, title: string, videos?: Video[]) => {
    const task = todos.find((todo) => todo._id === id);
    if (task && task.status !== "Completed") {
      setEditMode(!editMode);
      setEditId(id);
      setEditTitle(title);
      setSelectedVideos(videos || []);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditId("");
    setEditTitle("");
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmationId(id);
  };

  const handleUpdate = async (id: string, title: string, checked: boolean) => {
    try {
      if (!token) {
        setError("Authorization token is missing.");
        return;
      }

      const status = checked ? "Completed" : "ToDo";

      await axiosInstance.put(`/todo/update/?id=${id}`, {
        title,
        status,
        videoId: selectedVideos,
      });

      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo._id === id ? { ...todo, title, status } : todo
        )
      );
      setEditMode(false);
      setError("");
      setEditId("");
      setEditTitle("");
      fetchData(token || "", setTodos, setError);
    } catch (error) {
      console.error("Error updating todo:", error);
      setError("Error updating todo: " + error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (!token) {
        setError("Authorization token is missing.");
        return;
      }

      await axiosInstance.delete(`/todo/delete/?id=${id}`);

      setTodos((prevTodos) => prevTodos.filter((todo) => todo._id !== id));
      setError("");
      setDeleteConfirmationId("");
      fetchData(token || "", setTodos, setError);
    } catch (error) {
      console.error("Error deleting todo:", error);
      setError("Error deleting todo: " + error);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmationId("");
  };

  const handleChange = async (id: string) => {
    const updatedTodos = todos.map((todo) => {
      if (todo._id === id) {
        const updatedTodo = { ...todo, checked: !todo.checked };
        handleUpdate(id, updatedTodo.title, updatedTodo.checked);
        return updatedTodo;
      }
      return todo;
    });
    setTodos(updatedTodos);
  };
  const filteredTodos = todos.filter((todo) => {
    if (filter === "all") return true;
    else if (filter === "todos") return todo.status === "ToDo";
    else if (filter === "completed") return todo.status === "Completed";
    else return true;
  });

  return (
    <div className="w-full min-h-screen bg-gray-100 py-6">
      <Form
        setIsCreate={setIsCreate}
        setErrors={setError}
        errors={error}
        videoList={availableVideos}
      />

      <div className="mt-6">
        {todos.length === 0 ? (
          <p className="text-center text-gray-500">Empty list, add tasks..</p>
        ) : (
          <div className="flex justify-center gap-4 mb-4">
            <button
              className={`px-3 py-1 rounded ${
                filter === "all" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              className={`px-3 py-1 rounded ${
                filter === "todos" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
              onClick={() => setFilter("todos")}
            >
              ToDos
            </button>
            <button
              className={`px-3 py-1 rounded ${
                filter === "completed"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
              onClick={() => setFilter("completed")}
            >
              Completed
            </button>
          </div>
        )}
        <div className="flex flex-col items-start mx-auto w-[25rem] min-h-[5rem] max-h-[33rem] relative overflow-y-scroll">
          {filteredTodos.map((item) => (
            <div
              key={item._id}
              className="m-2 gap-2 p-2 border w-96 rounded overflow-auto flex flex-shrink-0  justify-between items-center"
            >
              <div className="flex gap-4 items-center w-80 overflow-scroll">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onClick={() => setError("")}
                  onChange={() => handleChange(item._id)}
                  className="cursor-pointer"
                />
                {editMode && editId === item._id ? (
                  <div>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="border p-2 h-10 rounded focus:outline-none"
                    />
                  </div>
                ) : (
                  <div
                    className={`${
                      item.status === "Completed" ? " line-through" : ""
                    }`}
                  >
                    {item.title}
                  </div>
                )}
              </div>
              <div className="flex gap-4 items-center w-28">
                {editMode && editId === item._id ? (
                  <>
                    <button
                      className="text-gray-900 bg-green-300 p-1 rounded"
                      onClick={() =>
                        handleUpdate(item._id, editTitle, item.checked)
                      }
                      disabled={!editTitle.trim()}
                    >
                      Save
                    </button>
                    <button
                      className="text-gray-900 bg-gray-300 p-1 rounded"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <FaRegEdit
                    className={`text-xl ms-2 ${
                      item.status === "Completed"
                        ? " cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                    onClick={() => {
                      handleEdit(item._id, item.title);
                      setError("");
                    }}
                  />
                )}

                <MdDeleteOutline
                  className="text-2xl cursor-pointer"
                  onClick={() => {
                    handleDeleteClick(item._id);
                    setError("");
                  }}
                />
              </div>
            </div>
          ))}
          {deleteConfirmationId && (
            <div className="absolute top-0 left-10 right-0 bottom-0 flex items-center ">
              <div className="bg-gray-300 p-4 rounded shadow-lg">
                <p className="mb-2">
                  Are you sure you want to delete this task?
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    className="bg-red-500 text-white p-2 rounded"
                    onClick={() => handleDelete(deleteConfirmationId)}
                  >
                    Yes
                  </button>
                  <button
                    className="bg-gray-500 text-white p-2 rounded"
                    onClick={handleCancelDelete}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default List;