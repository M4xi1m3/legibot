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

import dotenv from 'dotenv';

const HARDCONFIG_FILE = 'config/hardconfig.json';

/**
 * Class that parses the .env file.
 * 
 * This config is meant to not be editable nor reloadable,
 * we thus only load it when constructing.
 */
class HardConfig {
    constructor() {
        dotenv.config();
    }

    getBotToken() {
        return process.env.DISCORD_TOKEN;
    }

    getDiscordGods() {
        return process.env.DISCORD_GODS.split(',');
    }

    getBotAppID() {
        return process.env.DISCORD_APPID;
    }

    getDev() {
        return process.env.DISCORD_DEV === "true";
    }

    isUptimeRobotEnabled() {
        return process.env.UPTIMEROBOT_ENABLED === "true";
    }

    getUptimeRobotPort() {
        return process.env.UPTIMEROBOT_PORT;
    }

    getUptimeRobotIP() {
        return process.env.UPTIMEROBOT_IP;
    }
}

const instance = new HardConfig();
export default instance;
