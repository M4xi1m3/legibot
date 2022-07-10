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

import { Canvas, CanvasRenderingContext2D, createCanvas } from "canvas";
import { split } from "canvas-hypertxt";
import moment from "moment";
import { AgendaEntry } from "../api/ANAgendaAPI";

type DateRange = { start: Date, end: Date };
type OrganizedAgenda = { [index: string]: AgendaEntry[] };
type OrganizedSplitAgenda = { [index: string]: AgendaEntry[][] };
type Dimension = { width: number, height: number };

const AGENDA_CELL_HEIGHT = 48*2;
const AGENDA_CELL_WIDTH = 128*4;
const AGENDA_CELL_BG = "#36393e";
const AGENDA_CELL_FG = "#ffffff";
const AGENDA_HOUR_WIDTH = 64;
const AGENDA_HOUR_BG = "#2f3135";
const AGENDA_HOUR_FG = "#dcddde";
const AGENDA_DATE_HEIGHT = 18;
const AGENDA_DATE_BG = "#2f3135";
const AGENDA_DATE_FG = "#dcddde";
const AGENDA_CELL_BORDER = 1;
const AGENDA_BORDER_FG = "#202225";
const AGENDA_HOUR_BORDER = 2;
const AGENDA_DATE_BORDER = 2;
const AGENDA_TEXT_HEIGHT = 12;
const AGENDA_EVENT_BG = "#5865F2";
const HOUR_NUMBER = 24;
const HOUR_OFFSET = 0;

class AgendaManager {

    private sortEvents(events: AgendaEntry[]): AgendaEntry[] {
        return events.sort((a: AgendaEntry, b: AgendaEntry) => (
            (new Date(a.date)).getTime() - (new Date(b.date)).getTime()
        ));
    }

    private getHourRange(agenda: OrganizedAgenda): { start: number, end: number } {
        let start = 23;
        let end = 0;

        for (const k of Object.keys(agenda)) {
            if (agenda[k].length === 0)
                continue;
            start = Math.min(moment(agenda[k][0].date).hour(), start);
            end = Math.max(moment(agenda[k][agenda[k].length - 1].date).hour(), end);
        }

        start -= 1;
        end += 2;

        return { start, end };
    }

    private getDateRange(events: AgendaEntry[]): DateRange {
        const first = events[0];
        const last = events[events.length - 1];
        return {
            start: moment(first.date).startOf('day').toDate(),
            end: moment(last.date).startOf('day').toDate()
        };
    }

    private prefill(range: DateRange): OrganizedAgenda {
        const out: OrganizedAgenda = {};
        const current = range.start;

        while (current <= range.end) {
            out[moment(current).format("DD/MM/YYYY")] = [];
            current.setDate(current.getDate() + 1);
        }

        return out;
    }

    private split(agenda: OrganizedAgenda): OrganizedSplitAgenda {
        const out: OrganizedSplitAgenda = {};

        for (const day of Object.keys(agenda)) {
            const tmp: AgendaEntry[][] = [];

            events_loop:
            for (const event of agenda[day]) {
                const start = moment(event.date).toDate().getTime();
                const end = moment(event.date).add(2, 'hour').toDate().getTime();

                timelines_loop:
                // Iterate timelines
                for (const timeline of tmp) {
                    for (const t_event of timeline) {
                        const t_start = moment(t_event.date).toDate().getTime();
                        const t_end = moment(t_event.date).add(2, 'hour').toDate().getTime();

                        // If we overlap, we try another timeline
                        if (start < t_end && end > t_start) {
                            continue timelines_loop;
                        }
                    }

                    // We didn't overlap, we can add
                    timeline.push(event);
                    // Go to next event
                    continue events_loop;
                }

                // We didn't find a suitable timeline, add one
                tmp.push([event]);
            }

            out[day] = tmp;
        }

        return out;
    }

    private organize(events: AgendaEntry[]): OrganizedAgenda {
        events = this.sortEvents(events);
        const range = this.getDateRange(events);
        const out = this.prefill(range);

        for (const event of events) {
            out[moment(event.date).format("DD/MM/YYYY")].push(event);
        }

        return out;
    }

    private getDimmensions(agenda: OrganizedAgenda): Dimension {
        const { start, end } = this.getHourRange(agenda);

        return {
            width: AGENDA_HOUR_WIDTH + AGENDA_HOUR_BORDER - AGENDA_CELL_BORDER + (AGENDA_CELL_WIDTH + AGENDA_CELL_BORDER) * Object.keys(agenda).length,
            height: AGENDA_DATE_HEIGHT + AGENDA_DATE_BORDER - AGENDA_CELL_BORDER + (AGENDA_CELL_HEIGHT + AGENDA_CELL_BORDER) * (end - start)
        };
    }

    private createBackground(agenda: OrganizedAgenda): { canvas: Canvas, ctx: CanvasRenderingContext2D } {
        const { start, end } = this.getHourRange(agenda);
        const { width, height } = this.getDimmensions(agenda);
        const columns = Object.keys(agenda).length;
        const rows = end - start;

        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = AGENDA_DATE_BG;
        ctx.fillRect(0, 0, width, AGENDA_DATE_HEIGHT);
        ctx.fillStyle = AGENDA_HOUR_BG;
        ctx.fillRect(0, 0, AGENDA_HOUR_WIDTH, height);
        ctx.fillStyle = AGENDA_CELL_BG;
        ctx.fillRect(AGENDA_HOUR_WIDTH, AGENDA_DATE_HEIGHT, width - AGENDA_HOUR_WIDTH, height - AGENDA_DATE_HEIGHT);

        ctx.fillStyle = AGENDA_BORDER_FG;
        ctx.fillRect(0, AGENDA_DATE_HEIGHT, width, AGENDA_DATE_BORDER);
        ctx.fillRect(AGENDA_HOUR_WIDTH, 0, AGENDA_HOUR_BORDER, height);

        ctx.font = `${AGENDA_TEXT_HEIGHT}px Ubuntu`;

        ctx.textAlign = 'right';
        for (let i = 0; i < rows; i++) {
            ctx.fillStyle = AGENDA_BORDER_FG;
            ctx.fillRect(
                0,
                AGENDA_DATE_HEIGHT + AGENDA_DATE_BORDER + i * (AGENDA_CELL_BORDER + AGENDA_CELL_HEIGHT) - AGENDA_CELL_BORDER,
                width,
                AGENDA_CELL_BORDER
            );
            ctx.fillStyle = AGENDA_HOUR_FG;
            ctx.fillText(
                `${(i + start + '').padStart(2, "0")}:00`,
                AGENDA_HOUR_WIDTH - 3,
                AGENDA_DATE_HEIGHT + i * (AGENDA_CELL_BORDER + AGENDA_CELL_HEIGHT) + AGENDA_TEXT_HEIGHT + 3,
                AGENDA_HOUR_WIDTH
            );
        }

        ctx.textAlign = 'center';
        for (let i = 0; i < columns; i++) {
            ctx.fillStyle = AGENDA_BORDER_FG;
            ctx.fillRect(
                AGENDA_HOUR_WIDTH + AGENDA_HOUR_BORDER + i * (AGENDA_CELL_BORDER + AGENDA_CELL_WIDTH) - AGENDA_CELL_BORDER,
                0,
                AGENDA_CELL_BORDER,
                height
            );
            ctx.fillStyle = AGENDA_DATE_FG;
            ctx.fillText(
                Object.keys(agenda)[i],
                AGENDA_HOUR_WIDTH + (i + 0.5) * (AGENDA_CELL_BORDER + AGENDA_CELL_WIDTH),
                AGENDA_DATE_HEIGHT - 3,
                AGENDA_CELL_WIDTH
            );
        }

        return { canvas, ctx };
    }

    private drawForeground(agenda: OrganizedAgenda, ctx: CanvasRenderingContext2D) {
        const { start, end } = this.getHourRange(agenda);

        const splitted = this.split(agenda)

        for (let column = 0; column < Object.keys(splitted).length; column++) {
            const date = Object.keys(splitted)[column];

            for (let timeline = 0; timeline < splitted[date].length; timeline++) {
                const x = Math.round(timeline / splitted[date].length * AGENDA_CELL_WIDTH) + AGENDA_HOUR_WIDTH + AGENDA_HOUR_BORDER + column * (AGENDA_CELL_WIDTH + AGENDA_CELL_BORDER);
                const w = Math.round(AGENDA_CELL_WIDTH / splitted[date].length) - 1;

                for (const event of splitted[date][timeline]) {
                    const m = moment(event.date);
                    const y = Math.round(AGENDA_DATE_HEIGHT + AGENDA_DATE_BORDER + (m.hour() + m.minute() / 60 - start) * (AGENDA_CELL_HEIGHT + AGENDA_CELL_BORDER));

                    const s = split(ctx, event.title, ctx.font, w - 4, false);

                    ctx.fillStyle = event.color;
                    ctx.fillRect(
                        x,
                        y,
                        w,
                        12 * 14 + 4
                    );

                    ctx.fillStyle = event.color === "#57F287" ? "#000000" : AGENDA_CELL_FG;
                    ctx.textAlign = 'left';

                    for (let i = 0; i < Math.min(12, s.length); i++) {
                        ctx.fillText(
                            s[i],
                            x + 2,
                            y + AGENDA_TEXT_HEIGHT + 2 + i * 14,
                            w - 4
                        );
                    }

                }
            }
        }
    }

    public async renderAgenda(events: AgendaEntry[]) {
        const agenda = this.organize(events);

        const { canvas, ctx } = this.createBackground(agenda);
        this.drawForeground(agenda, ctx);

        return canvas.toBuffer();
    }

}

export const Agenda = new AgendaManager();
