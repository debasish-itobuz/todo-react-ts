import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { GlobalContext } from "../components/UserContext";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const userProfileSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().optional(),
  phone: z.string().optional(),
  academics: z
    .array(
      z.object({
        title: z.string().min(1, "Title is required").optional(),
        year: z
          .number()
          .min(1980, { message: "Year must be valid" })
          .optional(),
      })
    )
    .optional(),
  profilePicture: z.string().optional(),
});

type UserProfileFormData = z.infer<typeof userProfileSchema>;

const UserProfile: React.FC = () => {
  const { userDetails, setUserDetails } = useContext(GlobalContext);
  const [formError, setFormError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const backendUrl = import.meta.env.VITE_APP_BACKEND_URL;

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    watch,
  } = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "academics",
  });

  const loadUserData = () => {
    if (userDetails) {
      const userData = userDetails.data;

      const profilePicture = userData.profilePicture
        ? `${
            userData.profilePicture.startsWith(backendUrl)
              ? userData.profilePicture
              : `${backendUrl}/${userData.profilePicture}`
          }`
        : "";

      setValue("id", userData.id || userData._id || "");
      setValue("firstName", userData.firstName || "");
      setValue("lastName", userData.lastName || "");
      setValue("email", userData.email || "");
      setValue("password", userData.password || "");
      setValue("phone", String(userData.phone || ""));
      setValue(
        "academics",
        Array.isArray(userData.academics) ? userData.academics : []
      );
      setValue("profilePicture", profilePicture);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [userDetails]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);

      try {
        setIsUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append("profilePicture", file);

        const response = await axios.post(
          `${backendUrl}/user/upload-profile?id=${userDetails?.data._id}`,
          uploadFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const updatedProfilePicture = response.data.data.profilePicture;
        setValue("profilePicture", updatedProfilePicture);

        setUserDetails((prev) => {
          if (prev) {
            return {
              ...prev,
              data: {
                ...prev.data,
                profilePicture: updatedProfilePicture,
              },
            };
          }
          return prev;
        });

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

  const handleUpdateClick = () => {
    setIsEditMode(true);
  };

  const onSubmit: SubmitHandler<UserProfileFormData> = async (data) => {
    try {
      await axios.put(`${backendUrl}/user/update?id=${data.id}`, data);

      setUserDetails((prev: any) => {
        if (prev) {
          return {
            ...prev,
            data: {
              ...prev.data,
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              email: data.email,
              phone: data.phone || "",
              academics: data.academics || [],
              profilePicture: prev.data.profilePicture,
            },
          };
        }
        return prev;
      });

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

  const profilePicture = watch("profilePicture");

  const handleAddAcademic = () => {
    append({ title: "", year: undefined });
  };

  return (
    <div className="max-w-md mx-auto my-10 bg-white p-4 rounded-md shadow-md relative">
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
      <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex gap-3">
        <div>
          <div className="grid grid-cols-1 gap-y-6 w-[26rem]">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                {...register("firstName")}
                readOnly={!isEditMode}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.firstName ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                {...register("lastName")}
                readOnly={!isEditMode}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.lastName ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.lastName.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                type="email"
                id="email"
                {...register("email")}
                readOnly
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                {...register("phone")}
                readOnly={!isEditMode}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Academics
              </label>
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 mb-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      {...register(`academics.${index}.title` as const)}
                      placeholder="Title"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.academics?.[index]?.title
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      readOnly={!isEditMode}
                    />
                    <p className="text-red-500 text-xs mt-1 h-1">
                      {errors.academics?.[index]?.title?.message}
                    </p>
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      {...register(`academics.${index}.year` as const, {
                        valueAsNumber: true,
                      })}
                      placeholder="Year"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.academics?.[index]?.year
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      readOnly={!isEditMode}
                    />
                    <p className="text-red-500 text-xs mt-1 h-1">
                      {errors.academics?.[index]?.year?.message}
                    </p>
                  </div>
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="bg-red-500 text-white px-2 m-1 rounded-md"
                    >
                      -
                    </button>
                  )}
                </div>
              ))}
              {isEditMode && (
                <button
                  type="button"
                  onClick={handleAddAcademic}
                  className="bg-blue-500 text-white px-4 py-2 mt-2 rounded-md"
                >
                  Add Academic
                </button>
              )}
            </div>
          </div>
        </div>

        <div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Profile Picture(Click over the circle to upload image)
            </label>
            <div className="mt-1 flex items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="sr-only"
                id="profilePicture"
                disabled={!isEditMode}
              />
              <label
                htmlFor="profilePicture"
                className="cursor-pointer inline-block h-20 w-20 rounded-full overflow-hidden bg-gray-100"
              >
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <span className="inline-block h-20 w-20 rounded-full overflow-hidden bg-gray-100"></span>
                )}
              </label>
            </div>
          </div>

          <div>
            upload videos
          </div>
        </div>
        </div>

{!isEditMode && (
  <div className="mt-6">
    <button
      type="button"
      onClick={handleUpdateClick}
      className="w-full bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600"
    >
      Update
    </button>
  </div>
)}
{isEditMode && (
  <div className="mt-6">
    <button
      type="submit"
      className="w-full bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600"
    >
      Save Profile
    </button>
  </div>
)}
      </form>
    </div>
  );
};

export default UserProfile;






// import React, { useState, useEffect, useContext } from "react";
// import axios from "axios";
// import { Link } from "react-router-dom";
// import { GlobalContext } from "../components/UserContext";
// import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";

// const userProfileSchema = z.object({
//   id: z.string().optional(),
//   firstName: z.string().optional(),
//   lastName: z.string().optional(),
//   email: z.string().email("Invalid email address"),
//   password: z.string().optional(),
//   phone: z.string().optional(),
//   academics: z
//     .array(
//       z.object({
//         title: z.string().min(1, "Title is required").optional(),
//         year: z
//           .number()
//           .min(1980, { message: "Year must be valid" })
//           .optional(),
//       })
//     )
//     .optional(),
//   profilePicture: z.string().optional(),
//   videos: z.array(z.string()).optional(),
// });

// type UserProfileFormData = z.infer<typeof userProfileSchema>;

// const UserProfile: React.FC = () => {
//   const { userDetails, setUserDetails } = useContext(GlobalContext);
//   const [formError, setFormError] = useState("");
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [showSuccessMessage, setShowSuccessMessage] = useState(false);
//   const [isUploading, setIsUploading] = useState(false);
//   const [videos, setVideos] = useState<string[]>([]);

//   const backendUrl = import.meta.env.VITE_APP_BACKEND_URL;

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     control,
//     formState: { errors },
//     watch,
//   } = useForm<UserProfileFormData>({
//     resolver: zodResolver(userProfileSchema),
//   });

//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "academics",
//   });

//   const loadUserData = () => {
//     if (userDetails) {
//       const userData = userDetails.data;

//       const profilePicture = userData.profilePicture
//         ? `${
//             userData.profilePicture.startsWith(backendUrl)
//               ? userData.profilePicture
//               : `${backendUrl}/${userData.profilePicture}`
//           }`
//         : "";

//       setValue("id", userData.id || userData._id || "");
//       setValue("firstName", userData.firstName || "");
//       setValue("lastName", userData.lastName || "");
//       setValue("email", userData.email || "");
//       setValue("password", userData.password || "");
//       setValue("phone", String(userData.phone || ""));
//       setValue(
//         "academics",
//         Array.isArray(userData.academics) ? userData.academics : []
//       );
//       setValue("profilePicture", profilePicture);
//       setValue("videos", Array.isArray(userData.videos) ? userData.videos : []);
//     }
//   };

//   useEffect(() => {
//     loadUserData();
//   }, [userDetails]);

//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       const file = e.target.files[0];
//       setSelectedFile(file);

//       try {
//         setIsUploading(true);
//         const uploadFormData = new FormData();
//         uploadFormData.append("profilePicture", file);

//         const response = await axios.post(
//           `${backendUrl}/user/upload-profile?id=${userDetails?.data._id}`,
//           uploadFormData,
//           {
//             headers: {
//               "Content-Type": "multipart/form-data",
//             },
//           }
//         );

//         const updatedProfilePicture = response.data.data.profilePicture;
//         setValue("profilePicture", updatedProfilePicture);

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

//   const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       const uploadPromises = Array.from(e.target.files).map(async (file) => {
//         const formData = new FormData();
//         formData.append("videos", file);

//         try {
//           const response = await axios.post(
//             `${backendUrl}/user/upload-video?id=${userDetails?.data._id}`,
//             formData,
//             {
//               headers: {
//                 "Content-Type": "multipart/form-data",
//               },
//             }
//           );

//           return response.data.data.videoUrl; // Assuming the response includes the video URL
//         } catch (error) {
//           console.error("Error uploading video:", error);
//           throw error; // Re-throw error to handle it in the Promise.all catch
//         }
//       });

//       try {
//         const newVideos = await Promise.all(uploadPromises);
//         setUserDetails((prev: any) => {
//           if (prev) {
//             return {
//               ...prev,
//               data: {
//                 ...prev.data,
//                 videos: [...(prev.data.videos || []), ...newVideos],
//               },
//             };
//           }
//           return prev;
//         });

//         setValue("videos", [...(watch("videos") || []), ...newVideos]);

//         setFormError("");
//       } catch (error) {
//         setFormError("Failed to upload one or more videos. Please try again.");
//         console.error("Failed to upload videos:", error);
//         setTimeout(() => {
//           setFormError("");
//         }, 2000);
//       }
//     } else {
//       setFormError(
//         "No video selected. Please choose one or more videos to upload."
//       );
//       setTimeout(() => {
//         setFormError("");
//       }, 2000);
//     }
//   };

//   const handleUpdateClick = () => {
//     setIsEditMode(true);
//   };

//   const onSubmit: SubmitHandler<UserProfileFormData> = async (data) => {
//     try {
//       await axios.put(`${backendUrl}/user/update?id=${data.id}`, data);

//       setUserDetails((prev: any) => {
//         if (prev) {
//           return {
//             ...prev,
//             data: {
//               ...prev.data,
//               firstName: data.firstName || "",
//               lastName: data.lastName || "",
//               email: data.email,
//               phone: data.phone || "",
//               academics: data.academics || [],
//               profilePicture: prev.data.profilePicture,
//               videos: data.videos || [],
//             },
//           };
//         }
//         return prev;
//       });

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

//   const profilePicture = watch("profilePicture");

//   const handleAddAcademic = () => {
//     append({ title: "", year: undefined });
//   };

//   return (
//     <div className="max-w-4xl mx-auto my-10 bg-white p-8 rounded-md shadow-md relative">
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
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
//           <div>
//             <div className="grid grid-cols-1 gap-y-6 w-[26rem]">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   First Name
//                 </label>
//                 <input
//                   type="text"
//                   id="firstName"
//                   {...register("firstName")}
//                   readOnly={!isEditMode}
//                   className={`mt-1 block w-full px-3 py-2 border ${
//                     errors.firstName ? "border-red-500" : "border-gray-300"
//                   } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
//                 />
//                 {errors.firstName && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.firstName.message}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Last Name
//                 </label>
//                 <input
//                   type="text"
//                   id="lastName"
//                   {...register("lastName")}
//                   readOnly={!isEditMode}
//                   className={`mt-1 block w-full px-3 py-2 border ${
//                     errors.lastName ? "border-red-500" : "border-gray-300"
//                   } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
//                 />
//                 {errors.lastName && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.lastName.message}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Email address
//                 </label>
//                 <input
//                   type="email"
//                   id="email"
//                   {...register("email")}
//                   readOnly
//                   className={`mt-1 block w-full px-3 py-2 border ${
//                     errors.email ? "border-red-500" : "border-gray-300"
//                   } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
//                 />
//                 {errors.email && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.email.message}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Phone Number
//                 </label>
//                 <input
//                   type="tel"
//                   id="phone"
//                   {...register("phone")}
//                   readOnly={!isEditMode}
//                   className={`mt-1 block w-full px-3 py-2 border ${
//                     errors.phone ? "border-red-500" : "border-gray-300"
//                   } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
//                 />
//                 {errors.phone && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.phone.message}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Academics
//                 </label>
//                 {fields.map((field, index) => (
//                   <div key={field.id} className="flex gap-2 mb-2">
//                     <div className="flex-1">
//                       <input
//                         type="text"
//                         {...register(`academics.${index}.title` as const)}
//                         placeholder="Title"
//                         className={`mt-1 block w-full px-3 py-2 border ${
//                           errors.academics?.[index]?.title
//                             ? "border-red-500"
//                             : "border-gray-300"
//                         } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
//                         readOnly={!isEditMode}
//                       />
//                       <p className="text-red-500 text-xs mt-1 h-1">
//                         {errors.academics?.[index]?.title?.message}
//                       </p>
//                     </div>
//                     <div className="flex-1">
//                       <input
//                         type="number"
//                         {...register(`academics.${index}.year` as const, {
//                           valueAsNumber: true,
//                         })}
//                         placeholder="Year"
//                         className={`mt-1 block w-full px-3 py-2 border ${
//                           errors.academics?.[index]?.year
//                             ? "border-red-500"
//                             : "border-gray-300"
//                         } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
//                         readOnly={!isEditMode}
//                       />
//                       <p className="text-red-500 text-xs mt-1 h-1">
//                         {errors.academics?.[index]?.year?.message}
//                       </p>
//                     </div>
//                     {isEditMode && (
//                       <button
//                         type="button"
//                         onClick={() => remove(index)}
//                         className="bg-red-500 text-white px-2 m-1 rounded-md"
//                       >
//                         -
//                       </button>
//                     )}
//                   </div>
//                 ))}
//                 {isEditMode && (
//                   <button
//                     type="button"
//                     onClick={handleAddAcademic}
//                     className="bg-blue-500 text-white px-4 py-2 mt-2 rounded-md"
//                   >
//                     Add Academic
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div>
//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-700">
//                 Profile Picture(Click over the circle to upload image)
//               </label>
//               <div className="mt-1 flex items-center">
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleFileChange}
//                   className="sr-only"
//                   id="profilePicture"
//                   disabled={!isEditMode}
//                 />
//                 <label
//                   htmlFor="profilePicture"
//                   className="cursor-pointer inline-block h-20 w-20 rounded-full overflow-hidden bg-gray-100"
//                 >
//                   {profilePicture ? (
//                     <img
//                       src={profilePicture}
//                       alt="Profile"
//                       className="h-20 w-20 rounded-full object-cover"
//                     />
//                   ) : (
//                     <span className="inline-block h-20 w-20 rounded-full overflow-hidden bg-gray-100"></span>
//                   )}
//                 </label>
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Upload Videos
//               </label>
//               <input
//                 type="file"
//                 accept="video/*"
//                 multiple
//                 onChange={handleVideoUpload}
//                 className="mt-1 block w-full text-gray-700"
//                 disabled={!isEditMode}
//               />
//             </div>
//           </div>
//         </div>

//         <div className="mt-6 text-center">
//           {!isEditMode && (
//             <div className="mt-6 text-center">
//               <button
//                 type="button"
//                 onClick={handleUpdateClick}
//                 className=" w-[9rem] bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600"
//               >
//                 Update Profile
//               </button>
//             </div>
//           )}
//           {isEditMode && (
//             <div className="mt-6 text-center">
//               <button
//                 type="submit"
//                 className=" w-[9rem] bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600"
//               >
//                 Save Profile
//               </button>
//             </div>
//           )}
//         </div>
//       </form>
//     </div>
//   );
// };

// export default UserProfile;





//last update

// import React, { useState, useEffect, useContext } from "react";
// import axios from "axios";
// import { Link } from "react-router-dom";
// import { GlobalContext } from "../components/UserContext";
// import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";

// const userProfileSchema = z.object({
//   id: z.string().optional(),
//   firstName: z.string().optional(),
//   lastName: z.string().optional(),
//   email: z.string().email("Invalid email address"),
//   password: z.string().optional(),
//   phone: z.string().optional(),
//   academics: z
//     .array(
//       z.object({
//         title: z.string().min(1, "Title is required").optional(),
//         year: z
//           .number()
//           .min(1980, { message: "Year must be valid" })
//           .optional(),
//       })
//     )
//     .optional(),
//   profilePicture: z.string().optional(),
//   videos: z.array(z.string()).optional(),
// });

// type UserProfileFormData = z.infer<typeof userProfileSchema>;

// const UserProfile: React.FC = () => {
//   const { userDetails, setUserDetails } = useContext(GlobalContext);
//   const [formError, setFormError] = useState("");
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [showSuccessMessage, setShowSuccessMessage] = useState(false);
//   const [isUploading, setIsUploading] = useState(false);
//   const [videos, setVideos] = useState<string[]>([]);

//   const backendUrl = import.meta.env.VITE_APP_BACKEND_URL;

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     control,
//     formState: { errors },
//     watch,
//   } = useForm<UserProfileFormData>({
//     resolver: zodResolver(userProfileSchema),
//   });

//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "academics",
//   });

//   const loadUserData = () => {
//     if (userDetails) {
//       const userData = userDetails.data;

//       const profilePicture = userData.profilePicture
//         ? `${
//             userData.profilePicture.startsWith(backendUrl)
//               ? userData.profilePicture
//               : `${backendUrl}/${userData.profilePicture}`
//           }`
//         : "";

//       setValue("id", userData.id || userData._id || "");
//       setValue("firstName", userData.firstName || "");
//       setValue("lastName", userData.lastName || "");
//       setValue("email", userData.email || "");
//       setValue("password", userData.password || "");
//       setValue("phone", String(userData.phone || ""));
//       setValue(
//         "academics",
//         Array.isArray(userData.academics) ? userData.academics : []
//       );
//       setValue("profilePicture", profilePicture);
//       setValue("videos", Array.isArray(userData.videos) ? userData.videos : []);
//       setVideos(userData.videos || []);
//     }
//   };

//   useEffect(() => {
//     loadUserData();
//   }, [userDetails]);

//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       const file = e.target.files[0];
//       setSelectedFile(file);

//       try {
//         setIsUploading(true);
//         const uploadFormData = new FormData();
//         uploadFormData.append("profilePicture", file);

//         const response = await axios.post(
//           `${backendUrl}/user/upload-profile?id=${userDetails?.data._id}`,
//           uploadFormData,
//           {
//             headers: {
//               "Content-Type": "multipart/form-data",
//             },
//           }
//         );

//         const updatedProfilePicture = response.data.data.profilePicture;
//         setValue("profilePicture", updatedProfilePicture);

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

//   const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       const uploadPromises = Array.from(e.target.files).map(async (file) => {
    
//         const formData = new FormData();
//         formData.append("videos", file)

      
//         const response = await axios.post(
//           `${backendUrl}/user/upload-video?id=${userDetails?.data._id}`,
//           formData,
//           {
//             headers: {
//               "Content-Type": "multipart/form-data",
//             },
//           }
//         );
//         return response.data.data.videoUrl;
//       });

//       try {
//         const newVideos = await Promise.all(uploadPromises);
//         setVideos((prevVideos) => [...prevVideos, ...newVideos]);
//         console.log("newVideos", newVideos);

//         // Update the user details
//         setUserDetails((prev: any) => {
//           if (prev) {
//             return {
//               ...prev,
//               data: {
//                 ...prev.data,
//                 videos: [...(prev.data.videos || []), ...newVideos],
//               },
//             };
//           }
//           console.log("Prev", prev, newVideos);
//           return prev;
//         });

//         setValue("videos", [...(videos || []), ...newVideos]);
//       } catch (error) {
//         console.error("Error uploading videos:", error);
//         setFormError("Failed to upload videos. Please try again.");
//         setTimeout(() => {
//           setFormError("");
//         }, 2000);
//       }
//     }
//   };

//   const handleUpdateClick = () => {
//     setIsEditMode(true);
//   };

//   const onSubmit: SubmitHandler<UserProfileFormData> = async (data) => {
//     try {
//       await axios.put(`${backendUrl}/user/update?id=${data.id}`, data);

//       setUserDetails((prev: any) => {
//         if (prev) {
//           return {
//             ...prev,
//             data: {
//               ...prev.data,
//               firstName: data.firstName || "",
//               lastName: data.lastName || "",
//               email: data.email,
//               phone: data.phone || "",
//               academics: data.academics || [],
//               profilePicture: prev.data.profilePicture,
//               videos: data.videos || [],
//             },
//           };
//         }
//         return prev;
//       });

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

//   const profilePicture = watch("profilePicture");

//   const handleAddAcademic = () => {
//     append({ title: "", year: undefined });
//   };

//   return (
//     <div className="max-w-4xl mx-auto my-10 bg-white p-8 rounded-md shadow-md relative">
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
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
//           <div>
//             <div className="grid grid-cols-1 gap-y-6 w-[26rem]">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   First Name
//                 </label>
//                 <input
//                   type="text"
//                   id="firstName"
//                   {...register("firstName")}
//                   readOnly={!isEditMode}
//                   className={`mt-1 block w-full px-3 py-2 border ${
//                     errors.firstName ? "border-red-500" : "border-gray-300"
//                   } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
//                 />
//                 {errors.firstName && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.firstName.message}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Last Name
//                 </label>
//                 <input
//                   type="text"
//                   id="lastName"
//                   {...register("lastName")}
//                   readOnly={!isEditMode}
//                   className={`mt-1 block w-full px-3 py-2 border ${
//                     errors.lastName ? "border-red-500" : "border-gray-300"
//                   } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
//                 />
//                 {errors.lastName && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.lastName.message}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Email address
//                 </label>
//                 <input
//                   type="email"
//                   id="email"
//                   {...register("email")}
//                   readOnly
//                   className={`mt-1 block w-full px-3 py-2 border ${
//                     errors.email ? "border-red-500" : "border-gray-300"
//                   } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
//                 />
//                 {errors.email && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.email.message}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Phone Number
//                 </label>
//                 <input
//                   type="text"
//                   id="phone"
//                   {...register("phone")}
//                   readOnly={!isEditMode}
//                   className={`mt-1 block w-full px-3 py-2 border ${
//                     errors.phone ? "border-red-500" : "border-gray-300"
//                   } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
//                 />
//                 {errors.phone && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.phone.message}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Academics
//                 </label>
//                 {fields.map((field, index) => (
//                   <div key={field.id} className="flex gap-2 mb-2">
//                     <div className="flex-1">
//                       <input
//                         type="text"
//                         {...register(`academics.${index}.title` as const)}
//                         placeholder="Title"
//                         className={`mt-1 block w-full px-3 py-2 border ${
//                           errors.academics?.[index]?.title
//                             ? "border-red-500"
//                             : "border-gray-300"
//                         } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
//                         readOnly={!isEditMode}
//                       />
//                       <p className="text-red-500 text-xs mt-1 h-1">
//                         {errors.academics?.[index]?.title?.message}
//                       </p>
//                     </div>
//                     <div className="flex-1">
//                       <input
//                         type="number"
//                         {...register(`academics.${index}.year` as const, {
//                           valueAsNumber: true,
//                         })}
//                         placeholder="Year"
//                         className={`mt-1 block w-full px-3 py-2 border ${
//                           errors.academics?.[index]?.year
//                             ? "border-red-500"
//                             : "border-gray-300"
//                         } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
//                         readOnly={!isEditMode}
//                       />
//                       <p className="text-red-500 text-xs mt-1 h-1">
//                         {errors.academics?.[index]?.year?.message}
//                       </p>
//                     </div>
//                     {isEditMode && (
//                       <button
//                         type="button"
//                         onClick={() => remove(index)}
//                         className="bg-red-500 text-white px-2 m-1 rounded-md"
//                       >
//                         -
//                       </button>
//                     )}
//                   </div>
//                 ))}
//                 {isEditMode && (
//                   <button
//                     type="button"
//                     onClick={handleAddAcademic}
//                     className="bg-blue-500 text-white px-4 py-2 mt-2 rounded-md"
//                   >
//                     Add Academic
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div>
//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-700">
//                 Profile Picture(Click over the circle to upload image)
//               </label>
//               <div className="mt-1 flex items-center">
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleFileChange}
//                   className="sr-only"
//                   id="profilePicture"
//                   disabled={!isEditMode}
//                 />
//                 <label
//                   htmlFor="profilePicture"
//                   className="cursor-pointer inline-block h-20 w-20 rounded-full overflow-hidden bg-gray-100"
//                 >
//                   {profilePicture ? (
//                     <img
//                       src={profilePicture}
//                       alt="Profile"
//                       className="h-20 w-20 rounded-full object-cover"
//                     />
//                   ) : (
//                     <span className="inline-block h-20 w-20 rounded-full overflow-hidden bg-gray-100"></span>
//                   )}
//                 </label>
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Upload Videos
//               </label>
//               <input
//                 type="file"
//                 accept="video/*"
//                 multiple
//                 onChange={handleVideoUpload}
//                 className="mt-1 block w-full text-gray-700"
//                 disabled={!isEditMode}
//               />
//               {videos.length > 0 && (
//                 <div className="mt-4">
//                   {videos.map((video, index) => (
//                     <div key={index} className="mb-4">
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="mt-6 text-center">
//           {!isEditMode && (
//             <div className="mt-6 text-center">
//               <button
//                 type="button"
//                 onClick={handleUpdateClick}
//                 className=" bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600"
//               >
//                 Update Profile
//               </button>
//             </div>
//           )}
//           {isEditMode && (
//             <div className="mt-6 text-center">
//               <button
//                 type="submit"
//                 className="bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600"
//               >
//                 Save Profile
//               </button>
//             </div>
//           )}
//         </div>
//       </form>
//     </div>
//   );
// };

// export default UserProfile;




//last update
// import React, { useState, useEffect, useContext } from "react";
// import axios from "axios";
// import { Link } from "react-router-dom";
// import { GlobalContext } from "../components/UserContext";
// import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";

// const userProfileSchema = z.object({
//   id: z.string().optional(),
//   firstName: z.string().optional(),
//   lastName: z.string().optional(),
//   email: z.string().email("Invalid email address"),
//   password: z.string().optional(),
//   phone: z.string().optional(),
//   academics: z
//     .array(
//       z.object({
//         title: z.string().min(1, "Title is required").optional(),
//         year: z
//           .number()
//           .min(1980, { message: "Year must be valid" })
//           .optional(),
//       })
//     )
//     .optional(),
//   profilePicture: z.string().optional(),
//   // videos: z.array(z.string()).optional(),
//   videos: z.array(z.string()).optional(), 
// });

// type UserProfileFormData = z.infer<typeof userProfileSchema>;

// const UserProfile: React.FC = () => {
//   const { userDetails, setUserDetails } = useContext(GlobalContext);
//   const [formError, setFormError] = useState("");
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [showSuccessMessage, setShowSuccessMessage] = useState(false);
//   const [isUploading, setIsUploading] = useState(false);
//   const [videos, setVideos] = useState<string[]>([]);

//   const backendUrl = import.meta.env.VITE_APP_BACKEND_URL;

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     control,
//     getValues,
//     formState: { errors },
//     watch,
//   } = useForm<UserProfileFormData>({
//     resolver: zodResolver(userProfileSchema),
//   });

//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "academics",
//   });

//   console.log('video', videos)

//   const loadUserData = () => {
//     if (userDetails) {
//       const userData = userDetails.data;
//       // console.log("1", userData.videos)

//       const profilePicture = userData.profilePicture
//         ? `${
//             userData.profilePicture.startsWith(backendUrl)
//               ? userData.profilePicture
//               : `${backendUrl}/${userData.profilePicture}`
//           }`
//         : "";

//       setValue("id", userData.id || userData._id || "");
//       setValue("firstName", userData.firstName || "");
//       setValue("lastName", userData.lastName || "");
//       setValue("email", userData.email || "");
//       setValue("password", userData.password || "");
//       setValue("phone", String(userData.phone || ""));
//       setValue(
//         "academics",
//         Array.isArray(userData.academics) ? userData.academics : []
//       );
//       setValue("profilePicture", profilePicture);
      
//       // setValue("videos", userData.videos.length>0 ? userData.videos.filter((e) => e !== null) : []);
//       setValue("videos", Array.isArray(userData.videos) ? userData.videos : []);
//       setVideos(userData.videos.filter((e) => e !== null) || []);
//     }
//   };

//   useEffect(() => {
//     loadUserData();
//   }, [userDetails]);

//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       const file = e.target.files[0];
//       setSelectedFile(file);

//       try {
//         setIsUploading(true);
//         const uploadFormData = new FormData();
//         uploadFormData.append("profilePicture", file);

//         const response = await axios.post(
//           `${backendUrl}/user/upload-profile?id=${userDetails?.data._id}`,
//           uploadFormData,
//           {
//             headers: {
//               "Content-Type": "multipart/form-data",
//             },
//           }
//         );

//         const updatedProfilePicture = response.data.data.profilePicture;
//         setValue("profilePicture", updatedProfilePicture);

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

//   const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
   
  
//       try {
//         const uploadPromises = Array.from(e.target.files).map(async (file) => {
//           const formData = new FormData();
//           formData.append("videos", file);
    
//           const response = await axios.post(
//             `${backendUrl}/user/upload-video?id=${userDetails?.data._id}`,
//             formData,
//             {
//               headers: {
//                 "Content-Type": "multipart/form-data",
//               },
//             }
//           );


//           console.log('id', file.name)
//           let video = [];
//           video.push(file.name)
//           console.log('vide', video)
//           setVideos(video);
//           console.log(setVideos(video))
//           console.log('videos', videos)

//          setValue("videos", video); 
//          console.log(setValue("videos", video))
//           return response.data.data.videoUrl;
//         });
//         const newVideos = await Promise.all(uploadPromises);
//         const updatedVideos = [...(videos || []), ...newVideos];
        
  
//         // setVideos(updatedVideos);
//         // setValue("videos", updatedVideos); // Update the form state with the new videos
  
//         // Update the user details
//         setUserDetails((prev: any) => {
//           if (prev) {
//             return {
//               ...prev,
//               data: {
//                 ...prev.data,
//                 videos: updatedVideos,
//               },
//             };
//           }
//           return prev;
//         });
  
//       } catch (error) {
//         console.error("Error uploading videos:", error);
//         setFormError("Failed to upload videos. Please try again.");
//         setTimeout(() => {
//           setFormError("");
//         }, 2000);
//       }
//     }
//   };
  

//   const handleUpdateClick = () => {
//     setIsEditMode(true);
//   };

//   const onSubmit: SubmitHandler<UserProfileFormData> = async (data) => {
//     try {
//       await axios.put(`${backendUrl}/user/update?id=${data.id}`, data);

//       setUserDetails((prev: any) => {
//         if (prev) {
//           return {
//             ...prev,
//             data: {
//               ...prev.data,
//               firstName: data.firstName || "",
//               lastName: data.lastName || "",
//               email: data.email,
//               phone: data.phone || "",
//               academics: data.academics || [],
//               profilePicture: prev.data.profilePicture,
//               videos: data.videos || [],
//             },
//           };
//         }
//         return prev;
//       });

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

//   const profilePicture = watch("profilePicture");

//   const handleAddAcademic = () => {
//     append({ title: "", year: undefined });
//   };

//   return (
//     <div className="max-w-4xl mx-auto my-10 bg-white p-8 rounded-md shadow-md relative">
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
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
//           <div>
//             <div className="grid grid-cols-1 gap-y-6 w-[26rem]">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   First Name
//                 </label>
//                 <input
//                   type="text"
//                   id="firstName"
//                   {...register("firstName")}
//                   readOnly={!isEditMode}
//                   className={`mt-1 block w-full px-3 py-2 border ${
//                     errors.firstName ? "border-red-500" : "border-gray-300"
//                   } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
//                 />
//                 {errors.firstName && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.firstName.message}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Last Name
//                 </label>
//                 <input
//                   type="text"
//                   id="lastName"
//                   {...register("lastName")}
//                   readOnly={!isEditMode}
//                   className={`mt-1 block w-full px-3 py-2 border ${
//                     errors.lastName ? "border-red-500" : "border-gray-300"
//                   } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
//                 />
//                 {errors.lastName && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.lastName.message}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Email address
//                 </label>
//                 <input
//                   type="email"
//                   id="email"
//                   {...register("email")}
//                   readOnly
//                   className={`mt-1 block w-full px-3 py-2 border ${
//                     errors.email ? "border-red-500" : "border-gray-300"
//                   } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
//                 />
//                 {errors.email && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.email.message}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Phone Number
//                 </label>
//                 <input
//                   type="text"
//                   id="phone"
//                   {...register("phone")}
//                   readOnly={!isEditMode}
//                   className={`mt-1 block w-full px-3 py-2 border ${
//                     errors.phone ? "border-red-500" : "border-gray-300"
//                   } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
//                 />
//                 {errors.phone && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.phone.message}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Academics
//                 </label>
//                 {fields.map((field, index) => (
//                   <div key={field.id} className="flex gap-2 mb-2">
//                     <div className="flex-1">
//                       <input
//                         type="text"
//                         {...register(`academics.${index}.title` as const)}
//                         placeholder="Title"
//                         className={`mt-1 block w-full px-3 py-2 border ${
//                           errors.academics?.[index]?.title
//                             ? "border-red-500"
//                             : "border-gray-300"
//                         } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
//                         readOnly={!isEditMode}
//                       />
//                       <p className="text-red-500 text-xs mt-1 h-1">
//                         {errors.academics?.[index]?.title?.message}
//                       </p>
//                     </div>
//                     <div className="flex-1">
//                       <input
//                         type="number"
//                         {...register(`academics.${index}.year` as const, {
//                           valueAsNumber: true,
//                         })}
//                         placeholder="Year"
//                         className={`mt-1 block w-full px-3 py-2 border ${
//                           errors.academics?.[index]?.year
//                             ? "border-red-500"
//                             : "border-gray-300"
//                         } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
//                         readOnly={!isEditMode}
//                       />
//                       <p className="text-red-500 text-xs mt-1 h-1">
//                         {errors.academics?.[index]?.year?.message}
//                       </p>
//                     </div>
//                     {isEditMode && (
//                       <button
//                         type="button"
//                         onClick={() => remove(index)}
//                         className="bg-red-500 text-white px-2 m-1 rounded-md"
//                       >
//                         -
//                       </button>
//                     )}
//                   </div>
//                 ))}
//                 {isEditMode && (
//                   <button
//                     type="button"
//                     onClick={handleAddAcademic}
//                     className="bg-blue-500 text-white px-4 py-2 mt-2 rounded-md"
//                   >
//                     Add Academic
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div>
//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-700">
//                 Profile Picture(Click over the circle to upload image)
//               </label>
//               <div className="mt-1 flex items-center">
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleFileChange}
//                   className="sr-only"
//                   id="profilePicture"
//                   disabled={!isEditMode}
//                 />
//                 <label
//                   htmlFor="profilePicture"
//                   className="cursor-pointer inline-block h-20 w-20 rounded-full overflow-hidden bg-gray-100"
//                 >
//                   {profilePicture ? (
//                     <img
//                       src={profilePicture}
//                       alt="Profile"
//                       className="h-20 w-20 rounded-full object-cover"
//                     />
//                   ) : (
//                     <span className="inline-block h-20 w-20 rounded-full overflow-hidden bg-gray-100"></span>
//                   )}
//                 </label>
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Upload Videos
//               </label>
//               <input
//                 type="file"
//                 accept="video/*"
//                 multiple
//                 onChange={handleVideoUpload}
//                 className="mt-1 block w-full text-gray-700"
//                 disabled={!isEditMode}
//               />
//               {/* {videos.length > 0 && (
//                 <div className="mt-4">
//                   {videos.map((video, index) => (
//                     <div key={index} className="mb-4"></div>
//                   ))}
//                 </div>
//               )} */}
//             </div>
//           </div>
//         </div>

//         <div className="mt-6 text-center">
//           {!isEditMode && (
//             <div className="mt-6 text-center">
//               <button
//                 type="button"
//                 onClick={handleUpdateClick}
//                 className=" bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600"
//               >
//                 Update Profile
//               </button>
//             </div>
//           )}
//           {isEditMode && (
//             <div className="mt-6 text-center">
//               <button
//                 type="submit"
//                 className="bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600"
//               >
//                 Save Profile
//               </button>
//             </div>
//           )}
//         </div>
//       </form>
//     </div>
//   );
// };

// export default UserProfile;





// latest update

// import React, { useState, useEffect, useContext } from "react";
// import axios from "axios";
// import { Link } from "react-router-dom";
// import { GlobalContext } from "../components/UserContext";
// import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";

// const userProfileSchema = z.object({
//   id: z.string().optional(),
//   firstName: z.string().optional(),
//   lastName: z.string().optional(),
//   email: z.string().email("Invalid email address"),
//   password: z.string().optional(),
//   phone: z.string().optional(),
//   academics: z
//     .array(
//       z.object({
//         title: z.string().min(1, "Title is required").optional(),
//         year: z
//           .number()
//           .min(1980, { message: "Year must be valid" })
//           .optional(),
//       })
//     )
//     .optional(),
//   profilePicture: z.string().optional(),
//   videos: z.array(z.string()).optional(),
// });

// type UserProfileFormData = z.infer<typeof userProfileSchema>;

// const UserProfile: React.FC = () => {
//   const { userDetails, setUserDetails } = useContext(GlobalContext);
//   const [formError, setFormError] = useState("");
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [showSuccessMessage, setShowSuccessMessage] = useState(false);
//   const [isUploading, setIsUploading] = useState(false);
//   const [videos, setVideos] = useState<string[]>([]);

//   const backendUrl = import.meta.env.VITE_APP_BACKEND_URL;

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     control,
//     getValues,
//     formState: { errors },
//     watch,
//   } = useForm<UserProfileFormData>({
//     resolver: zodResolver(userProfileSchema),
//   });

//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "academics",
//   });

//   const loadUserData = () => {
//     if (userDetails) {
//       const userData = userDetails.data;
//       console.log("userData", userData);

//       const profilePicture = userData.profilePicture
//         ? `${
//             userData.profilePicture.startsWith(backendUrl)
//               ? userData.profilePicture
//               : `${backendUrl}/${userData.profilePicture}`
//           }`
//         : "";


//         const videos = Array.isArray(userData.videos)
//       ? userData.videos.map((videoPath: string) => `${videoPath}`)
//       : [];

//       // const videos = userData.videos ? `${backendUrl}/${userData.videos}`:"";

//       setValue("id", userData.id || userData._id || "");
//       setValue("firstName", userData.firstName || "");
//       setValue("lastName", userData.lastName || "");
//       setValue("email", userData.email || "");
//       setValue("password", userData.password || "");
//       setValue("phone", String(userData.phone || ""));
//       setValue(
//         "academics",
//         Array.isArray(userData.academics) ? userData.academics : []
//       );
//       // setValue("videos", [videos]);
//       setValue("profilePicture", profilePicture);
//       // setVideos(userData.videos || []);
//       // setVideos([videos]);
//       setVideos(videos);
//       // setValue("videos", userData.videos || [])
//       setValue("videos", videos || []);
//       console.log("userData.videos", userData.videos);
//     }
//   };

//   useEffect(() => {
//     loadUserData();
//   }, [userDetails]);

//   const handleProfilePicture = async (
//     e: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     if (e.target.files && e.target.files.length > 0) {
//       const file = e.target.files[0];
//       setSelectedFile(file);

//       try {
//         setIsUploading(true);
//         const uploadFormData = new FormData();
//         uploadFormData.append("profilePicture", file);

//         const response = await axios.post(
//           `${backendUrl}/user/upload-profile?id=${userDetails?.data._id}`,
//           uploadFormData,
//           {
//             headers: {
//               "Content-Type": "multipart/form-data",
//             },
//           }
//         );

//         const updatedProfilePicture = response.data.data.profilePicture;
//         setValue("profilePicture", updatedProfilePicture);

//         setUserDetails((prev) => {
//           if (prev) {
//             return {
//               // ...prev,
//               data: {
//                 ...prev.data,
//                 profilePicture: updatedProfilePicture,
//               },
//             };
//           }
//           return prev;
//         });

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

//   // console.log('videoss', videos);

//   // const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//   //   if (e.target.files && e.target.files.length > 0) {
//   //     const file = e.target.files[0];
//   //     setSelectedFile(file);

//   //     try {
//   //       setIsUploading(true);
//   //       const uploadFormData = new FormData();
//   //       uploadFormData.append("videos", file);

//   //       const response = await axios.post(
//   //         `user/upload-video?id=${userDetails?.data._id}`,
//   //         uploadFormData,
//   //         {
//   //           headers: {
//   //             "Content-Type": "multipart/form-data",
//   //           },
//   //         }
//   //       );

//   //       const uploadedVideoTitle = response.data.data.videos.originalname;
//   //       const uploadedVideoPath = response.data.data.videos.path;
//   //       console.log("videopath", uploadedVideoPath);
//   //       console.log("videotitle", uploadedVideoTitle);

//   //       let video = [...videos];
//   //       // video.push(uploadedVideoPath)
//   //       video.push(uploadedVideoPath);
//   //       setVideos(video);
//   //       // setVideos((prevVideos) => [...prevVideos, uploadedVideoPath]);
//   //       setVideos((prevVideos) => [...prevVideos]);

//   //       setTimeout(() => {
//   //         setShowSuccessMessage(false);
//   //       }, 3000);
//   //     } catch (error) {
//   //       console.error("Error uploading video:", error);
//   //       setFormError("Failed to upload video. Please try again.");
//   //       setTimeout(() => {
//   //         setFormError("");
//   //       }, 2000);
//   //     } finally {
//   //       setIsUploading(false);
//   //     }
//   //   } else {
//   //     setFormError("No file selected. Please choose a video to upload.");
//   //     setTimeout(() => {
//   //       setFormError("");
//   //     }, 2000);
//   //   }
//   // };

//   const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       const file = e.target.files[0];
//       setSelectedFile(file);

//       try {
//         setIsUploading(true);
//         const uploadFormData = new FormData();
//         uploadFormData.append("videos", file);

//         const response = await axios.post(
//           `${backendUrl}/user/upload-video?id=${userDetails?.data._id}`,
//           uploadFormData,
//           {
//             headers: {
//               "Content-Type": "multipart/form-data",
//             },
//           }
//         );

//         const uploadedVideoTitle = response.data.data.videos.originalname;
//         const uploadedVideoPath = response.data.data.videos.path;
//         console.log("videopath", uploadedVideoPath);
//         console.log("videotitle", uploadedVideoTitle);

//         let video = [...videos];
//         // video.push(uploadedVideoPath)
//         video.push(uploadedVideoTitle);
//         setVideos(video);
//         // setVideos((prevVideos) => [...prevVideos, uploadedVideoPath]);
//         setVideos((prevVideos) => [...prevVideos]);

//         setTimeout(() => {
//           setShowSuccessMessage(false);
//         }, 3000);
//       } catch (error) {
//         console.error("Error uploading video:", error);
//         setFormError("Failed to upload video. Please try again.");
//         setTimeout(() => {
//           setFormError("");
//         }, 2000);
//       } finally {
//         setIsUploading(false);
//       }
//     } else {
//       setFormError("No file selected. Please choose a video to upload.");
//       setTimeout(() => {
//         setFormError("");
//       }, 2000);
//     }
//   };

//   const handleUpdateClick = () => {
//     setIsEditMode(true);
//   };

//   const onSubmit: SubmitHandler<UserProfileFormData> = async (data) => {
//     try {
//       await axios.put(`${backendUrl}/user/update?id=${data.id}`, data);

//       setUserDetails((prev: any) => {
//         if (prev) {
//           return {
//             ...prev,
//             data: {
//               ...prev.data,
//               firstName: data.firstName || "",
//               lastName: data.lastName || "",
//               email: data.email,
//               phone: data.phone || "",
//               academics: data.academics || [],
//               profilePicture: prev.data.profilePicture,
//               videos: videos || [],
//               // videos: data.videos || [],
//             },
//           };
//         }
//         return prev;
//       });

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

//   const profilePicture = watch("profilePicture");

//   const handleAddAcademic = () => {
//     append({ title: "", year: undefined });
//   };

//   return (
//     <div className="max-w-4xl mx-auto my-10 bg-white p-6 rounded-md shadow-md relative">
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
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
//           <div>
//             <div className="grid grid-cols-1 gap-y-6 w-[26rem]">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   First Name
//                 </label>
//                 <input
//                   type="text"
//                   id="firstName"
//                   {...register("firstName")}
//                   readOnly={!isEditMode}
//                   className={`mt-1 block w-full px-3 py-2 border ${
//                     errors.firstName ? "border-red-500" : "border-gray-300"
//                   } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
//                 />
//                 {errors.firstName && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.firstName.message}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Last Name
//                 </label>
//                 <input
//                   type="text"
//                   id="lastName"
//                   {...register("lastName")}
//                   readOnly={!isEditMode}
//                   className={`mt-1 block w-full px-3 py-2 border ${
//                     errors.lastName ? "border-red-500" : "border-gray-300"
//                   } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
//                 />
//                 {errors.lastName && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.lastName.message}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Email address
//                 </label>
//                 <input
//                   type="email"
//                   id="email"
//                   {...register("email")}
//                   readOnly
//                   className={`mt-1 block w-full px-3 py-2 border ${
//                     errors.email ? "border-red-500" : "border-gray-300"
//                   } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
//                 />
//                 {errors.email && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.email.message}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Phone Number
//                 </label>
//                 <input
//                   type="text"
//                   id="phone"
//                   {...register("phone")}
//                   readOnly={!isEditMode}
//                   className={`mt-1 block w-full px-3 py-2 border ${
//                     errors.phone ? "border-red-500" : "border-gray-300"
//                   } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
//                 />
//                 {errors.phone && (
//                   <p className="text-red-500 text-xs mt-1">
//                     {errors.phone.message}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Academics
//                 </label>
//                 {fields.map((field, index) => (
//                   <div key={field.id} className="flex gap-2 mb-2">
//                     <div className="flex-1">
//                       <input
//                         type="text"
//                         {...register(`academics.${index}.title` as const)}
//                         placeholder="Title"
//                         className={`mt-1 block w-full px-3 py-2 border ${
//                           errors.academics?.[index]?.title
//                             ? "border-red-500"
//                             : "border-gray-300"
//                         } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
//                         readOnly={!isEditMode}
//                       />
//                       <p className="text-red-500 text-xs mt-1 h-1">
//                         {errors.academics?.[index]?.title?.message}
//                       </p>
//                     </div>
//                     <div className="flex-1">
//                       <input
//                         type="number"
//                         {...register(`academics.${index}.year` as const, {
//                           valueAsNumber: true,
//                         })}
//                         placeholder="Year"
//                         className={`mt-1 block w-full px-3 py-2 border ${
//                           errors.academics?.[index]?.year
//                             ? "border-red-500"
//                             : "border-gray-300"
//                         } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
//                         readOnly={!isEditMode}
//                       />
//                       <p className="text-red-500 text-xs mt-1 h-1">
//                         {errors.academics?.[index]?.year?.message}
//                       </p>
//                     </div>
//                     {isEditMode && (
//                       <button
//                         type="button"
//                         onClick={() => remove(index)}
//                         className="bg-red-500 text-white px-2 m-1 rounded-md"
//                       >
//                         -
//                       </button>
//                     )}
//                   </div>
//                 ))}
//                 {isEditMode && (
//                   <button
//                     type="button"
//                     onClick={handleAddAcademic}
//                     className="bg-blue-500 text-white px-4 py-2 mt-2 rounded-md"
//                   >
//                     Add Academic
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div>
//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-700">
//                 Profile Picture(Click over the circle to upload image)
//               </label>
//               <div className="mt-1 flex items-center">
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleProfilePicture}
//                   className="sr-only"
//                   id="profilePicture"
//                   disabled={!isEditMode}
//                 />
//                 <label
//                   htmlFor="profilePicture"
//                   className="cursor-pointer inline-block h-20 w-20 rounded-full overflow-hidden bg-gray-100"
//                 >
//                   {profilePicture ? (
//                     <img
//                       src={profilePicture}
//                       alt="Profile"
//                       className="h-20 w-20 rounded-full object-cover"
//                     />
//                   ) : (
//                     <span className="inline-block h-20 w-20 rounded-full overflow-hidden bg-gray-100"></span>
//                   )}
//                 </label>
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Upload Videos
//               </label>
//               <input
//                 type="file"
//                 accept="video/*"
//                 multiple
//                 onChange={handleVideoUpload}
//                 className="mt-1 block w-full text-gray-700"
//                 disabled={!isEditMode}
//               />
//               <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
//                 {videos.map((video, index) => (
//                   <li key={index}>
//                     <Link to={video} className="text-blue-500 hover:underline">
//                       {video}
//                     </Link>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         </div>

//         <div className="mt-6 text-center">
//           {!isEditMode && (
//             <div className="mt-6 text-center">
//               <button
//                 type="button"
//                 onClick={handleUpdateClick}
//                 className=" bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600"
//               >
//                 Update Profile
//               </button>
//             </div>
//           )}
//           {isEditMode && (
//             <div className="mt-6 text-center">
//               <button
//                 type="submit"
//                 className="bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600"
//               >
//                 Save Profile
//               </button>
//             </div>
//           )}
//         </div>
//       </form>
//     </div>
//   );
// };

// export default UserProfile;
