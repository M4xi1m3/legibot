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

import { Message, MessageEmbed } from 'discord.js';
import { DMCommand } from '../base/DMCommand';
import { SoftConfig } from '../config/SoftConfig';
import { Cache } from '../utils/Cache';

export class CacheInfoDMCommand extends DMCommand {
    constructor() {
        super();
    }

    getName() {
        return "cache info";
    }

    getDescription() {
        return "Affiche l'état du cache.";
    }

    getArgumentsRegex() {
        return "";
    }

    private humanSize(size: number): string {
        const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
        return (size / Math.pow(1024, i)).toFixed(2) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
    }

    async execute(message: Message) {
        const embed = new MessageEmbed()
            .setColor(SoftConfig.get("bot.color", "#fb963a"))
            .setTitle("Cache")
            .setDescription("Size: " + this.humanSize(Cache.getCacheSize()));
        const cache_infos = Cache.getInfos();
        if (cache_infos.length !== 0) {
            embed.addFields({ name: 'Name', value: cache_infos.map((e) => e.key).join("\n"), inline: true })
                .addFields({ name: 'Size', value: cache_infos.map((e) => this.humanSize(e.size)).join("\n"), inline: true })
                .addFields({ name: 'Expiration', value: cache_infos.map((e) => e.expires < Date.now() ? "Expired" : new Date(e.expires).toLocaleString()).join("\n"), inline: true });
        }
        message.reply({ embeds: [embed] });
    }
}
