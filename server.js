const nodemailer = require("nodemailer");

let mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "tmdbclone@gmail.com",
    pass: "shlbakqhkfsxkwwd",
  },
});

let mailDetails = {
  from: "tmdbclone@gmail.com",
  to: "tmdbclone@gmail.com",
  subject: "Test mail",
  text: "Node.js testing mail for GeeksforGeeks",
};

mailTransporter.sendMail(mailDetails, function (err, data) {
  if (err) {
    console.log("Error Occurs", err);
  } else {
    console.log("Email sent successfully");
  }
});
