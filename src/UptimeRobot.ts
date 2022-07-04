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

import { createServer, Server, Socket } from 'net';
import { HardConfig } from './config/HardConfig';
import { Log, Logger } from './utils/Logger';

/**
 * This is for uptimerobot to be able to check if an-bot is alive.
 * We just bind a port, and accept connections, and act as an echo server.
 */
export class UptimeRobot {
    private server: Server;
    private logger: Log;

    constructor() {
        this.server = createServer((socket: Socket) => {
            socket.pipe(socket);
        });
        this.logger = Logger.getLogger("UptimeRobot");
    }

    start() {
        const logger = this.logger;

        try {
            this.server.listen(HardConfig.getUptimeRobotPort(), HardConfig.getUptimeRobotIP(), (() => {
                logger.info(`Server started on ${HardConfig.getUptimeRobotIP()}:${HardConfig.getUptimeRobotPort()}.`);
            }));
        } catch (e) {
            this.logger.error(`Failed to start on ${HardConfig.getUptimeRobotIP()}:${HardConfig.getUptimeRobotPort()}.`, e);
        }
    }
}

