import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div>
      <Header />
      <section className="text-gray-600 body-font mt-20">
        <div className="container px-5 py-36 mx-auto">
          <div className="flex flex-col text-center w-full mb-20">
            <h1 className="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900">
              A better online to-do list app for work
            </h1>
            <p className="lg:w-2/3 mx-auto leading-relaxed text-base">
              makes it easier for a team to plan their work by using online
              to-do lists
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
