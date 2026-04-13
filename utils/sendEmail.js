import { Resend } from "resend";
import { env } from "../config/env.js";

const resend = new Resend(env.RESEND_API_KEY);

export const sendEmail = async({ subject, html}) => {
    try{
        const response = await resend.emails.send({
            from: env.EMAIL_FROM,
            to: env.EMAIL_USER,
            subject,
            html,
        });

        console.log("Email sent", response);
        return true;
    } catch(error){
        console.error("Resend error:", error);
        throw new Error("Email failed to send");
    }
};