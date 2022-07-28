const pool = require("../database");

const getMessageList = async (userId) => {
  const [result] = await pool.query(
    `SELECT a.name as paid_name, b.name as settle_name, message.amount, book.name as book, convert_tz(message.timestamp,'+00:00','+08:00') as timestamp, message.read_status, message.notice_status FROM cash_flows.message 
    LEFT JOIN cash_flows.user a ON message.paid_user_id=a.id 
    LEFT JOIN cash_flows.user b ON message.settle_user_id = b.id
    LEFT JOIN cash_flows.book ON message.book_id = book.id
    WHERE message.user_id = ? ORDER BY timestamp DESC`,
    [userId]
  );
  return result;
};
const updateNoticeStatus = async (userId) => {
  const [result] = await pool.query(
    `UPDATE message SET message.notice_status = 1
    WHERE message.user_id = ?`,
    [userId]
  );
  return result;
};

module.exports = {
  getMessageList,
  updateNoticeStatus,
};
