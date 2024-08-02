import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { GlobalContext } from "../components/UserContext";

const UserProfile: React.FC = () => {
  const [formData, setFormData] = useState({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    profilePicture: "",
  });
  const { userDetails, setUserDetails } = useContext(GlobalContext);
  const [formError, setFormError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const backendUrl = import.meta.env.VITE_APP_BACKEND_URL;

  const loadUserData = () => {
    if (userDetails) {
      const userData = userDetails;
      const profilePicture = userData.data.profilePicture
        ? userData.data.profilePicture.startsWith("http")
          ? userData.data.profilePicture
          : `${backendUrl}/${userData.data.profilePicture}`
        : "";

      setFormData({
        id: userData.data.id || userData.data._id || "",
        firstName: userData.data.firstName || "",
        lastName: userData.data.lastName || "",
        email: userData.data.email || "",
        password: userData.data.password || "",
        phone: userData.data.phone || "",
        profilePicture,
      });

      setPreviewUrl(profilePicture);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [userDetails]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      console.log("file", file.name);
      console.log("object", selectedFile);

      const fileReader = new FileReader();

      fileReader.onloadend = () => {
        if (fileReader.result) {
          setPreviewUrl(fileReader.result as string);
        }
      };

      fileReader.readAsDataURL(file);
    }
  };

  console.log(selectedFile);

  const handleProfilePictureUpload = async () => {
    if (selectedFile) {
      console.log("object1", selectedFile);
      const uploadFormData = new FormData();
      uploadFormData.append("profilePicture", selectedFile);

      try {
        setIsUploading(true);

        const response = await axios.post(
          `${backendUrl}/user/upload-profile?id=${formData.id}`,
          uploadFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const updatedProfilePicture = response.data.data.profilePicture;
        console.log("response", response.data.data.profilePicture);
        const updatedProfilePictureUrl = updatedProfilePicture.startsWith(
          "http"
        )
          ? updatedProfilePicture
          : `${backendUrl}/${updatedProfilePicture}`;

        setFormData((prevData) => ({
          ...prevData,
          profilePicture: updatedProfilePictureUrl,
        }));

        setUserDetails((prev) => {
          if (prev) {
            return {
              ...prev,
              data: {
                ...prev.data,
                profilePicture: updatedProfilePictureUrl,
              },
            };
          }
          return prev;
        });

        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        setFormError("Failed to upload profile picture. Please try again.");
        setTimeout(() => {
          setFormError("");
        }, 2000);
      } finally {
        setIsUploading(false);
      }
    } else {
      setFormError("No file selected. Please choose a file to upload.");
      setTimeout(() => {
        setFormError("");
      }, 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (selectedFile) {
        await handleProfilePictureUpload();
      } else {
        // Just update other user details if no new file is selected
        await axios.put(`${backendUrl}/user/update?id=${formData.id}`, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          profilePicture: formData.profilePicture,
        });
      }

      setUserDetails((prev) => {
        if (prev) {
          return {
            ...prev,
            data: {
              ...prev.data,
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone,
              profilePicture: formData.profilePicture,
            },
          };
        }
        return prev;
      });

      localStorage.setItem("userDetails", JSON.stringify(formData));

      setFormError("");
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);

      setIsEditMode(false);
    } catch (error) {
      console.error("Error updating user profile:", error);
      setFormError("Failed to update user profile. Please try again.");
      setTimeout(() => {
        setFormError("");
      }, 2000);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 bg-white p-6 rounded-md shadow-md relative">
      <Link to="/todolist">
        <svg
          fill="none"
          stroke="currentColor"
          className="w-6 h-6 ml-1 rotate-180 absolute end-5"
          viewBox="0 0 24 24"
        >
          <path d="M5 12h14M12 5l7 7-7 7"></path>
        </svg>
      </Link>
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Profile Form
      </h2>
      {formError && <p className="text-red-500 mb-4">{formError}</p>}
      {showSuccessMessage && (
        <p className="text-green-500 mb-4">Data updated successfully.</p>
      )}
      {isUploading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              readOnly={!isEditMode}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              readOnly={!isEditMode}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              readOnly
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              readOnly={!isEditMode}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Profile Picture
            </label>
            <div className="mt-1 flex items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                id="profilePicture"
                name="profilePicture"
                disabled={!isEditMode}
                className="hidden"
              />
              <label
                htmlFor="profilePicture"
                className="cursor-pointer inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100"
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile"
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100"></span>
                )}
              </label>
              {isEditMode && (
                <button
                  type="submit"
                  className="ml-4 inline-flex items-center px-4 py-2 bg-blue-500 text-white font-medium rounded-md shadow-sm hover:bg-blue-600"
                >
                  Save Profile
                </button>
              )}
            </div>
          </div>
          {!isEditMode && (
            <button
              type="button"
              onClick={() => setIsEditMode(true)}
              className="inline-flex justify-center items-center px-4 py-2 bg-gray-500 text-white font-medium rounded-md shadow-sm hover:bg-gray-600"
            >
              Edit Profile
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default UserProfile;

// import React, { useState, useEffect, useContext } from "react";
// import axios from "axios";
// import { Link } from "react-router-dom";
// import { GlobalContext } from "../components/UserContext";

// const UserProfile: React.FC = () => {
//   const [formData, setFormData] = useState({
//     id: "",
//     firstName: "",
//     lastName: "",
//     email: "",
//     password: "",
//     phone: "",
//     profilePicture: "",
//   });
//   const { userDetails, setUserDetails } = useContext(GlobalContext);
//   // console.log("userDetails", userDetails)
//   const [formError, setFormError] = useState("");
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [showSuccessMessage, setShowSuccessMessage] = useState(false);
//   const [isUploading, setIsUploading] = useState(false);

//   const backendUrl = import.meta.env.VITE_APP_BACKEND_URL;
//   // console.log("Backend URL:", backendUrl);

//   const loadUserData = () => {
//     if (userDetails) {
//       const userData = userDetails;
//       const profilePicture = userData.data.profilePicture
//         ? `${backendUrl}/${userData.data.profilePicture}`
//         : "";

//       // console.log("userDetails", userData.data.profilePicture);

//       setFormData({
//         id: userData.data.id || userData.data._id || "",
//         firstName: userData.data.firstName || "",
//         lastName: userData.data.lastName || "",
//         email: userData.data.email || "",
//         password: userData.data.password || "",
//         phone: userData.data.phone || "",
//         profilePicture,
//       });
//     }
//   };

//   useEffect(() => {
//     loadUserData();
//   }, [userDetails]);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prevFormData) => ({
//       ...prevFormData,
//       [name]: value,
//     }));
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       const file = e.target.files[0];
//       setSelectedFile(file);
//       console.log("file", file);
//       console.log("selectedfile", selectedFile);
//     }
//   };

//   const handleUpdateClick = () => {
//     setIsEditMode(true);
//   };

//   const handleProfilePictureUpload = async (e: { preventDefault: () => void; }) => {
//     e.preventDefault();
//     if (selectedFile) {
//       console.log("selectedfile1", selectedFile);
//       const uploadFormData = new FormData();
//       uploadFormData.append("profilePicture", selectedFile);

//       try {
//         setIsUploading(true);

//         const response = await axios.post(
//           `${backendUrl}/user/upload-profile?id=${formData.id}`,
//           uploadFormData,
//           {
//             headers: {
//               "Content-Type": "multipart/form-data",
//             },
//           }
//         );

//         const updatedProfilePicture = response.data.data.profilePicture;
//         console.log("DB", updatedProfilePicture, response.data.data, response);

//         setFormData((prevData) => ({
//           ...prevData,
//           profilePicture: updatedProfilePicture,
//         }));

//         // Update userDetails in GlobalContext
//         setUserDetails((prev) => {
//           if (prev) {
//             return {
//               ...prev,
//               data: {
//                 ...prev.data,
//                 profilePicture: updatedProfilePicture,
//               },
//             };
//           }
//           return prev;
//         });

//         setShowSuccessMessage(true);
//         setTimeout(() => {
//           setShowSuccessMessage(false);
//         }, 3000);
//       } catch (error) {
//         console.error("Error uploading profile picture:", error);
//         setFormError("Failed to upload profile picture. Please try again.");
//         setTimeout(() => {
//           setFormError("");
//         }, 2000);
//       } finally {
//         setIsUploading(false);
//       }
//     } else {
//       setFormError("No file selected. Please choose a file to upload.");
//       setTimeout(() => {
//         setFormError("");
//       }, 2000);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     try {
//       await axios.put(`${backendUrl}/user/update?id=${formData.id}`, {
//         firstName: formData.firstName,
//         lastName: formData.lastName,
//         email: formData.email,
//         password: formData.password,
//         phone: formData.phone,
//         profilePicture: formData.profilePicture,
//       });

//       // Update userDetails in GlobalContext
//       setUserDetails((prev) => {
//         if (prev) {
//           // console.log("prev", prev);
//           // console.log("prev1", prev.data.profilePicture);
//           return {
//             ...prev,
//             data: {
//               ...prev.data,
//               firstName: formData.firstName,
//               lastName: formData.lastName,
//               email: formData.email,
//               phone: formData.phone,
//               profilePicture: prev.data.profilePicture,
//             },
//           };
//         }
//         return prev;
//       });

//       // localStorage.setItem("userDetails", JSON.stringify(formData));

//       setFormError("");
//       setShowSuccessMessage(true);
//       setTimeout(() => {
//         setShowSuccessMessage(false);
//       }, 3000);

//       setIsEditMode(false);
//     } catch (error) {
//       console.error("Error updating user profile:", error);
//       setFormError("Failed to update user profile. Please try again.");
//       setTimeout(() => {
//         setFormError("");
//       }, 2000);
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto my-10 bg-white p-6 rounded-md shadow-md relative">
//       <Link to="/todolist">
//         <svg
//           fill="none"
//           stroke="currentColor"
//           className="w-6 h-6 ml-1 rotate-180 absolute end-5"
//           viewBox="0 0 24 24"
//         >
//           <path d="M5 12h14M12 5l7 7-7 7"></path>
//         </svg>
//       </Link>
//       <h2 className="text-2xl font-semibold mb-6 text-gray-800">
//         Profile Form
//       </h2>
//       {formError && <p className="text-red-500 mb-4">{formError}</p>}
//       {showSuccessMessage && (
//         <p className="text-green-500 mb-4">Data updated successfully.</p>
//       )}
//       {isUploading && (
//         <div className="fixed inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75">
//           <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
//         </div>
//       )}
//       <form onSubmit={handleSubmit}>
//         <div className="grid grid-cols-1 gap-y-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               First Name
//             </label>
//             <input
//               type="text"
//               id="firstName"
//               name="firstName"
//               value={formData.firstName}
//               onChange={handleInputChange}
//               readOnly={!isEditMode}
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Last Name
//             </label>
//             <input
//               type="text"
//               id="lastName"
//               name="lastName"
//               value={formData.lastName}
//               onChange={handleInputChange}
//               readOnly={!isEditMode}
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Email address
//             </label>
//             <input
//               type="email"
//               id="email"
//               name="email"
//               value={formData.email}
//               readOnly
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Phone Number
//             </label>
//             <input
//               type="tel"
//               id="phone"
//               name="phone"
//               value={formData.phone}
//               onChange={handleInputChange}
//               readOnly={!isEditMode}
//               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Profile Picture
//             </label>
//             <div className="mt-1 flex items-center">
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={handleFileChange}
//                 className="sr-only"
//                 id="profilePicture"
//                 name="profilePicture"
//                 disabled={!isEditMode}
//               />

//               <label
//                 htmlFor="profilePicture"
//                 className="cursor-pointer inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100"
//               >
//                 {formData.profilePicture ? (
//                   <img
//                     src={formData.profilePicture}
//                     alt="Profile"
//                     className="h-12 w-12 rounded-full object-cover"
//                   />
//                 ) : (
//                   <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100"></span>
//                 )}
//               </label>
//               {isEditMode && (
//                 <button
//                   type="button"
//                   onClick={handleProfilePictureUpload}
//                   className="ml-4 bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
//                 >
//                   Upload
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>

//         {!isEditMode && (
//           <div className="mt-6">
//             <button
//               type="button"
//               onClick={handleUpdateClick}
//               className="w-full bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600"
//             >
//               Update
//             </button>
//           </div>
//         )}
//         {isEditMode && (
//           <div className="mt-6">
//             <button
//               type="submit"
//               className="w-full bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600"
//             >
//               Save Profile
//             </button>
//           </div>
//         )}
//       </form>
//     </div>
//   );
// };

// export default UserProfile;
