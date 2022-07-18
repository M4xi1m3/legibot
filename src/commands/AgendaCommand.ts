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
import { ButtonInteraction, CommandInteraction, MessageActionRow, MessageAttachment, MessageButton, MessageSelectMenu, SelectMenuInteraction } from 'discord.js';
import moment from 'moment';
import { AgendaEntry, AgendaFilter, ANAgendaAPI } from '../api/ANAgendaAPI';
import { SAgendaAPI } from '../api/SAgendaAPI';
import { Command } from '../base/Command';
import { Bot } from '../Bot';
import { Agenda } from '../utils/Agenda';
import { I18n } from '../utils/I18n';

export class AgendaCommand extends Command {
    constructor() {
        super();
        Bot.registerButton("agenda_button", this.agnedaButton.bind(this));
        Bot.registerSelect("agenda_chamber", this.selectChamber.bind(this));
    }

    getName() {
        return "agenda";
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
        }, {
            type: ApplicationCommandOptionType.String,
            ...I18n.argumentI18n(this, 'period'),
            required: true,
            choices: [{
                ...I18n.choiceI18n(this, 'period', 'day'),
                value: 'day'
            }, {
                ...I18n.choiceI18n(this, 'period', 'week'),
                value: 'week'
            }]
        }, {
            type: ApplicationCommandOptionType.String,
            ...I18n.argumentI18n(this, 'date'),
        }, {
            type: ApplicationCommandOptionType.Boolean,
            ...I18n.argumentI18n(this, 'public'),
            required: false
        }, {
            type: ApplicationCommandOptionType.Boolean,
            ...I18n.argumentI18n(this, 'commission'),
            required: false
        }, {
            type: ApplicationCommandOptionType.Boolean,
            ...I18n.argumentI18n(this, 'meetings'),
            required: false
        }]
    }

    private async messageData(date: Date, chamber: 'senate' | 'assembly', period: "week" | "day", filter: AgendaFilter, locale: string) {
        let message = '';
        let agenda: AgendaEntry[] = [];
        if (chamber === 'senate') {
            if (period === 'day') {
                agenda = await SAgendaAPI.day_agenda(date, filter);
            } else {
                agenda = await SAgendaAPI.week_agenda(date, filter);
            }
        } else {
            if (period === 'day') {
                agenda = await ANAgendaAPI.day_agenda(date, filter);
            } else {
                agenda = await ANAgendaAPI.week_agenda(date, filter);
            }
        }

        message += `**${I18n.formatI18n(`command.agenda.reply.${period}.title`, locale, { date: moment(date).format('DD/MM/YYYY') })}**\n\n`;

        let files: MessageAttachment[] = [];

        if (agenda.length === 0) {
            message += `*${I18n.getI18n("command.agenda.reply.noevents", locale)}*`;
        } else {
            files = [new MessageAttachment(await Agenda.renderAgenda(agenda), 'agenda.png')];
        }

        const rows = [new MessageActionRow().addComponents(
            new MessageSelectMenu().setCustomId(`agenda_chamber,${moment(date).format("YYYY-MM-DD")},${period},${filter.commission ? "C" : ""}${filter.meetings ? "M" : ""}${filter.public ? "P" : ""}`)
                .setPlaceholder(I18n.getI18n('command.agenda.option.chamber.description', locale))
                .addOptions([{
                    label: I18n.getI18n('command.agenda.option.chamber.assembly.name', locale),
                    value: 'assembly',
                    default: chamber === 'assembly'
                }, {
                    label: I18n.getI18n('command.agenda.option.chamber.senate.name', locale),
                    value: 'senate',
                    default: chamber === 'senate'
                }])
        ), new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId(`agenda_button,${moment(date).subtract(1, period).format("YYYY-MM-DD")},${chamber},${period},${filter.commission ? "C" : ""}${filter.meetings ? "M" : ""}${filter.public ? "P" : ""}`)
                .setLabel(I18n.getI18n(`command.agenda.reply.${period}.previous`, locale))
                .setStyle("PRIMARY")
        ).addComponents(
            new MessageButton()
                .setCustomId(`agenda_button,${moment(date).add(1, period).format("YYYY-MM-DD")},${chamber},${period},${filter.commission ? "C" : ""}${filter.meetings ? "M" : ""}${filter.public ? "P" : ""}`)
                .setLabel(I18n.getI18n(`command.agenda.reply.${period}.next`, locale))
                .setStyle("PRIMARY")
        )];

        return { content: message, files, components: rows };
    }

    async selectChamber(interaction: SelectMenuInteraction) {
        await interaction.deferUpdate();
        const [_, d, p, f] = interaction.customId.split(",");
        const date = moment(d, "YYYY-MM-DD").toDate();
        const period = p as "week" | "day";
        const chamber = interaction.values[0] as "senate" | "assembly";
        const filter: AgendaFilter = {
            commission: f.includes('C'),
            meetings: f.includes('M'),
            public: f.includes('P')
        };

        await interaction.editReply(await this.messageData(date, chamber, period, filter, interaction.locale));
    }

    async agnedaButton(interaction: ButtonInteraction) {
        await interaction.deferUpdate();
        const [_, d, c, p, f] = interaction.customId.split(",");
        const date = moment(d, "YYYY-MM-DD").toDate();
        const period = p as "week" | "day";
        const chamber = c as "senate" | "assembly";
        const filter: AgendaFilter = {
            commission: f.includes('C'),
            meetings: f.includes('M'),
            public: f.includes('P')
        };

        await interaction.editReply(await this.messageData(date, chamber, period, filter, interaction.locale));
    }

    async execute(interaction: CommandInteraction) {
        const date_string = interaction.options.getString('date', false);
        let date = new Date();
        if (date_string !== null) {
            date = moment(date_string, 'DD/MM/YYYY').toDate();
            if (isNaN(date.getTime())) {
                interaction.reply({
                    content: I18n.getI18n("command.agenda.reply.invalid.date", interaction.locale),
                    ephemeral: true
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
        await interaction.editReply(await this.messageData(date, interaction.options.getString('chamber') as "assembly" | "senate", interaction.options.getString('period') as "week" | "day", filter, interaction.locale));
    }
}
