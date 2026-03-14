import nodemailer from "nodemailer"

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


transporter.verify((error, success) => {
  if (error) {
    console.log("Mail server connection error:", error);
  } else {
    console.log("Mail server is ready to send messages");
  }
});

