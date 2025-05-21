
import 'dotenv/config'// config/mailConfig.js

export default {
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT, // Используйте 587 если 465 не работает
  secure: true, // true для 465 порта, false для других
  auth: {
    user: process.env.MAIL_USER, // Полный email-адрес
    pass: process.env.MAIL_PASSWORD // Пароль из шага 2
  },
  tls: {
    // Не рекомендуется отключать в production
    rejectUnauthorized: process.env.NODE_ENV !== 'production'
  },
  from: '"Yasha" yasha.korny@yandex.ru'
}