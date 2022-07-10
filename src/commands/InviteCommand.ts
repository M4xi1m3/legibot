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
import { HardConfig } from '../config/HardConfig';

export class InviteCommand extends Command {
    constructor() {
        super();
    }

    getName() {
        return "invite";
    }

    getDescription() {
        return "Inviter legibot sur un autre serveur";
    }

    private link(): string {
        return `https://discord.com/api/oauth2/authorize?client_id=${HardConfig.getBotAppID()}&permissions=3145728&scope=bot%20applications.commands`;
    }

    async execute(interaction: CommandInteraction) {
        return interaction.reply({
            content: `**Voici un lien d'invitation :**\n${this.link()}`,
            ephemeral: true
        });
    }
}
