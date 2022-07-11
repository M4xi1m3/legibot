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

import { parse } from 'csv-parse/sync';
import { Locale, LocaleString } from "discord-api-types/v9";
import { readFileSync } from "fs";
import { writeFile } from "fs/promises";
import { join } from "path";
import { ConsoleCommand } from "../base/ConsoleCommand";
import { Log, Logger } from "../utils/Logger";


export class GenI18nConsoleCommand extends ConsoleCommand {
    private logger: Log;
    private values: { [index: string]: { [key in LocaleString]?: string } };

    constructor() {
        super();
        this.logger = Logger.getLogger("I18n");
        this.values = {};
    }

    getName(): string {
        return "gen:i18n";
    }

    getDescription(): string {
        return "Regenerates the i18n.ts file.";
    }

    private parse() {
        const content = readFileSync("src/i18n.csv");
        const records = parse(content, {
            columns: true,
            skip_empty_lines: true
        });

        for(const i in records) {
            const record = records[i];
            if (!("name" in record)) {
                this.logger.fatal(`Missing name in record #${i}.`);
            }

            const name = record["name"];

            this.values[name] = {};

            for(const lang of Object.keys(record)) {
                if (lang === 'name')
                    continue;
                
                    if (Object.values(Locale).includes(lang as Locale)) {
                        this.values[name][lang as Locale] = record[lang];
                    } else {
                        this.logger.fatal(`Invalide locale ${lang}.`);
                    }
            }
        }
    }

    async execute(args: string[]): Promise<void> {
        let content = "// AUTO GENERATED\n";
        content += "// Run \"yarn craft gen:i18n\" to update\n";

        this.parse();

        content += `import { LocaleString } from "discord-api-types/v9";\n`
        content += `export const i18n: { [index: string]: { [key in LocaleString]?: string } } = ${JSON.stringify(this.values)};\n`;

        this.logger.info(`Writing "${join("src", "i18n.ts")}"`);
        await writeFile(join("src", "i18n.ts"), content);
    }
}
