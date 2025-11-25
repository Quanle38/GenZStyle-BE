import transporter from "../config/email";

export class EmailService {
    async sendMail(to :string, subject : string, html : string){
        try {
            const info = await transporter.sendMail({
                from : process.env.EMAIL_USER,
                to,
                subject,
                html,
            });
            console.log("email" ,info.messageId);
            return true;
        } catch(err){
            console.error("Email",err);
            return false;
        }
    }
}
