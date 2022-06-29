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

import net from 'net';
import HardConfig from './config/HardConfig.js';
import Loggers from './utils/Logger.js';

/**
 * This is for uptimerobot to be able to check if an-bot is alive.
 * We just bind a port, and accept connections, and act as an echo server.
 */
class UptimeRobot {
    constructor() {
        this.__server = net.createServer(function (socket) {
            socket.pipe(socket);
        });
        this.__logger = Loggers.getLogger("UptimeRobot");
    }

    start() {
        try {
            this.__server.listen(HardConfig.getUptimeRobotPort(), HardConfig.getUptimeRobotIP(), (function () {
                this.__logger.info(`Server started on ${HardConfig.getUptimeRobotIP()}:${HardConfig.getUptimeRobotPort()}.`);
            }).bind(this));
        } catch (e) {
            this.__logger.error(`Failed to start on ${HardConfig.getUptimeRobotIP()}:${HardConfig.getUptimeRobotPort()}.`, e);
        }
    }
}

export default UptimeRobot;
