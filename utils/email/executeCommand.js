import nodemailer from "nodemailer";
import { user } from "./user.js";

export async function executeCommand(
    recipient,
    subject,
    body
) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: user.email,
            pass: user.password,
        },
    });

    var mailOptions = {
        from: user.email,
        to: recipient,
        subject: subject,
        text: body
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

}
