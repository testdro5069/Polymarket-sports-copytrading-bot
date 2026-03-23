import { logger } from "../../utils/logger";

export async function sendSmtpUrl(_smtpUrl: string, _subject: string, _body: string): Promise<void> {
  logger.debug("email stub");
}
