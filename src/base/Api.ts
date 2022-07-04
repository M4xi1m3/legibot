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

import axios from "axios";
import { Log, Logger } from "../utils/Logger";

export class Api {
    protected logger: Log;

    protected constructor() {
        this.logger = Logger.getLogger("AnApi");
    }


    protected async request(method: "GET" | "POST" | "PUT" | "DELETE", path: string, data?: any): Promise<{good: boolean, error: string, status: number, data: any}> {
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
}
