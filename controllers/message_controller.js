const Message = require("../models/message_model");

const getMessageList = async (req, res) => {
  try {
    const userId = req.query.userId;
    const response = await Message.getMessageList(userId);
    const notice = response.reduce(
      (prev, curr) => prev & curr.notice_status,
      1
    );
    response.map((item) => {
      item.timestamp = item.timestamp.toString().slice(4, 25);
    });
    const data = {
      notice: notice,
      detail: response,
    };

    return res.status(200).send({ data: data });
  } catch (err) {
    console.log(err);
  }
};

const updateNoticeStatus = async (req, res) => {
  try {
    const userId = req.query.userId;
    const response = await Message.updateNoticeStatus(userId);
    return res.status(200).send({ data: "update notice status" });
  } catch (err) {
    console.log(err);
  }
};
module.exports = {
  getMessageList,
  updateNoticeStatus,
};
