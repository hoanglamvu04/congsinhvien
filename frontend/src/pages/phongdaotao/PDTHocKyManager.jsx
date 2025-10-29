import React from "react";
import KhoaHocManager from "../../components/shared/KhoaHocManager";

const HocKyKhoaHoc = () => {
  const token = localStorage.getItem("token");

  return (
    <div className="admin-dashboard">
      <KhoaHocManager role="phongdaotao" token={token} />
     
    </div>
  );
};

export default HocKyKhoaHoc;
