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
    start: string,
    end: string;
};

class ANAgendaAPIManager extends Api {

    constructor() {
        super();
    }

    private dateFormat(date: Date) {
        return `${date.getFullYear()}-${(date.getMonth() + 1 + '').padStart(2, "0")}-${(date.getDate() + '').padStart(2, "0")}`;
    }

    async load_agenda(date: Date, periode: AgendaPeriode) {
        console.log(`https://www2.assemblee-nationale.fr/agendas/ics/${this.dateFormat(date)}/${periode}`);
        return await ical.async.fromURL(`https://www2.assemblee-nationale.fr/agendas/ics/${this.dateFormat(date)}/${periode}`);
    }

    async week_agenda(date: Date): Promise<AgendaEntry[]> {
        const year = moment(date).year();
        const week = moment(date).isoWeek();
        return await Cache.cache(`an.agenda.${year}.${week}`, 24 * 3600, async () => {
            const agenda = await this.load_agenda(date, 'hebdomadaire');
            const out: AgendaEntry[] = [];

            for(const key of Object.keys(agenda)) {
                const event = agenda[key];
                if (event.type !== 'VEVENT')
                    continue;

                out.push({
                    title: event.summary,
                    description: event.description === '' ? undefined : decode(event.description).replace("<br>", "\n").replace("<br/>", "\n"),
                    start: event.start.toISOString(),
                    end: event.end.toISOString()
                });
            }

            return out;
        });
    }

    async day_agenda(date: Date): Promise<AgendaEntry[]> {
        const week = await this.week_agenda(date);

        const out: AgendaEntry[] = [];

        const d = moment(date);

        for(const event of week) {
            if (d.isSame(event.start, 'day') || d.isSame(event.end, 'day')) {
                out.push(event);
            }
        }

        return out;
    }
}

export const ANAgendaAPI = new ANAgendaAPIManager();
