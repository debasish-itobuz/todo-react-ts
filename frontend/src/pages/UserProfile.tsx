import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

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

  const [formError, setFormError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    const loadUserDataFromLocalStorage = () => {
      const storedUserDetails = localStorage.getItem("userDetails");

      if (storedUserDetails) {
        const userData = JSON.parse(storedUserDetails);

        setFormData({
          id: userData.id || userData._id,
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          password: userData.password || "",
          phone: userData.phone || "",
          profilePicture: userData.profilePicture || "",
        });
      }
    };

    loadUserDataFromLocalStorage();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          profilePicture: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateClick = () => {
    setIsEditMode(true);
  };

  const handleUploadClick = () => {
    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      let profilePictureUrl = formData.profilePicture;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("profilePicture", selectedFile);

        const response = await axios.post(
          "http://localhost:4001/user/upload-profile-picture",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        profilePictureUrl = response.data.imageUrl;
      }

      await axios.put(`http://localhost:4001/user/update?id=${formData.id}`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        profilePicture: profilePictureUrl,
      });

      console.log("User profile updated successfully");

      localStorage.setItem(
        "userDetails",
        JSON.stringify({
          ...formData,
          profilePicture: profilePictureUrl,
        })
      );

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
                className="sr-only"
                id="fileInput"
                name="fileInput"
                disabled={!isEditMode}
              />
              <label className="cursor-pointer inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                {formData.profilePicture ? (
                  <img
                    src={formData.profilePicture}
                    alt="Profile"
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100"></span>
                )}
              </label>
              {isEditMode && (
                <button
                  type="button"
                  className="ml-4 bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600"
                  onClick={handleUploadClick}
                >
                  Upload
                </button>
              )}
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

