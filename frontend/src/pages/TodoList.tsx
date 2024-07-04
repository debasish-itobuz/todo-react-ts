import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import List from "../components/List";
import { UserProvider } from "../components/UserContext";

export default function TodoList() {
  return (
    <>
      <UserProvider>
        <Header />
        <List />
        <Footer />
      </UserProvider>
    </>
  );
}
