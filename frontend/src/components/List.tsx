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
  checked:boolean;
};

const List: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editId, setEditId] = useState("");
  const [isCreate, setIsCreate] = useState(false);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string>("");

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
        // Initialize todos with checked property based on status
        const initialTodos: TodoItem[] = response.data.data.map((item: any) => ({
          ...item,
          checked: item.status === Status.completed, // Initialize checked based on status
        }));
        setTodos(initialTodos);
      }
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  }

  const handleEdit = (id: string, title: string) => {
    setEditMode(true);
    setEditId(id);
    setEditTitle(title);
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

    const updatedTodo = updatedTodos.find(todo => todo._id === id);
    if (updatedTodo) {
      await handleUpdate(id, updatedTodo.title, updatedTodo.checked);
    }
  };

  return (
    <div>
      <Form setIsCreate={setIsCreate} />
      <div className="flex flex-col items-start mx-auto w-[25rem] relative">
        {todos.map((item) => (
          <div
            key={item._id}
            className="m-2 gap-2 p-2 border w-full rounded overflow-auto h-11 flex justify-between items-center"
          >
            <div className="flex gap-4 items-center">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => handleChange(item._id)}
                className=""
              />
              {editMode && editId === item._id ? (
                <input
                  type="text"
                  className="w-full border rounded p-1"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              ) : (
                <div>{item.title}</div>
              )}
            </div>
            <div className="flex gap-4 items-center">
              {editMode && editId === item._id ? (
                <>
                  <button
                    className="text-gray-900"
                    onClick={() => handleUpdate(item._id, editTitle, item.checked)}
                    disabled={!editTitle.trim()}
                  >
                    Save
                  </button>
                  <button className="text-gray-900" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                </>
              ) : (
                <FaRegEdit
                  className="text-xl cursor-pointer"
                  onClick={() => handleEdit(item._id, item.title)}
                />
              )}
              <MdDeleteOutline
                className="text-2xl cursor-pointer"
                onClick={() => handleDeleteClick(item._id)}
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


