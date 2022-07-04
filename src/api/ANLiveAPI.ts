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

import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { Cache } from '../utils/Cache';
import { Log, Logger } from '../utils/Logger';

export type LiveData = {flux: string, media: string}[];

export type DiffusionData = {
    id_organe: number,
    libelle: string,
    libelle_court: string,
    heure: number,
    flux: number,
    sujet: string,
    uid_referentiel: string,
    lieu: string,
    programme_ratp: number,
    titre: string,
    video_url?: string
};

export type EditoData = {titre: string, introduction: string, diffusion: DiffusionData[]};

class ANLiveAPIManager {
    private logger: Log;
    private parser: XMLParser;

    constructor() {
        this.logger = Logger.getLogger("AnApi");
        this.parser = new XMLParser({
            processEntities: false, htmlEntities: false, ignorePiTags: true, isArray: (name, jpath) => {
                return [
                    'editorial.diffusion'
                ].indexOf(jpath) !== -1;
            }
        });
    }

    private async request(method: "GET" | "POST" | "PUT" | "DELETE", path: string, data?: any) {
        this.logger.info(method + " " + path);
        try {
            const res = await axios.request({ method: method.toLocaleLowerCase(), url: path, data, headers: { 'Accepts': 'application/json' }});

            return {
                good: true,
                error: '',
                status: res.status,
                data: res.data
            };
        } catch (error: any) {
            this.logger.error(`Error with API Request:\n    ${method} ${path}\n`, error as Error);
            return {
                good: false,
                error: error?.message,
                status: -1,
                data: {}
            }
        }
    }

    async load_live() {
        return await this.request("GET", "https://videos.assemblee-nationale.fr/live/live.txt");
    }

    async live(): Promise<LiveData> {
        return await Cache.cache('an.live', 5 * 60, async () => {
            const data = [];
            const res = await this.load_live();

            if (!res.good) {
                return Promise.reject();
            } else {
                for (const line of res.data.split("\n")) {
                    const [flux, media] = line.split(" ");
                    data.push({
                        flux,
                        media
                    });
                }
                return data;
            }
        });
    }

    async load_edito() {
        return await this.request("GET", `https://videos.assemblee-nationale.fr/php/getedito.php`);
    }

    async edito(): Promise<EditoData> {
        return await Cache.cache('an.edito', 5 * 60, async () => {
            const res = await this.load_edito();

            if (!res.good) {
                Promise.reject();
            } else {
                const parsed: any = this.parser.parse(res.data);

                if (parsed.editorial.diffusion === undefined)
                    parsed.editorial.diffusion = [];

                return parsed.editorial;
            }
        });
    }
}

export const ANLiveAPI = new ANLiveAPIManager();
