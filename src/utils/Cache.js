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

import fs from 'fs';
import Logger from './Logger.js';

class __Cache {
    constructor() {
        this.__logger = Logger.getLogger("Cache");
    }

    __loadCache() {
        if (!fs.existsSync(`./cache.json`)) {
            try {
                fs.writeFileSync(`./cache.json`, JSON.stringify({}));
                this.__logger.info(`Creating cache file...`);
            }
            catch (error) {
                this.__logger.error(`Unable to create cache file.`, error);
            }
        }

        return JSON.parse(fs.readFileSync(`./cache.json`));
    }

    __saveCache(cache) {
        fs.writeFileSync(`./cache.json`, JSON.stringify(cache));
    }

    async cache(key, ttl, func) {
        const cache = this.__loadCache();

        let modified = false;

        // If the value is not found, we create it.
        if (!((key in cache) && ('time' in cache[key]) && ('ttl' in cache[key]) && ('modified' in cache[key]) && ('value' in cache[key]))) {
            cache[key] = {
                modified: Date.now(),
                time: Date.now() + ttl * 1000,
                ttl: ttl,
                value: await func()
            };
            modified = true;
        }

        // If the value is expired, we invalidate the cache
        if (cache[key].time < Date.now()) {
            cache[key] = {
                modified: Date.now(),
                time: Date.now() + ttl * 1000,
                ttl: ttl,
                value: await func()
            };
            modified = true;
        }

        if (modified) {
            this.__saveCache(cache);
        }

        return cache[key].value;
    }

    modified_date(key) {
        const cache = this.__loadCache();

        // If the value is not found, we return null.
        if (!((key in cache) && ('modified' in cache[key]) && ('time' in cache[key]) && ('value' in cache[key]))) {
            return null;
        }

        return cache[key].modified;
    }

    getInfos() {
        const cache = this.__loadCache();
        let out = [];

        for(const [key, value] of Object.entries(cache)) {
            out.push({
                key: key,
                modified: value?.modified,
                expires: value?.time,
                size: JSON.stringify(value?.value).length
            });
        }

        return out;
    }

    flush() {
        this.__saveCache({});
    }

    getCacheSize() {
        return fs.statSync(`./cache.json`).size;
    }
}

const Cache = new __Cache();
export default Cache;
