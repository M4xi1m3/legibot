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

export class ActivityClearDMCommand extends DMCommand {
    constructor() {
        super();
    }

    getName() {
        return "activity clear";
    }

    getDescription() {
        return "Efface l'activité du LegiBot.";
    }

    getArgumentsRegex() {
        return "";
    }

    async execute(message: Message) {
        message.client?.user?.setPresence({ activities: [] });
        message.reply({ content: "Activité effacé." });
    }
}
