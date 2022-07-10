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

import { decode } from 'html-entities';
import moment from 'moment';
import ical from 'node-ical';
import { Api } from '../base/Api';
import { Cache } from '../utils/Cache';

export type AgendaPeriode = 'journalier' | 'hebdomadaire';

export type AgendaEntry = {
    title: string,
    description?: string,
    date: string,
    color: string
};

export type AgendaFilter = {
    meetings: boolean,
    commission: boolean,
    public: boolean
}

class ANAgendaAPIManager extends Api {

    constructor() {
        super();
    }

    private dateFormat(date: Date) {
        return `${date.getFullYear()}-${(date.getMonth() + 1 + '').padStart(2, "0")}-${(date.getDate() + '').padStart(2, "0")}`;
    }

    async load_agenda(date: Date, periode: AgendaPeriode) {
        return await ical.async.fromURL(`https://www2.assemblee-nationale.fr/agendas/ics/${this.dateFormat(date)}/${periode}`);
    }

    async week_agenda(date: Date, filter?: AgendaFilter): Promise<AgendaEntry[]> {
        const year = moment(date).year();
        const week = moment(date).isoWeek();
        const out: AgendaEntry[] = await Cache.cache(`an.agenda.${year}.${week}`, 24 * 3600, async () => {
            const agenda = await this.load_agenda(date, 'hebdomadaire');
            const out: AgendaEntry[] = [];

            for(const key of Object.keys(agenda)) {
                const event = agenda[key];
                if (event.type !== 'VEVENT')
                    continue;

                out.push({
                    title: event.summary.replace("Réunion de la c", "C"),
                    description: event.description === '' ? undefined : decode(event.description).replace("<br>", "\n").replace("<br/>", "\n"),
                    date: event.start.toISOString(),
                    color: (() => {
                        if (event.summary.startsWith('Réunion - '))
                            return "#ED4245";
                        else if (event.summary.includes('séance publique'))
                            return "#57F287";
                        else
                            return "#5865F2";
                    })()
                });
            }

            return out;
        });

        if (filter === undefined)
            return out;

        return out.filter((event: AgendaEntry) => {
            return (event.title.startsWith('Réunion - ') && filter.meetings)
                || (event.title.startsWith('Commission') && filter.commission)
                || (event.title.includes('séance publique') && filter.public);
        })
    }

    async day_agenda(date: Date, filter?: AgendaFilter): Promise<AgendaEntry[]> {
        const week = await this.week_agenda(date, filter);

        const out: AgendaEntry[] = [];

        const d = moment(date);

        for(const event of week) {
            if (d.isSame(event.date, 'day')) {
                out.push(event);
            }
        }

        return out;
    }
}

export const ANAgendaAPI = new ANAgendaAPIManager();
