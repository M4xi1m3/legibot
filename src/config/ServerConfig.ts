/**
 * Copyright © 2022 Maxime Friess <M4x1me@pm.me>
 *
 * This file is part of LegiBot.
 *
 * LegiBot is free serverware: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Serverware Foundation, either version 3 of the License, or
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

import { LocaleString } from 'discord-api-types/v9';
import { Interaction, Snowflake } from 'discord.js';
import fs from 'fs';
import { Log, Logger } from '../utils/Logger';

const SERVERCONFIG_FILE = 'config/serverconfig.json';

const DEFAULT_CONFIG: SrvConf = {
    locale: 'fr',
    ephemeral: true
}

export type SrvConf = {
    locale: LocaleString,
    ephemeral: boolean
};

/**
 * Class that parses the serverconfig.json file.
 */
class ServerConfigManager {
    private logger: Log;
    private config: { [guildId: Snowflake]: SrvConf };

    constructor() {
        this.logger = Logger.getLogger('ServerConfig');
        this.config = {};
    }

    get(id: Snowflake | Interaction | null) {
        return {
            ...DEFAULT_CONFIG,
            ...this.config[
                id instanceof Interaction ? (id.guildId ?? "") : (id ?? '')
            ]
        };
    }

    set(id: Snowflake, values: Partial<SrvConf>) {
        this.config[id] = {
            ...DEFAULT_CONFIG,
            ...this.config[id],
            ...values
        };
        this.save();
    }

    save() {
        // Check if config dir exists, create if not.
        if (!fs.existsSync('config')) {
            this.logger.warn("Config directory doesn't exists, creating...");
            try {
                fs.mkdirSync('config');
            } catch (e: any) {
                this.logger.fatal('Failed to create config directory!', e as Error, 1);
                return;
            }
        }

        try {
            fs.writeFileSync(SERVERCONFIG_FILE, JSON.stringify(this.config));
        } catch (e: any) {
            this.logger.fatal('Failed to save to config file!', e as Error, 1);
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
                this.logger.fatal('Failed to create config directory!', e as Error, 1);
                return;
            }
        }

        if (!fs.existsSync(SERVERCONFIG_FILE)) {
            try {
                fs.writeFileSync(SERVERCONFIG_FILE, JSON.stringify({}));
                this.config = {};
                return;
            } catch (e: any) {
                this.logger.fatal('Failed to create config file!', e as Error, 1);
                return;
            }
        }

        try {
            this.config = JSON.parse(fs.readFileSync(SERVERCONFIG_FILE, { encoding: 'utf-8' }));
        } catch (e: any) {
            this.logger.fatal('Failed to read config file!', e as Error, 2);
            return;
        }
    }
}

export const ServerConfig = new ServerConfigManager();
