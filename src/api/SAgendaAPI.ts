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
import { AgendaEntry, AgendaFilter } from './ANAgendaAPI';

class SAgendaAPIManager extends Api {

    constructor() {
        super();
    }

    private dateFormat(date: Date) {
        return `${date.getFullYear()}-${(date.getMonth() + 1 + '').padStart(2, "0")}-${(date.getDate() + '').padStart(2, "0")}`;
    }

    async load_public_session() {
        this.logger.info("GET https://www.senat.fr/aglae/Seance/ical.ics");
        return await ical.async.fromURL(`https://www.senat.fr/aglae/Seance/ical.ics`);
    }

    async load_comission() {
        this.logger.info("GET https://www.senat.fr/aglae/Commissions/ical.ics");
        return await ical.async.fromURL(`https://www.senat.fr/aglae/Commissions/ical.ics`);
    }

    async week_agenda(date: Date, filter?: AgendaFilter): Promise<AgendaEntry[]> {
        const d = moment(date);
        const year = d.year();
        const week = d.isoWeek();
        const out: AgendaEntry[] = await Cache.cache(`s.agenda.${year}.${week}`, 24 * 3600, async () => {
            const public_agenda = await this.load_public_session();
            const commission_agenda = await this.load_comission();

            const out: AgendaEntry[] = [];

            for(const key of Object.keys(public_agenda)) {
                const event = public_agenda[key];
                if (event.type !== 'VEVENT' || !d.isSame(event.start, 'week'))
                    continue;
                out.push({
                    title: event.summary,
                    description: event.description === '' ? undefined : decode(event.description).replace("<br>", "\n").replace("<br/>", "\n"),
                    start: event.start.toISOString(),
                    end: (event.end !== event.start ? event.end.toISOString() : moment(event.start).add(2, 'hour').toISOString()),
                    color: "#57F287"
                })
            }

            for(const key of Object.keys(commission_agenda)) {
                const event = commission_agenda[key];
                if (event.type !== 'VEVENT' || !d.isSame(event.start, 'week'))
                    continue;
                out.push({
                    title: event.summary,
                    description: event.description === '' ? undefined : decode(event.description).replace("<br>", "\n").replace("<br/>", "\n"),
                    start: event.start.toISOString(),
                    end: (event.end !== event.start ? event.end.toISOString() : moment(event.start).add(2, 'hour').toISOString()),
                    color: "#5865F2"
                })
            }

            return out;
        });

        if (filter === undefined)
            return out;

        return out.filter((event: AgendaEntry) => {
            return (event.color === "#5865F2" && filter.commission)
                || (event.color === "#57F287" && filter.public);
        })
    }

    async day_agenda(date: Date, filter?: AgendaFilter): Promise<AgendaEntry[]> {
        const week = await this.week_agenda(date, filter);

        const out: AgendaEntry[] = [];

        const d = moment(date);

        for(const event of week) {
            if (d.isSame(event.start, 'day')) {
                out.push(event);
            }
        }

        return out;
    }
}

export const SAgendaAPI = new SAgendaAPIManager();
