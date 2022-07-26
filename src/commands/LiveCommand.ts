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

import { APIApplicationCommandOption, ApplicationCommandOptionType } from 'discord-api-types/v9';
import { ButtonInteraction, CommandInteraction, GuildMember, MessageActionRow, MessageButton, MessageEmbed, MessagePayload, MessageSelectMenu, MessageSelectOptionData, SelectMenuInteraction, Snowflake, WebhookEditMessageOptions } from 'discord.js';
import { ANLiveAPI, StreamEntry } from '../api/ANLiveAPI';
import { SLiveAPI } from '../api/SLiveAPI';
import { Command } from '../base/Command';
import { Bot } from '../Bot';
import { DeleteButton } from '../components/DeleteButton';
import { ServerConfig } from '../config/ServerConfig';
import { Audio } from '../utils/Audio';
import { Emoji } from '../utils/Emoji';
import { I18n } from '../utils/I18n';

export class LiveCommand extends Command {
    constructor() {
        super();
        Bot.registerSelect("live_chamber", this.selectChamber.bind(this));
        Bot.registerSelect("live_seance", this.selectSeance.bind(this));
        Bot.registerButton("live_listen", this.listenSeance.bind(this));
        Bot.registerButton("live_reload", this.reloadSeance.bind(this));
    }

    getName() {
        return "live";
    }

    getOptions(): APIApplicationCommandOption[] {
        return [{
            type: ApplicationCommandOptionType.String,
            ...I18n.argumentI18n(this, 'chamber'),
            required: true,
            choices: [{
                ...I18n.choiceI18n(this, 'chamber', 'assembly'),
                value: 'assembly'
            }, {
                ...I18n.choiceI18n(this, 'chamber', 'senate'),
                value: 'senate'
            }]
        }];
    }

    private getSelectable(streams: StreamEntry[], selected: string | null): MessageSelectOptionData[] | undefined {
        const out = [];

        for (const s of streams) {
            out.push({
                label: s.selector,
                value: s.id,
                default: s.id === selected
            });
        }

        if (out.length === 0)
            return undefined;

        return out;
    }

    private async getMessageData(selected: string | null = null, chamber: 'senate' | 'assembly', locale: string, delete_button: boolean, user_id: Snowflake): Promise<MessagePayload | WebhookEditMessageOptions> {
        let streams: StreamEntry[];
        let no_watch = false, no_listen = false;
        let watch_url = "http://discordapp.com/";
        try {
            if (chamber === 'assembly')
                streams = await ANLiveAPI.streams();
            else
                streams = await SLiveAPI.streams();
        } catch (e: any) {
            return { content: I18n.getI18n('command.live.error', locale) };
        }

        const selectable = this.getSelectable(streams, selected);

        if (selectable === undefined || streams.length === 0) {
            const embed = new MessageEmbed();
            embed.setTitle(I18n.getI18n(`command.live.embed.${chamber}.title`, locale));
            embed.setDescription(I18n.getI18n('command.live.embed.nolive', locale));
            return {
                embeds: [embed], components: [new MessageActionRow().addComponents(
                    new MessageSelectMenu().setCustomId('live_chamber')
                        .setPlaceholder(I18n.getI18n('command.live.option.chamber.description', locale))
                        .addOptions([{
                            label: I18n.getI18n('command.live.option.chamber.assembly.name', locale),
                            value: 'assembly',
                            default: chamber === 'assembly'
                        }, {
                            label: I18n.getI18n('command.live.option.chamber.senate.name', locale),
                            value: 'senate',
                            default: chamber === 'senate'
                        }])
                ), new MessageActionRow().addComponents(
                    new MessageSelectMenu().setCustomId(`live_seance,${chamber}`)
                        .setPlaceholder(I18n.getI18n('command.live.embed.session', locale))
                        .addOptions(selectable ?? [{ label: "ERROR", value: "ERROR" }])
                        .setDisabled(true)
                ), new MessageActionRow().addComponents(
                    new MessageButton().setCustomId(`live_listen,${chamber},null`)
                        .setLabel(I18n.getI18n('command.live.embed.listen', locale))
                        .setStyle("PRIMARY")
                        .setDisabled(true),
                    new MessageButton()
                        .setURL(`https://videos.assemblee-nationale.fr/direct`)
                        .setLabel(I18n.getI18n('command.live.embed.watch', locale))
                        .setStyle("LINK")
                        .setDisabled(true)
                ).addComponents(
                    new MessageButton().setCustomId(`live_reload,${chamber},null`)
                        .setLabel(I18n.getI18n('command.live.embed.refresh', locale))
                        .setStyle("SECONDARY")
                        .setEmoji(Emoji.refresh)
                )]
            };
        } else {
            const embed = new MessageEmbed();

            if (selected === null || selected === "null") {
                embed.setTitle(I18n.getI18n(`command.live.embed.${chamber}.title`, locale));
                embed.setDescription(I18n.getI18n('command.live.embed.select', locale));
            } else {
                const diffusions = streams.find(v => v.id + "" === selected);
                if (diffusions === undefined) {
                    embed.setTitle("Live Assemblée Nationale");
                    embed.setDescription(I18n.getI18n('command.live.embed.select', locale));
                    no_watch = true;
                    no_listen = true;
                } else {
                    embed.setTitle(diffusions.title);
                    embed.setDescription(diffusions.description);
                    if (diffusions.thumbnail_url !== undefined)
                        embed.setThumbnail(diffusions.thumbnail_url);
                    no_watch = diffusions.watch_url === undefined;
                    no_listen = diffusions.listen_url === undefined;
                    watch_url = diffusions.watch_url ?? 'http://discordapp.com/';
                }
            }

            return {
                embeds: [embed], components: [new MessageActionRow().addComponents(
                    new MessageSelectMenu().setCustomId(`live_chamber,${user_id}`)
                        .setPlaceholder(I18n.getI18n('command.live.option.chamber.description', locale))
                        .addOptions([{
                            label: I18n.getI18n('command.live.option.chamber.assembly.name', locale),
                            value: 'assembly',
                            default: chamber === 'assembly'
                        }, {
                            label: I18n.getI18n('command.live.option.chamber.senate.name', locale),
                            value: 'senate',
                            default: chamber === 'senate'
                        }])
                ), new MessageActionRow().addComponents(
                    new MessageSelectMenu().setCustomId(`live_seance,${chamber},${user_id}`)
                        .setPlaceholder(I18n.getI18n('command.live.embed.session', locale))
                        .addOptions(selectable ?? [{ label: "ERROR", value: "ERROR" }])
                ), new MessageActionRow().addComponents(
                    new MessageButton().setCustomId(`live_listen,${chamber},${selected},${user_id}`)
                        .setLabel(I18n.getI18n('command.live.embed.listen', locale))
                        .setStyle("PRIMARY")
                        .setDisabled(selected === null || no_listen),
                    new MessageButton()
                        .setURL(watch_url)
                        .setLabel(I18n.getI18n('command.live.embed.watch', locale))
                        .setStyle("LINK")
                        .setDisabled(selected === null || no_watch),
                ).addComponents(
                    new MessageButton().setCustomId(`live_reload,${chamber},${selected},${user_id}`)
                        .setLabel(I18n.getI18n('command.live.embed.refresh', locale))
                        .setStyle("SECONDARY")
                        .setEmoji(Emoji.refresh)
                ).addComponents(delete_button ? [DeleteButton.generate()] : [])]
            };
        }
    }

    async listenSeance(interaction: ButtonInteraction) {
        const member: GuildMember | null = interaction.member as GuildMember | null;
        if (member === null)
            return;

        if (member.voice.channelId === null) {
            interaction.reply({ content: I18n.getI18n('command.live.error.voice', I18n.getLang(interaction)), ephemeral: true });
            return;
        }

        const [_, chamber, id] = interaction.customId.split(",");
        let stream: StreamEntry | undefined

        try {
            let streams: StreamEntry[];

            if (chamber === 'assembly')
                streams = await ANLiveAPI.streams();
            else
                streams = await SLiveAPI.streams();

            stream = streams.find((v) => v.id === id);
            if (stream === undefined) {
                interaction.reply({ content: I18n.getI18n('command.live.error.notlive', I18n.getLang(interaction)), ephemeral: true });
                return;
            }
        } catch (e: any) {
            interaction.reply({ content: I18n.getI18n('command.live.error', I18n.getLang(interaction)), ephemeral: true });
            return;
        }

        if (stream.listen_url === undefined) {
            interaction.reply({ content: I18n.getI18n('command.live.error.nolisten', I18n.getLang(interaction)), ephemeral: true });
            return;
        }

        Audio.playStream(stream.listen_url, {
            channelId: member.voice.channelId,
            guildId: member.guild.id,
            adapterCreator: member.guild.voiceAdapterCreator,
        });

        interaction.reply({ content: I18n.getI18n('command.live.joining', I18n.getLang(interaction)), ephemeral: true });
    }

    async selectSeance(interaction: SelectMenuInteraction) {
        await interaction.deferUpdate();
        const select = interaction.values[0];
        const [_, chamber, user] = interaction.customId.split(",");
        interaction.editReply(await this.getMessageData(select, chamber as 'senate' | 'assembly', I18n.getLang(interaction), !ServerConfig.get(interaction).ephemeral, user));
    }

    async selectChamber(interaction: SelectMenuInteraction) {
        await interaction.deferUpdate();
        const chamber = interaction.values[0];
        const [_, user] = interaction.customId.split(",");
        interaction.editReply(await this.getMessageData(null, chamber as 'senate' | 'assembly', I18n.getLang(interaction), !ServerConfig.get(interaction).ephemeral, user));
    }

    async reloadSeance(interaction: ButtonInteraction) {
        await interaction.deferUpdate();
        const [_, chamber, flux, user] = interaction.customId.split(",");
        interaction.editReply(await this.getMessageData(flux === "null" ? null : flux, chamber as 'senate' | 'assembly', I18n.getLang(interaction), !ServerConfig.get(interaction).ephemeral, user));
    }

    async execute(interaction: CommandInteraction) {
        await interaction.deferReply({ ephemeral: ServerConfig.get(interaction).ephemeral });
        await interaction.editReply(await this.getMessageData(null, interaction.options.getString("chamber") as 'senate' | 'assembly', I18n.getLang(interaction), !ServerConfig.get(interaction).ephemeral, interaction.user.id));
    }
}
