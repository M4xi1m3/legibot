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

import DMCommand from "../DMCommand.js";
import Audio from "../utils/Audio.js";
import Messages from "../utils/Messages.js";

class AudioConnectionsDMCommand extends DMCommand {
    constructor() {
        super();
    }

    getName() {
        return "audio connections";
    }

    getDescription() {
        return "Liste les serveurs auxquels est connecté le bot.";
    }

    getArgumentsRegex() {
        return "";
    }

    async execute(message, content, args) {
        let msg = "**Serveurs:**\n";
        for (const id in Audio.__connections) {
            msg += " - " + id + "\n";
        }
        Messages.sendSplittedReply(message, msg);
    }
}

export default AudioConnectionsDMCommand;