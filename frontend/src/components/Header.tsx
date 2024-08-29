import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GlobalContext } from "./UserContext";

const Header = () => {
  const navigate = useNavigate();
  const { userDetails, token, setUserDetails, setToken } =
    useContext(GlobalContext);

  const handleLogout = () => {
    localStorage.clear();
    setUserDetails(null);
    setToken(null);
    navigate("/");
  };

  return (
    <header className="text-gray-600 body-font fixed top-0 w-full bg-white">
      <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row justify-between items-center">
        <p className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke="currentColor"
            className="w-10 h-10 text-white p-2 bg-indigo-500 rounded-full"
            viewBox="0 0 24 24"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          <span className="ml-3 text-xl cursor-pointer">Todo-App</span>
        </p>

        {!token ? (
          <div>
            <Link
              to="/login"
              className="inline-flex items-center bg-gray-100 border-0 py-1 px-3 focus:outline-none hover:bg-gray-200 rounded text-base mt-4 md:mt-0 me-5"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center bg-gray-100 border-0 py-1 px-3 focus:outline-none hover:bg-gray-200 rounded text-base mt-4 md:mt-0"
            >
              Signup
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <h3
              className="text-gray-900 cursor-pointer"
              onClick={() => {
                navigate("/user-profile/");
              }}
            >
              {`Hello, ${userDetails?.data?.userName}`}
            </h3>
            <button className="text-gray-900" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
