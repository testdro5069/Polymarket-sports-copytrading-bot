import pino from "pino";
import { getAppEnv } from "../config/environment";

const env = getAppEnv();
const level = env === "production" ? "info" : "debug";
const usePretty =
  env === "development" && String(process.env.PRETTY_LOGS || "true").toLowerCase() !== "false";

export const logger = usePretty
  ? pino({
      level,
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          colorizeObjects: true,
          translateTime: "HH:MM:ss.l",
          ignore: "pid,hostname",
          singleLine: false
        }
      }
    })
  : pino({
      level,
      base: undefined,
      timestamp: pino.stdTimeFunctions.isoTime
    });
