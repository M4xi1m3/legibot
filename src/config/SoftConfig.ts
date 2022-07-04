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
 * along with AN-BOT. If not, see <https://www.gnu.org/licenses/>.
 */

import fs from 'fs';
import _ from 'lodash';
import { Log, Logger } from '../utils/Logger.js';

const SOFTCONFIG_FILE = 'config/softconfig.json';

/**
 * Class that parses the softconfig.json file.
 * 
 * This config is meant to not be editable nor reloadable,
 * we thus only load it when constructing.
 */
class SoftConfigManager {
    private logger: Log;
    private config_options: string[];
    private config: { [key: string]: any };

    constructor() {
        this.logger = Logger.getLogger("SoftConfig");
        this.config_options = [];
        this.config = {};
    }

    get<T>(name: string, defaultValue: T) {
        return _.get(this.config, name, defaultValue);
    }

    set<T>(name: string, value: T) {
        _.set(this.config, name, value);
    }

    unset(name: string) {
        _.unset(this.config, name);
    }

    save() {
        // Check if config dir exists, create if not.
        if (!fs.existsSync('config')) {
            this.logger.warn("Config directory doesn't exists, creating...");
            try {
                fs.mkdirSync('config');
            } catch (e: any) {
                this.logger.fatal("Failed to create config directory!", e as Error, 1);
                return;
            }
        }

        try {
            fs.writeFileSync(SOFTCONFIG_FILE, JSON.stringify(this.config));
        } catch (e: any) {
            this.logger.fatal("Failed to save to config file!", e as Error, 1);
            return;
        }
    }

    load() {
        // Check if config dir exists, create if not.
        if (!fs.existsSync('config')) {
            this.logger.warn("Config directory doesn't exists, creating...");
            try {
                fs.mkdirSync('config');
            } catch (e: any) {
                this.logger.fatal("Failed to create config directory!", e as Error, 1);
                return;
            }
        }

        if (!fs.existsSync(SOFTCONFIG_FILE)) {
            try {
                fs.writeFileSync(SOFTCONFIG_FILE, JSON.stringify({}));
                this.config = {};
                return;
            } catch (e: any) {
                this.logger.fatal("Failed to create config file!", e as Error, 1);
                return;
            }
        }

        try {
            this.config = JSON.parse(fs.readFileSync(SOFTCONFIG_FILE, { encoding: "utf-8" }));
        } catch (e: any) {
            this.logger.fatal("Failed to read config file!", e as Error, 2);
            return;
        }
    }

    registerConfig(name: string) {
        this.config_options.push(name);
    }

    getConfigs(): string[] {
        return _.uniq(this.config_options);
    }
}

export const SoftConfig = new SoftConfigManager();
