import { exec } from "child_process";
import tmp from "tmp";
import fs from "fs";
import nodemailer from "nodemailer";

export async function executeCommand(
    sender,
    password,
    recipient,
    subject,
    body
) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: sender,
            pass: password,
        },
    });

    var mailOptions = {
        from: sender,
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
