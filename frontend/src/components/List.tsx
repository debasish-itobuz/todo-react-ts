import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import Form from "./Form";

enum Status {
  todo = "ToDo",
  completed = "Completed",
}

export type TodoItem = {
  _id: string;
  title: string;
  status: Status;
  checked: boolean;
};

const List: React.FC = () => {
  const [error, setError] = useState("");
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editId, setEditId] = useState("");
  const [isCreate, setIsCreate] = useState(false);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string>("");
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, [isCreate]);

  async function fetchData() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:4001/todo/get", {
        headers: {
          Authorization: token,
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
    }
  }

  const handleEdit = (id: string, title: string) => {
    const task = todos.find((todo) => todo._id === id);
    if (task && task.status !== Status.completed) {
      setEditMode(!editMode);
      setEditId(id);
      setEditTitle(title);
    }
  };

  const handleUpdate = async (id: string, title: string, checked: boolean) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:4001/todo/update?id=${id}`,
        {
          title: title,
          status: checked ? Status.completed : Status.todo,
        },
        {
          headers: {
            Authorization: token,
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

  const handleConfirmDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://localhost:4001/todo/delete?id=${id}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.status === 200) {
        setDeleteConfirmationId("");
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmationId("");
  };

  const handleChange = async (id: string) => {
    const updatedTodos = todos.map((todo) =>
      todo._id === id ? { ...todo, checked: !todo.checked } : todo
    );
    setTodos(updatedTodos);

    const updatedTodo = updatedTodos.find((todo) => todo._id === id);
    if (updatedTodo) {
      await handleUpdate(id, updatedTodo.title, updatedTodo.checked);
    }
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "all") return true;
    else if (filter === "todos") return (todo.status === Status.todo);
    else if (filter === "completed") return (todo.status === Status.completed);
    else return true;
  });

  return (
    <div>
      <Form setErrors={setError} errors={error} setIsCreate={setIsCreate} />

      {todos.length === 0 ?(
        <p className="text-center text-gray-500">
          Empty list, add tasks..
        </p>
      ) :
      (
        <div className="flex justify-center gap-4 mb-4">
          <button className={`px-3 py-1 rounded ${
            filter === "all" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`} onClick={()=> setFilter("all")}>
            All
          </button>
          <button className={`px-3 py-1 rounded ${
            filter === "todos" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`} onClick={()=>setFilter('todos')}>
            ToDos
          </button>
          <button className={`px-3 py-1 rounded ${
            filter === "completed" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`} onClick={()=>setFilter("completed")}>
            Completed
          </button>
        </div>
      )}



      <div className="flex flex-col items-start mx-auto w-[25rem] relative">
        {filteredTodos.map((item) => (
          <div
            key={item._id}
            className="m-2 gap-2 p-2 border w-full rounded overflow-auto h-11 flex justify-between items-center"
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
                <input
                  type="text"
                  className=" border rounded p-1 w-56 "
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              ) : (
                <div
                  className={`${
                    item.status === Status.completed ? " line-through" : ""
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
                    item.status === Status.completed
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
              <p className="mb-2">Are you sure you want to delete this task?</p>
              <div className="flex justify-center gap-4">
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => handleConfirmDelete(deleteConfirmationId)}
                >
                  Confirm
                </button>
                <button
                  className="bg-gray-400 text-gray-800 px-3 py-1 rounded"
                  onClick={handleCancelDelete}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default List;
