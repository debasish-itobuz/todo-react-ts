import axios from "axios";
import React, { useEffect, useState } from "react";

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

  const handleVideoSelection = (video: Video) => {
    setSelectedVideos((prevSelected) =>
      prevSelected.find((item) => item.url === video.url)
        ? prevSelected.filter((item) => item.url !== video.url)
        : [...prevSelected, video]
    );
  };

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
          <div className="grid grid-cols-2 gap-4">
            {availableVideos.map((video) => (
              <div
                key={video.url}
                className={`cursor-pointer p-2 border rounded flex items-center gap-2
            ${
              selectedVideos.find((item) => item.url === video.url)
                ? "bg-blue-200"
                : ""
            }`}
                onClick={() => handleVideoSelection(video)}
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-12 h-12"
                />
                <span>{video.title}</span>
              </div>
            ))}
          </div>
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




// // import axios from "axios";
// // import React, { useState, useEffect } from "react";

// // export type Video = {
// //   title: string;
// //   url: string;
// //   thumbnail: string;
// // };

// // export default function Form({
// //   setIsCreate,
// //   setErrors,
// //   errors,
// // }: {
// //   setIsCreate: React.Dispatch<React.SetStateAction<boolean>>;
// //   setErrors: React.Dispatch<React.SetStateAction<string>>;
// //   errors: string;
// // }) {
// //   const [todoText, setTodoText] = useState("");
// //   const [availableVideos, setAvailableVideos] = useState<Video[]>([]); // List of available videos
// //   const [selectedVideos, setSelectedVideos] = useState<Video[]>([]); // Selected videos

// //   useEffect(() => {
// //     // Fetch the available videos for selection (this should be modified to your actual API endpoint)
// //     const fetchVideos = async () => {
// //       try {
// //         const token = localStorage.getItem("token");
// //         if (!token) {
// //           setErrors("Authorization token is missing.");
// //           return;
// //         }

// //         const response = await axios.get("http://localhost:4001/videos", {
// //           headers: {
// //             Authorization: `Bearer ${token}`,
// //           },
// //         });

// //         setAvailableVideos(response.data.videos || []);
// //       } catch (error) {
// //         console.error("Error fetching videos:", error);
// //         setErrors("Error fetching videos: " + error);
// //       }
// //     };

// //     fetchVideos();
// //   }, [setErrors]);

// //   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
// //     event.preventDefault();

// //     if (!todoText.trim()) {
// //       setErrors("Todo text cannot be empty");
// //       return;
// //     }

// //     try {
// //       const token = localStorage.getItem("token");

// //       if (!token) {
// //         setErrors("Authorization token is missing.");
// //         return;
// //       }

// //       const response = await axios.post(
// //         "http://localhost:4001/todo/create",
// //         {
// //           title: todoText,
// //           status: "ToDo",
// //           videos: selectedVideos, // Include selected videos
// //         },
// //         {
// //           headers: {
// //             Authorization: `Bearer ${token}`,
// //           },
// //         }
// //       );

// //       setIsCreate(!!response.data);
// //       console.log("Response from server:", response.data);

// //       setTodoText("");
// //       setSelectedVideos([]); // Clear selected videos
// //       setErrors("");
// //     } catch (error) {
// //       console.error("Error posting data:", error);
// //       setErrors("Error posting data: " + error);
// //     }
// //   };

// //   const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
// //     setTodoText(event.target.value);
// //     setErrors("");
// //   };

// //   const handleVideoSelection = (video: Video) => {
// //     setSelectedVideos((prevSelected) =>
// //       prevSelected.find((v) => v.url === video.url)
// //         ? prevSelected.filter((v) => v.url !== video.url) // Deselect if already selected
// //         : [...prevSelected, video] // Select if not already selected
// //     );
// //   };

// //   return (
// //     <form
// //       className="form mt-36 mb-2 flex flex-col items-center gap-3"
// //       onSubmit={handleSubmit}
// //     >
// //       <div>
// //         <label>
// //           <input
// //             type="text"
// //             name="todo"
// //             id="todo"
// //             placeholder="Write your next task"
// //             className="border p-2 rounded w-[21rem] focus:outline-none"
// //             value={todoText}
// //             onChange={handleChange}
// //           />
// //         </label>
// //         <button
// //           onClick={() => setIsCreate(false)}
// //           type="submit"
// //           className="p-2 bg-green-600 rounded text-white ms-4"
// //         >
// //           Add
// //         </button>
// //       </div>

// //       <div className="mt-4 w-full">
// //         <h3 className="text-lg font-semibold mb-2">Select Videos</h3>
// //         <div className="grid grid-cols-2 gap-4">
// //           {availableVideos.map((video) => (
// //             <div
// //               key={video.url}
// //               className={`cursor-pointer p-2 border rounded flex items-center gap-2 ${
// //                 selectedVideos.find((v) => v.url === video.url)
// //                   ? "bg-blue-200"
// //                   : ""
// //               }`}
// //               onClick={() => handleVideoSelection(video)}
// //             >
// //               <img src={video.thumbnail} alt={video.title} className="w-12 h-12" />
// //               <span>{video.title}</span>
// //             </div>
// //           ))}
// //         </div>
// //       </div>

// //       <div className="min-h-7">
// //         {errors && <p className="text-red-500 text-start">{errors}</p>}
// //       </div>
// //     </form>
// //   );
// // }

// import axios from "axios";
// import React, { useEffect, useState } from "react";

// export type Video = {
//   title: string;
//   url: string;
//   thumbnail: string;
// };

// export default function Form({
//   setIsCreate,
//   setErrors,
//   errors,
// }: {
//   setIsCreate: React.Dispatch<React.SetStateAction<boolean>>;
//   setErrors: React.Dispatch<React.SetStateAction<string>>;
//   errors: string;
// }) {
//   const [todoText, setTodoText] = useState("");
//   const [availableVideos, setAvailableVideos] = useState<Video[]>([]);
//   const [selectedVideos, setSelectedVideos] = useState<Video[]>([]);

//   const userDetails = localStorage.getItem("userDetails");
//   const userId = userDetails ? JSON.parse(userDetails).data._id : null;

//   console.log("userId", userId);

//   useEffect(() => {
//     const fetchVideos = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) {
//           setErrors("Authorization token is missing.");
//           return;
//         }

//         const response = await axios.get(
//           `http://localhost:4001/user/get-videos/?userId=${userId}`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         setAvailableVideos(response.data.videos || []);
//         console.log("Response for video:", response.data);
//       } catch (error) {
//         console.error("Error fetching videos:", error);
//         setErrors("Error fetching videos:" + error);
//       }
//     };
//     fetchVideos();
//   }, [setErrors]);

//   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();

//     if (!todoText.trim()) {
//       setErrors("Todo text cannot be empty");
//       return;
//     }

//     try {
//       const token = localStorage.getItem("token");

//       if (!token) {
//         setErrors("Authorization token is missing.");
//         return;
//       }

//       const response = await axios.post(
//         "http://localhost:4001/todo/create",
//         {
//           title: todoText,
//           status: "ToDo",
//           videos: selectedVideos,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       setIsCreate(!!response.data);
//       console.log("Response from server:", response.data);

//       setTodoText("");
//       setErrors("");
//     } catch (error) {
//       console.error("Error posting data:", error);
//       setErrors("Error posting data: " + error);
//     }
//   };

//   const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setTodoText(event.target.value);
//     setErrors("");
//   };

//   const handleVideoSelection = (video: Video) => {
//     setSelectedVideos((prevSelected) =>
//       prevSelected.find((item) => item.url === video.url)
//         ? prevSelected.filter((item) => item.url !== video.url)
//         : [...prevSelected, video]
//     );
//   };

//   return (
//     <form
//       className="form mt-36 mb-2 flex flex-col items-center gap-3"
//       onSubmit={handleSubmit}
//     >
//       <div className="flex gap-5">
//         <label>
//           <input
//             type="text"
//             name="todo"
//             id="todo"
//             placeholder="Write your next task"
//             className="border p-2 rounded w-[21rem] focus:outline-none"
//             value={todoText}
//             onChange={handleChange}
//           />
//         </label>
//         <div className="">
//           <h3 className="text-lg font-semibold mb-2">Select Videos</h3>
//           <div className="grid grid-cols-2 gap-4">
//             {availableVideos.map((video) => (
//               <div
//                 key={video.url}
//                 className={`cursor-pointer p-2 border rounded flex items-center gap-2
//             ${
//               selectedVideos.find((item) => item.url === video.url)
//                 ? "bg-blue-200"
//                 : ""
//             }`}
//                 onClick={() => handleVideoSelection(video)}
//               >
//                 <img
//                   src={video.thumbnail}
//                   alt={video.title}
//                   className="w-12 h-12"
//                 />
//                 <span>{video.title}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//         <button
//           onClick={() => setIsCreate(false)}
//           type="submit"
//           className="p-2 bg-green-600 rounded text-white ms-4"
//         >
//           Add
//         </button>
//       </div>

//       <div className="min-h-7">
//         {errors && <p className="text-red-500 text-start">{errors}</p>}
//       </div>
//     </form>
//   );
// }

// import axios from "axios";
// import React, { useEffect, useState } from "react";

// export type Video = {
//   title: string;
//   url: string;
//   thumbnail: string;
// };

// export default function Form({
//   setIsCreate,
//   setErrors,
//   errors,
// }: {
//   setIsCreate: React.Dispatch<React.SetStateAction<boolean>>;
//   setErrors: React.Dispatch<React.SetStateAction<string>>;
//   errors: string;
// }) {
//   const [todoText, setTodoText] = useState("");
//   const [availableVideos, setAvailableVideos] = useState<Video[]>([]);
//   const [selectedVideos, setSelectedVideos] = useState<Video[]>([]);

//   const userDetails = localStorage.getItem("userDetails");
//   const userId = userDetails ? JSON.parse(userDetails).data._id : null;

//   console.log("userId", userId);

//   useEffect(() => {
//     const fetchVideos = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) {
//           setErrors("Authorization token is missing.");
//           return;
//         }

//         const response = await axios.get(
//           `http://localhost:4001/user/get-videos/?userId=${userId}`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         setAvailableVideos(response.data.videos || []);
//         console.log("Response for video:", response.data);
//       } catch (error) {
//         console.error("Error fetching videos:", error);
//         setErrors("Error fetching videos:" + error);
//       }
//     };
//     fetchVideos();
//   }, [setErrors]);

//   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();

//     if (!todoText.trim()) {
//       setErrors("Todo text cannot be empty");
//       return;
//     }

//     try {
//       const token = localStorage.getItem("token");

//       if (!token) {
//         setErrors("Authorization token is missing.");
//         return;
//       }

//       const response = await axios.post(
//         "http://localhost:4001/todo/create",
//         {
//           title: todoText,
//           status: "ToDo",
//           videos: selectedVideos,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       setIsCreate(!!response.data);
//       console.log("Response from server:", response.data);

//       setTodoText("");
//       setSelectedVideos([]);
//       setErrors("");
//     } catch (error) {
//       console.error("Error posting data:", error);
//       setErrors("Error posting data: " + error);
//     }
//   };

//   const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setTodoText(event.target.value);
//     setErrors("");
//   };

//   const handleVideoSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
//     const selectedOptions = Array.from(event.target.selectedOptions);
//     const selectedVideos = selectedOptions.map((option) =>
//       availableVideos.find((video) => video.url === option.value)
//     );
//     setSelectedVideos(selectedVideos as Video[]);
//   };

//   return (
//     <form
//       className="form mt-36 mb-2 flex flex-col items-center gap-3"
//       onSubmit={handleSubmit}
//     >
//       <div className="flex gap-5">
//         <label>
//           <input
//             type="text"
//             name="todo"
//             id="todo"
//             placeholder="Write your next task"
//             className="border p-2 rounded w-[21rem] focus:outline-none"
//             value={todoText}
//             onChange={handleChange}
//           />
//         </label>

//         <div>
//           <h3 className="text-lg font-semibold mb-2">Select Videos</h3>
//           <select
//             multiple
//             value={selectedVideos.map((video) => video.url)}
//             onChange={handleVideoSelection}
//             className="border p-2 rounded w-full"
//           >
//             {availableVideos.map((video) => (
//               <option key={video.url} value={video.url}>
//                 {video.title}
//               </option>
//             ))}
//           </select>
//         </div>

//         <button
//           onClick={() => setIsCreate(false)}
//           type="submit"
//           className="p-2 bg-green-600 rounded text-white ms-4"
//         >
//           Add
//         </button>
//       </div>

//       <div className="min-h-7">
//         {errors && <p className="text-red-500 text-start">{errors}</p>}
//       </div>
//     </form>
//   );
// }


// import axios from "axios";
// import React, { useEffect, useState } from "react";

// export type Video = {
//   title: string;
//   url: string;
//   thumbnail: string;
// };

// export default function Form({
//   setIsCreate,
//   setErrors,
//   errors,
// }: {
//   setIsCreate: React.Dispatch<React.SetStateAction<boolean>>;
//   setErrors: React.Dispatch<React.SetStateAction<string>>;
//   errors: string;
// }) {
//   const [todoText, setTodoText] = useState("");
//   const [availableVideos, setAvailableVideos] = useState<Video[]>([]);
//   const [selectedVideos, setSelectedVideos] = useState<Video[]>([]);

//   const userDetails = localStorage.getItem("userDetails");
//   const userId = userDetails ? JSON.parse(userDetails).data._id : null;

//   useEffect(() => {
//     const fetchVideos = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) {
//           setErrors("Authorization token is missing.");
//           return;
//         }

//         const response = await axios.get(
//           `http://localhost:4001/user/get-videos/?userId=${userId}`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         setAvailableVideos(response.data.videos || []);
//       } catch (error) {
//         console.error("Error fetching videos:", error);
//         setErrors("Error fetching videos: " + error);
//       }
//     };
//     fetchVideos();
//   }, [setErrors, userId]);

//   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();

//     if (!todoText.trim()) {
//       setErrors("Todo text cannot be empty");
//       return;
//     }

//     try {
//       const token = localStorage.getItem("token");

//       if (!token) {
//         setErrors("Authorization token is missing.");
//         return;
//       }

//       const response = await axios.post(
//         "http://localhost:4001/todo/create",
//         {
//           title: todoText,
//           status: "ToDo",
//           videos: selectedVideos,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       setIsCreate(!!response.data);
//       setTodoText("");
//       setSelectedVideos([]);
//       setErrors("");
//     } catch (error) {
//       console.error("Error posting data:", error);
//       setErrors("Error posting data: " + error);
//     }
//   };

//   const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setTodoText(event.target.value);
//     setErrors("");
//   };

//   const handleVideoSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
//     const selectedOptions = Array.from(event.target.selectedOptions);
//     const selectedVideos = selectedOptions.map((option) =>
//       availableVideos.find((video) => video.url === option.value)
//     );
//     setSelectedVideos(selectedVideos as Video[]);
//   };

//   return (
//     <form
//       className="form mt-36 mb-2 flex flex-col items-center gap-3"
//       onSubmit={handleSubmit}
//     >
//       <div className="flex gap-5">
//         <label>
//           <input
//             type="text"
//             name="todo"
//             id="todo"
//             placeholder="Write your next task"
//             className="border p-2 rounded w-[21rem] focus:outline-none"
//             value={todoText}
//             onChange={handleChange}
//           />
//         </label>

//         <div>
//           <h3 className="text-lg font-semibold mb-2">Select Videos</h3>
//           <select
//             multiple
//             value={selectedVideos.map((video) => video.url)}
//             onChange={handleVideoSelection}
//             className="border p-2 rounded w-full"
//           >
//             {availableVideos.map((video) => (
//               <option key={video.url} value={video.url}>
//                 {video.title}
//               </option>
//             ))}
//           </select>
//         </div>

//         <button
//           onClick={() => setIsCreate(false)}
//           type="submit"
//           className="p-2 bg-green-600 rounded text-white ms-4"
//         >
//           Add
//         </button>
//       </div>

//       <div className="min-h-7">
//         {errors && <p className="text-red-500 text-start">{errors}</p>}
//       </div>
//     </form>
//   );
// }

