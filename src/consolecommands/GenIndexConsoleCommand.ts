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

import { readdir, writeFile } from "fs/promises";
import { join } from "path";
import { ConsoleCommand } from "../base/ConsoleCommand";
import { Log, Logger } from "../utils/Logger";

export class GenIndexConsoleCommand extends ConsoleCommand {
    private logger: Log;
    private folders: { file: string, type: string, name: string }[];

    constructor() {
        super();
        this.logger = Logger.getLogger("Refresh");
        this.folders = [
            { file: "src/commands", type: "Command", name: "commands" },
            { file: "src/dmcommands", type: "DMCommand", name: "dmcommands" },
            { file: "src/consolecommands", type: "ConsoleCommand", name: "consolecommands" }
        ];
    }

    getName(): string {
        return "gen:index";
    }

    getDescription(): string {
        return "Regenerates the various index.ts files.";
    }

    async execute(args: string[]): Promise<void> {
        for (const path of this.folders) {
            const classes: string[] = [];
            for (const file of await readdir(path.file)) {
                if (file.endsWith('.ts') && file !== "index.ts") {
                    classes.push(file.slice(0, -3));
                }
            }

            const content = `// AUTO-GENERATED
// Run "yarn craft gen:index" to update

import { ${path.type} } from "../base/${path.type}";
${classes.map((n: string) => `import { ${n} } from "./${n}";`).join("\n")}

export const ${path.name}: { new(): ${path.type} }[] = [
${classes.map((n: string) => `    ${n}`).join(",\n")}
];
`;
            this.logger.info(`Writing "${join(path.file, "index.ts")}"`);
            await writeFile(join(path.file, "index.ts"), content);
        }
    }
}
