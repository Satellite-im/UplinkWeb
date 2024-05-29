export enum LogLevel {
    Info = "INFO",
    Developer = "DEV",
    Debug = "DEBUG",
    Warning = "WARN",
    Error = "ERROR"
}

export type LogItem = {
    timestamp: number,
    level: LogLevel,
    message: string
}

export type LoggerSettings = {
    relay_to_js_console: boolean,
}

export class Logger {
    log: LogItem[]
    settings: LoggerSettings

    constructor(settings: LoggerSettings) {
        this.settings = settings
        this.log = []
    }

    write(level: LogLevel, message: string) {
        this.log.push({
            timestamp: Date.now(),
            level,
            message
        })

        if (this.settings.relay_to_js_console) {
            console.log(`[${level.toString()}] (${new Date().toLocaleTimeString()}): `, message)
        }
    }

    info(message: string) {
        this.write(LogLevel.Info, message)
    }

    dev(message: string) {
        this.write(LogLevel.Developer, message)
    }

    debug(message: string) {
        this.write(LogLevel.Debug, message)
    }

    warn(message: string) {
        this.write(LogLevel.Warning, message)
    }

    error(message: string) {
        this.write(LogLevel.Error, message)
    }
}