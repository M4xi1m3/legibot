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

import Command from '../Command.js';
import SoftConfig from '../config/SoftConfig.js';

class PingCommand extends Command {
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
        return "Vérifie si AN-BOT est vivant.";
    }

    getConfigs() {
        return ["command.ping.message"];
    }

    async execute(interaction) {
        interaction.reply({ content: SoftConfig.get("command.ping.message", "Pong!"), ephemeral: true });
    }
}

export default PingCommand;
