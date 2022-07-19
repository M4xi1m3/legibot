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

import { LocaleString } from 'discord-api-types/v9';
import { ButtonInteraction, CommandInteraction, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu, SelectMenuInteraction, WebhookEditMessageOptions } from 'discord.js';
import { Command } from '../base/Command';
import { Bot } from '../Bot';
import { HardConfig } from '../config/HardConfig';
import { ServerConfig } from '../config/ServerConfig';
import { I18n } from '../utils/I18n';

export class ConfigCommand extends Command {
    constructor() {
        super();
        Bot.registerSelect("config_language", this.languageSelect.bind(this));
        Bot.registerButton("config_ephemeral", this.ephemeralButton.bind(this));
    }

    getName() {
        return "config";
    }

    async ephemeralButton(interaction: ButtonInteraction) {
        if (!await this.validateCall(interaction)) return;

        ServerConfig.set(interaction.guildId ?? '', {
            ephemeral: interaction.customId.split(',')[1] === "true"
        });

        await interaction.deferUpdate();
        await interaction.editReply(await this.messageData(interaction));
    }

    async languageSelect(interaction: SelectMenuInteraction) {
        if (!await this.validateCall(interaction)) return;

        ServerConfig.set(interaction.guildId ?? '', {
            locale: interaction.values[0] as LocaleString
        });

        await interaction.deferUpdate();
        await interaction.editReply(await this.messageData(interaction));
    }

    async validateCall(interaction: CommandInteraction | SelectMenuInteraction | ButtonInteraction): Promise<boolean> {
        if (interaction.guildId === null) {
            await interaction.reply({ content: I18n.getI18n('command.config.error.dm', I18n.getLang(interaction)), ephemeral: true });
            return false;
        }

        if (!interaction.memberPermissions?.any('MANAGE_GUILD', true)
            && !HardConfig.getDiscordGods().includes(interaction.user.id)) {
            await interaction.reply({ content: I18n.getI18n('command.config.error.permission', I18n.getLang(interaction)), ephemeral: true });
            return false;
        }

        return true;
    }

    async messageData(interaction: CommandInteraction | SelectMenuInteraction | ButtonInteraction): Promise<WebhookEditMessageOptions> {
        return {
            embeds: [
                new MessageEmbed()
                    .setTitle(I18n.getI18n('command.config.reply.title', I18n.getLang(interaction)))
                    .setDescription(I18n.getI18n('command.config.reply.description', I18n.getLang(interaction)))
            ],
            components: [
                new MessageActionRow().addComponents(
                    new MessageSelectMenu()
                        .setPlaceholder(I18n.getI18n('command.config.reply.language', I18n.getLang(interaction)))
                        .addOptions(I18n.getLocales(ServerConfig.get(interaction).locale))
                        .setCustomId('config_language')
                ),
                new MessageActionRow().addComponents(
                    new MessageButton()
                        .setLabel(I18n.getI18n(`command.config.reply.ephemeral.${!ServerConfig.get(interaction).ephemeral}`, I18n.getLang(interaction)))
                        .setStyle('PRIMARY')
                        .setCustomId(`config_ephemeral,${!ServerConfig.get(interaction).ephemeral}`)
                )
            ]
        };
    }

    async execute(interaction: CommandInteraction) {
        if (!await this.validateCall(interaction)) return;

        await interaction.deferReply({ ephemeral: true });
        await interaction.editReply(await this.messageData(interaction));
    }
}
