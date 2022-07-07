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

import { CommandInteraction, MessageAttachment, MessageEmbed } from 'discord.js';
import { Command } from '../base/Command';
import { LEGIBOT_DEV, LEGIBOT_HASH, LEGIBOT_REPOSITORY, LEGIBOT_VERSION } from '../version';

export class AboutCommand extends Command {
    constructor() {
        super();
    }

    getName() {
        return "about";
    }

    getDescription() {
        return "En apprendre plus sur LegiBot.";
    }

    getConfigs() {
        return ["command.about.message"];
    }

    async execute(interaction: CommandInteraction) {
        return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setTitle(`**LegiBot ${LEGIBOT_VERSION}${LEGIBOT_DEV ? '-dev' : ''} (${LEGIBOT_HASH})**\n`)
                    .setURL(LEGIBOT_REPOSITORY)
                    .setThumbnail('attachment://logo.png')
                    .setDescription("Bot Discord pour interragir avec l'asseblée nationale.")
                    .addField("Licence", "LegiBot est distribué sous licence [GNU GPL v3](https://www.gnu.org/licenses/gpl-3.0.en.html).")
            ], files: [new MessageAttachment(`doc/logo/logo-transparent${LEGIBOT_DEV ? '-dev' : ''}.png`, 'logo.png')], ephemeral: true
        });
    }
}
