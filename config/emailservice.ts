import nodemailer from "nodemailer";
require("dotenv").config();
import SMTPTransport from "nodemailer/lib/smtp-transport";

export const sendEmail = async (to: string, subject: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 25,
    service: "gmail",
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  } as SMTPTransport.Options);

  await transporter.sendMail(
    {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    },
    (error) => {
      if (error) {
        console.error("Error sending email:", error);
        console.error("Email details:", { to, subject, html });
        console.error("Environment variables:", {
          EMAIL_USER: process.env.EMAIL_USER,
          EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
        });
      } else {
        console.log("Email sent successfully to:", to);
      }
    }
  );
};

export const EmailWithButton = (
  title: string,
  schoolName: string,
  buttonLink: string,
  description: string,
  buttonText: string
): string => `
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>${title}</title>
    <style>
      body {
        font-family: "Nunito", sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        background: #ffffff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
      }
      .header {
        text-align: center;
      }
      .header img {
        max-width: 150px;
      }
      .content {
        text-align: left;
        padding: 20px;
      }
      .content h2 {
        color: #4b0081;
      }
      .content p {
        color: #666;
        font-size: 16px;
      }
      .btn {
        display: inline-block;
        padding: 12px 20px;
        background-color: #4b0081;
        color: #ffffff;
        text-decoration: none;
        border-radius: 5px;
        font-size: 16px;
        margin-top: 15px;
      }
      .footer {
        text-align: center;
        padding: 15px;
        font-size: 14px;
        color: #888;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="./companyLogo.jpg" alt="Elsoft Logo" title="Elsoft Logo" />
      </div>
      <div class="content">
        <h2 title="Title">${title}</h2>
        <p>Dear ${schoolName},</p>
        <p title="Description">
          ${description}
        </p>
        <a href="${buttonLink}" class="btn">${buttonText}</a>
      </div>
      <div class="footer">&copy; Elsoft | All Rights Reserved</div>
    </div>
  </body>
</html>
`;

export const EmailWithoutButton = (
  title: string,
  schoolName: string,
  description: string
): string => `
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>${title}</title>
    <style>
      body {
        font-family: "Nunito", sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        background: #ffffff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
      }
      .header {
        text-align: center;
      }
      .header img {
        max-width: 150px;
      }
      .content {
        text-align: left;
        padding: 20px;
      }
      .content h2 {
        color: #4b0081;
      }
      .content p {
        color: #666;
        font-size: 16px;
      }
      .btn {
        display: inline-block;
        padding: 12px 20px;
        background-color: #4b0081;
        color: #ffffff;
        text-decoration: none;
        border-radius: 5px;
        font-size: 16px;
        margin-top: 15px;
      }
      .footer {
        text-align: center;
        padding: 15px;
        font-size: 14px;
        color: #888;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="./companyLogo.jpg" alt="Elsoft Logo" title="Elsoft Logo" />
      </div>
      <div class="content">
        <h2 title="Title">${title}</h2>
        <p>Dear ${schoolName},</p>
        <p title="Description">
          ${description}
        </p>
      </div>
      <div class="footer">&copy; Elsoft | All Rights Reserved</div>
    </div>
  </body>
</html>
`;
