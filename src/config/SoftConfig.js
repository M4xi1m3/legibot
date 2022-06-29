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
import _ from 'lodash';
import Loggers from '../utils/Logger.js';

const SOFTCONFIG_FILE = 'config/softconfig.json';

/**
 * Class that parses the softconfig.json file.
 * 
 * This config is meant to not be editable nor reloadable,
 * we thus only load it when constructing.
 */
class SoftConfig {
    constructor() {
        this.__logger = Loggers.getLogger("SoftConfig");
        this.__config_options = [];
        this.__config = {};
    }

    get(name, defaultValue) {
        return _.get(this.__config, name, defaultValue);
    }

    set(name, value) {
        _.set(this.__config, name, value);
    }

    unset(name) {
        _.unset(this.__config, name);
    }

    isReservedToGod() {
        return true;
    }

    save() {
        // Check if config dir exists, create if not.
        if (!fs.existsSync('config')) {
            this.__logger.warn("Config directory doesn't exists, creating...");
            try {
                fs.mkdirSync('config');
            } catch (e) {
                this.__logger.fatal("Failed to create config directory!", e, 1);
                return;
            }
        }

        try {
            fs.writeFileSync(SOFTCONFIG_FILE, JSON.stringify(this.__config));
        } catch (e) {
            this.__logger.fatal("Failed to save to config file!", e, 1);
            return;
        }
    }

    load() {
        // Check if config dir exists, create if not.
        if (!fs.existsSync('config')) {
            this.__logger.warn("Config directory doesn't exists, creating...");
            try {
                fs.mkdirSync('config');
            } catch (e) {
                this.__logger.fatal("Failed to create config directory!", e, 1);
                return;
            }
        }

        if (!fs.existsSync(SOFTCONFIG_FILE)) {
            try {
                fs.writeFileSync(SOFTCONFIG_FILE, JSON.stringify({}));
                this.__config = {};
                return;
            } catch (e) {
                this.__logger.fatal("Failed to create config file!", e, 1);
                return;
            }
        }

        try {
            this.__config = JSON.parse(fs.readFileSync(SOFTCONFIG_FILE, { encoding: "utf-8" }));
        } catch (e) {
            this.__logger.fatal("Failed to read config file!", e, 2);
            return;
        }
    }

    registerConfig(name) {
        this.__config_options.push(name);
    }

    getConfigs() {
        return _.uniq(this.__config_options);
    }
}

const instance = new SoftConfig();
export default instance;
