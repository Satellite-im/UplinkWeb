import { createPersistentState } from "$lib/state"
import { get, type Writable } from "svelte/store"

export enum LogLevel {
    Info = "INFO",
    Developer = "DEV",
    Debug = "DEBUG",
    Warning = "WARN",
    Error = "ERROR",
}

export type LogItem = {
    timestamp: number
    level: LogLevel
    message: string
}

export type LoggerSettings = {
    relay_to_js_console: boolean
    level: LogLevel
}

export class Logger {
    log: LogItem[]
    settings: Writable<LoggerSettings>

    constructor(settings: LoggerSettings) {
        this.settings = createPersistentState("uplink.settings.developer", settings)
        this.log = []
    }

    write(level: LogLevel, message: string) {
        let settings = get(this.settings)
        if (Object.values(LogLevel).indexOf(level) < Object.values(LogLevel).indexOf(settings.level)) return
        this.log.push({
            timestamp: Date.now(),
            level,
            message,
        })

        if (settings.relay_to_js_console) {
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

export let log = new Logger({ relay_to_js_console: true, level: LogLevel.Info })
