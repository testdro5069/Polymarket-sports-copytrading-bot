import axios from "axios";
import { logger } from "../../utils/logger";

export async function sendTelegram(token: string, chatId: string, text: string): Promise<void> {
  if (!token || !chatId) return;
  try {
    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text,
      disable_web_page_preview: true
    });
  } catch (e) {
    logger.warn({ err: e }, "telegram");
  }
}
