import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import TodoList from "./pages/TodoList";
import VerifyUser from "./pages/VerifyUser";
import { adminRoutes } from "./routes";
import UserProfile from "./pages/UserProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signUp" element={<SignUp />} />
        <Route path="/todolist" element={<TodoList />} />
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path={adminRoutes.verifyEmail.fullpath} element={<VerifyUser />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
