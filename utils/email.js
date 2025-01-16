const nodemailer = require('nodemailer');
const catchAsync = require('./catchAsync');

const sendEmail = async (options) => {
  // 1) crating transporter
  const transporter = nodemailer.createTransport({
    // service: 'Gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
    dkim: {
      domainName: 'jainsarwang.me',
      keySelector: '1024',
      privateKey:
        '-----BEGIN RSA PRIVATE KEY-----MIICXQIBAAKBgQDBJdMn4+ytDYNqbedfmnUQI+KQnaBjlY8dQZpY1ZxjjFtzhpB5zMPWo4m4dbwelHx8buOt6CdcC8YMavkPMv6zxHoQIwQrKSjUqvmzL2YQ+KfBzWDEayhX42c7957NSCLcOOpIE4A6QJdXDEc1Rj1xYpruU51jDmd6KMmkNP8Z7QIDAQABAoGBAJvUs58McihQrcVRdIoaqPXjrei1c/DEepnFEw03EpzyYdo8KBZM0Xg7q2KKgsM9U45lPQZTNmY6DYh5SgYsQ3dGvocvwndq+wK+QsWH8ngTYqYqwUBBCaX3kwgknAc++EpRRVmV0dJMdXt3xAUKSXnDP9fLPdKXffJoG7C1HHVVAkEA+087rR2FLCjdRq/9WhIT/p2U0RRQnMJyQ74chIJSbeyXg8Ell5QxhSg7skrHSZ0cBPhyaLNDIZkn3NMnK2UqhwJBAMTAsUorHNo4dGpO8y2HE6QXxeuX05OhjiO8H2hmmcuMi2C9OwGIrI+lx1Q8mK261NKJh7sSVwQikh5YQYLKcOsCQQD6YqcChDb7GHvewdmatAhX1ok/Bw6KIPHXrMKdA3s9KkyLaRUbQPtVwBA6Q2brYS1Zhm/3ASQRhZbB3V9ZTSJhAkB772097P5Vr24VcPnZWdbTbG4twwtxWTix5dRa7RY/k55QJ6K9ipw4OBLhSvJZrPBWVm97NUg+wJAOMUXC30ZVAkA6pDgLbxVqkCnNgh2eNzhxQtvEGE4a8yFSUfSktS9UbjAATRYXNv2mAms32aAVKTzgSTapEX9M1OWdk+/yJrJs-----END RSA PRIVATE KEY-----',
    },
    // logger: true,
    // debug: true,
  });

  // 2) email options
  const mailOptions = {
    from: 'Admin <jainsarwang@jainsarwang.me>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html :
  };

  // 3) send mail
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
