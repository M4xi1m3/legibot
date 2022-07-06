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

import { execSync } from "child_process";
import { readFileSync } from "fs";
import { writeFile } from "fs/promises";
import { join } from "path";
import { ConsoleCommand } from "../base/ConsoleCommand";
import { Log, Logger } from "../utils/Logger";


export class GenVersionConsoleCommand extends ConsoleCommand {
    private logger: Log;
    private values: {[key: string]: string | boolean | number};

    constructor() {
        super();
        this.logger = Logger.getLogger("Refresh");
        this.values = {
            ANBOT_HASH: execSync('git rev-parse HEAD').toString().trim().slice(0,7),
            ANBOT_VERSION: JSON.parse(readFileSync("./package.json").toString("utf-8")).version,
            ANBOT_DEV: execSync('git tag --contains HEAD').toString().trim() === ""
        }
    }

    getName(): string {
        return "gen:version";
    }

    getDescription(): string {
        return "Regenerates the version.ts file.";
    }

    async execute(args: string[]): Promise<void> {
        let content = "// AUTO GENERATED\n";
        content += "// Run \"yarn craft gen:version\" to update\n";

        for(const key of Object.keys(this.values)) {
            content += `export const ${key} = ${JSON.stringify(this.values[key])};\n`;
        }

        this.logger.info(`Writing "${join("src", "version.ts")}"`);
        await writeFile(join("src", "version.ts"), content);
    }
}
