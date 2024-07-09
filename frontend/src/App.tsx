import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import TodoList from "./pages/TodoList";
import VerifyEmail from "./pages/VerifyEmail";
import VerifyUser from "./pages/VerifyUser";
import { adminRoutes } from "./routes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signUp" element={<SignUp />} />
        {/* <Route path="/verify" element={<VerifyEmail />} /> */}
        <Route path="/todolist" element={<TodoList />} />
        <Route path="/todolist" element={<TodoList />} />
        <Route path={adminRoutes.verifyEmail.fullpath} element={<VerifyUser />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
