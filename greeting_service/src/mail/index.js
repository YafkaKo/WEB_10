import nodemailer from 'nodemailer';
import mailConfig from '../config/mailConfig.js';

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport(mailConfig);
  }

  async sendWelcomeEmail(userData) {
    try {
      const { email, username } = userData;

      await this.transporter.sendMail({
        from: mailConfig.from,
        to: email,
        subject: 'Добро пожаловать!',
        html: `
          <h1>Добро пожаловать, ${username}!</h1>
          <p>Спасибо за регистрацию в нашем сервисе.</p>
        `
      });
    } catch (error) {
      console.error('Ошибка отправки письма:', error);
      throw error;
    }
  }
}

export default new MailService();