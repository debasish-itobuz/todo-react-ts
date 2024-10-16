import React, { useState, useEffect, useContext, useRef } from "react";
import axios, { AxiosError } from "axios";
import { Link } from "react-router-dom";
import { GlobalContext } from "../components/UserContext";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "react-modal";
import axiosInstance from "../axiosConfig";

const userProfileSchema: any = z.object({
  id: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email address"),
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

  videos: z
    .array(
      z.object({
        title: z.string().optional(),
        url: z.string().optional(),
        _id: z.string().optional(),
        thumbnail: z.string().optional(),
      })
    )
    .optional(),
});

type UserProfileFormData = z.infer<typeof userProfileSchema>;

const UserProfile: React.FC = () => {
  const { userDetails, setUserDetails } = useContext(GlobalContext);
  const [formError, setFormError] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [videos, setVideos] = useState<any>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const backendUrl = import.meta.env.VITE_APP_BACKEND_URL;

  useEffect(() => {
    const userDetails = localStorage.getItem("userDetails");
    if (userDetails) {
      const parsedDetails = JSON.parse(userDetails);
      setUserId(parsedDetails?.data?._id || null);
    }
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    getValues,
    formState: { errors },
    watch,
  } = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "academics",
  });

  useEffect(() => {
    if (userId) {
      const getUser = async () => {
        try {
          const response = await axiosInstance.get("/user/get-user");

          return response.data;
        } catch (error) {
          if (error instanceof AxiosError) {
            return error.response?.data;
          }
        }
      };

      getUser().then((userResponse) => {
        userResponse.data.videos = userResponse.data.videos.map((e: any) => {
          return {
            title: e.title,
            url: e.url,
            _id: e._id,
            thumbnail: e.thumbnail,
          };
        });

        localStorage.setItem("userDetails", JSON.stringify(userResponse));
        setUserDetails(userResponse);
      });
    }
  }, [userId]);

  const loadUserData = () => {
    if (userDetails) {
      const userData = userDetails.data;

      // Profile picture logic
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
      setValue("phone", String(userData.phone || ""));
      setValue(
        "academics",
        Array.isArray(userData.academics) ? userData.academics : []
      );
      setValue("profilePicture", profilePicture);

      // Ensure video thumbnail URLs are absolute

      const videos = (userData.videos || []).map((video: any) => ({
        ...video,
        thumbnail: video.thumbnail
          ? video.thumbnail
          : `${backendUrl}/${video.thumbnail}`,
      }));

      setVideos(videos);
      setValue("videos", videos);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [setValue, isUploading]);

  const handleProfilePicture = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      try {
        setIsUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append("profilePicture", file);

        const response = await axiosInstance.post(
          `/user/upload-profile`,
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

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      try {
        setIsUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append("videos", file);

        const response = await axiosInstance.post(
          `/user/upload-video`,
          uploadFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const video = response.data.data;
        setValue("videos", userDetails?.data.videos.concat(video));

        setUserDetails((prev: any) => {
          if (prev) {
            const updatedUserDetails = {
              data: {
                ...prev.data,
                videos: getValues("videos"),
              },
            };

            localStorage.setItem(
              "userDetails",
              JSON.stringify(updatedUserDetails)
            );
            return updatedUserDetails;
          }
          return prev;
        });

        if (videoInputRef.current) {
          videoInputRef.current.value = "";
        }
      } catch (error) {
        console.error("Error uploading video:", error);
        setFormError("Failed to upload video. Please try again.");
        setTimeout(() => {
          setFormError("");
        }, 2000);
      } finally {
        setIsUploading(false);
      }
    } else {
      setFormError("No file selected. Please choose a video to upload.");
      setTimeout(() => {
        setFormError("");
      }, 2000);
    }
  };

  const downloadVideo = async (videoId: string, videoTitle: string) => {
    try {
      if (!videoId) {
        setFormError("Failed to identify video ID.");
        setTimeout(() => setFormError(""), 2000);
        return;
      }

      const response = await axiosInstance.get(
        `/user/download-video?videoId=${videoId}`,
        {
          responseType: "blob", // important for handling binary data
        }
      );

      // Create a link element, set the URL and trigger a download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", videoTitle); // Use video title as the filename
      document.body.appendChild(link);
      link.click();
      link.remove();

      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error("Error downloading video:", error);
      setFormError("Failed to download video. Please try again.");
      setTimeout(() => setFormError(""), 2000);
    }
  };

  const deleteVideo = async (video_id: string) => {
    try {
      const videoId = video_id;

      if (!videoId) {
        setFormError("Failed to identify video ID.");
        setTimeout(() => setFormError(""), 2000);
        return;
      }

      await axiosInstance.delete(`/user/delete-video?videoId=${videoId}`);

      // Update state to remove the deleted video
      const updatedVideos = videos.filter(
        (video: any) => video._id !== videoId
      );
      setVideos(updatedVideos);
      setValue("videos", updatedVideos);

      // Update user details with the new list of videos
      setUserDetails((prev: any) => {
        if (prev) {
          const updatedUserDetails = {
            data: {
              ...prev.data,
              videos: updatedVideos,
            },
          };
          localStorage.setItem(
            "userDetails",
            JSON.stringify(updatedUserDetails)
          );
          return updatedUserDetails;
        }
        return prev;
      });

      setFormError("");
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error("Error deleting video:", error);
      setFormError("Failed to delete video. Please try again.");
      setTimeout(() => setFormError(""), 2000);
    }
  };

  const handleUpdateClick = () => {
    setIsEditMode(true);
  };

  const onSubmit: SubmitHandler<UserProfileFormData> = async (data) => {
    try {
      await axiosInstance.put(`/user/update`, data);

      setUserDetails((prev: any) => {
        if (prev) {
          return {
            data: {
              ...prev.data,
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              email: data.email,
              phone: data.phone || "",
              academics: data.academics || [],
              profilePicture: prev.data.profilePicture,
              videos: videos || [],
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

  const openVideoModal = (url: string) => {
    setSelectedVideo(url);
    setIsModalOpen(true);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto my-10 bg-white p-6 rounded-md shadow-md relative">
      <Link to="/todolist">
        <svg
          fill="none"
          stroke="currentColor"
          className="w-12 h-9 ml-1 rotate-180 absolute end-5"
          viewBox="0 0 24 24"
        >
          <path d="M5 12h14M12 5l7 7-7 7"></path>
        </svg>
      </Link>
      <h2 className="text-2xl font-semibold text-gray-800">Profile Form</h2>
      <div className="mb-4">
        <p className={`text-red-500 ${formError ? "visible" : "invisible"}`}>
          {formError || "Placeholder for error message"}
        </p>
        <p
          className={`text-green-500 ${
            showSuccessMessage ? "visible" : "invisible"
          }`}
        >
          {showSuccessMessage
            ? "Data updated successfully"
            : "Placeholder for success message"}
        </p>
      </div>
      {isUploading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
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
                {errors.firstName &&
                  typeof errors.firstName.message === "string" && (
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
                {errors.lastName &&
                  typeof errors.lastName.message === "string" && (
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
                {errors.email && typeof errors.email.message === "string" && (
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
                  type="text"
                  id="phone"
                  {...register("phone")}
                  readOnly={!isEditMode}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.phone && typeof errors.phone.message === "string" && (
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
                          (errors.academics as any)?.[index]?.title
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        readOnly={!isEditMode}
                      />
                      <p className="text-red-500 text-xs mt-1 h-1">
                        {(errors.academics as any)?.[index]?.title?.message}
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
                          (errors.academics as any)?.[index]?.year
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        readOnly={!isEditMode}
                      />
                      <p className="text-red-500 text-xs mt-1 h-1">
                        {(errors.academics as any)?.[index]?.year?.message}
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
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700">
                Profile Picture(Click over the circle to upload image)
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicture}
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
              <label className="block text-sm font-medium text-gray-700">
                Upload Videos
              </label>
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={handleVideoUpload}
                className="mt-1 block w-full text-gray-700"
                ref={videoInputRef}
                disabled={!isEditMode}
              />

              <ul className="mt-2 list-disc list-inside text-sm text-gray-600 ">
                {videos.map((video: any, index: any) => (
                  <li
                    key={index}
                    className="flex justify-start items-center gap-3 mb-8"
                  >
                    <button
                      onClick={() =>
                        openVideoModal(`${backendUrl}/${video.url}`)
                      }
                      className="text-blue-500 h-16 w-16 flex gap-6"
                    >
                      <img
                        src={`${backendUrl}/${video.thumbnail}`}
                        alt="Video Thumbnail"
                        className="w-16 h-16 object-cover"
                      />
                    </button>
                    <div className="flex">
                      <span className="font-medium text-gray-700">
                        {video.title}
                      </span>
                      <button
                        className="ms-2 text-blue-500 font-extrabold"
                        type="button"
                        onClick={() => downloadVideo(video._id, video.title)}
                      >
                        Download
                      </button>

                      <button
                        className="ms-2 text-red-500 font-extrabold"
                        type="button"
                        onClick={() => deleteVideo(video._id)}
                      >
                        X
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <Modal
                isOpen={isModalOpen}
                onRequestClose={closeVideoModal}
                contentLabel="Video Modal"
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-40"
              >
                {selectedVideo && (
                  <div className="relative bg-white rounded-lg shadow-lg max-w-xl w-full h-auto max-h-[90vh] overflow-hidden">
                    <div className="flex justify-end p-2">
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-500"
                        aria-label="Close"
                        onClick={closeVideoModal}
                      >
                        &times;
                      </button>
                    </div>
                    <div className="p-4 flex items-center justify-center h-full">
                      <video
                        controls
                        className="w-auto max-w-full max-h-full object-contain"
                      >
                        <source src={selectedVideo} type="video/mp4" />
                      </video>
                    </div>
                  </div>
                )}
              </Modal>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          {!isEditMode && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={handleUpdateClick}
                className=" bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600"
              >
                Update Profile
              </button>
            </div>
          )}
          {isEditMode && (
            <div className="mt-6 text-center">
              <button
                type="submit"
                className="bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600"
              >
                Save Profile
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default UserProfile;
