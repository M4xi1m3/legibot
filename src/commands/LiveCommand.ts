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

import { ButtonInteraction, CommandInteraction, GuildMember, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu, SelectMenuInteraction } from 'discord.js';
import { decode } from 'html-entities';
import { ANLiveAPI, DiffusionData, EditoData, LiveData } from '../api/ANLiveAPI';
import { Command } from '../base/Command';
import { Bot } from '../Bot';
import { Audio } from '../utils/Audio';

export class LiveCommand extends Command {
    constructor() {
        super();
        Bot.registerSelect("live_seance", this.selectSeance.bind(this));
        Bot.registerButton("live_listen", this.listenSeance.bind(this));
    }

    getName() {
        return "live";
    }

    getDescription() {
        return "Test";
    }

    getConfigs() {
        return ["command.ping.message"];
    }

    private getSelectable(live: LiveData, edito: EditoData) {
        if (edito.diffusion === undefined)
            return [];

        const out = [];

        for (const l of live) {
            const e: DiffusionData | undefined = edito.diffusion.find(v => v.flux + "" === l.flux);
            if (e !== undefined) {
                out.push({
                    label: e.libelle_court, value: l.flux
                });
            }
        }

        return out;
    }

    private async getMessageData(selected: string | null = null) {
        let live: LiveData, edito: EditoData;
        try {
            live = await ANLiveAPI.live();
            edito = await ANLiveAPI.edito();
        } catch (e: any) {
            return { content: "Une erreur est survenue !" };
        }

        if (this.getSelectable(live, edito).length === 0) {
            const embed = new MessageEmbed();
            embed.setTitle("Live Assemblée Nationale");
            embed.setDescription("Pas de direct en cours.");
            return { embeds: [embed] };
        } else {
            const embed = new MessageEmbed();

            if (live.length === 0) {
                embed.setTitle("Live Assemblée Nationale");
                embed.setDescription("Aucune séance en direct actuellement.");
                return { embeds: [embed] };
            }

            if (selected === null) {
                embed.setTitle("Live Assemblée Nationale");
                embed.setDescription("Veuillez sélectionner une séance en cours.");
            } else {
                const diffusion = edito.diffusion.find(v => v.flux + "" === selected);
                if (diffusion === undefined) {
                    embed.setTitle("Live Assemblée Nationale");
                    embed.setDescription("Veuillez sélectionner une séance en cours.");
                } else {
                    embed.setTitle(diffusion.libelle === "" ? diffusion.libelle_court : diffusion.libelle);
                    embed.setDescription(decode(diffusion.sujet).replace("<br>", "\n").replace("<br/>", "\n"));
                    embed.setThumbnail(`https://videos.assemblee-nationale.fr/live/images/${diffusion.id_organe}.jpg`);
                }
            }

            const row = [new MessageActionRow().addComponents(
                new MessageSelectMenu().setCustomId("live_seance")
                    .setPlaceholder("Séance")
                    .addOptions(this.getSelectable(live, edito))
            ), new MessageActionRow().addComponents(
                new MessageButton().setCustomId("live_listen," + selected)
                    .setLabel("Écouter")
                    .setStyle("PRIMARY")
                    .setDisabled(selected === null)
            )];

            return { embeds: [embed], components: row };
        }

    }

    async listenSeance(interaction: ButtonInteraction) {
        const member: GuildMember | null = interaction.member as GuildMember | null;
        if (member === null)
            return;

        if (member.voice.channelId === null) {
            interaction.reply({ content: "Vous devez être dans un canal vocal !" });
            return;
        }

        const flux = interaction.customId.split(",")[1];

        Audio.playStream(`https://videos.assemblee-nationale.fr/live/live${flux}/playlist${flux}.m3u8`, {
            channelId: member.voice.channelId,
            guildId: member.guild.id,
            adapterCreator: member.guild.voiceAdapterCreator,
        });

        interaction.reply({ content: "J'arrive ^^", ephemeral: true });
    }

    async selectSeance(interaction: SelectMenuInteraction) {
        await interaction.deferUpdate();
        const select = interaction.values[0];
        interaction.editReply(await this.getMessageData(select));
    }

    async execute(interaction: CommandInteraction) {
        await interaction.deferReply({ ephemeral: true });
        await interaction.editReply(await this.getMessageData(null));
    }
}
