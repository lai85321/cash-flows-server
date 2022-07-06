const { S3 } = require("aws-sdk");
require("dotenv").config();

exports.s3Upload = async (id, file) => {
  const s3 = new S3();

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `cash_flows/user/${id}/${file.originalname}`,
    Body: file.buffer,
  };

  return await s3.upload(params).promise();
};
