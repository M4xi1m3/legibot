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

import dotenv from 'dotenv';

const HARDCONFIG_FILE = 'config/hardconfig.json';

/**
 * Class that parses the .env file.
 * 
 * This config is meant to not be editable nor reloadable,
 * we thus only load it when constructing.
 */
class HardConfigManager {
    constructor() {
        dotenv.config();
    }

    getBotToken() {
        return process.env.DISCORD_TOKEN;
    }

    getDiscordGods(): string[] {
        return process.env.DISCORD_GODS?.split(',') ?? [];
    }

    getBotAppID(): string {
        return process.env.DISCORD_APPID ?? "";
    }

    getDev(): boolean {
        return process.env.DISCORD_DEV === "true";
    }

    isUptimeRobotEnabled(): boolean {
        return process.env.UPTIMEROBOT_ENABLED === "true";
    }

    getUptimeRobotPort(): number {
        return parseInt(process.env.UPTIMEROBOT_PORT ?? "1234");
    }

    getUptimeRobotIP(): string {
        return process.env.UPTIMEROBOT_IP ?? "0.0.0.0";
    }
}

export const HardConfig = new HardConfigManager();
