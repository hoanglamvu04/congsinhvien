// src/layouts/UserLayout.jsx
import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom"; // 🧩 thêm dòng này
import ScrollToTopButton from "../components/ScrollToTopButton";

const UserLayout = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet /> {/* 🧩 chỗ này là nơi hiển thị các trang con */}
      </main>
      <Footer />
      <ScrollToTopButton />

    </>
  );
};

export default UserLayout;
