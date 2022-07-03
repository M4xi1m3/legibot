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

import ANLiveAPI from '../api/ANLiveAPI.js';
import Command from '../Command.js';

import { MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu } from 'discord.js';
import { decode } from 'html-entities';
import Bot from '../Bot.js';
import Audio from '../utils/Audio.js';

class LiveCommand extends Command {
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

    __getSelectable(live, edito) {
        let out = [];

        for (let l of live.data) {
            let e = edito.diffusion.find(v => v.flux + "" === l.flux);
            out.push({
                label: e.libelle_court, value: l.flux
            });
        }

        return out;
    }

    async __getMessageData(selected = null) {

        const live = await ANLiveAPI.live();
        const edito = await ANLiveAPI.edito();
        console.log(live, edito);

        if (live.error || edito.error)
            return { content: "Une erreur est survenue !" };

        const embed = new MessageEmbed();

        if (live.data.length === 0) {
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
                .addOptions(this.__getSelectable(live, edito))
        ), new MessageActionRow().addComponents(
            new MessageButton().setCustomId("live_listen," + selected)
                .setLabel("Écouter")
                .setStyle("PRIMARY")
                .setDisabled(selected === null)
        )];

        return { embeds: [embed], components: row };
    }

    async listenSeance(interaction) {
        if (interaction.member.voice.channelId === null) {
            interaction.reply({ content: "Vous devez être dans un canal vocal !" });
            return;
        }

        let flux = interaction.customId.split(",")[1];
        
        Audio.playStream(`https://videos.assemblee-nationale.fr/live/live${flux}/playlist${flux}.m3u8`, {
            channelId: interaction.member.voice.channelId,
            guildId: interaction.member.guild.id,
            adapterCreator: interaction.member.guild.voiceAdapterCreator,
        });

        interaction.reply({content: "J'arrive ^^", ephemeral: true});
    }

    async selectSeance(interaction) {
        await interaction.deferUpdate();
        const select = interaction.values[0];
        interaction.editReply(await this.__getMessageData(select));
    }

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        await interaction.editReply(await this.__getMessageData(null));
    }
}

export default LiveCommand;
