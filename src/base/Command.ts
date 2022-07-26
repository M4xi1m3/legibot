/**
 * Copyright © 2022 Maxime Friess <M4x1me@pm.me>
 * 
 * This file is part of LegiBot.
 * 
 * LegiBot is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * LegiBot is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with LegiBot.  If not, see <https://www.gnu.org/licenses/>.
 */

import { APIApplicationCommandOption } from "discord-api-types/v9";
import { CommandInteraction } from "discord.js";
import { I18nKey } from "../utils/I18n";

export class Command {
    protected constructor() {
        if (this.constructor === Command) {
            throw new TypeError('Abstract class "Command" cannot be instantiated directly');
        }
    }

    getName(): string {
        throw new TypeError('Abstract method "getName" of class "Command" cannot be used directly');
    }

    getI18nName(): I18nKey {
        return `command.${this.getName()}.name`;
    }

    getI18nDescription(): I18nKey {
        return `command.${this.getName()}.description`;
    }

    getOptions(): APIApplicationCommandOption[] {
        return [];
    }

    getConfigs(): string[] {
        return [];
    }

    isReservedToGod(): boolean {
        return false;
    }

    isDevCommand(): boolean {
        return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(interaction: CommandInteraction): Promise<void> {
        throw new TypeError('Abstract method "execute" of class "Command" cannot be used directly');
    }
}
