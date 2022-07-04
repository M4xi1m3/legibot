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

import { ConsoleCommand } from "./base/ConsoleCommand";
import { consolecommands } from "./consolecommands";
import { Log, Logger } from "./utils/Logger";

class Craft {
    private logger: Log;

    constructor() {
        this.logger = Logger.getLogger("Craft");
    }

    private findCommand(name: string): ConsoleCommand {
        let command: ConsoleCommand | undefined = undefined;

        for (const ctor of consolecommands) {
            const c = new ctor();
            if (c.getName() === name) {
                command = c;
                break;
            }
        }

        if (command === undefined)
            this.logger.fatal(`Command "${name}" doesn't exist. Please run "yarn craft help" to get a list of available commands.`);

        return command as ConsoleCommand;
    }

    public async run(args: string[]) {
        const name = args.shift();

        if (name === undefined) {
            this.logger.fatal("Please provide a command !");
        }

        const command = this.findCommand(name as string);

        await command.execute(args);
    }
}

const main = async () => {
    const craft = new Craft();
    await craft.run(process.argv.splice(2));
};

main();
