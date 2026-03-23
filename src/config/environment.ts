export type AppEnv = "development" | "production" | "test";

export function getAppEnv(): AppEnv {
  const v = (process.env.NODE_ENV || "development").toLowerCase();
  if (v === "production") return "production";
  if (v === "test") return "test";
  return "development";
}

export function isDryRun(): boolean {
  return String(process.env.DRY_RUN || "false").toLowerCase() === "true";
}
