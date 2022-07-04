/**
 * Copyright © 2022 Maxime Friess <M4x1me@pm.me>
 * 
 * This file is part of AN-BOT.
 * 
 * AN-BOT is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * AN-BOT is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with AN-BOT. If not, see <https://www.gnu.org/licenses/>.
 */

import process from "process";

/**
 * Logger, used to log things.
 */
class Log {
    /**
     * Name of the logger
     */
    private name: string;

    /**
     * Construct a new logger
     * 
     * @param {string} name Name of the logger
     */
    public constructor(name: string) {
        this.name = name;
    }

    /**
     * Get the name of the logger
     * @returns Name of the logger
     */
    public getName(): string {
        return this.name;
    }

    /**
     * Writes.
     * 
     * @param {string} string String to write
     * @param {string} prefix Prefix
     * @param {(message: string) => void} logfnc Function to call to write
     */
    private write(string: string, prefix: string, logfnc: (message: string) => void): void {
        const date = new Date().toISOString();
        const pref = "[" + date + "][" + this.name + "][" + prefix + "] ";

        for (let line of string.toString().split('\n')) {
            logfnc(pref + line);
        }
    }

    public info(message: string): void {
        this.write(message, "INFO", console.info);
    }

    public warn(message: string): void {
        this.write(message, "WARN", console.warn);
    }

    public error(message: string, error: Error): void {
        this.write(message, "ERR!", console.error);
        if (error !== undefined && error.stack !== undefined)
            this.write(error.stack, "ERR!", console.error);
    }

    public fatal(message: string, error: Error, code: number): void {
        this.write(message, "FTAL", console.error);
        if (error !== undefined && error.stack !== undefined)
            this.write(error.stack, "FTAL", console.error);
        process.exit(code !== undefined ? code : -1);
    }
}

class Loggers {
    private loggers: { [name: string]: Log };

    constructor() {
        this.loggers = {};
    }

    getLogger(name: string): Log {
        if (!(name in this.loggers)) {
            this.loggers[name] = new Log(name);
        }

        return this.loggers[name];
    }
}

export const Logger = new Loggers();
