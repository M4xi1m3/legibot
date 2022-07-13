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

import { XMLParser } from 'fast-xml-parser';
import { Api } from '../base/Api';
import { Cache } from '../utils/Cache';

export type LiveData = { flux: string, media: string }[];

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
    titre?: string,
    video_url?: string
};

export type EditoData = { titre: string, introduction: string, diffusion: DiffusionData[] };

class ANLiveAPIManager extends Api {
    private parser: XMLParser;

    constructor() {
        super();
        this.parser = new XMLParser({
            processEntities: false, htmlEntities: false, ignorePiTags: true, isArray: (name, jpath) => {
                return [
                    'editorial.diffusion'
                ].indexOf(jpath) !== -1;
            }
        });
    }

    async load_live() {
        return await this.request("GET", `https://videos.assemblee-nationale.fr/live/live.txt?rnd=${Date.now()}`);
    }

    async live(): Promise<LiveData> {
        return await Cache.cache('an.live', 15, async () => {
            const data = [];
            const res = await this.load_live();

            if (!res.good) {
                return Promise.reject();
            } else {
                for (const line of res.data.split("\n")) {
                    const [flux, media] = line.split(" ");
                    if (flux === '')
                        continue;
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
        return await this.request("GET", `https://videos.assemblee-nationale.fr/php/getedito.php?${Date.now()}`);
    }

    async edito(): Promise<EditoData> {
        return await Cache.cache('an.edito', 10 * 60, async () => {
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
