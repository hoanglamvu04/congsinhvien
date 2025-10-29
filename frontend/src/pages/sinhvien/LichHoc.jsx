import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  FaCalendarAlt,
  FaFileExcel,
  FaFilePdf,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  eachWeekOfInterval,
} from "date-fns";
import { vi } from "date-fns/locale";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import pdfMake from "../../utils/pdfFonts";

import "../../styles/LichHoc.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const tietToCa = (tietBatDau) => {
  if (tietBatDau <= 5) return "Sáng";
  if (tietBatDau <= 10) return "Chiều";
  return "Tối";
};

const LichHoc = () => {
  const [tab, setTab] = useState("tuan"); // "hocKy" | "tuan"
  const [lichHoc, setLichHoc] = useState([]);
  const [hocKyList, setHocKyList] = useState([]);
  const [hocKy, setHocKy] = useState("tatca");
  const [monList, setMonList] = useState([]);
  const [mon, setMon] = useState("tatca");
  const [weekList, setWeekList] = useState([]);
  const [tuan, setTuan] = useState(null);
  const token = localStorage.getItem("token");

  // 📘 Lấy dữ liệu lịch học
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/thoi-khoa-bieu/sinhvien`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data.data || [];
        setLichHoc(data);

        const ky = [...new Set(data.map((d) => d.hoc_ky).filter(Boolean))];
        const mon = [...new Set(data.map((d) => d.ten_mon).filter(Boolean))];
        setHocKyList(ky);
        setMonList(mon);

        if (data.length > 0) {
          const minDate = new Date(Math.min(...data.map((i) => new Date(i.ngay_hoc))));
          const maxDate = new Date(Math.max(...data.map((i) => new Date(i.ngay_hoc))));
          const weeks = eachWeekOfInterval({ start: minDate, end: maxDate }, { weekStartsOn: 1 });
          const list = weeks.map((start, idx) => {
            const end = endOfWeek(start, { weekStartsOn: 1 });
            return {
              label: `Tuần ${idx + 1} (${format(start, "dd/MM")} - ${format(end, "dd/MM")})`,
              start,
              end,
            };
          });
          setWeekList(list);
          setTuan(list[0]);
        }
      } catch (err) {
        console.error(err);
        toast.error("❌ Không thể tải thời khóa biểu!");
      }
    };
    fetchData();
  }, [token]);

  // 🧮 Lọc dữ liệu theo học kỳ và môn
  const filtered = useMemo(() => {
    let data = lichHoc;
    if (hocKy !== "tatca") data = data.filter((i) => i.hoc_ky === hocKy);
    if (mon !== "tatca") data = data.filter((i) => i.ten_mon === mon);
    if (tab === "tuan" && tuan) {
      data = data.filter((i) => {
        const d = new Date(i.ngay_hoc);
        return d >= tuan.start && d <= tuan.end;
      });
    }
    return data;
  }, [lichHoc, hocKy, mon, tuan, tab]);

  // 🧭 Điều hướng tuần
  const prevWeek = () => {
    const idx = weekList.findIndex((w) => w.start.getTime() === tuan.start.getTime());
    if (idx > 0) setTuan(weekList[idx - 1]);
  };
  const nextWeek = () => {
    const idx = weekList.findIndex((w) => w.start.getTime() === tuan.start.getTime());
    if (idx < weekList.length - 1) setTuan(weekList[idx + 1]);
  };

  // 🧾 Xuất Excel / PDF
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filtered.map((i) => ({
        "Ngày học": format(new Date(i.ngay_hoc), "dd/MM/yyyy"),
        "Thứ": i.thu_trong_tuan,
        "Ca": tietToCa(i.tiet_bat_dau),
        "Môn học": i.ten_mon,
        "Giảng viên": i.ten_giang_vien,
        "Phòng": i.phong_hoc,
        "Lớp HP": i.ma_lop_hp,
        "Trạng thái": i.trang_thai,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "LichHoc");
    XLSX.writeFile(wb, "lich_hoc.xlsx");
  };
const exportPDF = () => {
  try {
    const tableBody = [
      [
        { text: "Ngày", bold: true },
        { text: "Thứ", bold: true },
        { text: "Ca", bold: true },
        { text: "Môn học", bold: true },
        { text: "Giảng viên", bold: true },
        { text: "Phòng", bold: true },
        { text: "Lớp HP", bold: true },
        { text: "Trạng thái", bold: true },
      ],
      ...filtered.map((i) => [
        format(new Date(i.ngay_hoc), "dd/MM/yyyy"),
        i.thu_trong_tuan,
        tietToCa(i.tiet_bat_dau),
        i.ten_mon,
        i.ten_giang_vien,
        i.phong_hoc,
        i.ma_lop_hp,
        i.trang_thai,
      ]),
    ];

    const docDefinition = {
      content: [
        { text: "LỊCH HỌC SINH VIÊN", style: "header" },
        {
          table: {
            headerRows: 1,
            widths: ["auto", "auto", "auto", "*", "*", "auto", "auto", "auto"],
            body: tableBody,
          },
          layout: "lightHorizontalLines",
        },
      ],
      styles: {
        header: {
          fontSize: 16,
          bold: true,
          alignment: "center",
          margin: [0, 0, 0, 10],
        },
      },
      defaultStyle: {
        font: "Roboto", // font mặc định pdfmake có sẵn
        fontSize: 11,
      },
    };

    pdfMake.createPdf(docDefinition).download("lich_hoc.pdf");
  } catch (err) {
    console.error("❌ Xuất PDF lỗi:", err);
    toast.error("Không thể xuất PDF!");
  }
};
  return (
    <div className="page-container">
      <ToastContainer position="top-center" autoClose={2000} />
      <h2 className="lichhoc-title">
        <FaCalendarAlt style={{ color: "#007bff", marginRight: 8 }} />
        Lịch học sinh viên
      </h2>

      {/* Tab chuyển đổi */}
      <div className="tab-switch">
        <button
          className={tab === "hocKy" ? "active" : ""}
          onClick={() => setTab("hocKy")}
        >
          LỊCH HỌC DỰ KIẾN THEO HỌC KỲ
        </button>
        <button className={tab === "tuan" ? "active" : ""} onClick={() => setTab("tuan")}>
          LỊCH HỌC ĐÃ DUYỆT THEO TUẦN
        </button>
      </div>

      {/* Bộ lọc */}
      <div className="filter-bar">
        <select value={hocKy} onChange={(e) => setHocKy(e.target.value)}>
          <option value="tatca">Tất cả học kỳ</option>
          {hocKyList.map((k, i) => (
            <option key={i} value={k}>
              Học kỳ {k}
            </option>
          ))}
        </select>
        <select value={mon} onChange={(e) => setMon(e.target.value)}>
          <option value="tatca">Tất cả môn học</option>
          {monList.map((m, i) => (
            <option key={i} value={m}>
              {m}
            </option>
          ))}
        </select>
        {tab === "tuan" && (
          <select
            value={tuan ? tuan.label : ""}
            onChange={(e) => {
              const week = weekList.find((w) => w.label === e.target.value);
              if (week) setTuan(week);
            }}
          >
            {weekList.map((w, idx) => (
              <option key={idx} value={w.label}>
                {w.label}
              </option>
            ))}
          </select>
        )}
        <button onClick={exportExcel}>
          <FaFileExcel style={{ color: "green", marginRight: 5 }} />
          Excel
        </button>
        <button onClick={exportPDF}>
          <FaFilePdf style={{ color: "red", marginRight: 5 }} />
          PDF
        </button>
      </div>

      {/* --- LỊCH HỌC THEO TUẦN (ma trận 3 ca) --- */}
      {tab === "tuan" ? (
        <div className="hocKy-container">
          <div className="week-nav">
            <button onClick={prevWeek}>
              <FaChevronLeft /> Tuần trước
            </button>
            <span className="week-label">{tuan?.label}</span>
            <button onClick={nextWeek}>
              Tuần sau <FaChevronRight />
            </button>
          </div>

          <table className="hocKy-matrix">
            <thead>
              <tr>
                <th></th>
                <th>Thứ 2</th>
                <th>Thứ 3</th>
                <th>Thứ 4</th>
                <th>Thứ 5</th>
                <th>Thứ 6</th>
                <th>Thứ 7</th>
                <th>CN</th>
              </tr>
            </thead>
            <tbody>
              {["Sáng", "Chiều", "Tối"].map((ca, idx) => (
                <tr key={idx}>
                  <td className={`ca-label ca-${ca.toLowerCase()}`}>{ca}</td>
                  {[2, 3, 4, 5, 6, 7, 8].map((thu, tIndex) => {
                    const buoi = filtered.filter(
                      (i) =>
                        i.thu_trong_tuan === thu &&
                        ca === (i.tiet_bat_dau <= 5
                          ? "Sáng"
                          : i.tiet_bat_dau <= 10
                            ? "Chiều"
                            : "Tối")
                    );
                    return (
                      <td key={tIndex} className={`hocKy-cell ca-${ca.toLowerCase()}`}>
                        {buoi.length > 0 ? (
                          buoi.map((b, j) => (
                            <div key={j} className="hocKy-item">
                              <strong>{b.ten_mon}</strong>
                              <span>Phòng: {b.phong_hoc || "—"}</span>
                              <div className="giangvien">GV: {b.ten_giang_vien || "—"}</div>
                              <div className="tiet">Tiết: {b.tiet_bat_dau} – {b.tiet_ket_thuc}</div>
                            </div>

                          ))
                        ) : (
                          <span className="no-class">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // --- LỊCH THEO HỌC KỲ (giữ nguyên bảng cũ) ---
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Ngày học</th>
              <th>Thứ</th>
              <th>Ca</th>
              <th>Môn học</th>
              <th>Giảng viên</th>
              <th>Phòng</th>
              <th>Lớp học phần</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: "center" }}>
                  ⚠️ Không có dữ liệu.
                </td>
              </tr>
            ) : (
              filtered.map((i, idx) => (
                <tr key={idx}>
                  <td>{format(new Date(i.ngay_hoc), "dd/MM/yyyy")}</td>
                  <td>Thứ {i.thu_trong_tuan}</td>
                  <td>{tietToCa(i.tiet_bat_dau)}</td>
                  <td>{i.ten_mon}</td>
                  <td>{i.ten_giang_vien}</td>
                  <td>{i.phong_hoc}</td>
                  <td>{i.ma_lop_hp}</td>
                  <td>{i.trang_thai}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LichHoc;
