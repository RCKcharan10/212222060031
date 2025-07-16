interface LogParams {
  stack: "backend" | "frontend"
  level: "debug" | "info" | "warn" | "error" | "fatal"
  package: string
  message: string
}

interface LogResponse {
  logID: string
  message: string
}

class Logger {
  private static instance: Logger
  private authToken: string | null = null

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  setAuthToken(token: string) {
    this.authToken = token
  }

  async log(
    stack: LogParams["stack"],
    level: LogParams["level"],
    packageName: LogParams["package"],
    message: string,
  ): Promise<void> {
    try {
      const response = await fetch("http://20.244.56.144/evaluation-service/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.authToken}`,
        },
        body: JSON.stringify({
          stack,
          level,
          package: packageName,
          message,
        }),
      })

      if (!response.ok) {
        this.logToLocalStorage(stack, level, packageName, message)
      }
    } catch (error) {
      this.logToLocalStorage(stack, level, packageName, message)
    }
  }

  private logToLocalStorage(stack: string, level: string, packageName: string, message: string) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      stack,
      level,
      package: packageName,
      message,
    }

    const logs = JSON.parse(localStorage.getItem("app_logs") || "[]")
    logs.push(logEntry)
    localStorage.setItem("app_logs", JSON.stringify(logs))
  }
}

export const Log = (
  stack: LogParams["stack"],
  level: LogParams["level"],
  packageName: LogParams["package"],
  message: string,
) => {
  const logger = Logger.getInstance()
  logger.log(stack, level, packageName, message)
}

export default Logger
