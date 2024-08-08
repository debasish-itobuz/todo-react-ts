import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { GlobalContext } from "../components/UserContext";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const userProfileSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().optional(),
  phone: z.string().optional(),
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
    register, handleSubmit, setValue,
    formState: { errors },
    watch,
  } = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
  });

  const loadUserData = () => {
    if (userDetails) {
      const userData = userDetails;
      const profilePicture = userData.data.profilePicture
        ? `${userData.data.profilePicture.startsWith(backendUrl) ? userData.data.profilePicture : `${backendUrl}/${userData.data.profilePicture}`}`
        : "";

      setValue("id", userData.data.id || userData.data._id || "");
      setValue("firstName", userData.data.firstName || "");
      setValue("lastName", userData.data.lastName || "");
      setValue("email", userData.data.email || "");
      setValue("password", userData.data.password || "");
      setValue("phone", String(userData.data.phone || ""));
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
        console.log("upp", updatedProfilePicture)
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

      setUserDetails((prev) => {
        if (prev) {
          return {
            ...prev,
            data: {
              ...prev.data,
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              email: data.email,
              phone: data.phone || "",
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              {...register("firstName")}
              readOnly={!isEditMode}
              className={`mt-1 block w-full px-3 py-2 border ${errors.firstName ? "border-red-500" : "border-gray-300"
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
              className={`mt-1 block w-full px-3 py-2 border ${errors.lastName ? "border-red-500" : "border-gray-300"
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
              className={`mt-1 block w-full px-3 py-2 border ${errors.email ? "border-red-500" : "border-gray-300"
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
              className={`mt-1 block w-full px-3 py-2 border ${errors.phone ? "border-red-500" : "border-gray-300"
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