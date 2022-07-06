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

import { Message } from "discord.js";
import { DMCommand } from "../base/DMCommand";
import { Audio } from "../utils/Audio";

export class AudioCleanDMCommand extends DMCommand {
    constructor() {
        super();
    }

    getName() {
        return "audio clean";
    }

    getDescription() {
        return "Nettoie les streams audio non connectés à des voiceconnections.";
    }

    getArgumentsRegex() {
        return "";
    }

    async execute(message: Message) {
        Audio.clean();
        message.reply({ content: "Audio garbage-collecté." });
    }
}
