const nodemailer = require('nodemailer')

class MailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        })
    }


    async sendActivationLink(link, to) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: 'Confirm registration',
            text: '',
            html: 
                `
                <div style="background-color: #112535; padding: 20px; border-radius: 12px; margin: 0 auto; text-align: center;">
                        <h1 style="text-align: center; color: white;">mind_mesh/</h1>
                        <br>
                        <h2 style="color: white;">Thanks for signing up! You must follow this link to activate your account</h2> <br>
                        <p style="text-align: center;">
                        <a href="${link}" style="text-decoration: none;">${link}</a>
                    </p>
                        <br>
                </div>
                `
        })
    }

    async sendResetLink(link, to) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: 'Confirm registration',
            text: '',
            html: 
                `
                <div style="background-color: #2CAAD8; padding: 20px; border-radius: 12px; margin: 0 auto; text-align: center;">
                        <h1 style="text-align: center; color: white;">DEV_ASK</h1>
                        <br>
                        <h2 style="color: white;">Dear user, here is your reset-password link,</h2> <br>
                        <p style="text-align: center;">
                        <a href="${link}" style="text-decoration: none;">${link}</a>
                    </p>
                        <br>
                </div>
                `
        })
    }
}

module.exports = new MailService();