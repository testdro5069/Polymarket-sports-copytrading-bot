import axios from "axios";
import { logger } from "../../utils/logger";

export async function sendDiscord(webhookUrl: string, content: string): Promise<void> {
  if (!webhookUrl) return;
  try {
    await axios.post(webhookUrl, { content });
  } catch (e) {
    logger.warn({ err: e }, "discord");
  }
}
