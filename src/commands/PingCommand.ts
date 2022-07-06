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

import { CommandInteraction } from 'discord.js';
import { Command } from '../base/Command';
import { SoftConfig } from '../config/SoftConfig';

export class PingCommand extends Command {
    constructor() {
        super();
    }

    getName() {
        return "ping";
    }

    isDevCommand() {
        return true;
    }

    getDescription() {
        return "Vérifie si LegiBot est vivant.";
    }

    getConfigs() {
        return ["command.ping.message"];
    }

    async execute(interaction: CommandInteraction) {
        interaction.reply({ content: SoftConfig.get("command.ping.message", "Pong!"), ephemeral: true });
    }
}
