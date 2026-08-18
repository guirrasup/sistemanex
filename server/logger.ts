// Structured Logger for NEX Production Backend Engine

export interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  context?: Record<string, any>;
  correlationId?: string;
}

export const logger = {
  info(message: string, context?: Record<string, any>) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "info",
      message,
      ...context
    }));
  },
  warn(message: string, context?: Record<string, any>) {
    console.warn(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "warn",
      message,
      ...context
    }));
  },
  error(message: string, context?: Record<string, any>) {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "error",
      message,
      ...context
    }));
  },
  debug(message: string, context?: Record<string, any>) {
    if (process.env.NODE_ENV !== "production") {
      console.debug(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "debug",
        message,
        ...context
      }));
    }
  }
};
