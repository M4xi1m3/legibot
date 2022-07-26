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

import { consolecommands } from ".";
import { ConsoleCommand } from "../base/ConsoleCommand";
import { Log, Logger } from "../utils/Logger";

export class HelpConsoleCommand extends ConsoleCommand {
    private logger: Log;

    constructor() {
        super();
        this.logger = Logger.getLogger("Help");
    }
    
    getName(): string {
        return "help";
    }

    getDescription(): string {
        return "Get a list of the commands";
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async execute(args: string[]): Promise<void> {
        const comms: [string, string][] = [];

        for(const ctor of consolecommands) {
            const c = new ctor();
            comms.push([c.getName(), c.getDescription()]);
        }

        let size = 0;

        for(const c of comms) {
            size = Math.max(size, c[0].length);
        }

        size = size - size % 4 + 4;

        this.logger.info("List of available commands:");

        for(const c of comms) {
            this.logger.info(`  ${c[0].padEnd(size, ' ')}${c[1]}`);
        }
    }
}
