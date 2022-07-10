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
import { CommandInteraction, MessageAttachment } from 'discord.js';
import moment from 'moment';
import { AgendaEntry, AgendaFilter, ANAgendaAPI } from '../api/ANAgendaAPI';
import { Command } from '../base/Command';
import { Agenda } from '../utils/Agenda';

export class AgendaCommand extends Command {
    constructor() {
        super();
    }

    getName() {
        return "agenda";
    }

    getDescription() {
        return "Consulter l'agenda de l'Assemblée Nationale.";
    }

    getOptions(): APIApplicationCommandOption[] {
        return [{
            type: ApplicationCommandOptionType.Subcommand,
            name: 'day',
            description: 'Agenda du jour',
            options: [{
                type: ApplicationCommandOptionType.String,
                name: 'date',
                description: 'Date (JJ/MM/AAAA)',
            }, {
                type: ApplicationCommandOptionType.Boolean,
                name: 'public',
                description: 'Inclure les séances publiques (défaut: oui)',
                required: false
            }, {
                type: ApplicationCommandOptionType.Boolean,
                name: 'commission',
                description: 'Inclure les séances en commission (défaut: oui)',
                required: false
            }, {
                type: ApplicationCommandOptionType.Boolean,
                name: 'meetings',
                description: 'Inclure les réunions des députés (défaut: non)',
                required: false
            }]
        }, {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'week',
            description: 'Agenda de la semaine',
            options: [{
                type: ApplicationCommandOptionType.String,
                name: 'date',
                description: 'Date (JJ/MM/AAAA)'
            }, {
                type: ApplicationCommandOptionType.Boolean,
                name: 'public',
                description: 'Inclure les séances publiques (défaut: oui)',
                required: false
            }, {
                type: ApplicationCommandOptionType.Boolean,
                name: 'commission',
                description: 'Inclure les séances en commission (défaut: oui)',
                required: false
            }, {
                type: ApplicationCommandOptionType.Boolean,
                name: 'meetings',
                description: 'Inclure les réunions des députés (défaut: non)',
                required: false
            }]
        }]
    }

    async execute(interaction: CommandInteraction) {
        const date_string = interaction.options.getString('date', false);
        let date = new Date();
        if (date_string !== null) {
            date = moment(date_string, 'DD/MM/YYYY').toDate();
            if (isNaN(date.getTime())) {
                interaction.reply({
                    content: "Date invalide !"
                });
                return;
            }
        }

        const filter: AgendaFilter = {
            commission: interaction.options.getBoolean('commission', false) ?? true,
            public: interaction.options.getBoolean('public', false) ?? true,
            meetings: interaction.options.getBoolean('meetings', false) ?? false
        };

        await interaction.deferReply({ ephemeral: true });
        let message = '';
        let agenda: AgendaEntry[] = [];
        switch (interaction.options.getSubcommand()) {
            case 'day':
                agenda = await ANAgendaAPI.day_agenda(date, filter);
                message += `**Agenda du ${moment(date).format('DD/MM/YYYY')}**\n\n`;
                break;
            case 'week':
                agenda = await ANAgendaAPI.week_agenda(date, filter);
                message += `**Agenda de la semaine du ${moment(date).format('DD/MM/YYYY')}**\n\n`;
                break;
            default:
                agenda = [];
                break;
        }

        if (agenda.length === 0) {
            await interaction.editReply({ content: "**Pas d'évènements**" });
            return;
        }

        const tmp = await Agenda.renderAgenda(agenda);

        await interaction.editReply({ content: message, files: [new MessageAttachment(tmp, 'agenda.png')] });
    }
}
