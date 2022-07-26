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

import { ConsoleCommand } from "../base/ConsoleCommand";
import { Log, Logger } from "../utils/Logger";

export class PingConsoleCommand extends ConsoleCommand {
    private logger: Log;

    constructor() {
        super();
        this.logger = Logger.getLogger("Ping");
    }
    
    getName(): string {
        return "ping";
    }

    getDescription(): string {
        return "Ping";
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(args: string[]): Promise<void> {
        this.logger.info("ping");
    }
}
