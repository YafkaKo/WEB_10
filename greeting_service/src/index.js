import { AmpqProvider } from "./ampq/ampq.service.js";
import queueConfig from "./config/queue.js";
import MailService from "./mail/index.js";

await AmpqProvider.connect(queueConfig);

AmpqProvider.subscribeToEvent("greetings", async (userData) => {
  try {
    await MailService.sendWelcomeEmail(userData);
    console.log(`Приветственное письмо отправлено на ${userData.email}`);
  } catch (error) {
    console.error("Ошибка отправки письма:", error);
  }
});
