import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import Form from "./Form";
import { useToken } from "./UserContext";

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
  videos?: Video[]; // Include videos field
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

  const { token } = useToken(); // Get the token from context

  useEffect(() => {
    fetchData();
  }, [isCreate, token]); // Add token as a dependency

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

  const handleEdit = (id: string, title: string) => {
    const task = todos.find((todo) => todo._id === id);
    if (task && task.status !== Status.completed) {
      setEditMode(!editMode);
      setEditId(id);
      setEditTitle(title);
    }
  };

  const handleUpdate = async (id: string, title: string, checked: boolean, videos?: Video[]) => {
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
          videos: videos, // Include videos in the update request
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
        setDeleteConfirmationId("");
        fetchData();
      }
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
        handleUpdate(id, updatedTodo.title, updatedTodo.checked, updatedTodo.videos);
        return updatedTodo;
      }
      return todo;
    });
    setTodos(updatedTodos);
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "all") return true;
    else if (filter === "todos") return todo.status === Status.todo;
    else if (filter === "completed") return todo.status === Status.completed;
    else return true;
  });

  return (
    <div>
      <Form setErrors={setError} errors={error} setIsCreate={setIsCreate} />

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
              filter === "completed" ? "bg-blue-500 text-white" : "bg-gray-200"
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
            className="m-2 gap-2 p-2 border w-96 rounded overflow-auto flex flex-shrink-0 justify-between items-center"
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
                  className="border rounded p-1 w-56"
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
            <div className="flex flex-col gap-2 items-start">
              {item.videos && item.videos.map((video, index) => (
                <div key={index} className="flex items-center">
                  <img src={video.thumbnail} alt={video.title} className="w-12 h-12 mr-2" />
                  <a href={video.url} target="_blank" rel="noopener noreferrer">{video.title}</a>
                </div>
              ))}
            </div>
            <div className="flex gap-4 items-center w-28">
              {editMode && editId === item._id ? (
                <>
                  <button
                    className="text-gray-900 bg-green-300 p-1 rounded"
                    onClick={() =>
                      handleUpdate(item._id, editTitle, item.checked, item.videos)
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
                  className="bg-red-500 text-white p-2 rounded"
                  onClick={() => handleConfirmDelete(deleteConfirmationId)}
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
      {error && <p className="text-red-500 text-center mt-2">{error}</p>}
    </div>
  );
};

export default List;




// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { FaRegEdit } from "react-icons/fa";
// import { MdDeleteOutline } from "react-icons/md";
// import Form from "./Form";
// import { useToken } from "./UserContext";

// enum Status {
//   todo = "ToDo",
//   completed = "Completed",
// }

// export type Video = {
//   title: string;
//   url: string;
//   thumbnail: string;
// };

// export type TodoItem = {
//   _id: string;
//   title: string;
//   status: Status;
//   checked: boolean;
//   videos?: Video[];
// };

// const List: React.FC = () => {
//   const [error, setError] = useState("");
//   const [todos, setTodos] = useState<TodoItem[]>([]);
//   const [editMode, setEditMode] = useState(false);
//   const [editTitle, setEditTitle] = useState("");
//   const [editId, setEditId] = useState("");
//   const [isCreate, setIsCreate] = useState(false);
//   const [deleteConfirmationId, setDeleteConfirmationId] = useState<string>("");
//   const [filter, setFilter] = useState<string>("all");

//   const { token } = useToken(); // Get the token from context

//   useEffect(() => {
//     fetchData();
//   }, [isCreate, token]); // Add token as a dependency

//   async function fetchData() {
//     try {
//       if (!token) {
//         setError("Authorization token is missing.");
//         return;
//       }

//       const response = await axios.get("http://localhost:4001/todo/get", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (response && response.data && response.data.data) {
//         const initialTodos: TodoItem[] = response.data.data.map(
//           (item: any) => ({
//             ...item,
//             checked: item.status === Status.completed,
//           })
//         );
//         setTodos(initialTodos);
//       }
//     } catch (error) {
//       console.error("Error fetching todos:", error);
//       setError("Error fetching todos: " + error);
//     }
//   }

//   const handleEdit = (id: string, title: string) => {
//     const task = todos.find((todo) => todo._id === id);
//     if (task && task.status !== Status.completed) {
//       setEditMode(!editMode);
//       setEditId(id);
//       setEditTitle(title);
//     }
//   };

//   const handleUpdate = async (
//     id: string,
//     title: string,
//     checked: boolean,
//     videos?: Video[]
//   ) => {
//     try {
//       if (!token) {
//         setError("Authorization token is missing.");
//         return;
//       }

//       const response = await axios.put(
//         `http://localhost:4001/todo/update?id=${id}`,
//         {
//           title: title,
//           status: checked ? Status.completed : Status.todo,
//           videos: videos,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (response.status === 200) {
//         setEditMode(false);
//         setEditId("");
//         setEditTitle("");
//         fetchData();
//       }
//     } catch (error) {
//       console.error("Error updating todo:", error);
//       setError("Error updating todo: " + error);
//     }
//   };

//   const handleCancelEdit = () => {
//     setEditMode(false);
//     setEditId("");
//     setEditTitle("");
//   };

//   const handleDeleteClick = (id: string) => {
//     setDeleteConfirmationId(id);
//   };

//   const handleConfirmDelete = async (id: string) => {
//     try {
//       if (!token) {
//         setError("Authorization token is missing.");
//         return;
//       }

//       const response = await axios.delete(
//         `http://localhost:4001/todo/delete?id=${id}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (response.status === 200) {
//         setDeleteConfirmationId("");
//         fetchData();
//       }
//     } catch (error) {
//       console.error("Error deleting todo:", error);
//       setError("Error deleting todo: " + error);
//     }
//   };

//   const handleCancelDelete = () => {
//     setDeleteConfirmationId("");
//   };

//   const handleChange = async (id: string) => {
//     const updatedTodos = todos.map((todo) => {
//       if (todo._id === id) {
//         const updatedTodo = { ...todo, checked: !todo.checked };
//         handleUpdate(id, updatedTodo.title, updatedTodo.checked, updatedTodo.videos);
//         return updatedTodo;
//       }
//       return todo;
//     });
//     setTodos(updatedTodos);
//   };

//   const filteredTodos = todos.filter((todo) => {
//     if (filter === "all") return true;
//     else if (filter === "todos") return todo.status === Status.todo;
//     else if (filter === "completed") return todo.status === Status.completed;
//     else return true;
//   });

//   return (
//     <div>
//       <Form setErrors={setError} errors={error} setIsCreate={setIsCreate} />

//       {todos.length === 0 ? (
//         <p className="text-center text-gray-500">Empty list, add tasks..</p>
//       ) : (
//         <div className="flex justify-center gap-4 mb-4">
//           <button
//             className={`px-3 py-1 rounded ${
//               filter === "all" ? "bg-blue-500 text-white" : "bg-gray-200"
//             }`}
//             onClick={() => setFilter("all")}
//           >
//             All
//           </button>
//           <button
//             className={`px-3 py-1 rounded ${
//               filter === "todos" ? "bg-blue-500 text-white" : "bg-gray-200"
//             }`}
//             onClick={() => setFilter("todos")}
//           >
//             ToDos
//           </button>
//           <button
//             className={`px-3 py-1 rounded ${
//               filter === "completed" ? "bg-blue-500 text-white" : "bg-gray-200"
//             }`}
//             onClick={() => setFilter("completed")}
//           >
//             Completed
//           </button>
//         </div>
//       )}

//       <div className="flex flex-col items-start mx-auto w-[25rem] min-h-[5rem] max-h-[33rem] relative overflow-y-scroll">
//         {filteredTodos.map((item) => (
//           <div
//             key={item._id}
//             className="m-2 gap-2 p-2 border w-96 rounded overflow-auto flex flex-shrink-0  justify-between items-center"
//           >
//             <div className="flex gap-4 items-center w-80 overflow-scroll">
//               <input
//                 type="checkbox"
//                 checked={item.checked}
//                 onClick={() => setError("")}
//                 onChange={() => handleChange(item._id)}
//                 className="cursor-pointer"
//               />
//               {editMode && editId === item._id ? (
//                 <input
//                   type="text"
//                   className=" border rounded p-1 w-56 "
//                   value={editTitle}
//                   onChange={(e) => setEditTitle(e.target.value)}
//                 />
//               ) : (
//                 <div
//                   className={`${
//                     item.status === Status.completed ? " line-through" : ""
//                   }`}
//                 >
//                   {item.title}
//                 </div>
//               )}
//             </div>

//               <div className="flex flex-col gap-2 items-start">
//                 {item.videos && item.videos.map((video,index)=>(
//                   <div key={index} className="flex items-start" >
//                       <img src={video.thumbnail} alt={video.title} className="w-12 h-12 mr-2" />
//                       <a href={video.url} target="_blank" rel="noopener noreferrer">{video.title}</a>
//                   </div>
//                 ))}
//               </div>

//             <div className="flex gap-4 items-center w-28">
//               {editMode && editId === item._id ? (
//                 <>
//                   <button
//                     className="text-gray-900 bg-green-300 p-1 rounded"
//                     onClick={() =>
//                       handleUpdate(item._id, editTitle, item.checked, item.videos)
//                     }
//                     disabled={!editTitle.trim()}
//                   >
//                     Save
//                   </button>
//                   <button
//                     className="text-gray-900 bg-gray-300 p-1 rounded"
//                     onClick={handleCancelEdit}
//                   >
//                     Cancel
//                   </button>
//                 </>
//               ) : (
//                 <FaRegEdit
//                   className={`text-xl ms-2 ${
//                     item.status === Status.completed
//                       ? " cursor-not-allowed"
//                       : "cursor-pointer"
//                   }`}
//                   onClick={() => {
//                     handleEdit(item._id, item.title);
//                     setError("");
//                   }}
//                 />
//               )}

//               <MdDeleteOutline
//                 className="text-2xl cursor-pointer"
//                 onClick={() => {
//                   handleDeleteClick(item._id);
//                   setError("");
//                 }}
//               />
//             </div>
//           </div>
//         ))}
//         {deleteConfirmationId && (
//           <div className="absolute top-0 left-10 right-0 bottom-0 flex items-center ">
//             <div className="bg-gray-300 p-4 rounded shadow-lg">
//               <p className="mb-2">Are you sure you want to delete this task?</p>
//               <div className="flex justify-center gap-4">
//                 <button
//                   className="bg-red-500 text-white p-2 rounded"
//                   onClick={() => handleConfirmDelete(deleteConfirmationId)}
//                 >
//                   Yes
//                 </button>
//                 <button
//                   className="bg-gray-500 text-white p-2 rounded"
//                   onClick={handleCancelDelete}
//                 >
//                   No
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//       {error && <p className="text-red-500 text-center mt-2">{error}</p>}
//     </div>
//   );
// };

// export default List;
