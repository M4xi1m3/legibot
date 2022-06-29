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

import { MessageEmbed } from 'discord.js';
import Bot from '../Bot.js';
import SoftConfig from '../config/SoftConfig.js';
import DMCommand from "../DMCommand.js";

class ConfigListDMCommand extends DMCommand {
    constructor() {
        super();
    }

    getName() {
        return "help";
    }

    getDescription() {
        return "Liste les dmcommands du AN-BOT.";
    }

    getArgumentsRegex() {
        return "";
    }

    async execute(message, content, args) {
        const embed = new MessageEmbed()
            .setColor(SoftConfig.get("bot.color", "#fb963a"))
            .setTitle("Commandes")
            .setDescription(Object.values(Bot.getDMCommands()).map((e) => "`" + e.getUsage() + "` - " + e.getDescription()).join("\n"));

        message.reply({ embeds: [embed] });
    }
}

export default ConfigListDMCommand;