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
import { decode } from 'html-entities';
import { Api } from '../base/Api';
import { Cache } from '../utils/Cache';
import { StreamEntry } from './ANLiveAPI';

type SenateLive = {
    nid: string,
    mediaId: string,
    title: string,
    date: string,
    videotype: string,
    commission: string,
    url: string,
    lang: string,
    stream: string,
    flux: string
};

class SLiveAPIManager extends Api {
    private parser: XMLParser;

    constructor() {
        super();
        this.parser = new XMLParser({
            processEntities: false,
            htmlEntities: false,
            ignorePiTags: true,
            ignoreAttributes: false,
            attributeNamePrefix: "@_",
            isArray: (name, jpath) => {
                return [
                    'data.chapters.chapter',
                    'data.files.file',
                    'data.metadatas.metadata'
                ].indexOf(jpath) !== -1;
            }
        });
    }

    async load_live() {
        return await this.request("GET", `https://videos.senat.fr/senat_lives.json`);
    }

    async lives(): Promise<SenateLive[]> {
        return await Cache.cache('s.live', 30, async () => {
            const res = await this.load_live();

            if (!res.good) {
                return Promise.reject();
            } else {
                const out: SenateLive[] = [];

                for (const key of Object.keys(res.data)) {
                    out.push({
                        ...res.data[key],
                        flux: key,
                        date: (new Date(parseInt(res.data[key].date) * 1000)).toISOString(),
                        url: ((/\/?(.*)/).exec(res.data[key].url) ?? ["", ""])[1]
                    });
                }

                return out;
            }
        });
    }

    async load_nvs(url: string) {
        return await this.request("GET", `https://videos.senat.fr/Datas/senat/${url}/content/data.nvs`)
    }

    async nvs(url: string): Promise<any> {
        return await Cache.cache(`s.nvs.${url}`, 10 * 60, async () => {
            const res = await this.load_nvs(url);

            if (!res.good) {
                Promise.reject();
            } else {
                const parsed: any = this.parser.parse(res.data);

                return parsed;
            }
        });
    }

    async streams(): Promise<StreamEntry[]> {
        return await Cache.cache('s.streams', 15, async () => {
            const lives = await this.lives();

            const out: StreamEntry[] = [];

            for (const live of lives) {
                const nvs = await this.nvs(live.url);
                console.log(nvs.data.files.file);
                if (nvs.data['@_status'] !== 'live')
                    continue;

                out.push({
                    id: live.flux,
                    selector: (nvs.data.metadatas.metadata.find((v: any) => v['@_name'] === 'organes') ?? { '@_value': `Flux ${live.flux}` })['@_value'],
                    thumbnail_url: `https://videos.senat.fr/img/video_live_${live.flux}.jpg`,
                    title: (nvs.data.metadatas.metadata.find((v: any) => v['@_name'] === 'organes') ?? { '@_label': `Flux ${live.flux}` })['@_label'],
                    description: decode((nvs.data.metadatas.metadata.find((v: any) => v['@_name'] === 'description') ?? { '@_value': `Pas de description.` })['@_value']).replace("<br>", "\n").replace("<br/>", "\n"),
                    listen_url: (nvs.data.files.file.find((v: any) => v['@_title'] === 'live') ?? { '@_url': undefined })['@_url'],
                    watch_url: `https://videos.senat.fr/video.${live.url}`
                });
            }

            console.log(out);

            return out;
        });
    }
}

export const SLiveAPI = new SLiveAPIManager();
