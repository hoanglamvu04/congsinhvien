// ===============================
// 🎓 gradeUtils.js
// Chuẩn quy đổi điểm học phần và xếp loại học lực
// ===============================

/**
 * Quy đổi điểm hệ 10 sang hệ 4, điểm chữ, và xếp loại môn
 * @param {number} diem - Điểm hệ 10 (0–10)
 * @returns {{he4: number, chu: string, xepLoai: string}}
 */
export function quyDoiDiem(diem) {
  const g = parseFloat(diem);
  if (isNaN(g)) return { he4: 0, chu: "F", xepLoai: "Kém / Không đạt" };

  if (g >= 9.0) return { he4: 4.0, chu: "A+", xepLoai: "Xuất sắc" };
  if (g >= 8.5) return { he4: 3.7, chu: "A", xepLoai: "Giỏi" };
  if (g >= 8.0) return { he4: 3.5, chu: "B+", xepLoai: "Giỏi" };
  if (g >= 7.0) return { he4: 3.0, chu: "B", xepLoai: "Khá" };
  if (g >= 6.5) return { he4: 2.5, chu: "C+", xepLoai: "Trung bình" };
  if (g >= 5.5) return { he4: 2.0, chu: "C", xepLoai: "Trung bình" };
  if (g >= 5.0) return { he4: 1.5, chu: "D+", xepLoai: "Yếu" };
  if (g >= 4.0) return { he4: 1.0, chu: "D", xepLoai: "Yếu" };
  return { he4: 0.0, chu: "F", xepLoai: "Kém / Không đạt" };
}

/**
 * Xếp loại học lực tổng kết theo GPA hệ 4 (chuẩn Bộ GD&ĐT)
 * @param {number} gpa4 - GPA hệ 4
 * @returns {string} - Xếp loại học lực toàn khóa
 */
export function xepLoaiHocLuc(gpa4) {
  const g = parseFloat(gpa4);
  if (g >= 3.6) return "Xuất sắc";
  if (g >= 3.2) return "Giỏi";
  if (g >= 2.5) return "Khá";
  if (g >= 2.0) return "Trung bình";
  if (g >= 1.0) return "Yếu";
  return "Kém";
}
