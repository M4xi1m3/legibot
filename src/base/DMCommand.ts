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

import { Message } from "discord.js";

export class DMCommand {
    constructor() {
        if (this.constructor === DMCommand) {
            throw new TypeError('Abstract class "DMCommand" cannot be instantiated directly');
        }
    }

    getName(): string {
        throw new TypeError('Abstract method "getName" of class "DMCommand" cannot be used directly');
    }

    getUsage(): string {
        return this.getName();
    }

    getDescription(): string {
        throw new TypeError('Abstract method "getDescription" of class "DMCommand" cannot be used directly');
    }

    getArgumentsRegex(): string {
        return "";
    }

    async execute(message: Message, content: string, args: string[]): Promise<void> {
        throw new TypeError('Abstract method "execute" of class "DMCommand" cannot be used directly');
    }

    getConfigs(): string[] {
        return [];
    }

    isReservedToGod(): boolean {
        return true;
    }

    isDevCommand(): boolean {
        return false;
    }

    getCommandRegex(): RegExp {
        const ar = this.getArgumentsRegex();
        return new RegExp("^" + this.getName() + (ar !== "" ? " " + ar : "") + "$");
    }
}
