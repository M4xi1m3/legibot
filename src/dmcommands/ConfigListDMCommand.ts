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

import { Message, MessageEmbed } from "discord.js";
import { DMCommand } from "../base/DMCommand";
import { SoftConfig } from "../config/SoftConfig";

export class ConfigListDMCommand extends DMCommand {
    constructor() {
        super();
    }

    getName() {
        return "config list";
    }

    getDescription() {
        return "List les clés de configuration.";
    }

    getArgumentsRegex() {
        return "";
    }

    async execute(message: Message) {
        const embed = new MessageEmbed()
            .setColor(SoftConfig.get("bot.color", "#fb963a"))
            .setTitle("Options de configuration")
            .setDescription(SoftConfig.getConfigs().map((e) => "`" + e + "`").join("\n"));

        message.reply({ embeds: [embed] });
    }
}