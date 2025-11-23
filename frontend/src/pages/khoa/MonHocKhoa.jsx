import MonHocKhoa from "../../components/shared/MonHocManager";

const MonHoc = () => {
  const token = localStorage.getItem("token");

  return (
    <div className="admin-dashboard">
      <MonHocKhoa role="phongdaotao" token={token} />
     
    </div>
  );
};

export default MonHoc;
