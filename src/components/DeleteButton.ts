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

import { ButtonInteraction, MessageButton } from "discord.js";
import { Emoji } from "../utils/Emoji";
import { I18n } from "../utils/I18n";
import { Button } from "./../base/Button";

export class DeleteButton extends Button {

    constructor() {
        super();
    }

    getID(): string {
        return "global_delete";
    }

    async execute(interaction: ButtonInteraction): Promise<void> {
        const [_, user_id] = interaction.customId.split(",");
        if (user_id === undefined || interaction.user.id === user_id) {
            await interaction.deferUpdate();
            await interaction.deleteReply();
        } else {
            await interaction.reply({
                content: I18n.getI18n('bot.error.deleterights', interaction),
                ephemeral: true
            });
        }
    }

    static generate(user_id?: string): MessageButton {
        return new MessageButton()
            .setCustomId(user_id === undefined ? `global_delete` : `global_delete,${user_id}`)
            .setEmoji(Emoji.delete)
            .setStyle('DANGER')
    }
}
