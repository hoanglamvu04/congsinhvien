import React from "react";
import MonHocManager from "../../components/shared/MonHocManager";

const MonHoc = () => {
  const token = localStorage.getItem("token");

  return (
    <div className="admin-dashboard">
      <MonHocManager role="phongdaotao" token={token} />
     
    </div>
  );
};

export default MonHoc;
