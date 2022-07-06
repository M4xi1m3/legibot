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

import { Bot } from './Bot';
import { HardConfig } from './config/HardConfig';
import { SoftConfig } from './config/SoftConfig';
import { UptimeRobot } from './UptimeRobot';
import { Logger } from './utils/Logger';
import { ANBOT_DEV, ANBOT_HASH, ANBOT_VERSION } from './version';

export const main = async () => {
    Logger.getLogger('Main').info(`Starting LegiBot ${ANBOT_VERSION}${ANBOT_DEV ? '-dev' : ''} (${ANBOT_HASH})`);
    if (ANBOT_DEV)
        Logger.getLogger('Main').warn("This is a developpement build of LegiBot!");

    SoftConfig.load();

    if (HardConfig.isUptimeRobotEnabled()) {
        const ur = new UptimeRobot();
        ur.start();
    }

    await Bot.initClient();
    Bot.start();
};
