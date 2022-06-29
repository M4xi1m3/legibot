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
 * along with AN-BOT.  If not, see <https://www.gnu.org/licenses/>.
 */

import process from "process";

/**
 * Logger, used to log things.
 */
class Logger {
    /**
     * Construct a new logger
     * 
     * @param {string} name Name of the logger
     */
    constructor(name) {
        this.__name = name;
    }

    /**
     * Get the name of the logger
     * @returns Name of the logger
     */
    getName() {
        return this.__name;
    }

    /**
     * Writes.
     * 
     * @param {string} string String to write
     * @param {string} prefix Prefix
     * @param {function} logfnc Function to call to write
     */
    __write(string, prefix, logfnc) {
        const date = new Date().toISOString();
        const pref = "[" + date + "][" + this.__name + "][" + prefix + "] ";

        for (let line of string.toString().split('\n')) {
            logfnc(pref + line);
        }
    }

    info(message) {
        this.__write(message, "INFO", console.info);
    }

    warn(message) {
        this.__write(message, "WARN", console.warn);
    }

    error(message, error) {
        this.__write(message, "ERR!", console.error);
        if (error !== undefined)
            this.__write(error.stack, "ERR!", console.error);
    }

    fatal(message, error, code) {
        this.__write(message, "FTAL", console.error);
        if (error !== undefined)
            this.__write(error.stack, "FTAL", console.error);
        process.exit(code !== undefined ? code : -1);
    }
}

class Loggers {
    constructor() {
        this.__loggers = {};
    }

    getLogger(name) {
        if (!(name in this.__loggers)) {
            this.__loggers[name] = new Logger(name);
        }

        return this.__loggers[name];
    }
}

const loggers = new Loggers();
export default loggers;
