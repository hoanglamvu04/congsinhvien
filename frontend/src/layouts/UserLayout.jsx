// src/layouts/UserLayout.jsx
import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom"; // 🧩 thêm dòng này

const UserLayout = () => {
  return (
    <>
      <Header />
      <main style={{ padding: "20px", minHeight: "80vh" }}>
        <Outlet /> {/* 🧩 chỗ này là nơi hiển thị các trang con */}
      </main>
      <Footer />
    </>
  );
};

export default UserLayout;
