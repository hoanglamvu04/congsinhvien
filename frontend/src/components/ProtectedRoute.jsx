import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ user, allowedRoles = [], requiredPhong = null }) => {
  if (!user) return <Navigate to="/login" replace />;

  const hasRole =
    allowedRoles.length === 0 || allowedRoles.includes(user.role);

  const hasPhongOrKhoa =
    !requiredPhong ||
    user.role === "admin" ||
    user.ten_phong === requiredPhong ||
    user.ten_khoa === requiredPhong;

  if (!hasRole || !hasPhongOrKhoa)
    return <Navigate to="/" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
