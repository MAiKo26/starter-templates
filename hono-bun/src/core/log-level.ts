const LOG_LEVEL_MAP: Record<string, string> = {
  DEBUG: "debug",
  INFO: "info",
  WARNING: "warn",
  ERROR: "error",
  CRITICAL: "fatal",
};

export function envLogLevelToPino(level: string): string {
  return LOG_LEVEL_MAP[level.toUpperCase()] ?? "info";
}

export function resolveLogLevel(level: string): string {
  return envLogLevelToPino(level);
}
