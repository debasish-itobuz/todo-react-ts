import axios from "axios";
import React, { useState } from "react";
export default function Form({
  setIsCreate,
}: {
  setIsCreate: React.Dispatch<React.SetStateAction<boolean>>;
  
}) {
  const [todoText, setTodoText] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    if (!todoText.trim()) {
      setError("Todo text cannot be empty");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:4001/todo/create",
        {
          title: todoText,
          status: "ToDo",
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );
      setIsCreate(!!response.data); //sets bollean
      console.log("Response from server:", response.data);

      setTodoText("");
      setError("");
    } catch (error) {
      console.error("Error posting data:", error);
    }
  };

  const handleChange = (event: any) => {
    setTodoText(event.target.value);
    setError("");
  };

  return (
    <form
      className="form mt-36 mb-2 flex flex-col items-center gap-3"
      onSubmit={handleSubmit}
    >
      <div className="">
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
        <button
          onClick={() => setIsCreate(false)}
          type="submit"
          className="p-2 bg-green-600 rounded text-white ms-4"
        >
          Add
        </button>
      </div>
      <div className="min-h-7">
        {error && <p className="text-red-500 text-start">{error}</p>}
      </div>
    </form>
  );
}
