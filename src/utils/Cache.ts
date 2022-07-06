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

import fs from 'fs';
import { Log, Logger } from './Logger';

interface CacheEntry {
    modified: number;
    ttl: number;
    time: number;
    value: any;
}

type CacheContent = { [key: string]: CacheEntry };

type CacheInfos = {
    key: string;
    modified: number;
    expires: number;
    size: number;
}[];

class CacheManger {
    private logger: Log;

    constructor() {
        this.logger = Logger.getLogger('Cache');
    }

    private loadCache(): CacheContent {
        if (!fs.existsSync(`./cache.json`)) {
            try {
                fs.writeFileSync(`./cache.json`, JSON.stringify({}));
                this.logger.info(`Creating cache file...`);
            } catch (error: any) {
                this.logger.error(`Unable to create cache file.`, error as Error);
            }
        }

        return JSON.parse(fs.readFileSync(`./cache.json`).toString('utf-8'));
    }

    private saveCache(cache: CacheContent) {
        fs.writeFileSync(`./cache.json`, JSON.stringify(cache));
    }

    public async cache<T>(key: string, ttl: number, func: () => any): Promise<T> {
        const cache = this.loadCache();

        let modified = false;

        // If the value is not found, we create it.
        if (!(key in cache && 'time' in cache[key] && 'ttl' in cache[key] && 'modified' in cache[key] && 'value' in cache[key])) {
            cache[key] = {
                modified: Date.now(),
                time: Date.now() + ttl * 1000,
                ttl: ttl,
                value: await func(),
            };
            modified = true;
        }

        // If the value is expired, we invalidate the cache
        if (cache[key].time < Date.now()) {
            cache[key] = {
                modified: Date.now(),
                time: Date.now() + ttl * 1000,
                ttl: ttl,
                value: await func(),
            };
            modified = true;
        }

        if (modified) {
            this.saveCache(cache);
        }

        return cache[key].value;
    }

    modified_date(key: string): number | null {
        const cache = this.loadCache();

        // If the value is not found, we return null.
        if (!(key in cache && 'modified' in cache[key] && 'time' in cache[key] && 'value' in cache[key])) {
            return null;
        }

        return cache[key].modified;
    }

    getInfos(): CacheInfos {
        const cache = this.loadCache();
        const out = [];

        for (const [key, value] of Object.entries(cache)) {
            out.push({
                key: key,
                modified: value?.modified,
                expires: value?.time,
                size: JSON.stringify(value?.value).length,
            });
        }

        return out;
    }

    flush(): void {
        this.saveCache({});
    }

    getCacheSize(): number {
        return fs.statSync(`./cache.json`).size;
    }
}

export const Cache = new CacheManger();
export type { CacheEntry as Entry, CacheContent, CacheInfos };
