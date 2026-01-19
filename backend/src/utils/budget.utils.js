const pool = require("../config/db");

exports.updateSpentAmount = async (client, userId, categoryId, date) => {
  // Tạo một đối tượng Date từ biến 'date' và lấy tháng và năm
  const month = new Date(date).getMonth() + 1; // Lấy tháng từ date (tháng trong JavaScript bắt đầu từ 0, nên cộng thêm 1)
  const year = new Date(date).getFullYear(); // Lấy năm từ date

  // Thực hiện truy vấn cập nhật số tiền đã chi cho user và category cụ thể
  await client.query(
    `
    UPDATE budgets
    SET spent_amount = COALESCE((
      -- Truy vấn con: tính tổng tiền chi (amount) của các transactions
      SELECT SUM(amount) 
      FROM transactions
      WHERE user_id = $1           -- Lọc theo userId
        AND category_id = $2       -- Lọc theo categoryId
        AND type = 'expense'       -- Chỉ tính các giao dịch chi tiêu (expense)
        AND EXTRACT(MONTH FROM date) = $3  -- Lọc theo tháng từ date của giao dịch
        AND EXTRACT(YEAR FROM date) = $4   -- Lọc theo năm từ date của giao dịch
    ), 0) -- Nếu không có giao dịch nào, đặt spent_amount = 0
    WHERE user_id = $1               -- Cập nhật cho đúng user
      AND category_id = $2           -- Cập nhật cho đúng category
      AND month = $3                 -- Cập nhật cho đúng tháng
      AND year = $4                  -- Cập nhật cho đúng năm
    `,
    [userId, categoryId, month, year] // Truyền các tham số vào query
  );
};
