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

class Loadable {

    constructor(filename) {
        this.__filename = filename;
        this.__logger = Logger.getLogger(`Loadable/${this.__filename}`);
        this.__data = {};
    }

    filename() {
    }

    __load() {
        if (!fs.existsSync(`./${this.__filename}.json`)) {
            try {
                fs.writeFileSync(`./${this.__filename}.json`, JSON.stringify({}));
                this.__logger.info(`Creating ${this.__filename} file...`);
            }
            catch (error) {
                this.__logger.error(`Unable to create ${this.__filename} file.`, error);
            }
        }

        this.__data = JSON.parse(fs.readFileSync(`./${this.__filename}.json`));
    }

    __save() {
        fs.writeFileSync(`./${this.__filename}.json`, JSON.stringify(this.__data));
    }

}

export default Loadable;