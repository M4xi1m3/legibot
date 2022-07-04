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

import { ExcludeEnum, Message } from "discord.js";
import { ActivityTypes } from "discord.js/typings/enums";
import { DMCommand } from "../base/DMCommand";

export class ActivityDMCommand extends DMCommand {
    constructor() {
        super();
    }

    getName() {
        return "activity set";
    }

    getDescription() {
        return "Modifie l'activité du AN-BOT.";
    }

    getArgumentsRegex() {
        return "(PLAYING|STREAMING|LISTENING|WATCHING|CUSTOM|COMPETING) (.+)";
    }

    getUsage() {
        return this.getName() + " <PLAYING|STREAMING|LISTENING|WATCHING|CUSTOM|COMPETING> <nom>"
    }

    async execute(message: Message, content: string, args: string[]) {
        message.client?.user?.setActivity(args[2], { type: args[1] as ExcludeEnum<typeof ActivityTypes, 'CUSTOM'> });
        message.reply({ content: "Activité modifié en `" + args[1] + " " + args[2] + "`." });
    }
}
