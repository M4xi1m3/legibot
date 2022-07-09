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
import { CommandInteraction } from 'discord.js';
import moment from 'moment';
import { AgendaEntry, ANAgendaAPI } from '../api/ANAgendaAPI';
import { Command } from '../base/Command';

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
                description: 'Date (JJ/MM/AAAA)'
            }]
        }, {
            type: ApplicationCommandOptionType.Subcommand,
            name: 'week',
            description: 'Agenda de la semaine',
            options: [{
                type: ApplicationCommandOptionType.String,
                name: 'date',
                description: 'Date (JJ/MM/AAAA)'
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

        await interaction.deferReply({ ephemeral: true });
        let message = '';
        let agenda: AgendaEntry[] = [];
        switch (interaction.options.getSubcommand()) {
            case 'day':
                agenda = await ANAgendaAPI.day_agenda(date);
                message += `**Agenda du ${moment(date).format('DD/MM/YYYY')}**\n\n`;
                break;
            case 'week':
                agenda = await ANAgendaAPI.week_agenda(date);
                message += `**Agenda de la semaine du ${moment(date).format('DD/MM/YYYY')}**\n\n`;
                break;
            default:
                agenda = [];
                break;
        }

        for (const event of agenda) {
            message += event.title + '\n';
            message += `*Le ${moment(event.start).format("DD/MM/YYYY")} de ${moment(event.start).format("HH:mm")} à ${moment(event.end).format("HH:mm")}*\n\n`;
        }

        await interaction.editReply({ content: message });
    }
}
