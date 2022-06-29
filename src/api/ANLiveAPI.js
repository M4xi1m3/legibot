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
import Logger from '../utils/Logger.js';


class ANLiveAPI {
    constructor() {
        this.__logger = Logger.getLogger("AnApi");
    }

    async __request(method, path, data) {
        this.__logger.info(method + " " + path);
        try {
            let res = null;
            if (data === undefined)
                res = await axios[method.toLowerCase()](path, { headers: { 'Accepts': 'application/json' } });
            else
                res = await axios[method.toLowerCase()](path, data, { headers: { 'Accepts': 'application/json' } });

            return {
                good: true,
                error: '',
                status: res.status,
                data: res.data
            };
        } catch (error) {
            this.__logger.error(`Error with API Request:\n    ${method} ${path}\n`, error);
            return {
                good: false,
                error: error?.message,
                status: -1,
                data: {}
            }
        }
    }

    async edito() {
        return await this.__request("GET", `https://videos.assemblee-nationale.fr/php/getedito.php`);
    }
}

const instance = new ANLiveAPI();
export default instance;
